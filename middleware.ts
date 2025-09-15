// middleware.ts (in root directory)
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        const publicRoutes = [
          '/',
          '/auth/signin',
          '/auth/register',
          '/assessment',
          '/api/auth/send-otp',
          '/api/auth/verify-otp',
          '/api/auth/register'
        ]
        
        const { pathname } = req.nextUrl
        
        // Allow access to public routes
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true
        }
        
        // Allow access to NextAuth routes
        if (pathname.startsWith('/api/auth/')) {
          return true
        }
        
        // For admin routes, check if user has admin role
        if (pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN' || token?.role === 'CLINICAL_STAFF'
        }
        
        // For other protected routes, just check if token exists
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ]
}
