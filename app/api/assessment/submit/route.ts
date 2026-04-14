// app/api/assessment/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'
import { z } from 'zod'
import { Language, AssessmentStatus, NotificationType, AnswerType } from '@prisma/client'


interface Question {
  id: string;
    //type: Enums.QuestionType;
    text: string;
    textAr: string;
    hasScoring: boolean;
    scoringConfig: string | null;
    minScore: number | null;
    maxScore: number | null;
    scoreUnit: string | null;
    interpretationRules: string | null;
}

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
function determineAnswerType(value: AnswerType, questionType?: string): AnswerType {
  if (Array.isArray(value)) return AnswerType.MULTIPLE_CHOICE
  if (typeof value === 'boolean') return AnswerType.BOOLEAN
  if (typeof value === 'number') return AnswerType.NUMBER
  if (questionType === 'DATE') return AnswerType.DATE
  if (questionType === 'SCALE') return AnswerType.SCALE
  return AnswerType.TEXT
}

// NEW: Calculate score based on question's scoring config
function calculateScore(
  
  answerValue: AnswerType,
  question: Question,
): { score: number | null; scoreLabel: string | null } {
  
  if (!question.hasScoring || !question.scoringConfig) {
    return { score: null, scoreLabel: null }
  }

  try {
    const config = JSON.parse(question.scoringConfig)
    let score: number | null = null
    
    // Convert answer to string for comparison
    const answerStr = typeof answerValue === 'object' 
      ? JSON.stringify(answerValue) 
      : String(answerValue)

    switch (config.type) {
      case 'answer_match':
        // GDS-15 style: specific answer gets specific score
        score = config.scores[answerStr] !== undefined 
          ? Number(config.scores[answerStr]) 
          : 0
        break
        
      case 'option_index':
        // FAST style: option index maps to score
        const index = parseInt(answerStr)
        score = config.scores[index] !== undefined 
          ? Number(config.scores[index]) 
          : index + 1
        break
        
      case 'direct':
        // Direct score from answer value
        score = Number(answerStr) || 0
        break
        
      default:
        score = 0
    }

    // Get interpretation if available
    let scoreLabel: string | null = null
    if (question.interpretationRules) {
      try {
        const interpretation = JSON.parse(question.interpretationRules)
        if (interpretation.ranges && Array.isArray(interpretation.ranges)) {
          const range = interpretation.ranges.find(
            (r: any) => score !== null && score >= r.min && score <= r.max
          )
          if (range) {
            scoreLabel = range.label
          }
        }
      } catch (e) {
        console.error('Error parsing interpretation rules:', e)
      }
    }

    console.log(`Score calculated: Question ${question.id}, Answer: "${answerStr}", Score: ${score}, Label: ${scoreLabel}`)
    
    return { score, scoreLabel }
    
  } catch (error) {
    console.error('Error calculating score:', error)
    return { score: null, scoreLabel: null }
  }
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
    
    console.log('=== Submit Assessment ===')
    console.log('Patient ID:', body.patientId)
    console.log('Form Type:', body.formType)
    console.log('Response Count:', Object.keys(body.responses || {}).length)

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

      console.log('Assessment created:', newAssessment.assessmentNumber)

      // Create assessment responses WITH SCORING
      if (validatedData.responses && Object.keys(validatedData.responses).length > 0) {
        const questionIds = Object.keys(validatedData.responses)
        
        // Fetch questions with scoring configuration
        const questions = await tx.question.findMany({
          where: { id: { in: questionIds } },
          select: {
            id: true,
            text: true,
            textAr: true,
            type: true,
            hasScoring: true,
            scoringConfig: true,
            minScore: true,
            maxScore: true,
            scoreUnit: true,
            interpretationRules: true
          }
        })

        const questionMap = new Map(questions.map(q => [q.id, q]))
        
        console.log(`Processing ${questionIds.length} responses...`)
        console.log(`Questions with scoring enabled: ${questions.filter(q => q.hasScoring).length}`)

        const responseRecords = Object.entries(validatedData.responses)
          .filter(([ value]) => value !== undefined && value !== null && value !== '')
          .map(([questionId, answerValue]) => {
            const question = questionMap.get(questionId)
            
            if (!question) {
              console.warn(`Question not found: ${questionId}`)
              return null
            }

            // Calculate score for this response
            const { score, scoreLabel } = calculateScore(answerValue, question)
            
            return {
              assessmentId: newAssessment.id,
              questionId,
              questionText: question.text || 'Question not found',
              answerValue: typeof answerValue === 'object' 
                ? JSON.stringify(answerValue) 
                : String(answerValue),
              answerType: determineAnswerType(answerValue, question.type),
              score,        // ← SAVE THE CALCULATED SCORE
              scoreLabel    // ← SAVE THE INTERPRETATION
            }
          })
          .filter(record => record !== null)

        if (responseRecords.length > 0) {
          await tx.assessmentResponse.createMany({
            data: responseRecords
          })
          
          const scoredResponses = responseRecords.filter(r => r.score !== null)
          console.log(`Created ${responseRecords.length} responses (${scoredResponses.length} with scores)`)
          
          // Log sample scores
          if (scoredResponses.length > 0) {
            console.log('Sample scores:', scoredResponses.slice(0, 3).map(r => ({
              question: r.questionText.substring(0, 40),
              answer: r.answerValue.substring(0, 20),
              score: r.score
            })))
          }
        }
      }

      // Create notification records
      const notifications = []

      if (process.env.ADMIN_EMAIL) {
        notifications.push({
          assessmentId: newAssessment.id,
          type: NotificationType.ASSESSMENT_SUBMITTED,
          recipient: process.env.ADMIN_EMAIL,
          subject: `New Assessment Submission - ${assessmentNumber}`,
          content: `Assessment ${assessmentNumber} has been submitted.\n\nPatient: ${patient.fullName}\nMRN: ${patient.mrn}\nSubmitted by: ${session.user.name || session.user.email}`
        })
      }

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

    console.log('=== Assessment Submitted Successfully ===')
    console.log('Assessment Number:', assessment.assessmentNumber)

    // Send notification emails (outside transaction, non-blocking)
    const emailPromises = []

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