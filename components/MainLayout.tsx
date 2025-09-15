'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { usePathname } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import MainNavigation from './MainNavigation'

interface MainLayoutProps {
  children: React.ReactNode
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}


// Create a context for language
interface LanguageContextType {
  language: 'english' | 'arabic'
  setLanguage: (lang: 'english' | 'arabic') => void
}
export default function MainLayout({ children }: MainLayoutProps) {
  const [language, setLanguage] = useState<'english' | 'arabic'>('english')
  const pathname = usePathname()

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as 'english' | 'arabic' | null
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference
  const handleLanguageChange = (newLanguage: 'english' | 'arabic') => {
    setLanguage(newLanguage)
    localStorage.setItem('preferred-language', newLanguage)
    
    // Update document direction
    document.documentElement.dir = newLanguage === 'arabic' ? 'rtl' : 'ltr'
    document.documentElement.lang = newLanguage === 'arabic' ? 'ar' : 'en'
  }

  // Apply language settings to document
  useEffect(() => {
    document.documentElement.dir = language === 'arabic' ? 'rtl' : 'ltr'
    document.documentElement.lang = language === 'arabic' ? 'ar' : 'en'
  }, [language])

  // Don't show navigation on certain pages
  const hideNavigation = ['/auth/signin', '/auth/register'].includes(pathname)

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavigation && (
        <MainNavigation 
          language={language} 
          onLanguageChange={handleLanguageChange} 
        />
      )}
      
      <main>
        {/* Pass language context to children if possible */}
      
          { children}
      </main>

      {/* Footer */}
      {!hideNavigation && (
        <footer className={`bg-gray-900 text-white py-12 ${language === 'arabic' ? 'rtl' : 'ltr'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'arabic' ? 'لاتنسا الصحية' : 'Latnsa Health'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {language === 'arabic' 
                    ? 'نظام شامل للتقييم الصحي والمعرفي'
                    : 'Comprehensive health and cognitive assessment system'
                  }
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">
                  {language === 'arabic' ? 'الخدمات' : 'Services'}
                </h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>{language === 'arabic' ? 'التقييم المعرفي' : 'Cognitive Assessment'}</li>
                  <li>{language === 'arabic' ? 'التقييم الوظيفي' : 'Functional Assessment'}</li>
                  <li>{language === 'arabic' ? 'المراجعة الطبية' : 'Clinical Review'}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">
                  {language === 'arabic' ? 'الدعم' : 'Support'}
                </h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>{language === 'arabic' ? 'مركز المساعدة' : 'Help Center'}</li>
                  <li>{language === 'arabic' ? 'اتصل بنا' : 'Contact Us'}</li>
                  <li>{language === 'arabic' ? 'الأسئلة الشائعة' : 'FAQ'}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">
                  {language === 'arabic' ? 'قانوني' : 'Legal'}
                </h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>{language === 'arabic' ? 'سياسة الخصوصية' : 'Privacy Policy'}</li>
                  <li>{language === 'arabic' ? 'شروط الاستخدام' : 'Terms of Service'}</li>
                  <li>{language === 'arabic' ? 'ملفات تعريف الارتباط' : 'Cookie Policy'}</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>
                © 2024 Latnsa Health Assessment System. {language === 'arabic' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
              </p>
            </div>
          </div>
        </footer>
      )}

      {/* Toast Notifications */}
      <Toaster 
        position={language === 'arabic' ? 'top-left' : 'top-right'}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </div>
  )
}