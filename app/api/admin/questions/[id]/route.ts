
// ============================================================================
// FILE: app/api/admin/questions/[id]/route.ts
// ============================================================================

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

// GET - Get single question
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await context.params

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        questionGroup: true
      }
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, question })
  } catch (error) {
    console.error('Error fetching question:', error)
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 })
  }
}

// PUT - Update question
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await context.params
    const body = await request.json()
    
    const question = await prisma.question.update({
      where: { id },
      data: {
        text: body.text,
        textAr: body.textAr,
        description: body.description,
        descriptionAr: body.descriptionAr,
        type: body.type,
        isRequired: body.isRequired,
        order: body.order,
        isActive: body.isActive,
        options: body.options,
        validationRules: body.validationRules,
        hasScoring: body.hasScoring,
        scoringType: body.scoringType,
        scoringConfig: body.scoringConfig,
        minScore: body.minScore,
        maxScore: body.maxScore,
        scoreUnit: body.scoreUnit,
        interpretationRules: body.interpretationRules,
        applicableFor: body.applicableFor
      }
    })

    return NextResponse.json({ success: true, question })
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
  }
}

// DELETE - Delete question
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await context.params

    await prisma.question.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Question deleted' })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}