
// 4. ADMIN APPOINTMENTS DASHBOARD - /app/admin/appointments/page.tsx
// ==================================================================

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AppointmentDashboard from '@/components/AppointmentDashboard'


export default async function AdminAppointmentsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CLINICAL_STAFF')) {
    redirect('/admin/login')
  }

  return (
    <AppointmentDashboard 
      language="english" 
      userRole={session.user.role === 'ADMIN' ? 'admin' : 'clinical_staff'} 
    />
  )
}