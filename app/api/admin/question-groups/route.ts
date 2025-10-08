// ============================================================================
// FILE: app/api/admin/question-groups/route.ts
// ============================================================================
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List all question groups
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const groups = await prisma.questionGroup.findMany({
      include: {
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ success: true, groups })
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
  }
}

// POST - Create new question group
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    
    const group = await prisma.questionGroup.create({
      data: {
        name: body.name,
        nameAr: body.nameAr,
        description: body.description,
        descriptionAr: body.descriptionAr,
        order: body.order || 0,
        videoUrl: body.videoUrl,
        isActive: body.isActive ?? true,
        hasGroupScoring: body.hasGroupScoring || false,
        scoringType: body.scoringType || null,
        scoringConfig: body.scoringConfig || null,
        interpretationRules: body.interpretationRules || null
      }
    })

    return NextResponse.json({ success: true, group })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}

// ============================================================================
// FILE: app/api/admin/question-groups/[id]/route.ts
// ============================================================================

// PUT - Update question group
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
    
    const group = await prisma.questionGroup.update({
      where: { id },
      data: {
        name: body.name,
        nameAr: body.nameAr,
        description: body.description,
        descriptionAr: body.descriptionAr,
        order: body.order,
        videoUrl: body.videoUrl,
        isActive: body.isActive,
        hasGroupScoring: body.hasGroupScoring,
        scoringType: body.scoringType,
        scoringConfig: body.scoringConfig,
        interpretationRules: body.interpretationRules
      }
    })

    return NextResponse.json({ success: true, group })
  } catch (error) {
    console.error('Error updating group:', error)
    return NextResponse.json({ error: 'Failed to update group' }, { status: 500 })
  }
}

// DELETE - Delete question group
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

    await prisma.questionGroup.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Group deleted' })
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 })
  }
}