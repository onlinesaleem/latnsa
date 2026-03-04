// app/layout.tsx
import type { Metadata } from 'next'
import { Baloo_Bhaijaan_2 } from 'next/font/google'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/components/SessionProvider'
import MainLayout from '@/components/MainLayout'
import './globals.css'

// ─────────────────────────────────────────────────────────────
// Baloo Bhajaan 2 supports BOTH Latin (English) AND Arabic
// in a single font — no need for two separate fonts anymore.
// next/font downloads and self-hosts it automatically at build
// time. No manual download or copy required.
// ─────────────────────────────────────────────────────────────
const balooBhajaan = Baloo_Bhaijaan_2({
  subsets: ['latin', 'arabic'],      // loads both scripts
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-baloo',          // CSS variable used by Tailwind
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Latnsa Health - Healthcare Assessment System',
  description: 'Comprehensive cognitive and functional health assessment platform',
  keywords: 'healthcare, assessment, cognitive, functional, medical evaluation, saudi arabia',
  authors: [{ name: 'Latnsa Health' }],
  openGraph: {
    title: 'Latnsa Health - Healthcare Assessment System',
    description: 'Comprehensive cognitive and functional health assessment platform',
    type: 'website',
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    // balooBhajaan.variable  → injects --font-baloo CSS variable onto <html>
    // MainLayout handles dir="rtl/ltr" and lang="ar/en" dynamically
    <html lang="en" className={balooBhajaan.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      {/* font-baloo applies Baloo Bhajaan 2 globally via Tailwind */}
      <body className="font-baloo antialiased">
        <SessionProvider session={session}>
          <MainLayout>
            {children}
          </MainLayout>
        </SessionProvider>
      </body>
    </html>
  )
}