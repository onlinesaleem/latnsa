// app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { ZoomService } from '@/lib/zoom-service'
import { sendEmail } from '@/lib/email'

const appointmentSchema = z.object({
  patientName: z.string().min(2),
  patientEmail: z.string().email(),
  patientPhone: z.string().optional(),
  type: z.enum(['LAB_TESTING', 'VIRTUAL_CONSULTATION', 'VIDEO_CALL']),
  scheduledAt: z.string().datetime(),
  duration: z.number().min(15).max(180).default(30),
  notes: z.string().optional(),
  language: z.enum(['ENGLISH', 'ARABIC']).default('ENGLISH'),
  assessmentId: z.string().optional(), // Link to existing assessment
  clinicianId: z.string().optional()
})

// CREATE Appointment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const appointmentData = appointmentSchema.parse(body)

    // Check for scheduling conflicts
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        scheduledAt: new Date(appointmentData.scheduledAt),
        status: {
          not: 'CANCELLED'
        },
        ...(appointmentData.clinicianId && {
          clinicianId: appointmentData.clinicianId
        })
      }
    })

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: 'Time slot already booked' },
        { status: 400 }
      )
    }

    let meetingUrl = null
    let meetingId = null

    // Create Zoom meeting for virtual consultations
    if (appointmentData.type === 'VIRTUAL_CONSULTATION' || appointmentData.type === 'VIDEO_CALL') {
      try {
        const zoomService = new ZoomService()
        const zoomMeeting = await zoomService.createMeeting({
          topic: `Healthcare Consultation - ${appointmentData.patientName}`,
          start_time: appointmentData.scheduledAt,
          duration: appointmentData.duration,
          settings: {
            join_before_host: false,
            waiting_room: true,
            mute_upon_entry: true,
            approval_type: 1, // Manually approve
            audio: 'both',
            video: true,
            enforce_login: false
          }
        })
        
        meetingUrl = zoomMeeting.join_url
        meetingId = zoomMeeting.id.toString()
      } catch (error) {
        console.error('Failed to create Zoom meeting:', error)
        return NextResponse.json(
          { error: 'Failed to create virtual consultation' },
          { status: 500 }
        )
      }
    }

    // Create appointment in database
    const appointment = await prisma.appointment.create({
      data: {
        ...appointmentData,
        scheduledAt: new Date(appointmentData.scheduledAt),
        meetingUrl,
        meetingId,
        createdBy: session.user.id,
        status: 'SCHEDULED'
      }
    })

    // Send confirmation email
    await sendAppointmentConfirmation(appointment, appointmentData.language)

    // Schedule reminder emails
    await scheduleReminders(appointment)

    return NextResponse.json({
      success: true,
      appointment: {
        ...appointment,
        meetingUrl: appointmentData.type === 'VIRTUAL_CONSULTATION' || appointmentData.type === 'VIDEO_CALL' ? meetingUrl : null
      }
    })

  } catch (error) {
    console.error('Create appointment error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid appointment data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}

// GET Appointments
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
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const clinicianId = searchParams.get('clinicianId')

    const where: any = {}

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      where.scheduledAt = {
        gte: startOfDay,
        lte: endOfDay
      }
    }

    if (status) where.status = status
    if (type) where.type = type
    if (clinicianId) where.clinicianId = clinicianId

    // Non-admin users can only see their own appointments
    if (session.user.role === 'USER') {
      where.patientEmail = session.user.email
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: {
        scheduledAt: 'asc'
      },
      include: {
        // Only include assessment if assessmentId is not null
        assessment: {
          select: {
            id: true,
            status: true,
            clinicalScore: true,
            recommendations: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      appointments: appointments.map(appointment => ({
        ...appointment,
        // Only include assessment if it exists
        assessment: appointment.assessment || null
      }))
    })

  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

// Helper functions
async function sendAppointmentConfirmation(appointment: any, language: string) {
  const isArabic = language === 'ARABIC'
  const isVirtual = appointment.type === 'VIRTUAL_CONSULTATION' || appointment.type === 'VIDEO_CALL'
  
  const subject = isArabic ? 
    `تأكيد الموعد - ${appointment.patientName}` :
    `Appointment Confirmation - ${appointment.patientName}`

  const appointmentDate = new Date(appointment.scheduledAt).toLocaleString(
    isArabic ? 'ar-SA' : 'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  )

  const appointmentTypeText = {
    'LAB_TESTING': isArabic ? 'فحص مختبري' : 'Lab Testing',
    'VIRTUAL_CONSULTATION': isArabic ? 'استشارة افتراضية' : 'Virtual Consultation',
    'VIDEO_CALL': isArabic ? 'مكالمة فيديو' : 'Video Call'
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: ${isArabic ? 'rtl' : 'ltr'};">
      <div style="background: linear-gradient(135deg, #0ea5e9, #3b82f6); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">${isArabic ? 'تأكيد الموعد' : 'Appointment Confirmed'}</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">${isArabic ? 'نظام التقييم الصحي - لاتنسا' : 'Healthcare Assessment System - Latnsa'}</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #1f2937; margin-top: 0;">${isArabic ? 'تفاصيل الموعد' : 'Appointment Details'}</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 40%;">${isArabic ? 'المريض:' : 'Patient:'}</td>
              <td style="padding: 8px 0; color: #6b7280;">${appointment.patientName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">${isArabic ? 'نوع الموعد:' : 'Appointment Type:'}</td>
              <td style="padding: 8px 0; color: #6b7280;">${appointmentTypeText[appointment.type as keyof typeof appointmentTypeText]}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">${isArabic ? 'التاريخ والوقت:' : 'Date & Time:'}</td>
              <td style="padding: 8px 0; color: #6b7280;">${appointmentDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">${isArabic ? 'المدة:' : 'Duration:'}</td>
              <td style="padding: 8px 0; color: #6b7280;">${appointment.duration} ${isArabic ? 'دقيقة' : 'minutes'}</td>
            </tr>
            ${appointment.meetingUrl ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">${isArabic ? 'رابط الاجتماع:' : 'Meeting Link:'}</td>
              <td style="padding: 8px 0;">
                <a href="${appointment.meetingUrl}" style="color: #0ea5e9; text-decoration: none; font-weight: bold;">
                  ${isArabic ? 'انضم إلى الاستشارة' : 'Join Consultation'}
                </a>
              </td>
            </tr>
            ` : ''}
          </table>
        </div>

        ${isVirtual ? `
        <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 16px;">
            ${isArabic ? 'تعليمات الاستشارة الافتراضية' : 'Virtual Consultation Instructions'}
          </h3>
          <ul style="margin: 0; padding-${isArabic ? 'right' : 'left'}: 20px; color: #047857;">
            <li>${isArabic ? 'تأكد من اتصال إنترنت مستقر' : 'Ensure stable internet connection'}</li>
            <li>${isArabic ? 'اختبر الكاميرا والميكروفون مسبقاً' : 'Test your camera and microphone beforehand'}</li>
            <li>${isArabic ? 'انضم قبل 5 دقائق من الموعد' : 'Join 5 minutes before the appointment'}</li>
            <li>${isArabic ? 'اختر مكاناً هادئاً ومضاء جيداً' : 'Choose a quiet, well-lit location'}</li>
          </ul>
        </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/appointments/${appointment.id}" 
             style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            ${isArabic ? 'عرض تفاصيل الموعد' : 'View Appointment Details'}
          </a>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px; text-align: center;">
          <p>${isArabic ? 'إذا كنت بحاجة لإعادة جدولة أو إلغاء الموعد، يرجى الاتصال بنا قبل 24 ساعة على الأقل.' : 'If you need to reschedule or cancel, please contact us at least 24 hours in advance.'}</p>
          <p style="margin: 10px 0 0 0;">${isArabic ? 'شكراً لاختيارك خدماتنا الصحية' : 'Thank you for choosing our healthcare services'}</p>
        </div>
      </div>
    </div>
  `

  await sendEmail({
    to: appointment.patientEmail,
    subject,
    html
  })
}

async function scheduleReminders(appointment: any) {
  // This would integrate with a job queue system like Bull or Agenda
  // For now, we'll store reminder times in the database
  const reminders = [
    { time: new Date(appointment.scheduledAt.getTime() - 24 * 60 * 60 * 1000), type: '24_HOUR' }, // 24 hours
    { time: new Date(appointment.scheduledAt.getTime() - 2 * 60 * 60 * 1000), type: '2_HOUR' },     // 2 hours
    { time: new Date(appointment.scheduledAt.getTime() - 15 * 60 * 1000), type: '15_MINUTE' }       // 15 minutes
  ]

  for (const reminder of reminders) {
    await prisma.appointmentReminder.create({
      data: {
        appointmentId: appointment.id,
        reminderTime: reminder.time,
        reminderType: reminder.type,
        sent: false
      }
    })
  }
}