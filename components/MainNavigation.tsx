'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Globe, Home, CalendarDays, Info, Mail, ChevronDown, LogOut, Settings, ClipboardList } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'

interface MainNavigationProps {
  language: 'english' | 'arabic'
  onLanguageChange: (lang: 'english' | 'arabic') => void
}

type UserData = { name: string; email: string; role: string }

export default function MainNavigation({ language, onLanguageChange }: MainNavigationProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const isActive  = (p: string) => pathname === p
  const isArabic  = language === 'arabic'

  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showMobileMenu,  setShowMobileMenu]  = useState(false)
  const [userData,        setUserData]        = useState<UserData>({ name: '', email: '', role: '' })
  const [scrolled,        setScrolled]        = useState(false)

  const allowedRoles              = ['ADMIN', 'CLINICAL_STAFF']
  const allowedRolesForAssessment = ['USER', 'ADMIN', 'CLINICAL_STAFF']

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (session?.user) setUserData(session.user as UserData)
  }, [session])

  const navItems = [
    { href: '/',             labelEn: 'Home',        labelAr: 'الرئيسية',    icon: <Home        className="w-[15px] h-[15px]" /> },
    { href: '/appointments', labelEn: 'Appointments',labelAr: 'المواعيد',    icon: <CalendarDays className="w-[15px] h-[15px]" /> },
    { href: '/about',        labelEn: 'About',       labelAr: 'من نحن',      icon: <Info        className="w-[15px] h-[15px]" /> },
    { href: '/contact',      labelEn: 'Contact',     labelAr: 'اتصل بنا',    icon: <Mail        className="w-[15px] h-[15px]" /> },
  ]
  if (allowedRoles.includes(userData?.role?.toUpperCase() || ''))
    navItems.push({ href: '/admin',      labelEn: 'Review',    labelAr: 'مراجعة',       icon: <ClipboardList className="w-[15px] h-[15px]" /> })
  if (allowedRolesForAssessment.includes(userData?.role?.toUpperCase() || ''))
    navItems.push({ href: '/assessment', labelEn: 'Assessment',labelAr: 'التقييم',      icon: <ClipboardList className="w-[15px] h-[15px]" /> })

  if (status === 'loading') return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#FDFAF8] border-b border-[#EDE8E3] h-[68px]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-full">
        <div className="flex items-center gap-3">
          <div className="w-[120px] h-[44px] bg-[#EDE8E3] animate-pulse rounded-xl" />
        </div>
        <div className="h-9 w-28 bg-[#EDE8E3] animate-pulse rounded-lg" />
      </div>
    </header>
  )

  return (
    <>
      <header className={`
        fixed top-0 left-0 w-full z-50
        transition-all duration-400
        ${scrolled
          ? 'bg-[#FDFAF8]/96 backdrop-blur-xl border-b border-[#EDE8E3] shadow-[0_1px_16px_rgba(26,20,16,0.07)]'
          : 'bg-[#FDFAF8] border-b border-[#EDE8E3]'
        }
        ${isArabic ? 'rtl' : 'ltr'}
      `}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 h-[68px]">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-0 group flex-shrink-0">
            <div className="relative h-[52px] w-[148px] transition-opacity duration-200 group-hover:opacity-90">
              <Image src="/logo.png" alt="LaTnsa" fill style={{ objectFit: 'contain', objectPosition: isArabic ? 'right center' : 'left center' }} priority />
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative flex items-center gap-2 px-4 py-2.5 rounded-xl
                  text-[13.5px] font-medium tracking-tight
                  transition-all duration-200
                  ${isArabic ? 'font-arabic' : ''}
                  ${isActive(item.href)
                    ? 'text-[#A31755] bg-[#F9EEF3]'
                    : 'text-[#4A3F38] hover:text-[#A31755] hover:bg-[#FDF5F8]'
                  }
                `}
              >
                <span className="opacity-60">{item.icon}</span>
                {isArabic ? item.labelAr : item.labelEn}
                {isActive(item.href) && (
                  <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-[#A31755] rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-2.5">

            {/* Language */}
            <button
              onClick={() => onLanguageChange(isArabic ? 'english' : 'arabic')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#EDE8E3] bg-white text-[13px] font-medium text-[#4A3F38] hover:border-[#A31755]/30 hover:text-[#A31755] hover:bg-[#FDF5F8] transition-all duration-200"
            >
              <Globe className="w-4 h-4 opacity-70" />
              {isArabic ? 'English' : 'عربي'}
            </button>

            {/* Auth */}
            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-xl border border-[#EDE8E3] bg-white hover:border-[#A31755]/25 hover:bg-[#FDF5F8] transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#A31755] flex items-center justify-center text-white text-sm font-bold">
                    {session.user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-[13px] font-medium text-[#1A1410] max-w-[100px] truncate">
                    {session.user.name}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#8C7E76] transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {showProfileMenu && (
                  <div className={`absolute ${isArabic ? 'left-0' : 'right-0'} top-full mt-2 w-60 bg-white rounded-2xl shadow-[0_8px_40px_rgba(26,20,16,0.12)] border border-[#EDE8E3] overflow-hidden z-50`}>
                    <div className="p-4 bg-[#F9EEF3] border-b border-[#EDE8E3]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#A31755] flex items-center justify-center text-white font-bold text-sm">
                          {session.user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-[13.5px] font-semibold text-[#1A1410] truncate ${isArabic ? 'font-arabic' : ''}`}>{session.user.name}</p>
                          <p className="text-[11.5px] text-[#8C7E76] truncate">{session.user.email}</p>
                        </div>
                      </div>
                      <span className="inline-flex mt-2.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#A31755] text-white rounded-full">
                        {userData?.role?.toLowerCase()}
                      </span>
                    </div>
                    <div className="py-1.5">
                      <Link href="/profile" onClick={() => setShowProfileMenu(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-[#4A3F38] hover:bg-[#F9EEF3] hover:text-[#A31755] transition-colors ${isArabic ? 'font-arabic' : ''}`}>
                        <Settings className="w-4 h-4 opacity-60" />
                        {isArabic ? 'إعدادات الملف الشخصي' : 'Profile Settings'}
                      </Link>
                      <button onClick={() => { setShowProfileMenu(false); signOut() }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-red-500 hover:bg-red-50 transition-colors ${isArabic ? 'font-arabic' : ''}`}>
                        <LogOut className="w-4 h-4" />
                        {isArabic ? 'تسجيل الخروج' : 'Sign Out'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/signin"
                  className={`hidden sm:block px-4 py-2.5 text-[13.5px] font-medium text-[#4A3F38] hover:text-[#A31755] hover:bg-[#FDF5F8] rounded-xl transition-all duration-200 ${isArabic ? 'font-arabic' : ''}`}>
                  {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                </Link>
                <Link href="/auth/register"
                  className={`px-5 py-2.5 text-[13.5px] font-semibold text-white bg-[#A31755] hover:bg-[#8B1248] rounded-xl transition-all duration-200 shadow-[0_2px_12px_rgba(163,23,85,0.25)] ${isArabic ? 'font-arabic' : ''}`}>
                  {isArabic ? 'احجز الآن' : 'Book Now'}
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2.5 rounded-xl hover:bg-[#F9EEF3] transition-colors"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-[14px] flex flex-col justify-between">
                <span className={`block h-[1.5px] bg-[#4A3F38] rounded transition-all duration-300 origin-left ${showMobileMenu ? 'rotate-[42deg] translate-y-[0.5px]' : ''}`} />
                <span className={`block h-[1.5px] bg-[#4A3F38] rounded transition-all duration-300 ${showMobileMenu ? 'opacity-0 scale-x-0' : ''}`} />
                <span className={`block h-[1.5px] bg-[#4A3F38] rounded transition-all duration-300 origin-left ${showMobileMenu ? '-rotate-[42deg] -translate-y-[0.5px]' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {showMobileMenu && (
          <div className="md:hidden bg-[#FDFAF8] border-t border-[#EDE8E3]">
            <nav className="px-5 py-4 space-y-1">
              {navItems.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 ${isArabic ? 'font-arabic' : ''} ${isActive(item.href) ? 'text-[#A31755] bg-[#F9EEF3]' : 'text-[#4A3F38] hover:text-[#A31755] hover:bg-[#FDF5F8]'}`}>
                  <span className="opacity-60">{item.icon}</span>
                  {isArabic ? item.labelAr : item.labelEn}
                </Link>
              ))}
              <div className="pt-3 border-t border-[#EDE8E3] mt-2 flex gap-2">
                <button
                  onClick={() => { onLanguageChange(isArabic ? 'english' : 'arabic'); setShowMobileMenu(false) }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#EDE8E3] bg-white text-[13.5px] font-medium text-[#4A3F38]">
                  <Globe className="w-4 h-4" />
                  {isArabic ? 'English' : 'عربي'}
                </button>
                {!session?.user && (
                  <Link href="/auth/register" onClick={() => setShowMobileMenu(false)}
                    className="flex-1 flex items-center justify-center py-3 rounded-xl bg-[#A31755] text-white text-[13.5px] font-semibold">
                    {isArabic ? 'احجز الآن' : 'Book Now'}
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {showProfileMenu && <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />}
    </>
  )
}