// app/layout.tsx - Updated root layout
import type { Metadata } from 'next'
import { Inter, Cairo } from 'next/font/google'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/components/SessionProvider'
import MainLayout from '@/components/MainLayout'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const cairo = Cairo({ 
  subsets: ['arabic'],
  variable: '--font-cairo',
  display: 'swap'
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
    <html lang="en" className={`${inter.variable} ${cairo.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider session={session}>
          <MainLayout>
            {children}
          </MainLayout>
        </SessionProvider>
      </body>
    </html>
  )
}
