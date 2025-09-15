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

  // Update profile information
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

  // Change password
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            {isArabic ? 'يجب تسجيل الدخول للوصول إلى هذه الصفحة' : 'You must be logged in to access this page'}
          </p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="text-blue-600 hover:text-blue-800"
          >
            {isArabic ? 'تسجيل الدخول' : 'Sign In'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isArabic ? 'الملف الشخصي' : 'Profile Settings'}
              </h1>
              <p className="text-gray-600">
                {isArabic ? 'إدارة معلوماتك الشخصية وإعداداتك' : 'Manage your personal information and settings'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{session.user.name}</h3>
                <p className="text-sm text-gray-500">{session.user.email}</p>
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-2 capitalize">
                  {session.user.role?.toLowerCase()}
                </span>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>{isArabic ? 'المعلومات الشخصية' : 'Profile Info'}</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'password'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>{isArabic ? 'كلمة المرور' : 'Password'}</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'security'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>{isArabic ? 'الأمان' : 'Security'}</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {isArabic ? 'المعلومات الشخصية' : 'Personal Information'}
                  </h2>
                  <p className="text-gray-600">
                    {isArabic ? 'تحديث معلوماتك الشخصية الأساسية' : 'Update your basic personal information'}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'الاسم الكامل' : 'Full Name'}
                      </label>
                      <div className="relative">
                        <User className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                        <input
                          {...profileForm.register('name')}
                          type="text"
                          className={`w-full ${isArabic ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      {profileForm.formState.errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {profileForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                      </label>
                      <div className="relative">
                        <Mail className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                        <input
                          {...profileForm.register('email')}
                          type="email"
                          className={`w-full ${isArabic ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      {profileForm.formState.errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {profileForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={profileForm.handleSubmit(handleProfileUpdate)}
                      disabled={loading}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
                  </h2>
                  <p className="text-gray-600">
                    {isArabic ? 'قم بتحديث كلمة المرور لحماية حسابك' : 'Update your password to keep your account secure'}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic ? 'كلمة المرور الحالية' : 'Current Password'}
                    </label>
                    <div className="relative">
                      <Lock className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                      <input
                        {...passwordForm.register('currentPassword')}
                        type={showCurrentPassword ? 'text' : 'password'}
                        className={`w-full ${isArabic ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className={`absolute top-2.5 ${isArabic ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600`}
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
                    </label>
                    <div className="relative">
                      <Lock className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                      <input
                        {...passwordForm.register('newPassword')}
                        type={showNewPassword ? 'text' : 'password'}
                        className={`w-full ${isArabic ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className={`absolute top-2.5 ${isArabic ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600`}
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                    </label>
                    <div className="relative">
                      <Lock className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                      <input
                        {...passwordForm.register('confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`w-full ${isArabic ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute top-2.5 ${isArabic ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600`}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={passwordForm.handleSubmit(handlePasswordChange)}
                      disabled={passwordLoading}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {isArabic ? 'إعدادات الأمان' : 'Security Settings'}
                  </h2>
                  <p className="text-gray-600">
                    {isArabic ? 'معلومات حول أمان حسابك' : 'Information about your account security'}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {isArabic ? 'البريد الإلكتروني محقق' : 'Email Verified'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {session.user.email}
                          </div>
                        </div>
                      </div>
                      <span className="text-green-600 text-sm font-medium">
                        {isArabic ? 'نشط' : 'Active'}
                      </span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {isArabic ? 'تاريخ إنشاء الحساب' : 'Account Created'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date().toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Lock className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {isArabic ? 'كلمة المرور' : 'Password'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {isArabic ? 'آخر تغيير منذ فترة' : 'Last changed recently'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('password')}
                        className="text-blue-600 text-sm font-medium hover:text-blue-800"
                      >
                        {isArabic ? 'تغيير' : 'Change'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}