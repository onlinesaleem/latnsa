import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

// GET - List questions (optionally filtered by group)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'CLINICAL_STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    const questions = await prisma.question.findMany({
      where: groupId ? { questionGroupId: groupId } : undefined,
      include: {
        questionGroup: {
          select: {
            name: true,
            nameAr: true
          }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ success: true, questions })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

// POST - Create new question
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    
    const question = await prisma.question.create({
      data: {
        questionGroupId: body.questionGroupId,
        text: body.text,
        textAr: body.textAr,
        description: body.description,
        descriptionAr: body.descriptionAr,
        type: body.type,
        isRequired: body.isRequired || false,
        order: body.order || 0,
        isActive: body.isActive ?? true,
        options: body.options,
        validationRules: body.validationRules,
        hasScoring: body.hasScoring || false,
        scoringType: body.scoringType,
        scoringConfig: body.scoringConfig,
        minScore: body.minScore,
        maxScore: body.maxScore,
        scoreUnit: body.scoreUnit,
        interpretationRules: body.interpretationRules,
        applicableFor: body.applicableFor || ['SELF', 'PROXY']
      }
    })

    return NextResponse.json({ success: true, question })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json({ 
      error: 'Failed to create question',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
