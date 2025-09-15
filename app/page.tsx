
// app/page.tsx - Home page that redirects to registration
import { redirect } from 'next/navigation'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import LandingPage from '@/components/LandingPage'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
    return <LandingPage />
  // If user is logged in, redirect based on role
  // if (session) {
  //   if (session.user.role === 'ADMIN' || session.user.role === 'CLINICAL_STAFF') {
  //     redirect('/admin')
  //   } else {
  //     redirect('/assessment')
  //   }
  // }
  
  // If not logged in, redirect to registration
  redirect('/auth/register')
}