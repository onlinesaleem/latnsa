// app/api/assessment/questions/route.ts

import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"


export async function GET(request: NextRequest) {
  try {
    const questionGroups = await prisma.questionGroup.findMany({
      where: { isActive: true },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({
      success: true,
      questionGroups
    })

  } catch (error) {
    console.error('Get questions API error:', error)
    return NextResponse.json(
      { error: 'Failed to load questions' },
      { status: 500 }
    )
  }
}
