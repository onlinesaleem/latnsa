'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Globe, Home, CalendarDays, Info, Mail, User, ChevronDown, LogOut, Settings } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'

interface MainNavigationProps {
  language: 'english' | 'arabic'
  onLanguageChange: (lang: 'english' | 'arabic') => void
}

type UserData = {
  name: string
  email: string
  role: string
}

export default function MainNavigation({ language, onLanguageChange }: MainNavigationProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path
  const isArabic = language === 'arabic'
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [userData, setUserData] = useState<UserData>({ name: '', email: '', role: '' })
  // ✅ Conditionally add "Review" menu for ADMIN and CLINICAL_STAFF
  const allowedRoles = ['ADMIN', 'CLINICAL_STAFF']
  const allowedRolesForAssessment = ['USER', 'ADMIN', 'CLINICAL_STAFF']
useEffect(() => {
  console.log('AssessmentForm language prop:', language)
  console.log('AssessmentForm isArabic:', isArabic)
}, [language, isArabic])
  // Update user data when session changes
  useEffect(() => {
    if (session?.user) {
      setUserData(session.user as UserData)
    }
  }, [session])
console.log("the user role is "+userData?.role);
  const navItems = [
    { 
      href: '/', 
      labelEn: 'Home', 
      labelAr: 'الرئيسية', 
      icon: <Home className="w-4 h-4" /> 
    },
    { 
      href: '/appointments', 
      labelEn: 'Appointments', 
      labelAr: 'المواعيد', 
      icon: <CalendarDays className="w-4 h-4" /> 
    },
    { 
      href: '/about', 
      labelEn: 'About', 
      labelAr: 'من نحن', 
      icon: <Info className="w-4 h-4" /> 
    },
    { 
      href: '/contact', 
      labelEn: 'Contact', 
      labelAr: 'اتصل بنا', 
      icon: <Mail className="w-4 h-4" /> 
    },
  
  
  ]
  // ✅ Conditionally add "Review" menu item AFTER the array is defined
  if (allowedRoles.includes(userData?.role?.toUpperCase() || '')) {
    navItems.push({
      href: '/admin',
      labelEn: 'Review',
      labelAr: 'مراجعة',
      icon: <Mail className="w-4 h-4" />,
    })
  }
  // ✅ Conditionally show Assessment Form menu for USER, ADMIN & CLINICAL_STAFF
  if (allowedRolesForAssessment.includes(userData?.role?.toUpperCase() || '')) {
    navItems.push({
      href: '/assessment',
      labelEn: 'Assessment',
      labelAr: 'نموذج التقييم',
      icon: <Mail className="w-4 h-4" />,
    })
  }

  // Show loading state while session is being fetched
  if (status === 'loading') {
    return (
      <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="space-y-1">
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-3 w-32 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
          <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </header>
    )
  }

  return (
    <header className={`fixed top-0 left-0 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200 z-50 shadow-sm ${isArabic ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
            <Image
              src="/logo.jpeg"
              alt="Latnsa Logo"
              fill
              className="object-contain rounded-lg shadow-sm"
              priority
            />
          </div>
          <div>
            <h1 className={`text-xl font-bold bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] bg-clip-text text-transparent ${isArabic ? 'font-arabic' : ''}`}>
              {isArabic ? 'لا تنسى للصحة' : 'LaTnsa'}
            </h1>
            <p className={`text-xs text-gray-600 -mt-0.5 ${isArabic ? 'font-arabic' : ''}`}>
              {isArabic ? 'نحن معك.. حتى لاتنسى' : 'With you… so you never forget'}
            </p>
          </div>
        </Link>

        {/* ⭐ DESKTOP NAVIGATION - THIS WAS MISSING! */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                transition-all duration-300 ease-in-out
                ${isArabic ? 'font-arabic' : ''}
                ${isActive(item.href)
                  ? 'text-[#E76A6A] bg-rose-50'
                  : 'text-gray-700 hover:text-[#E76A6A] hover:bg-gray-50'
                }
              `}
            >
              <span className="transition-transform duration-300 group-hover:scale-110">
                {item.icon}
              </span>
              <span>{isArabic ? item.labelAr : item.labelEn}</span>
              {isActive(item.href) && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] rounded-full"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => onLanguageChange(isArabic ? 'english' : 'arabic')}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg
              text-gray-700 hover:text-[#E76A6A] hover:bg-gray-50
              transition-all duration-300 ease-in-out
              ${isArabic ? 'font-arabic' : ''}
            `}
          >
            <Globe className="w-5 h-5 transition-transform duration-300 hover:rotate-12" />
            <span className="text-sm font-medium">
              {isArabic ? 'English' : 'عربي'}
            </span>
          </button>

          {/* User Profile or Sign In */}
          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg
                  bg-gradient-to-r from-[#E76A6A]/10 to-[#85C3E0]/10
                  hover:from-[#E76A6A]/20 hover:to-[#85C3E0]/20
                  transition-all duration-300 ease-in-out
                  border border-gray-200
                  ${isArabic ? 'font-arabic' : ''}
                `}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] flex items-center justify-center text-white font-semibold text-sm">
                  {session.user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {session.user.name}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className={`
                  absolute ${isArabic ? 'left-0' : 'right-0'} mt-2 w-56 
                  bg-white rounded-xl shadow-xl border border-gray-200
                  overflow-hidden
                  animate-in fade-in slide-in-from-top-2 duration-300
                  z-50
                `}>
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#E76A6A]/5 to-[#85C3E0]/5">
                    <p className={`text-sm font-semibold text-gray-900 ${isArabic ? 'font-arabic' : ''}`}>
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user.email}
                    </p>
                    <span className="inline-flex mt-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                      {userData?.role?.toLowerCase() || session.user.role?.toLowerCase()}
                    </span>
                  </div>
                  
                  <div className="py-2">
                    <Link
                      href="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className={`
                        flex items-center gap-3 px-4 py-2.5
                        text-gray-700 hover:bg-gray-50 hover:text-[#E76A6A]
                        transition-all duration-200
                        ${isArabic ? 'font-arabic' : ''}
                      `}
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">
                        {isArabic ? 'إعدادات الملف الشخصي' : 'Profile Settings'}
                      </span>
                    </Link>
                    
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        signOut()
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2.5
                        text-red-600 hover:bg-red-50
                        transition-all duration-200
                        ${isArabic ? 'font-arabic' : ''}
                      `}
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">
                        {isArabic ? 'تسجيل الخروج' : 'Sign Out'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className={`
                px-4 py-2 text-sm font-medium rounded-lg
                text-gray-700 hover:text-[#E76A6A] hover:bg-gray-50
                transition-all duration-300 ease-in-out
                ${isArabic ? 'font-arabic' : ''}
              `}
            >
              {isArabic ? 'تسجيل الدخول' : 'Sign In'}
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="w-5 h-5 flex flex-col justify-center gap-1">
              <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ${showMobileMenu ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ${showMobileMenu ? 'opacity-0' : ''}`}></span>
              <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ${showMobileMenu ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className={`
          md:hidden border-t border-gray-200 bg-white
          animate-in slide-in-from-top duration-300
        `}>
          <nav className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMobileMenu(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-300 ease-in-out
                  ${isArabic ? 'font-arabic' : ''}
                  ${isActive(item.href)
                    ? 'text-[#E76A6A] bg-rose-50'
                    : 'text-gray-700 hover:text-[#E76A6A] hover:bg-gray-50'
                  }
                `}
              >
                {item.icon}
                <span className="text-sm font-medium">
                  {isArabic ? item.labelAr : item.labelEn}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Click Outside to Close Dropdown */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </header>
  )
}