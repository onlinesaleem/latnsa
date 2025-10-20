'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Globe, Home, CalendarDays, Info, Mail } from 'lucide-react'
import { Button } from './ui/button'


interface MainNavigationProps {
  language: 'english' | 'arabic'
  onLanguageChange: (lang: 'english' | 'arabic') => void
}

export default function MainNavigation({ language, onLanguageChange }: MainNavigationProps) {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  const navItems = [
    { href: '/', labelEn: 'Home', labelAr: 'الرئيسية', icon: <Home className="w-4 h-4" /> },
    { href: '/appointments', labelEn: 'Book Appointment', labelAr: 'حجز موعد', icon: <CalendarDays className="w-4 h-4" /> },
    { href: '/about', labelEn: 'About', labelAr: 'حول', icon: <Info className="w-4 h-4" /> },
    { href: '/contact', labelEn: 'Contact', labelAr: 'اتصل بنا', icon: <Mail className="w-4 h-4" /> },
  ]

  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        
        {/* 🌿 Logo + Title */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative w-8 h-8">
            <Image
              src="/logo.jpeg"
              alt="Latnsa Logo"
              fill
              className="object-contain rounded-md"
              priority
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Latnsa Health
            </h1>
            <p className="text-xs text-gray-500 -mt-1">
              {language === 'arabic' ? 'نظام التقييم الصحي' : 'Health Assessment System'}
            </p>
          </div>
        </Link>

        {/* 🌐 Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'text-[#E76A6A]'
                  : 'text-gray-700 hover:text-[#E76A6A]'
              }`}
            >
              {item.icon}
              {language === 'arabic' ? item.labelAr : item.labelEn}
            </Link>
          ))}
        </nav>

        {/* 🌍 Actions */}
        <div className="flex items-center space-x-4">
          {/* Language Toggle */}
          <button
            onClick={() => onLanguageChange(language === 'arabic' ? 'english' : 'arabic')}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition"
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">
              {language === 'arabic' ? 'EN' : 'عربي'}
            </span>
          </button>

          {/* Sign In */}
          <Link
            href="/auth/signin"
            className="text-sm font-medium text-gray-700 hover:text-[#E76A6A] transition"
          >
            {language === 'arabic' ? 'تسجيل الدخول' : 'Sign In'}
          </Link>

          {/* Start Assessment */}
          <Link href="/assessment">
            <Button
              className="bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] text-white font-semibold rounded-full px-4 py-2 shadow-md hover:opacity-90 transition"
            >
              {language === 'arabic' ? 'ابدأ التقييم' : 'Start Assessment'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation (optional future section) */}
    </header>
  )
}
