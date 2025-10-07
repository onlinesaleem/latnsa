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

    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
      include: {
        responses: {
          orderBy: { createdAt: 'asc' }
        },
        patient: true,
      }
    })

    console.log('Fetched assessment:', assessment);

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      assessment
    })

  } catch (error) {
    console.error('Get assessment API error:', error)
    return NextResponse.json(
      { error: 'Failed to load assessment' },
      { status: 500 }
    )
  }
}