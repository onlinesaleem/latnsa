// app/api/assessment/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'
import { z } from 'zod'
import { AnswerType, Language, Gender } from '@prisma/client'

const submitAssessmentSchema = z.object({
  formType: z.enum(['SELF', 'PROXY']),
  language: z.enum(['english', 'arabic']),
  proxyDetails: z.object({
    subjectName: z.string().optional(),
    subjectAge: z.string().optional(),
    subjectGender: z.string().optional(),
    relationship: z.string().optional()
  }).optional().nullable(),
  responses: z.record(z.string(), z.any()),
  isComplete: z.boolean()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const validatedData = submitAssessmentSchema.parse(body)

    // Save the assessment (reuse logic from save-progress)
    let assessment = await prisma.assessment.findFirst({
      where: {
        userId: session?.user.id,
        status: 'DRAFT'
      }
    })

    const assessmentData = {
      formType: validatedData.formType,
      language: validatedData.language === 'arabic' ? Language.ARABIC : Language.ENGLISH,
      registrantName: session?.user.name || 'Anonymous',
      registrantEmail: session?.user.email || null,
      subjectName: validatedData.proxyDetails?.subjectName || null,
      subjectAge: validatedData.proxyDetails?.subjectAge ? parseInt(validatedData.proxyDetails.subjectAge) : null,
      subjectGender: validatedData.proxyDetails?.subjectGender
        ? (validatedData.proxyDetails.subjectGender.toUpperCase() === 'MALE'
            ? Gender.MALE
            : Gender.FEMALE)
        : null,
      relationship: validatedData.proxyDetails?.relationship || null,
      status: 'SUBMITTED' as import('@prisma/client').AssessmentStatus,
      userId: session?.user.id || null,
      submittedAt: new Date()
    }

    if (assessment) {
      assessment = await prisma.assessment.update({
        where: { id: assessment.id },
        data: assessmentData
      })
    } else {
      assessment = await prisma.assessment.create({
        data: assessmentData
      })
    }

    // Save responses (same as save-progress)
    for (const [questionId, answerValue] of Object.entries(validatedData.responses)) {
      if (answerValue !== undefined && answerValue !== null && answerValue !== '') {
        const existingResponse = await prisma.assessmentResponse.findFirst({
          where: {
            assessmentId: assessment.id,
            questionId: questionId
          }
        })
        const question = await prisma.question.findUnique({
          where: { id: questionId }
        })
        const responseData = {
          assessmentId: assessment.id,
          questionId: questionId,
          questionText: question?.text || `Question ${questionId}`,
          answerValue: typeof answerValue === 'object' ? JSON.stringify(answerValue) : String(answerValue),
          answerType: Array.isArray(answerValue) ? AnswerType.MULTIPLE_CHOICE : AnswerType.TEXT
        }

        if (existingResponse) {
          await prisma.assessmentResponse.update({
            where: { id: existingResponse.id },
            data: responseData
          })
        } else {
          await prisma.assessmentResponse.create({
            data: responseData
          })
        }
      }
    }

    // Send notification emails
    const emailPromises = []

    // 1. Confirmation email to user
    if (assessment.registrantEmail) {
      const confirmationTemplate = emailTemplates.assessmentConfirmation({
        registrantName: assessment.registrantName || 'User',
        assessmentId: assessment.id,
        submittedAt: assessment.submittedAt?.toISOString() || new Date().toISOString(),
        language: validatedData.language
      })

      emailPromises.push(
        sendEmail({
          to: assessment.registrantEmail,
          subject: confirmationTemplate.subject,
          html: confirmationTemplate.html
        })
      )
    }

    // 2. Notification to client (Latnsa)
    if (process.env.ADMIN_EMAIL) {
      const clientTemplate = emailTemplates.assessmentNotificationClient({
        registrantName: assessment.registrantName || 'Anonymous',
        assessmentId: assessment.id,
        submittedAt: assessment.submittedAt?.toISOString() || new Date().toISOString(),
        formType: assessment.formType,
        subjectName: assessment.subjectName || undefined
      })

      emailPromises.push(
        sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: clientTemplate.subject,
          html: clientTemplate.html
        })
      )
    }

    // 3. Notification to clinical team
    if (process.env.CLINICAL_EMAIL) {
      const clinicalTemplate = emailTemplates.assessmentNotificationClinical({
        registrantName: assessment.registrantName || 'Anonymous',
        assessmentId: assessment.id,
        submittedAt: assessment.submittedAt?.toISOString() || new Date().toISOString(),
        formType: assessment.formType,
        subjectName: assessment.subjectName || undefined,
        priority: 'Normal'
      })

      emailPromises.push(
        sendEmail({
          to: process.env.CLINICAL_EMAIL,
          subject: clinicalTemplate.subject,
          html: clinicalTemplate.html
        })
      )
    }

    // Send all emails
    try {
      await Promise.all(emailPromises)
      console.log('All notification emails sent successfully')
    } catch (emailError) {
      console.error('Some emails failed to send:', emailError)
      // Don't fail the assessment submission if emails fail
    }

    // Create notification records
    // Import NotificationType enum from your Prisma client or define it if needed
    // import { NotificationType } from '@prisma/client'

    const notifications = [
      {
        assessmentId: assessment.id,
        type: 'ASSESSMENT_SUBMITTED' as any, // Replace 'any' with NotificationType if imported
        recipient: process.env.ADMIN_EMAIL || 'admin@latnsa.com',
        subject: 'New Assessment Submission',
        content: `Assessment ${assessment.id} submitted by ${assessment.registrantName}`,
        sent: true,
        sentAt: new Date()
      },
      {
        assessmentId: assessment.id,
        type: 'ASSESSMENT_SUBMITTED' as any, // Replace 'any' with NotificationType if imported
        recipient: process.env.CLINICAL_EMAIL || 'clinical@latnsa.com',
        subject: 'Clinical Review Required',
        content: `Assessment ${assessment.id} requires clinical review`,
        sent: true,
        sentAt: new Date()
      }
    ]

    await prisma.notification.createMany({
      data: notifications
    })

    return NextResponse.json({
      success: true,
      message: 'Assessment submitted successfully',
      messageAr: 'تم إرسال التقييم بنجاح',
      assessmentId: assessment.id,
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