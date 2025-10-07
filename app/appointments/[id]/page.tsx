
// ==================================================================
// 3. SINGLE APPOINTMENT VIEW - /app/appointments/[id]/page.tsx  
// ==================================================================

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SingleAppointmentView from '@/components/SingleAppointmentView'


export default async function AppointmentDetailsPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Verify user can access this appointment
  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      assessment: {
        select: {
          id: true,
          status: true,
          clinicalScore: true
        }
      }
    }
  })

  if (!appointment) {
    redirect('/appointments')
  }

  // Users can only see their own appointments
  if (session.user.role === 'USER' && appointment.patientEmail !== session.user.email) {
    redirect('/appointments')
  }

  return <SingleAppointmentView appointment={appointment} />
}