'use client'
import React from 'react'
import { Toaster } from 'react-hot-toast'
import AssessmentForm from '@/components/AssessmentForm'

export default function AssessmentPage() {
  const handleAssessmentComplete = (assessmentData: any) => {
    // Assessment completed successfully
    console.log('Assessment completed:', assessmentData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AssessmentForm onComplete={handleAssessmentComplete} />
      
      {/* Toast Notifications */}
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