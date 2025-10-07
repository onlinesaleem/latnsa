// lib/appointment-reminders.ts
import { prisma } from './prisma'
import { sendEmail } from './email'

export class AppointmentReminderService {
  async sendReminder(reminderId: string) {
    const reminder = await prisma.appointmentReminder.findUnique({
      where: { id: reminderId },
      include: {
        appointment: true
      }
    })

    if (!reminder || reminder.sent) {
      return
    }

    const appointment = reminder.appointment
    const isVirtual = appointment.type === 'VIRTUAL_CONSULTATION' || appointment.type === 'VIDEO_CALL'
    const isArabic = appointment.language === 'ARABIC'

    let subject = ''
    let timeText = ''

    switch (reminder.reminderType) {
      case '24_HOUR':
        subject = isArabic ? 'تذكير: موعدك غداً' : 'Reminder: Your appointment tomorrow'
        timeText = isArabic ? 'خلال 24 ساعة' : 'in 24 hours'
        break
      case '2_HOUR':
        subject = isArabic ? 'تذكير: موعدك خلال ساعتين' : 'Reminder: Your appointment in 2 hours'
        timeText = isArabic ? 'خلال ساعتين' : 'in 2 hours'
        break
      case '15_MINUTE':
        subject = isArabic ? 'تذكير عاجل: موعدك خلال 15 دقيقة' : 'Urgent: Your appointment in 15 minutes'
        timeText = isArabic ? 'خلال 15 دقيقة' : 'in 15 minutes'
        break
    }

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

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: ${isArabic ? 'rtl' : 'ltr'};">
        <div style="background: #f59e0b; padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 20px;">${subject}</h1>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            ${isArabic ? `عزيزي ${appointment.patientName}،` : `Dear ${appointment.patientName},`}
          </p>
          
          <p style="color: #6b7280;">
            ${isArabic ? `لديك موعد ${timeText}:` : `You have an appointment ${timeText}:`}
          </p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>${isArabic ? 'التاريخ والوقت:' : 'Date & Time:'}</strong> ${appointmentDate}</p>
            <p><strong>${isArabic ? 'النوع:' : 'Type:'}</strong> ${isVirtual ? (isArabic ? 'استشارة افتراضية' : 'Virtual Consultation') : (isArabic ? 'موعد عيادة' : 'Clinic Appointment')}</p>
            ${appointment.meetingUrl ? `<p><strong>${isArabic ? 'رابط الاجتماع:' : 'Meeting Link:'}</strong> <a href="${appointment.meetingUrl}">${isArabic ? 'انضم الآن' : 'Join Now'}</a></p>` : ''}
          </div>
          
          ${isVirtual && reminder.reminderType === '15_MINUTE' ? `
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="color: #92400e; margin: 0; font-weight: bold;">
              ${isArabic ? 'يمكنك الانضمام الآن!' : 'You can join now!'}
            </p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 20px 0;">
            ${appointment.meetingUrl ? `
            <a href="${appointment.meetingUrl}" 
               style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 0 10px;">
              ${isArabic ? 'انضم إلى الاستشارة' : 'Join Consultation'}
            </a>
            ` : ''}
            <a href="${process.env.NEXTAUTH_URL}/appointments/${appointment.id}" 
               style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 0 10px;">
              ${isArabic ? 'عرض التفاصيل' : 'View Details'}
            </a>
          </div>
        </div>
      </div>
    `

    await sendEmail({
      to: appointment.patientEmail,
      subject,
      html
    })

    // Mark reminder as sent
    await prisma.appointmentReminder.update({
      where: { id: reminderId },
      data: { sent: true, sentAt: new Date() }
    })
  }

  async processScheduledReminders() {
    const now = new Date()
    const pendingReminders = await prisma.appointmentReminder.findMany({
      where: {
        sent: false,
        reminderTime: {
          lte: now
        }
      },
      include: {
        appointment: true
      }
    })

    for (const reminder of pendingReminders) {
      // Skip if appointment is cancelled
      if (reminder.appointment.status === 'CANCELLED') {
        await prisma.appointmentReminder.update({
          where: { id: reminder.id },
          data: { sent: true, sentAt: new Date() }
        })
        continue
      }

      try {
        await this.sendReminder(reminder.id)
      } catch (error) {
        console.error(`Failed to send reminder ${reminder.id}:`, error)
      }
    }
  }
}