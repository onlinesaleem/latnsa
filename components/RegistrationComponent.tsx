'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Phone, User, Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  identifier: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  language: z.enum(['english', 'arabic'])
})

type RegistrationForm = z.infer<typeof registrationSchema>

interface RegistrationProps {
  onSuccess?: (userData: any) => void
  requirePassword?: boolean
}

export default function RegistrationComponent({ onSuccess, requirePassword = false }: RegistrationProps) {
  const [currentStep, setCurrentStep] = useState<'form' | 'otp' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpType, setOtpType] = useState<'EMAIL' | 'SMS'>('EMAIL')
  const [language, setLanguage] = useState<'english' | 'arabic'>('english')
  const [identifierValue, setIdentifierValue] = useState('')
  const [formData, setFormData] = useState<RegistrationForm>()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema)
  })

  const watchedIdentifier = watch('identifier')

  // Auto-detect identifier type
  React.useEffect(() => {
    if (watchedIdentifier) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const phoneRegex = /^(\+966|966|0)?[0-9]{8,9}$/
      
      if (emailRegex.test(watchedIdentifier)) {
        setOtpType('EMAIL')
      } else if (phoneRegex.test(watchedIdentifier)) {
        setOtpType('SMS')
      }
      setIdentifierValue(watchedIdentifier)
    }
  }, [watchedIdentifier])

  const handleSendOtp = async (data: RegistrationForm) => {
      console.log('handleSendOtp triggered with data:', data);
    setLoading(true)
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: data.identifier,
          name: data.name,
          language: data.language,
          type: otpType
        })
      })

      const result = await response.json()

      if (response.ok) {
        setFormData(data)
        setOtpSent(true)
        setCurrentStep('otp')
        toast.success(language === 'arabic' ? result.messageAr : result.message)
      } else {
        toast.error(language === 'arabic' ? result.errorAr : result.error)
      }
    } catch (error) {
      toast.error('Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error(language === 'arabic' ? 'يجب أن يكون الرمز 6 أرقام' : 'OTP must be 6 digits')
      return
    }

    setLoading(true)
    try {
      const verifyResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifierValue,
          otp,
          type: otpType
        })
      })

      const verifyResult = await verifyResponse.json()

      if (verifyResponse.ok) {
        // Now register the user
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            [otpType === 'EMAIL' ? 'email' : 'phone']: identifierValue
          })
        })

        const registerResult = await registerResponse.json()

        if (registerResponse.ok) {
          setCurrentStep('success')
          toast.success(language === 'arabic' ? registerResult.messageAr : registerResult.message)
          setTimeout(() => {
            onSuccess?.(registerResult.user)
          }, 2000)
        } else {
          toast.error(language === 'arabic' ? registerResult.errorAr : registerResult.error)
        }
      } else {
        toast.error(language === 'arabic' ? verifyResult.errorAr : verifyResult.error)
        if (verifyResult.attemptsLeft !== undefined) {
          toast.error(`Attempts left: ${verifyResult.attemptsLeft}`)
        }
      }
    } catch (error) {
      toast.error('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!formData) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifierValue,
          name: formData.name,
          language: formData.language,
          type: otpType
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(language === 'arabic' ? result.messageAr : result.message)
        setOtp('')
      } else {
        toast.error(language === 'arabic' ? result.errorAr : result.error)
      }
    } catch (error) {
      toast.error('Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  const isArabic = language === 'arabic'

  if (currentStep === 'success') {
    return (
      <div className={`max-w-md mx-auto p-6 ${isArabic ? 'rtl' : 'ltr'}`}>
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isArabic ? 'تم التسجيل بنجاح!' : 'Registration Successful!'}
          </h2>
          <p className="text-gray-600">
            {isArabic 
              ? 'يمكنك الآن المتابعة لملء نموذج التقييم الصحي.'
              : 'You can now proceed to fill out the health assessment form.'
            }
          </p>
        </div>
      </div>
    )
  }

  if (currentStep === 'otp') {
    return (
      <div className={`max-w-md mx-auto p-6 bg-white rounded-lg shadow-md ${isArabic ? 'rtl' : 'ltr'}`}>
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {otpType === 'EMAIL' ? <Mail className="w-6 h-6 text-blue-600" /> : <Phone className="w-6 h-6 text-blue-600" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isArabic ? 'تأكيد الهوية' : 'Verify Identity'}
          </h2>
          <p className="text-gray-600 text-sm">
            {isArabic 
              ? `تم إرسال رمز التحقق إلى ${otpType === 'EMAIL' ? 'بريدك الإلكتروني' : 'هاتفك'}`
              : `Verification code sent to your ${otpType === 'EMAIL' ? 'email' : 'phone'}`
            }
          </p>
          <p className="text-blue-600 font-medium text-sm mt-1">
            {identifierValue}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'أدخل رمز التحقق (6 أرقام)' : 'Enter verification code (6 digits)'}
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-2xl font-mono tracking-widest"
            placeholder="000000"
            maxLength={6}
          />
        </div>

        <button
          onClick={handleVerifyOtp}
          disabled={loading || otp.length !== 6}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {isArabic ? 'تأكيد الرمز' : 'Verify Code'}
        </button>

        <button
          onClick={handleResendOtp}
          disabled={loading}
          className="w-full mt-3 text-blue-600 hover:text-blue-800 text-sm"
        >
          {isArabic ? 'إعادة إرسال الرمز' : 'Resend Code'}
        </button>

        <button
          onClick={() => setCurrentStep('form')}
          className="w-full mt-2 text-gray-500 hover:text-gray-700 text-sm"
        >
          {isArabic ? 'العودة للتسجيل' : 'Back to Registration'}
        </button>
      </div>
    )
  }

  return (
    <div className={`max-w-md mx-auto p-6 bg-white rounded-lg shadow-md ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Language Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => {setLanguage('english'); setValue('language', 'english')}}
            className={`px-3 py-1 rounded-md text-sm ${language === 'english' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
          >
            English
          </button>
          <button
            onClick={() => {setLanguage('arabic'); setValue('language', 'arabic')}}
            className={`px-3 py-1 rounded-md text-sm ${language === 'arabic' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
          >
            العربية
          </button>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isArabic ? 'تسجيل جديد' : 'Registration'}
        </h2>
        <p className="text-gray-600">
          {isArabic 
            ? 'أدخل معلوماتك للبدء في التقييم الصحي'
            : 'Enter your information to start the health assessment'
          }
        </p>
      </div>

      <div className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isArabic ? 'الاسم الكامل' : 'Full Name'}
          </label>
          <div className="relative">
            <User className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
            <input
              {...register('name')}
              type="text"
              className={`w-full ${isArabic ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
              placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'}
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email or Phone Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isArabic ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email or Phone Number'}
          </label>
          <div className="relative">
            {otpType === 'EMAIL' ? (
              <Mail className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
            ) : (
              <Phone className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
            )}
            <input
              {...register('identifier')}
              type="text"
              className={`w-full ${isArabic ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
              placeholder={isArabic ? 'example@email.com أو 0501234567' : 'example@email.com or 0501234567'}
            />
          </div>
          {watchedIdentifier && (
            <p className="text-sm text-blue-600 mt-1">
              {isArabic ? 'سيتم الإرسال عبر:' : 'Will send via:'} {otpType === 'EMAIL' ? (isArabic ? 'البريد الإلكتروني' : 'Email') : (isArabic ? 'رسالة نصية' : 'SMS')}
            </p>
          )}
          {errors.identifier && (
            <p className="text-red-500 text-sm mt-1">{errors.identifier.message}</p>
          )}
        </div>

        {/* Password Field (Optional) */}
        {requirePassword && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isArabic ? 'كلمة المرور (اختياري)' : 'Password (Optional)'}
            </label>
            <div className="relative">
              <Lock className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className={`w-full ${isArabic ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                placeholder={isArabic ? 'أدخل كلمة مرور (اختياري)' : 'Enter password (optional)'}
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
        )}

        {/* Hidden language field */}
        <input {...register('language')} type="hidden" />

        {/* Submit Button */}
        <button
         type="button" 
          onClick={handleSubmit(handleSendOtp)}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {isArabic ? 'جاري الإرسال...' : 'Sending...'}
            </>
          ) : (
            <>
              {otpType === 'EMAIL' ? <Mail className="w-4 h-4 mr-2" /> : <Phone className="w-4 h-4 mr-2" />}
              {isArabic 
                ? `إرسال رمز التحقق ${otpType === 'EMAIL' ? 'للبريد' : 'للهاتف'}` 
                : `Send verification code ${otpType === 'EMAIL' ? 'via Email' : 'via SMS'}`
              }
            </>
          )}
        </button>

        {/* Info Text */}
        <div className="text-center text-sm text-gray-500">
          {isArabic 
            ? 'سنرسل لك رمز التحقق لتأكيد هويتك قبل المتابعة'
            : 'We will send you a verification code to confirm your identity before proceeding'
          }
        </div>
      </div>
    </div>
  )
}