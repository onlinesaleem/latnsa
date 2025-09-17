// Option 1: Add as separate page in admin layout
// app/admin/reports/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ReportsAnalytics from '@/components/ReportsAnalytics'

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CLINICAL_STAFF')) {
    redirect('/admin/login')
  }

  return <ReportsAnalytics language="english" />
}