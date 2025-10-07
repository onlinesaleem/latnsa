
// ==================================================================
// 1. PUBLIC BOOKING PAGE - /app/appointments/book/page.tsx
// ==================================================================

import { Suspense } from 'react'
import { Metadata } from 'next'
import AppointmentBooking from '@/components/AppointmentBooking'

export const metadata: Metadata = {
  title: 'Book Appointment | Healthcare System',
  description: 'Schedule your medical appointment online'
}

export default function BookAppointmentPage({
  searchParams
}: {
  searchParams: { assessmentId?: string; patientEmail?: string; patientName?: string; language?: string }
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <AppointmentBooking
          language={searchParams.language === 'arabic' ? 'arabic' : 'english'}
          assessmentId={searchParams.assessmentId}
          patientEmail={searchParams.patientEmail}
          patientName={searchParams.patientName}
        />
      </Suspense>
    </div>
  )
}
