// app/appointments/book/page.tsx
'use client' // Add this at the top!

import { Suspense } from 'react'

import { useLanguage } from '@/components/MainLayout'
import { useSearchParams } from 'next/navigation'

import AppointmentBooking from '@/components/AppointmentBooking'

// Remove metadata export - it's not compatible with 'use client'

function AppointmentContent() {
  const { language } = useLanguage()
  const searchParams = useSearchParams()

  return (
    <AppointmentBooking
      language={language}
      assessmentId={searchParams.get('assessmentId') || undefined}
      patientEmail={searchParams.get('patientEmail') || undefined}
      patientName={searchParams.get('patientName') || undefined}
    />
  )
}

export default function BookAppointmentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        <AppointmentContent />
      </Suspense>
    </div>
  )
}