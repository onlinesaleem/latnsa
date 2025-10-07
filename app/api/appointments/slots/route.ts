
// ====================================================================
// app/api/appointments/slots/route.ts - Available time slots
// ====================================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const appointmentType = searchParams.get('type') || 'VIRTUAL_CONSULTATION'
    const clinicianId = searchParams.get('clinicianId')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter required' },
        { status: 400 }
      )
    }

    const selectedDate = new Date(date)
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Get existing appointments for the date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          not: 'CANCELLED'
        },
        ...(clinicianId && { clinicianId })
      },
      select: {
        scheduledAt: true,
        duration: true
      }
    })

    // Generate available slots based on appointment type
    const slots = generateAvailableSlots(selectedDate, appointmentType, existingAppointments)

    return NextResponse.json({
      success: true,
      slots
    })

  } catch (error) {
    console.error('Get slots error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    )
  }
}

function generateAvailableSlots(date: Date, appointmentType: string, existingAppointments: any[]) {
  const slots = []
  const now = new Date()
  
  // Define working hours based on appointment type
  let startHour = 8
  let endHour = 17
  let slotDuration = 30

  if (appointmentType === 'LAB_TESTING') {
    startHour = 7
    endHour = 14
    slotDuration = 60
  } else if (appointmentType === 'VIRTUAL_CONSULTATION') {
    startHour = 8
    endHour = 20
    slotDuration = 30
  }

  // Generate slots for the day
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const slotTime = new Date(date)
      slotTime.setHours(hour, minute, 0, 0)

      // Skip past time slots
      if (slotTime <= now) {
        continue
      }

      // Check if slot conflicts with existing appointments
      const isAvailable = !existingAppointments.some(apt => {
        const aptStart = new Date(apt.scheduledAt)
        const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000)
        const slotEnd = new Date(slotTime.getTime() + slotDuration * 60000)
        
        return (slotTime < aptEnd && slotEnd > aptStart)
      })

      slots.push({
        time: slotTime.toTimeString().slice(0, 5), // HH:MM format
        available: isAvailable,
        datetime: slotTime.toISOString()
      })
    }
  }

  return slots
}