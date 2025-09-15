// app/api/admin/reports/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CLINICAL_STAFF')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Get analytics data
    const [
      totalAssessments,
      completedAssessments,
      avgBristolScore,
      assessmentsByType,
      assessmentsByLanguage,
      dailySubmissions,
      clinicalReviewStats
    ] = await Promise.all([
      // Total assessments in period
      prisma.assessment.count({
        where: {
          submittedAt: { gte: startDate }
        }
      }),

      // Completed assessments
      prisma.assessment.count({
        where: {
          status: 'COMPLETED',
          submittedAt: { gte: startDate }
        }
      }),

      // Average Bristol score (simplified calculation)
      prisma.assessment.aggregate({
        _avg: {
          subjectAge: true
        },
        where: {
          submittedAt: { gte: startDate }
        }
      }),

      // Assessments by type
      prisma.assessment.groupBy({
        by: ['formType'],
        _count: { formType: true },
        where: {
          submittedAt: { gte: startDate }
        }
      }),

      // Assessments by language
      prisma.assessment.groupBy({
        by: ['language'],
        _count: { language: true },
        where: {
          submittedAt: { gte: startDate }
        }
      }),

      // Daily submissions for chart
      prisma.$queryRaw`
        SELECT 
          DATE(submitted_at) as date,
          COUNT(*) as count
        FROM "Assessment" 
        WHERE submitted_at >= ${startDate}
        GROUP BY DATE(submitted_at)
        ORDER BY date ASC
      `,

      // Clinical review statistics
      prisma.assessment.groupBy({
        by: ['status'],
        _count: { status: true },
        where: {
          submittedAt: { gte: startDate }
        }
      })
    ])

    // Format the response
    const analytics = {
      summary: {
        totalAssessments,
        completedAssessments,
        completionRate: totalAssessments > 0 ? 
          ((completedAssessments / totalAssessments) * 100).toFixed(1) : '0',
        avgPatientAge: avgBristolScore._avg.subjectAge?.toFixed(1) || 'N/A'
      },
      
      distribution: {
        byType: assessmentsByType.map(item => ({
          type: item.formType,
          count: item._count.formType
        })),
        
        byLanguage: assessmentsByLanguage.map(item => ({
          language: item.language,
          count: item._count.language
        })),
        
        byStatus: clinicalReviewStats.map(item => ({
          status: item.status,
          count: item._count.status
        }))
      },
      
      trends: {
        dailySubmissions: (dailySubmissions as any[]).map(item => ({
          date: item.date,
          count: parseInt(item.count)
        }))
      },

      period: parseInt(period),
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      analytics
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    )
  }
}