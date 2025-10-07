// app/api/admin/assessments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check authorization
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'CLINICAL_STAFF') {
      return NextResponse.json(
        { error: 'Access denied. Admin or clinical staff privileges required.' },
        { status: 403 }
      )
    }

    // Fetch all assessments with patient and submitter information
    const assessments = await prisma.assessment.findMany({
      include: {
        patient: {
          select: {
            id: true,
            mrn: true,
            fullName: true,
            email: true,
            phone: true,
            gender: true,
            dateOfBirth: true
          }
        },
        submitter: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            responses: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      assessments
    })

  } catch (error) {
    console.error('Error fetching assessments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    )
  }
}