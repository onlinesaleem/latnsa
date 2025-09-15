'use client'

import React, { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required')
})

type SignInForm = z.infer<typeof signInSchema>

export default function SignInComponent() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [language, setLanguage] = useState<'english' | 'arabic'>('english')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema)
  })

  const handleSignIn = async (data: SignInForm) => {
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (result?.error) {
        toast.error(language === 'arabic' ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials')
      } else {
        toast.success(language === 'arabic' ? 'تم تسجيل الدخول بنجاح' : 'Signed in successfully')
        
        // Get the updated session
        const session = await getSession()
        
        // Redirect based on user role
        if (session?.user.role === 'ADMIN' || session?.user.role === 'CLINICAL_STAFF') {
          router.push('/admin')
        } else {
          router.push('/assessment')
        }
      }
    } catch (error) {
      toast.error(language === 'arabic' ? 'حدث خطأ أثناء تسجيل الدخول' : 'An error occurred during sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleGoToRegistration = () => {
    router.push('/auth/register')
  }

  const isArabic = language === 'arabic'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {isArabic ? 'نظام التقييم الصحي' : 'Healthcare Assessment System'}
          </h1>
          <p className="text-lg text-gray-600">
            {isArabic ? 'لاتنسا للرعاية الصحية' : 'Latnsa Healthcare'}
          </p>
        </div>

        <div className={`max-w-md mx-auto p-6 bg-white rounded-lg shadow-md ${isArabic ? 'rtl' : 'ltr'}`}>
          {/* Language Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setLanguage('english')}
                className={`px-3 py-1 rounded-md text-sm ${language === 'english' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('arabic')}
                className={`px-3 py-1 rounded-md text-sm ${language === 'arabic' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              >
                العربية
              </button>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isArabic ? 'تسجيل الدخول' : 'Sign In'}
            </h2>
            <p className="text-gray-600">
              {isArabic 
                ? 'ادخل بيانات حسابك للوصول إلى النظام'
                : 'Enter your account details to access the system'
              }
            </p>
          </div>

          <div>
            {/* Email Field */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                  <input
                    {...register('email')}
                    type="email"
                    className={`w-full ${isArabic ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full ${isArabic ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    placeholder={isArabic ? 'أدخل كلمة المرور' : 'Enter your password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-2.5 ${isArabic ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Sign In Button */}
              <button
                onClick={handleSubmit(handleSignIn)}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {isArabic ? 'جاري تسجيل الدخول...' : 'Signing in...'}
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">
              {isArabic ? 'أو' : 'or'}
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Register Button */}
          <button
            onClick={handleGoToRegistration}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 flex items-center justify-center"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {isArabic ? 'تسجيل جديد للتقييم الصحي' : 'New Registration for Health Assessment'}
          </button>

          {/* Info Text */}
          <div className="text-center text-sm text-gray-500 mt-4">
            {isArabic 
              ? 'المستخدمون الجدد يمكنهم البدء مباشرة بالتسجيل'
              : 'New users can start directly with registration'
            }
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 Latnsa Healthcare Assessment System</p>
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