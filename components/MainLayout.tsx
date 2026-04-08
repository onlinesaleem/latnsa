'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { usePathname } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import MainNavigation from './MainNavigation'
import SplashScreen from './SplashScreen'

interface MainLayoutProps { children: React.ReactNode }
interface LanguageContextType {
  language: 'english' | 'arabic'
  setLanguage: (lang: 'english' | 'arabic') => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)
export const useLanguage = () => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}

const FONT = "'Baloo Bhaijaan 2', system-ui, sans-serif"

export default function MainLayout({ children }: MainLayoutProps) {
  const [language,   setLanguage]   = useState<'english' | 'arabic'>('english')
  const [showSplash, setShowSplash] = useState(false)
  const pathname = usePathname()
  const isArabic = language === 'arabic'

  useEffect(() => {
    if (!sessionStorage.getItem('latnsa-visited')) setShowSplash(true)
  }, [])

  const handleSplashComplete = () => {
    setShowSplash(false)
    sessionStorage.setItem('latnsa-visited', 'true')
  }

  useEffect(() => {
    const saved = localStorage.getItem('preferred-language') as 'english' | 'arabic' | null
    if (saved) setLanguage(saved)
  }, [])

  const handleLanguageChange = (lang: 'english' | 'arabic') => {
    setLanguage(lang)
    localStorage.setItem('preferred-language', lang)
    document.documentElement.dir  = lang === 'arabic' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang === 'arabic' ? 'ar'  : 'en'
  }

  useEffect(() => {
    document.documentElement.dir  = isArabic ? 'rtl' : 'ltr'
    document.documentElement.lang = isArabic ? 'ar'  : 'en'
  }, [isArabic])

  const hideNav = ['/auth/signin', '/auth/register'].includes(pathname)

  const footerCols = [
    { headEn: 'Company',  headAr: 'الشركة',   links: [{ href: '/about', en: 'About Us', ar: 'من نحن' }, { href: '/contact', en: 'Contact', ar: 'اتصل بنا' }] },
    { headEn: 'Services', headAr: 'خدماتنا',  links: [{ href: '/assessment', en: 'Assessment', ar: 'التقييم' }, { href: '/appointments', en: 'Appointments', ar: 'المواعيد' }] },
    { headEn: 'Legal',    headAr: 'قانوني',   links: [{ href: '/privacy', en: 'Privacy Policy', ar: 'سياسة الخصوصية' }, { href: '/terms', en: 'Terms of Use', ar: 'شروط الاستخدام' }] },
  ]

  const socialIcons = [
    { label: 'X',         d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
    { label: 'LinkedIn',  d: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z' },
    { label: 'Instagram', d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
  ]

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleLanguageChange }}>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} language={language} />}

      <div className={`min-h-screen ${showSplash ? 'overflow-hidden' : ''}`} style={{ background: '#FFFEF9', fontFamily: FONT }}>
        {!hideNav && <MainNavigation language={language} onLanguageChange={handleLanguageChange} />}

        <main className={!hideNav ? 'pt-[68px]' : ''}>{children}</main>

        {!hideNav && (
          <footer className={isArabic ? 'rtl' : 'ltr'} style={{ background: '#1A1410', fontFamily: FONT }}>
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-12">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

                {/* Brand col */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl px-6 py-4 inline-flex">
                    <div className="relative w-[140px] h-[54px]">
                      <Image src="/logo.png" alt="LaTnsa" fill style={{ objectFit: 'contain', objectPosition: isArabic ? 'right center' : 'left center' }} />
                    </div>
                  </div>
                  <p className="text-[14px] leading-relaxed max-w-xs" style={{ color: '#8C7E76', fontFamily: FONT }}>
                    {isArabic
                      ? 'عيادات افتراضية متخصصة في اضطرابات الذاكرة والإدراك، بقيادة استشاريين سعوديين.'
                      : 'Virtual clinics specializing in memory and cognitive disorders, led by Saudi consultants.'}
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: 'Info@latensa.com', href: 'mailto:Info@latensa.com' },
                      { label: '+962 7 9699 8578', href: 'tel:+96279699857' },
                      { label: 'www.latensa.com',  href: 'https://www.latensa.com' },
                    ].map(c => (
                      <a key={c.href} href={c.href} className="block text-[13px] transition-colors duration-200" style={{ color: '#8C7E76', fontFamily: FONT }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#FFFEF9')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#8C7E76')}>
                        {c.label}
                      </a>
                    ))}
                  </div>
                  <div className="flex gap-2.5 pt-1">
                    {socialIcons.map(s => (
                      <button key={s.label} aria-label={s.label}
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg,#A31755,#405EAA)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d={s.d} /></svg>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Link columns */}
                {footerCols.map((col, i) => (
                  <div key={i}>
                    <h4 className="text-[11px] font-bold tracking-[1.8px] uppercase mb-5" style={{ color: '#8C7E76', fontFamily: FONT }}>
                      {isArabic ? col.headAr : col.headEn}
                    </h4>
                    <ul className="space-y-3">
                      {col.links.map(l => (
                        <li key={l.href}>
                          <Link href={l.href} className="text-[13.5px] transition-colors duration-200" style={{ color: '#C7B8B0', fontFamily: FONT }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#FFFEF9')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#C7B8B0')}>
                            {isArabic ? l.ar : l.en}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[12px]" style={{ color: '#8C7E76', fontFamily: FONT }}>
                  © {new Date().getFullYear()} LaTnsa Memory Assessment System.{' '}
                  {isArabic ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#A8D163' }} />
                  <span className="text-[12px]" style={{ color: '#8C7E76', fontFamily: FONT }}>
                    {isArabic ? 'جميع الأنظمة تعمل' : 'All systems operational'}
                  </span>
                </div>
              </div>
            </div>
          </footer>
        )}

        <Toaster
          position={isArabic ? 'top-left' : 'top-right'}
          toastOptions={{
            duration: 4000,
            style: { background: '#1A1410', color: '#FFFEF9', fontSize: '13.5px', fontFamily: FONT, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px' },
            success: { style: { background: '#0A2B18', color: '#A8D163', border: '1px solid rgba(168,209,99,0.3)' } },
            error:   { style: { background: '#2D0A15', color: '#F9C5D8', border: '1px solid rgba(163,23,85,0.3)' } },
          }}
        />
      </div>
    </LanguageContext.Provider>
  )
}