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

const FONT = "'Baloo Bhaijaan 2', system-ui, sans-serif"

export default function MainNavigation({ language, onLanguageChange }: MainNavigationProps) {
  const { data: session, status } = useSession()
  const pathname  = usePathname()
  const isActive  = (p: string) => pathname === p
  const isArabic  = language === 'arabic'

  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showMobileMenu,  setShowMobileMenu]  = useState(false)
  const [userData,        setUserData]        = useState<UserData>({ name: '', email: '', role: '' })
  const [scrolled,        setScrolled]        = useState(false)

  const allowedRoles              = ['ADMIN', 'CLINICAL_STAFF']
  const allowedRolesForAssessment = ['USER', 'ADMIN', 'CLINICAL_STAFF']

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (session?.user) setUserData(session.user as UserData)
  }, [session])

  const navItems = [
    { href: '/',             labelEn: 'Home',        labelAr: 'الرئيسية',  icon: <Home         className="w-[15px] h-[15px]" /> },
    { href: '/appointments', labelEn: 'Appointments',labelAr: 'المواعيد',  icon: <CalendarDays className="w-[15px] h-[15px]" /> },
    { href: '/about',        labelEn: 'About',       labelAr: 'من نحن',    icon: <Info         className="w-[15px] h-[15px]" /> },
    { href: '/contact',      labelEn: 'Contact',     labelAr: 'اتصل بنا',  icon: <Mail         className="w-[15px] h-[15px]" /> },
  ]
  if (allowedRoles.includes(userData?.role?.toUpperCase() || ''))
    navItems.push({ href: '/admin',      labelEn: 'Review',    labelAr: 'مراجعة',   icon: <ClipboardList className="w-[15px] h-[15px]" /> })
  if (allowedRolesForAssessment.includes(userData?.role?.toUpperCase() || ''))
    navItems.push({ href: '/assessment', labelEn: 'Assessment',labelAr: 'التقييم',  icon: <ClipboardList className="w-[15px] h-[15px]" /> })

  if (status === 'loading') return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#FFFEF9] border-b border-[#F2F2F2] h-[68px]" style={{ fontFamily: FONT }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-full">
        <div className="w-[130px] h-[44px] bg-[#F2F2F2] animate-pulse rounded-xl" />
        <div className="h-9 w-28 bg-[#F2F2F2] animate-pulse rounded-lg" />
      </div>
    </header>
  )

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isArabic ? 'rtl' : 'ltr'}`}
        style={{
          fontFamily: FONT,
          background: '#FFFEF9',
          borderBottom: '1px solid #F2F2F2',
          boxShadow: scrolled ? '0 1px 16px rgba(26,20,16,0.07)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 h-[68px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-0 group flex-shrink-0">
            <div className="relative h-[52px] w-[148px] transition-opacity duration-200 group-hover:opacity-90">
              <Image src="/logo.png" alt="LaTnsa" fill style={{ objectFit: 'contain', objectPosition: isArabic ? 'right center' : 'left center' }} priority />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 ${isArabic ? 'font-arabic' : ''} ${isActive(item.href) ? 'text-[#A31755] bg-[#F9EEF3]' : 'text-[#4A3F38] hover:text-[#A31755] hover:bg-[#FDF5F8]'}`}
                style={{ fontFamily: FONT }}
              >
                <span className="opacity-60">{item.icon}</span>
                {isArabic ? item.labelAr : item.labelEn}
                {isActive(item.href) && (
                  <span className="absolute bottom-1 left-4 right-4 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg,#A31755,#405EAA)' }} />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* Language */}
            <button
              onClick={() => onLanguageChange(isArabic ? 'english' : 'arabic')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[#4A3F38] hover:text-[#A31755] hover:bg-[#FDF5F8] transition-all duration-200"
              style={{ fontFamily: FONT, border: '1px solid #F2F2F2', background: 'white' }}
            >
              <Globe className="w-4 h-4 opacity-70" />
              {isArabic ? 'English' : 'عربي'}
            </button>

            {/* Auth */}
            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-xl transition-all duration-200"
                  style={{ border: '1px solid #F2F2F2', background: 'white', fontFamily: FONT }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg,#A31755,#405EAA)' }}>
                    {session.user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-[13px] font-medium text-[#1A1410] max-w-[100px] truncate" style={{ fontFamily: FONT }}>
                    {session.user.name}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#8C7E76] transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {showProfileMenu && (
                  <div className={`absolute ${isArabic ? 'left-0' : 'right-0'} top-full mt-2 w-60 bg-white rounded-2xl overflow-hidden z-50`}
                    style={{ boxShadow: '0 8px 40px rgba(26,20,16,0.12)', border: '1px solid #F2F2F2', fontFamily: FONT }}>
                    <div className="p-4 border-b border-[#F2F2F2] bg-[#F9EEF3]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg,#A31755,#405EAA)' }}>
                          {session.user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-semibold text-[#1A1410] truncate">{session.user.name}</p>
                          <p className="text-[11.5px] text-[#8C7E76] truncate">{session.user.email}</p>
                        </div>
                      </div>
                      <span className="inline-flex mt-2.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white rounded-full" style={{ background: 'linear-gradient(135deg,#A31755,#405EAA)' }}>
                        {userData?.role?.toLowerCase()}
                      </span>
                    </div>
                    <div className="py-1.5">
                      <Link href="/profile" onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-[#4A3F38] hover:bg-[#F9EEF3] hover:text-[#A31755] transition-colors">
                        <Settings className="w-4 h-4 opacity-60" />
                        {isArabic ? 'إعدادات الملف الشخصي' : 'Profile Settings'}
                      </Link>
                      <button onClick={() => { setShowProfileMenu(false); signOut() }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-red-500 hover:bg-red-50 transition-colors">
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
                  className="hidden sm:block px-4 py-2.5 text-[13.5px] font-medium text-[#4A3F38] hover:text-[#A31755] hover:bg-[#FDF5F8] rounded-xl transition-all duration-200"
                  style={{ fontFamily: FONT }}>
                  {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                </Link>
                <Link href="/auth/register"
                  className="px-5 py-2.5 text-[13.5px] font-semibold text-white rounded-xl transition-all duration-200"
                  style={{ fontFamily: FONT, background: '#a8d163', boxShadow: '0 2px 12px rgba(64,94,170,0.28)' }}>
                  {isArabic ? 'احجز الآن' : 'Book Now'}
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2.5 rounded-xl hover:bg-[#F9EEF3] transition-colors" aria-label="Toggle menu">
              <div className="w-5 h-[14px] flex flex-col justify-between">
                <span className={`block h-[1.5px] bg-[#4A3F38] rounded transition-all duration-300 origin-left ${showMobileMenu ? 'rotate-[42deg] translate-y-[0.5px]' : ''}`} />
                <span className={`block h-[1.5px] bg-[#4A3F38] rounded transition-all duration-300 ${showMobileMenu ? 'opacity-0 scale-x-0' : ''}`} />
                <span className={`block h-[1.5px] bg-[#4A3F38] rounded transition-all duration-300 origin-left ${showMobileMenu ? '-rotate-[42deg] -translate-y-[0.5px]' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-[#FFFEF9] border-t border-[#F2F2F2]" style={{ fontFamily: FONT }}>
            <nav className="px-5 py-4 space-y-1">
              {navItems.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 ${isActive(item.href) ? 'text-[#A31755] bg-[#F9EEF3]' : 'text-[#4A3F38] hover:text-[#A31755] hover:bg-[#FDF5F8]'}`}>
                  <span className="opacity-60">{item.icon}</span>
                  {isArabic ? item.labelAr : item.labelEn}
                </Link>
              ))}
              <div className="pt-3 border-t border-[#F2F2F2] mt-2 flex gap-2">
                <button onClick={() => { onLanguageChange(isArabic ? 'english' : 'arabic'); setShowMobileMenu(false) }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-[#4A3F38]"
                  style={{ border: '1px solid #F2F2F2', background: 'white' }}>
                  <Globe className="w-4 h-4" />{isArabic ? 'English' : 'عربي'}
                </button>
                {!session?.user && (
                  <Link href="/auth/register" onClick={() => setShowMobileMenu(false)}
                    className="flex-1 flex items-center justify-center py-2.5 rounded-xl text-white text-[13.5px] font-semibold"
                    style={{ background: 'linear-gradient(135deg,#A31755,#405EAA)' }}>
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