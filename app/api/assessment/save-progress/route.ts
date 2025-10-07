// app/api/assessment/save-progress/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Language, AssessmentStatus, AnswerType } from '@prisma/client'
import { z } from 'zod'

const saveProgressSchema = z.object({
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
    
    console.log('Save progress request:', {
      patientId: body.patientId,
      formType: body.formType,
      hasProxyInfo: !!body.proxyInfo,
      responseCount: Object.keys(body.responses || {}).length
    })

    const validatedData = saveProgressSchema.parse(body)

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

    // Check if there's an existing draft for this patient by this user
    let assessment = await prisma.assessment.findFirst({
      where: {
        patientId: validatedData.patientId,
        submittedBy: session.user.id,
        status: AssessmentStatus.DRAFT
      },
      include: {
        responses: true
      }
    })

 if (assessment) {
  // Update existing draft
  assessment = await prisma.$transaction(async (tx) => {
    // Delete old responses
    await tx.assessmentResponse.deleteMany({
      where: { assessmentId: assessment!.id }
    })

    // Update assessment
    const updated = await tx.assessment.update({
      where: { id: assessment!.id },
      data: {
        formType: validatedData.formType,
        language: validatedData.language,
        
        // Proxy details
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
        
        updatedAt: new Date()
      },
      include: {
        responses: true  // Add this to match the type
      }
    })

    // Create new responses
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
            assessmentId: updated.id,
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

    return updated
  })

  console.log('Updated existing draft assessment:', assessment.id)
} else {
  // Create new draft
  const assessmentNumber = await generateAssessmentNumber()

  assessment = await prisma.$transaction(async (tx) => {
    const newAssessment = await tx.assessment.create({
      data: {
        assessmentNumber,
        patientId: validatedData.patientId,
        formType: validatedData.formType,
        language: validatedData.language,
        submittedBy: session.user.id,
        
        // Proxy details
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
        
        status: AssessmentStatus.DRAFT,
        priority: 'NORMAL'
      },
      include: {
        responses: true  // Add this line
      }
    })

    // Create responses
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

    return newAssessment
  })

  console.log('Created new draft assessment:', assessment.id)
}

    return NextResponse.json({
      success: true,
      message: 'Progress saved successfully',
      messageAr: 'تم حفظ التقدم بنجاح',
      assessmentId: assessment.id,
      assessmentNumber: assessment.assessmentNumber,
      patientMRN: patient.mrn
    })

  } catch (error) {
    console.error('Save progress API error:', error)
    
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
        error: 'Failed to save progress',
        errorAr: 'فشل في حفظ التقدم'
      },
      { status: 500 }
    )
  }
}