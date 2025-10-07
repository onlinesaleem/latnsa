// components/AppointmentDetailsModal.tsx
'use client'

import React, { useState } from 'react'
import { 
  XCircle, 
  CheckCircle, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Video, 
  FileText,
  MessageSquare,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Appointment {
  id: string
  patientName: string
  patientEmail: string
  patientPhone?: string
  type: 'LAB_TESTING' | 'VIRTUAL_CONSULTATION' | 'VIDEO_CALL'
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  scheduledAt: string
  duration: number
  notes?: string
  meetingUrl?: string
  meetingId?: string
  assessment?: {
    id: string
    status: string
    clinicalScore?: string
  } | null
}

interface AppointmentDetailsModalProps {
  appointment: Appointment
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
  language: string
  canManage: boolean
}

export default function AppointmentDetailsModal({
  appointment,
  isOpen,
  onClose,
  onUpdate,
  language,
  canManage
}: AppointmentDetailsModalProps) {
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState(appointment.notes || '')
  const [showNotesEdit, setShowNotesEdit] = useState(false)
  
  const isArabic = language === 'arabic'

  const updateStatus = async (newStatus: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success(isArabic ? 'تم تحديث الحالة بنجاح' : 'Status updated successfully')
        onUpdate()
        onClose()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Error updating appointment')
    } finally {
      setLoading(false)
    }
  }

  const updateNotes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })

      if (response.ok) {
        toast.success(isArabic ? 'تم تحديث الملاحظات' : 'Notes updated')
        setShowNotesEdit(false)
        onUpdate()
      } else {
        toast.error('Failed to update notes')
      }
    } catch (error) {
      console.error('Error updating notes:', error)
      toast.error('Error updating notes')
    } finally {
      setLoading(false)
    }
  }

  const joinMeeting = () => {
    if (appointment.meetingUrl) {
      window.open(appointment.meetingUrl, '_blank')
      
      // If appointment is confirmed, mark as in progress
      if (appointment.status === 'CONFIRMED' && canManage) {
        updateStatus('IN_PROGRESS')
      }
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getTypeIcon = () => {
    if (appointment.type === 'LAB_TESTING') return <FileText className="w-5 h-5 text-blue-600" />
    return <Video className="w-5 h-5 text-green-600" />
  }

  const getTypeLabel = () => {
    const types: Record<string, { en: string; ar: string }> = {
      'LAB_TESTING': { en: 'Lab Testing', ar: 'فحص مختبري' },
      'VIRTUAL_CONSULTATION': { en: 'Virtual Consultation', ar: 'استشارة افتراضية' },
      'VIDEO_CALL': { en: 'Video Call', ar: 'مكالمة فيديو' }
    }
    return isArabic ? types[appointment.type]?.ar : types[appointment.type]?.en || appointment.type
  }

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, { en: string; ar: string }> = {
      SCHEDULED: { en: 'Scheduled', ar: 'مجدول' },
      CONFIRMED: { en: 'Confirmed', ar: 'مؤكد' },
      IN_PROGRESS: { en: 'In Progress', ar: 'جاري' },
      COMPLETED: { en: 'Completed', ar: 'مكتمل' },
      CANCELLED: { en: 'Cancelled', ar: 'ملغي' },
      NO_SHOW: { en: 'No Show', ar: 'عدم حضور' }
    }
    return isArabic ? statusLabels[status]?.ar : statusLabels[status]?.en || status
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {isArabic ? 'تفاصيل الموعد' : 'Appointment Details'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Status and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'نوع الموعد' : 'Appointment Type'}
              </label>
              <div className="flex items-center">
                {getTypeIcon()}
                <span className="ml-2 text-gray-900">{getTypeLabel()}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'الحالة' : 'Status'}
              </label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                {getStatusLabel(appointment.status)}
              </span>
            </div>
          </div>

          {/* Patient Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {isArabic ? 'معلومات المريض' : 'Patient Information'}
            </label>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{appointment.patientName}</p>
                  <p className="text-sm text-gray-600">{isArabic ? 'اسم المريض' : 'Patient Name'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{appointment.patientEmail}</p>
                  <p className="text-sm text-gray-600">{isArabic ? 'البريد الإلكتروني' : 'Email Address'}</p>
                </div>
              </div>

              {appointment.patientPhone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{appointment.patientPhone}</p>
                    <p className="text-sm text-gray-600">{isArabic ? 'رقم الهاتف' : 'Phone Number'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'التاريخ والوقت' : 'Date & Time'}
              </label>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(appointment.scheduledAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.scheduledAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'المدة' : 'Duration'}
              </label>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-900">
                  {appointment.duration} {isArabic ? 'دقيقة' : 'minutes'}
                </span>
              </div>
            </div>
          </div>

          {/* Meeting Link for Virtual Appointments */}
          {appointment.meetingUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'رابط الاجتماع' : 'Meeting Link'}
              </label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Video className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-blue-900">
                        {isArabic ? 'الاستشارة الافتراضية' : 'Virtual Consultation'}
                      </p>
                      <p className="text-sm text-blue-700">
                        {isArabic ? 'انقر للانضمام إلى الاجتماع' : 'Click to join the meeting'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={joinMeeting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    {isArabic ? 'انضم الآن' : 'Join Now'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {isArabic ? 'الملاحظات' : 'Notes'}
              </label>
              {canManage && (
                <button
                  onClick={() => setShowNotesEdit(!showNotesEdit)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {showNotesEdit ? (isArabic ? 'إلغاء' : 'Cancel') : (isArabic ? 'تحرير' : 'Edit')}
                </button>
              )}
            </div>
            
            {showNotesEdit ? (
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={isArabic ? 'أضف ملاحظات إضافية...' : 'Add additional notes...'}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowNotesEdit(false)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={updateNotes}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ' : 'Save')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                {notes ? (
                  <p className="text-gray-900">{notes}</p>
                ) : (
                  <p className="text-gray-500 italic">
                    {isArabic ? 'لا توجد ملاحظات' : 'No notes available'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Related Assessment */}
          {appointment.assessment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'التقييم المرتبط' : 'Related Assessment'}
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {isArabic ? 'التقييم رقم:' : 'Assessment #'} {appointment.assessment.id.substring(0, 8)}...
                    </p>
                    <p className="text-sm text-gray-600">
                      {isArabic ? 'الحالة:' : 'Status:'} {appointment.assessment.status}
                      {appointment.assessment.clinicalScore && (
                        <span className="ml-2">
                          • {isArabic ? 'النتيجة:' : 'Score:'} {appointment.assessment.clinicalScore}
                        </span>
                      )}
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    {isArabic ? 'عرض التقييم' : 'View Assessment'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {canManage && (
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            {appointment.status === 'SCHEDULED' && (
              <button
                onClick={() => updateStatus('CONFIRMED')}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                {isArabic ? 'تأكيد' : 'Confirm'}
              </button>
            )}
            
            {appointment.status === 'IN_PROGRESS' && (
              <button
                onClick={() => updateStatus('COMPLETED')}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                {isArabic ? 'إنهاء' : 'Complete'}
              </button>
            )}
            
            {appointment.status === 'SCHEDULED' && (
              <button
                onClick={() => updateStatus('NO_SHOW')}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                {isArabic ? 'عدم حضور' : 'No Show'}
              </button>
            )}
            
            <button
              onClick={() => updateStatus('CANCELLED')}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
              {isArabic ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}