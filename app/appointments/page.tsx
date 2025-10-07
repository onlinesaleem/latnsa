
// ==================================================================
// 2. USER APPOINTMENTS PAGE - /app/appointments/page.tsx
// ==================================================================

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import UserAppointments from '@/components/UserAppointments'


export default async function AppointmentsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/appointments')
  }

  return <UserAppointments />
}