

// app/api/assessment/save-progress/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Language, Gender, AssessmentStatus, AnswerType } from '@prisma/client'
import { z } from 'zod'

const saveProgressSchema = z.object({
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
    

     // Debug logging  
    console.log('Save progress request:', {
      formType: body.formType,
      hasProxyDetails: !!body.proxyDetails,
      proxyDetails: body.proxyDetails,
      responseCount: Object.keys(body.responses || {}).length
    })

    const validatedData = saveProgressSchema.parse(body)
    // Find existing assessment or create new one
    let assessment = await prisma.assessment.findFirst({
      where: {
        userId: session?.user.id,
        status: 'DRAFT'
      }
    })

    const assessmentData = {
      language: validatedData.language === 'arabic' ? Language.ARABIC : Language.ENGLISH,
      
      registrantName: session?.user.name || 'Anonymous',
      registrantEmail: session?.user.email || null,
      subjectName: validatedData.proxyDetails?.subjectName || null,
      subjectAge: validatedData.proxyDetails?.subjectAge ? parseInt(validatedData.proxyDetails.subjectAge) : null,
      subjectGender: validatedData.proxyDetails?.subjectGender
        ? validatedData.proxyDetails.subjectGender.toUpperCase() === 'MALE'
          ? Gender.MALE
          : Gender.FEMALE
        : null,
      relationship: validatedData.proxyDetails?.relationship || null,
      status: validatedData.isComplete ? AssessmentStatus.SUBMITTED : AssessmentStatus.DRAFT,
      userId: session?.user.id || null
    }

    if (assessment) {
      // Update existing assessment
      assessment = await prisma.assessment.update({
        where: { id: assessment.id },
        data: assessmentData
      })
    } else {
      // Create new assessment
      assessment = await prisma.assessment.create({
        data: assessmentData
      })
    }

    // Save/update responses
    for (const [questionId, answerValue] of Object.entries(validatedData.responses)) {
          const question = await prisma.question.findUnique({
  where: { id: questionId }
})


      if (answerValue !== undefined && answerValue !== null && answerValue !== '') {
        // Find existing response or create new one
        const existingResponse = await prisma.assessmentResponse.findFirst({
          where: {
            assessmentId: assessment.id,
            questionId: questionId
          }
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

    return NextResponse.json({
      success: true,
      message: 'Progress saved successfully',
      assessmentId: assessment.id
    })

  } catch (error) {
    console.error('Save progress API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    )
  }
}
