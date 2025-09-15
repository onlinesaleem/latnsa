"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import RegistrationComponent from '@/components/RegistrationComponent'

export default function RegistrationPage() {
  const router = useRouter()

  const handleRegistrationSuccess = (userData: any) => {
    // Redirect to assessment form after successful registration
    router.push('/assessment')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Healthcare Assessment System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome to Latnsa Healthcare Assessment. Please register to begin your health evaluation.
          </p>
        </div>

        {/* Registration Form */}
        <div className="flex justify-center">
          <RegistrationComponent 
            onSuccess={handleRegistrationSuccess}
            requirePassword={false}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>© 2024 Latnsa Healthcare Assessment System</p>
          <p className="mt-2">
            Secure and confidential health assessment platform
          </p>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  )
}