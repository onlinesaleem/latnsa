// app/api/admin/questions/details/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { questionIds } = body

    if (!Array.isArray(questionIds)) {
      return NextResponse.json(
        { error: 'questionIds must be an array' },
        { status: 400 }
      )
    }

    // Fetch questions with their groups
    const questions = await prisma.question.findMany({
      where: {
        id: {
          in: questionIds
        }
      },
      include: {
        questionGroup: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            hasGroupScoring: true,
            scoringType: true,
            scoringConfig: true,
            interpretationRules: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      questions
    })

  } catch (error) {
    console.error('Error fetching question details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch question details' },
      { status: 500 }
    )
  }
}