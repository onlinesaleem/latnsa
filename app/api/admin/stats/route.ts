
// app/api/admin/stats/route.ts
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

    // Get dashboard statistics
    const [
      total,
      pending,
      underReview,
      completed,
      todaySubmissions
    ] = await Promise.all([
      // Total assessments
      prisma.assessment.count(),
      
      // Pending review (submitted but not reviewed)
      prisma.assessment.count({
        where: { 
          status: 'SUBMITTED',
          isReviewed: false
        }
      }),
      
      // Under review
      prisma.assessment.count({
        where: { status: 'UNDER_REVIEW' }
      }),
      
      // Completed
      prisma.assessment.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Today's submissions
      prisma.assessment.count({
        where: {
          submittedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      })
    ])

    return NextResponse.json({
      success: true,
      stats: {
        total,
        pending,
        underReview,
        completed,
        todaySubmissions
      }
    })

  } catch (error) {
    console.error('Get stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to load statistics' },
      { status: 500 }
    )
  }
}