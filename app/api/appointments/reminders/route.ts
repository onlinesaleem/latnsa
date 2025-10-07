
// ====================================================================
// app/api/appointments/reminders/route.ts - Process reminders
// ====================================================================

import { NextRequest, NextResponse } from 'next/server'
import { AppointmentReminderService } from '@/lib/appointment-reminders'

// This endpoint would be called by a cron job or scheduled task
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from your cron service (add authentication)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const reminderService = new AppointmentReminderService()
    await reminderService.processScheduledReminders()

    return NextResponse.json({
      success: true,
      message: 'Reminders processed successfully'
    })

  } catch (error) {
    console.error('Process reminders error:', error)
    return NextResponse.json(
      { error: 'Failed to process reminders' },
      { status: 500 }
    )
  }
}
