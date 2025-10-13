// app/api/admin/assessment/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CLINICAL_STAFF')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Fetch assessment with responses
    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
      include: {
        responses: {
          orderBy: { createdAt: 'asc' }
        },
        patient: true,
        submitter: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Get all question IDs from responses
    const questionIds = assessment.responses.map(r => r.questionId)

    // Fetch question details with groups
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

    // Create a map for quick lookup
    const questionMap = new Map(questions.map(q => [q.id, q]))

    // Enrich responses with question details
    const enrichedResponses = assessment.responses.map(response => {
      const question = questionMap.get(response.questionId)
      return {
        ...response,
        question: question ? {
          id: question.id,
          questionGroupId: question.questionGroupId,
          hasScoring: question.hasScoring,
          scoringType: question.scoringType,
          minScore: question.minScore,
          maxScore: question.maxScore,
          scoreUnit: question.scoreUnit,
          questionGroup: question.questionGroup
        } : null
      }
    })

    // Calculate group scores
    const groupScores = new Map()

    enrichedResponses.forEach(response => {
      if (!response.question || !response.question.hasScoring) return

      const groupId = response.question.questionGroupId
      const groupName = response.question.questionGroup?.name || 'Ungrouped'
      const groupNameAr = response.question.questionGroup?.nameAr || 'غير مجمع'

      if (!groupScores.has(groupId)) {
        groupScores.set(groupId, {
          groupId,
          groupName,
          groupNameAr,
          totalScore: 0,
          maxScore: 0,
          questionCount: 0
        })
      }

      const group = groupScores.get(groupId)
      group.totalScore += response.score || 0
      group.maxScore += response.question.maxScore || 0
      group.questionCount += 1
    })

    const groupScoresArray = Array.from(groupScores.values()).map(group => ({
      ...group,
      percentage: group.maxScore > 0 ? (group.totalScore / group.maxScore) * 100 : 0
    }))

    console.log('Assessment loaded with group scores:', {
      assessmentId: assessment.id,
      totalResponses: assessment.responses.length,
      groupCount: groupScoresArray.length,
      groupScores: groupScoresArray
    })

    return NextResponse.json({
      success: true,
      assessment: {
        ...assessment,
        responses: enrichedResponses
      },
      groupScores: groupScoresArray,
      questions: Array.from(questionMap.values())
    })

  } catch (error) {
    console.error('Get assessment API error:', error)
    return NextResponse.json(
      { error: 'Failed to load assessment' },
      { status: 500 }
    )
  }
}