import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check admin access
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CLINICAL_STAFF')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const formType = searchParams.get('formType')

    // Build where clause
    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }
    if (formType && formType !== 'all') {
      where.formType = formType
    }

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        _count: {
          select: { responses: true }
        }
      },
      orderBy: { submittedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.assessment.count({ where })

    return NextResponse.json({
      success: true,
      assessments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get assessments API error:', error)
    return NextResponse.json(
      { error: 'Failed to load assessments' },
      { status: 500 }
    )
  }
}