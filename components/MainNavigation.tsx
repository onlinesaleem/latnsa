'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  Brain, 
  Menu, 
  X, 
  Globe, 
  User, 
  LogOut, 
  Settings,
  ChevronDown,
  Home,
  Info,
  Mail,
  FileText,
  Shield
} from 'lucide-react'

interface NavigationProps {
  language?: 'english' | 'arabic'
  onLanguageChange?: (lang: 'english' | 'arabic') => void
}

export default function MainNavigation({ language = 'english', onLanguageChange }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const isArabic = language === 'arabic'

  const navLinks = [
    {
      labelEn: 'Home',
      labelAr: 'الرئيسية',
      href: '/',
      icon: Home
    },
    {
      labelEn: 'Assessment',
      labelAr: 'التقييم',
      href: '/assessment',
      icon: FileText,
      requiresAuth: true
    },
    {
      labelEn: 'About',
      labelAr: 'حول',
      href: '/about',
      icon: Info
    },
    {
      labelEn: 'Contact',
      labelAr: 'اتصل بنا',
      href: '/contact',
      icon: Mail
    }
  ]

  const handleLanguageToggle = () => {
    const newLang = language === 'english' ? 'arabic' : 'english'
    onLanguageChange?.(newLang)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const isActivePath = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false)
      setIsUserMenuOpen(false)
    }

    if (isOpen || isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen, isUserMenuOpen])

  return (
    <nav className={`bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50 ${isArabic ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="hidden md:block">
              <div className="text-xl font-bold text-gray-900">
                {isArabic ? 'لاتنسا الصحية' : 'Latnsa Health'}
              </div>
              <div className="text-xs text-gray-500">
                {isArabic ? 'نظام التقييم الصحي' : 'Health Assessment System'}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              if (link.requiresAuth && status !== 'authenticated') return null
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActivePath(link.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{isArabic ? link.labelAr : link.labelEn}</span>
                </Link>
              )
            })}
          </div>

          {/* Right side - Language & Auth */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={handleLanguageToggle}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language === 'english' ? 'عربي' : 'English'}
              </span>
            </button>

            {/* User Menu */}
            {status === 'authenticated' ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsUserMenuOpen(!isUserMenuOpen)
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {session.user.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{session.user.name}</div>
                      <div className="text-xs text-gray-500">{session.user.email}</div>
                      <div className="text-xs text-blue-600 capitalize">{session.user.role?.toLowerCase()}</div>
                    </div>
                    
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4" />
                      <span>{isArabic ? 'الملف الشخصي' : 'Profile Settings'}</span>
                    </Link>
                    
                    {(session.user.role === 'ADMIN' || session.user.role === 'CLINICAL_STAFF') && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Shield className="w-4 h-4" />
                        <span>{isArabic ? 'لوحة الإدارة' : 'Admin Panel'}</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{isArabic ? 'تسجيل الخروج' : 'Sign Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {isArabic ? 'ابدأ التقييم' : 'Start Assessment'}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(!isOpen)
              }}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="space-y-2">
              {navLinks.map((link) => {
                if (link.requiresAuth && status !== 'authenticated') return null
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActivePath(link.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{isArabic ? link.labelAr : link.labelEn}</span>
                  </Link>
                )
              })}

              {status !== 'authenticated' && (
                <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
                  <Link
                    href="/auth/signin"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
                  >
                    {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-center"
                  >
                    {isArabic ? 'ابدأ التقييم' : 'Start Assessment'}
                  </Link>
                </div>
              )}

              {status === 'authenticated' && (
                <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
                  <div className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900">{session?.user.name}</div>
                    <div className="text-xs text-gray-500">{session?.user.email}</div>
                  </div>
                  
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <Settings className="w-4 h-4" />
                    <span>{isArabic ? 'الملف الشخصي' : 'Profile Settings'}</span>
                  </Link>
                  
                  {(session?.user.role === 'ADMIN' || session?.user.role === 'CLINICAL_STAFF') && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <Shield className="w-4 h-4" />
                      <span>{isArabic ? 'لوحة الإدارة' : 'Admin Panel'}</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isArabic ? 'تسجيل الخروج' : 'Sign Out'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}