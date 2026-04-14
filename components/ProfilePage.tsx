'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  Eye, 
  EyeOff,
  Shield,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address')
})

type PasswordChangeForm = z.infer<typeof passwordChangeSchema>
type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>

interface ProfilePageProps {
  language?: 'english' | 'arabic'
}

export default function ProfilePage({ language = 'english' }: ProfilePageProps) {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'security'>('profile')
  const isArabic = language === 'arabic'

  const profileForm = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: session?.user.name || '',
      email: session?.user.email || ''
    }
  })

  const passwordForm = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema)
  })

  const handleProfileUpdate = async (data: ProfileUpdateForm) => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (response.ok) {
        await update({ name: data.name, email: data.email })
        toast.success(isArabic ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully')
      } else {
        toast.error(isArabic ? result.errorAr : result.error)
      }
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ أثناء التحديث' : 'Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (data: PasswordChangeForm) => {
    setPasswordLoading(true)
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (response.ok) {
        passwordForm.reset()
        toast.success(isArabic ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully')
      } else {
        toast.error(isArabic ? result.errorAr : result.error)
      }
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ أثناء تغيير كلمة المرور' : 'Error changing password')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className={`text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full ${isArabic ? 'font-arabic' : ''}`}>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {isArabic ? 'الوصول مرفوض' : 'Access Denied'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isArabic ? 'يجب تسجيل الدخول للوصول إلى هذه الصفحة' : 'You must be logged in to access this page'}
          </p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
          >
            {isArabic ? 'تسجيل الدخول' : 'Sign In'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isArabic ? 'rtl font-arabic' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10 backdrop-blur-lg bg-white/95">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className={`${isArabic ? 'ml-4' : 'mr-4'} p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-300`}
            >
              <ArrowLeft className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] bg-clip-text text-transparent">
                {isArabic ? 'إعدادات الملف الشخصي' : 'Profile Settings'}
              </h1>
              <p className="text-gray-600 text-sm mt-0.5">
                {isArabic ? 'إدارة معلوماتك الشخصية وإعداداتك' : 'Manage your personal information and settings'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl font-bold text-white">
                    {session.user.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{session.user.name}</h3>
                <p className="text-sm text-gray-500 truncate px-2">{session.user.email}</p>
                <span className="inline-flex px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full mt-3 capitalize">
                  {session.user.role?.toLowerCase()}
                </span>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300
                    ${activeTab === 'profile'
                      ? 'bg-gradient-to-r from-[#E76A6A]/10 to-[#85C3E0]/10 text-[#E76A6A] shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <User className="w-5 h-5" />
                  <span>{isArabic ? 'المعلومات الشخصية' : 'Profile Info'}</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('password')}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300
                    ${activeTab === 'password'
                      ? 'bg-gradient-to-r from-[#E76A6A]/10 to-[#85C3E0]/10 text-[#E76A6A] shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Lock className="w-5 h-5" />
                  <span>{isArabic ? 'كلمة المرور' : 'Password'}</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('security')}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300
                    ${activeTab === 'security'
                      ? 'bg-gradient-to-r from-[#E76A6A]/10 to-[#85C3E0]/10 text-[#E76A6A] shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Shield className="w-5 h-5" />
                  <span>{isArabic ? 'الأمان' : 'Security'}</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 transition-all duration-500">
              {activeTab === 'profile' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {isArabic ? 'المعلومات الشخصية' : 'Personal Information'}
                    </h2>
                    <p className="text-gray-600">
                      {isArabic ? 'تحديث معلوماتك الشخصية الأساسية' : 'Update your basic personal information'}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {isArabic ? 'الاسم الكامل' : 'Full Name'}
                        </label>
                        <div className="relative">
                          <User className={`absolute top-3 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                          <input
                            {...profileForm.register('name')}
                            type="text"
                            className={`
                              w-full ${isArabic ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 
                              border border-gray-300 rounded-xl
                              focus:ring-2 focus:ring-[#E76A6A] focus:border-transparent
                              transition-all duration-300
                            `}
                            placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                          />
                        </div>
                        {profileForm.formState.errors.name && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {profileForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                        </label>
                        <div className="relative">
                          <Mail className={`absolute top-3 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                          <input
                            {...profileForm.register('email')}
                            type="email"
                            className={`
                              w-full ${isArabic ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 
                              border border-gray-300 rounded-xl
                              focus:ring-2 focus:ring-[#E76A6A] focus:border-transparent
                              transition-all duration-300
                            `}
                            placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                          />
                        </div>
                        {profileForm.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {profileForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={profileForm.handleSubmit(handleProfileUpdate)}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>{isArabic ? 'جاري الحفظ...' : 'Saving...'}</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            <span>{isArabic ? 'حفظ التغييرات' : 'Save Changes'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'password' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
                    </h2>
                    <p className="text-gray-600">
                      {isArabic ? 'قم بتحديث كلمة المرور لحماية حسابك' : 'Update your password to keep your account secure'}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {isArabic ? 'كلمة المرور الحالية' : 'Current Password'}
                      </label>
                      <div className="relative">
                        <Lock className={`absolute top-3 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                        <input
                          {...passwordForm.register('currentPassword')}
                          type={showCurrentPassword ? 'text' : 'password'}
                          className={`
                            w-full ${isArabic ? 'pr-11 pl-11' : 'pl-11 pr-11'} py-3 
                            border border-gray-300 rounded-xl
                            focus:ring-2 focus:ring-[#E76A6A] focus:border-transparent
                            transition-all duration-300
                          `}
                          placeholder={isArabic ? '••••••••' : '••••••••'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className={`absolute top-3 ${isArabic ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600 transition-colors duration-200`}
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
                      </label>
                      <div className="relative">
                        <Lock className={`absolute top-3 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                        <input
                          {...passwordForm.register('newPassword')}
                          type={showNewPassword ? 'text' : 'password'}
                          className={`
                            w-full ${isArabic ? 'pr-11 pl-11' : 'pl-11 pr-11'} py-3 
                            border border-gray-300 rounded-xl
                            focus:ring-2 focus:ring-[#E76A6A] focus:border-transparent
                            transition-all duration-300
                          `}
                          placeholder={isArabic ? '••••••••' : '••••••••'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className={`absolute top-3 ${isArabic ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600 transition-colors duration-200`}
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {isArabic ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                      </label>
                      <div className="relative">
                        <Lock className={`absolute top-3 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                        <input
                          {...passwordForm.register('confirmPassword')}
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`
                            w-full ${isArabic ? 'pr-11 pl-11' : 'pl-11 pr-11'} py-3 
                            border border-gray-300 rounded-xl
                            focus:ring-2 focus:ring-[#E76A6A] focus:border-transparent
                            transition-all duration-300
                          `}
                          placeholder={isArabic ? '••••••••' : '••••••••'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className={`absolute top-3 ${isArabic ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600 transition-colors duration-200`}
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={passwordForm.handleSubmit(handlePasswordChange)}
                        disabled={passwordLoading}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                      >
                        {passwordLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>{isArabic ? 'جاري التغيير...' : 'Changing...'}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5" />
                            <span>{isArabic ? 'تغيير كلمة المرور' : 'Change Password'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {isArabic ? 'إعدادات الأمان' : 'Security Settings'}
                    </h2>
                    <p className="text-gray-600">
                      {isArabic ? 'معلومات حول أمان حسابك' : 'Information about your account security'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="border-2 border-green-200 bg-green-50 rounded-xl p-5 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-lg">
                              {isArabic ? 'البريد الإلكتروني محقق' : 'Email Verified'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {session.user.email}
                            </div>
                          </div>
                        </div>
                        <span className="px-4 py-2 text-sm font-bold text-green-700 bg-green-100 rounded-lg">
                          {isArabic ? 'نشط' : 'Active'}
                        </span>
                      </div>
                    </div>

                    <div className="border-2 border-blue-200 bg-blue-50 rounded-xl p-5 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-lg">
                              {isArabic ? 'تاريخ إنشاء الحساب' : 'Account Created'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date().toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-purple-200 bg-purple-50 rounded-xl p-5 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <Lock className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-lg">
                              {isArabic ? 'كلمة المرور' : 'Password'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {isArabic ? 'آخر تغيير منذ فترة' : 'Last changed recently'}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('password')}
                          className="px-5 py-2 text-sm font-bold text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-all duration-300"
                        >
                          {isArabic ? 'تغيير' : 'Change'}
                        </button>
                      </div>
                    </div>

                    <div className="border-2 border-gray-200 bg-gray-50 rounded-xl p-5 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <Shield className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-lg">
                              {isArabic ? 'دور المستخدم' : 'User Role'}
                            </div>
                            <div className="text-sm text-gray-600 capitalize">
                              {session.user.role?.toLowerCase()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}