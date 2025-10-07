// app/api/appointments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ZoomService } from '@/lib/zoom-service'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  notes: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  duration: z.number().min(15).max(180).optional()
})

// GET Single Appointment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
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

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check permission - users can only view their own appointments
    if (session.user.role === 'USER' && appointment.patientEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      appointment
    })

  } catch (error) {
    console.error('Get appointment error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    )
  }
}

// UPDATE Appointment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admins and clinical staff can update appointments
    if (session.user.role !== 'ADMIN' && session.user.role !== 'CLINICAL_STAFF') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const updateData = updateSchema.parse(body)

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: params.id }
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Handle Zoom meeting updates for virtual consultations
    let meetingUpdates = {}
    if (updateData.scheduledAt || updateData.duration) {
      if (existingAppointment.meetingId && 
          (existingAppointment.type === 'VIRTUAL_CONSULTATION' || existingAppointment.type === 'VIDEO_CALL')) {
        try {
          const zoomService = new ZoomService()
          await zoomService.updateMeeting(existingAppointment.meetingId, {
            start_time: updateData.scheduledAt || existingAppointment.scheduledAt.toISOString(),
            duration: updateData.duration || existingAppointment.duration
          })
        } catch (error) {
          console.error('Failed to update Zoom meeting:', error)
          // Continue with appointment update even if Zoom update fails
        }
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        ...updateData,
        ...(updateData.scheduledAt && { scheduledAt: new Date(updateData.scheduledAt) }),
        updatedAt: new Date()
      }
    })

    // Send notification email if status changed
    if (updateData.status && updateData.status !== existingAppointment.status) {
      await sendStatusUpdateEmail(updatedAppointment, updateData.status)
    }

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment
    })

  } catch (error) {
    console.error('Update appointment error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}

// DELETE Appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Delete Zoom meeting if exists
    if (appointment.meetingId) {
      try {
        const zoomService = new ZoomService()
        await zoomService.deleteMeeting(appointment.meetingId)
      } catch (error) {
        console.error('Failed to delete Zoom meeting:', error)
        // Continue with appointment deletion
      }
    }

    // Delete related reminders
    await prisma.appointmentReminder.deleteMany({
      where: { appointmentId: params.id }
    })

    // Delete appointment
    await prisma.appointment.delete({
      where: { id: params.id }
    })

    // Send cancellation email
    await sendCancellationEmail(appointment)

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully'
    })

  } catch (error) {
    console.error('Delete appointment error:', error)
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    )
  }
}

// Helper function to send status update email
async function sendStatusUpdateEmail(appointment: any, newStatus: string) {
  const isArabic = appointment.language === 'ARABIC'
  
  const statusMessages: Record<string, { en: string; ar: string }> = {
    CONFIRMED: {
      en: 'Your appointment has been confirmed',
      ar: 'تم تأكيد موعدك'
    },
    IN_PROGRESS: {
      en: 'Your appointment is now in progress',
      ar: 'موعدك جاري الآن'
    },
    COMPLETED: {
      en: 'Your appointment has been completed',
      ar: 'تم إنهاء موعدك'
    },
    CANCELLED: {
      en: 'Your appointment has been cancelled',
      ar: 'تم إلغاء موعدك'
    },
    NO_SHOW: {
      en: 'Appointment marked as no-show',
      ar: 'تم تسجيل عدم الحضور'
    }
  }

  const message = statusMessages[newStatus]
  if (!message) return

  const subject = isArabic ? message.ar : message.en
  const appointmentDate = new Date(appointment.scheduledAt).toLocaleString()

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0ea5e9;">${subject}</h2>
      <p>${isArabic ? 'عزيزي' : 'Dear'} ${appointment.patientName},</p>
      <p>${isArabic ? message.ar : message.en}</p>
      <p><strong>${isArabic ? 'التاريخ والوقت:' : 'Date & Time:'}</strong> ${appointmentDate}</p>
      ${appointment.meetingUrl ? `
        <p><strong>${isArabic ? 'رابط الاجتماع:' : 'Meeting Link:'}</strong> 
          <a href="${appointment.meetingUrl}">${isArabic ? 'انضم إلى الاستشارة' : 'Join Consultation'}</a>
        </p>
      ` : ''}
      <p>${isArabic ? 'شكراً لاختيارك خدماتنا الصحية' : 'Thank you for choosing our healthcare services'}</p>
    </div>
  `

  await sendEmail({
    to: appointment.patientEmail,
    subject,
    html
  })
}

// Helper function to send cancellation email
async function sendCancellationEmail(appointment: any) {
  const isArabic = appointment.language === 'ARABIC'
  
  const subject = isArabic ? 'إلغاء الموعد' : 'Appointment Cancelled'
  const appointmentDate = new Date(appointment.scheduledAt).toLocaleString()

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">${subject}</h2>
      <p>${isArabic ? 'عزيزي' : 'Dear'} ${appointment.patientName},</p>
      <p>${isArabic ? 'نأسف لإبلاغك بأنه تم إلغاء موعدك المجدول.' : 'We regret to inform you that your scheduled appointment has been cancelled.'}</p>
      <p><strong>${isArabic ? 'التاريخ والوقت المُلغى:' : 'Cancelled Date & Time:'}</strong> ${appointmentDate}</p>
      <p>${isArabic ? 'يرجى الاتصال بنا لإعادة جدولة موعد جديد.' : 'Please contact us to reschedule a new appointment.'}</p>
      <p>${isArabic ? 'نعتذر عن أي إزعاج قد يسببه هذا الإلغاء.' : 'We apologize for any inconvenience this cancellation may cause.'}</p>
    </div>
  `

  await sendEmail({
    to: appointment.patientEmail,
    subject,
    html
  })
}