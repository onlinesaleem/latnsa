// app/api/assessment/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'
import { z } from 'zod'
import { Language, AssessmentStatus, NotificationType, AnswerType } from '@prisma/client'

const submitAssessmentSchema = z.object({
  patientId: z.string(),
  formType: z.enum(['SELF', 'PROXY']),
  language: z.enum(['ENGLISH', 'ARABIC']),
  proxyInfo: z.object({
    proxyName: z.string(),
    proxyEmail: z.string().optional(),
    proxyPhone: z.string().optional(),
    proxyRelationship: z.string()
  }).optional().nullable(),
  responses: z.record(z.string(), z.any())
})

// Generate Assessment Number
async function generateAssessmentNumber(): Promise<string> {
  const year = new Date().getFullYear()
  
  const lastAssessment = await prisma.assessment.findFirst({
    where: { 
      assessmentNumber: { startsWith: `ASM-${year}-` } 
    },
    orderBy: { createdAt: 'desc' }
  })
  
  const nextNumber = lastAssessment 
    ? parseInt(lastAssessment.assessmentNumber.split('-')[2]) + 1 
    : 1
    
  return `ASM-${year}-${String(nextNumber).padStart(5, '0')}`
}

// Helper function to determine answer type
// Helper function to determine answer type
function determineAnswerType(value: any, questionType?: string): AnswerType {
  if (Array.isArray(value)) return AnswerType.MULTIPLE_CHOICE
  if (typeof value === 'boolean') return AnswerType.BOOLEAN
  if (typeof value === 'number') return AnswerType.NUMBER
  if (questionType === 'DATE') return AnswerType.DATE
  if (questionType === 'SCALE') return AnswerType.SCALE
  return AnswerType.TEXT
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', errorAr: 'غير مصرح' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    console.log('Submit assessment request:', {
      patientId: body.patientId,
      formType: body.formType,
      hasProxyInfo: !!body.proxyInfo,
      responseCount: Object.keys(body.responses || {}).length
    })

    const validatedData = submitAssessmentSchema.parse(body)

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: validatedData.patientId }
    })

    if (!patient) {
      return NextResponse.json(
        { 
          error: 'Patient not found',
          errorAr: 'المريض غير موجود'
        },
        { status: 404 }
      )
    }

    // Generate assessment number
    const assessmentNumber = await generateAssessmentNumber()

    // Create assessment with responses in a transaction
    const assessment = await prisma.$transaction(async (tx) => {
      // Create the assessment
      const newAssessment = await tx.assessment.create({
        data: {
          assessmentNumber,
          patientId: validatedData.patientId,
          formType: validatedData.formType,
          language: validatedData.language,
          submittedBy: session.user.id,
          
          // Proxy details (only if PROXY)
          proxyRelationship: validatedData.formType === 'PROXY' 
            ? validatedData.proxyInfo?.proxyRelationship 
            : null,
          proxyName: validatedData.formType === 'PROXY' 
            ? validatedData.proxyInfo?.proxyName 
            : null,
          proxyEmail: validatedData.formType === 'PROXY' 
            ? validatedData.proxyInfo?.proxyEmail 
            : null,
          proxyPhone: validatedData.formType === 'PROXY' 
            ? validatedData.proxyInfo?.proxyPhone 
            : null,
          
          status: AssessmentStatus.SUBMITTED,
          priority: 'NORMAL',
          submittedAt: new Date()
        }
      })

      // Create assessment responses
      if (validatedData.responses && Object.keys(validatedData.responses).length > 0) {
        const questionIds = Object.keys(validatedData.responses)
        const questions = await tx.question.findMany({
          where: { id: { in: questionIds } }
        })

        const questionMap = new Map(
          questions.map(q => [q.id, { text: q.text, textAr: q.textAr, type: q.type }])
        )

        const responseRecords = Object.entries(validatedData.responses)
          .filter(([_, value]) => value !== undefined && value !== null && value !== '')
          .map(([questionId, answerValue]) => {
            const question = questionMap.get(questionId)
            
            return {
              assessmentId: newAssessment.id,
              questionId,
              questionText: question?.text || 'Question not found',
              answerValue: typeof answerValue === 'object' 
                ? JSON.stringify(answerValue) 
                : String(answerValue),
              answerType: determineAnswerType(answerValue, question?.type)
            }
          })

        if (responseRecords.length > 0) {
          await tx.assessmentResponse.createMany({
            data: responseRecords
          })
        }
      }

      // Create notification records
      const notifications = []

      // Notification for admin
      if (process.env.ADMIN_EMAIL) {
        notifications.push({
          assessmentId: newAssessment.id,
          type: NotificationType.ASSESSMENT_SUBMITTED,
          recipient: process.env.ADMIN_EMAIL,
          subject: `New Assessment Submission - ${assessmentNumber}`,
          content: `Assessment ${assessmentNumber} has been submitted.\n\nPatient: ${patient.fullName}\nMRN: ${patient.mrn}\nSubmitted by: ${session.user.name || session.user.email}`
        })
      }

      // Notification for clinical team
      if (process.env.CLINICAL_EMAIL) {
        notifications.push({
          assessmentId: newAssessment.id,
          type: NotificationType.ASSESSMENT_SUBMITTED,
          recipient: process.env.CLINICAL_EMAIL,
          subject: `Clinical Review Required - ${assessmentNumber}`,
          content: `Assessment ${assessmentNumber} requires clinical review.\n\nPatient: ${patient.fullName}\nMRN: ${patient.mrn}\nForm Type: ${validatedData.formType}\nSubmitted At: ${new Date().toLocaleString()}`
        })
      }

      if (notifications.length > 0) {
        await tx.notification.createMany({
          data: notifications
        })
      }

      return newAssessment
    })

    // Send notification emails (outside transaction, non-blocking)
    const emailPromises = []

    // 1. Confirmation email to patient/submitter
    const recipientEmail = validatedData.formType === 'SELF' 
      ? patient.email 
      : validatedData.proxyInfo?.proxyEmail

    if (recipientEmail) {
      const confirmationTemplate = emailTemplates.assessmentConfirmation({
        registrantName: validatedData.formType === 'SELF' 
          ? patient.fullName 
          : validatedData.proxyInfo?.proxyName || 'User',
        assessmentId: assessment.id,
        submittedAt: assessment.submittedAt?.toISOString() || new Date().toISOString(),
        language: validatedData.language === Language.ARABIC ? 'arabic' : 'english'
      })

      emailPromises.push(
        sendEmail({
          to: recipientEmail,
          subject: confirmationTemplate.subject,
          html: confirmationTemplate.html
        }).catch(err => console.error('Failed to send confirmation email:', err))
      )
    }

    // 2. Notification to admin
    if (process.env.ADMIN_EMAIL) {
      const clientTemplate = emailTemplates.assessmentNotificationClient({
        registrantName: validatedData.formType === 'SELF' 
          ? patient.fullName 
          : validatedData.proxyInfo?.proxyName || 'Anonymous',
        assessmentId: assessment.id,
        submittedAt: assessment.submittedAt?.toISOString() || new Date().toISOString(),
        formType: assessment.formType,
        subjectName: patient.fullName
      })

      emailPromises.push(
        sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: clientTemplate.subject,
          html: clientTemplate.html
        }).catch(err => console.error('Failed to send admin email:', err))
      )
    }

    // 3. Notification to clinical team
    if (process.env.CLINICAL_EMAIL) {
      const clinicalTemplate = emailTemplates.assessmentNotificationClinical({
        registrantName: validatedData.formType === 'SELF' 
          ? patient.fullName 
          : validatedData.proxyInfo?.proxyName || 'Anonymous',
        assessmentId: assessment.id,
        submittedAt: assessment.submittedAt?.toISOString() || new Date().toISOString(),
        formType: assessment.formType,
        subjectName: patient.fullName,
        priority: 'Normal'
      })

      emailPromises.push(
        sendEmail({
          to: process.env.CLINICAL_EMAIL,
          subject: clinicalTemplate.subject,
          html: clinicalTemplate.html
        }).catch(err => console.error('Failed to send clinical email:', err))
      )
    }

    // Send all emails (non-blocking)
    if (emailPromises.length > 0) {
      Promise.all(emailPromises)
        .then(() => console.log('All notification emails sent successfully'))
        .catch(err => console.error('Some emails failed to send:', err))
    }

    return NextResponse.json({
      success: true,
      message: 'Assessment submitted successfully',
      messageAr: 'تم إرسال التقييم بنجاح',
      assessmentId: assessment.id,
      assessmentNumber: assessment.assessmentNumber,
      patientMRN: patient.mrn,
      submittedAt: assessment.submittedAt
    })

  } catch (error) {
    console.error('Submit assessment API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          errorAr: 'بيانات غير صحيحة',
          details: error.issues 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to submit assessment',
        errorAr: 'فشل في إرسال التقييم'
      },
      { status: 500 }
    )
  }
}