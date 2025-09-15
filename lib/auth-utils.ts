
// lib/auth-utils.ts
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"
import { redirect } from "next/navigation"

export async function getRequiredServerSession() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  return session
}

export async function requireAdmin() {
  const session = await getRequiredServerSession()
  
  if (session.user.role !== 'ADMIN' && session.user.role !== 'CLINICAL_STAFF') {
    redirect('/')
  }
  
  return session
}

// hooks/useAuth.ts
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useRequireAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  return { session, status }
}

export function useRequireAdmin() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'CLINICAL_STAFF') {
      router.push('/')
    }
  }, [session, status, router])

  return { session, status }
}