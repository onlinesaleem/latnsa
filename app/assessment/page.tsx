'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Toaster } from 'react-hot-toast'
import AssessmentForm from '@/components/AssessmentForm'
import { Assessment } from '@prisma/client'

export default function AssessmentPage() {
  const [language, setLanguage] = useState<'english' | 'arabic'>('english')
  const lastLanguageRef = useRef(language)

  // Optimized polling for language changes
  useEffect(() => {
    const checkLanguage = () => {
      const savedLanguage = localStorage.getItem('preferred-language') as 'english' | 'arabic' | null
      if (savedLanguage && savedLanguage !== lastLanguageRef.current) {
        lastLanguageRef.current = savedLanguage
        setLanguage(savedLanguage)
      }
    }

    // Check immediately
    checkLanguage()

    // Set up interval to check for changes - reduced frequency
    const interval = setInterval(checkLanguage, 1000) // Increased to 1 second
    
    return () => clearInterval(interval)
  }, []) // Remove language dependency to prevent loops

  const handleAssessmentComplete = (assessmentData: Assessment) => {
    console.log('Assessment completed:', assessmentData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 mt-16">
      <AssessmentForm 
        
        onComplete={handleAssessmentComplete} 
        language={language} 
      />
      
      <Toaster 
        position="top-center"
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