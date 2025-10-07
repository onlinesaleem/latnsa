// components/AppointmentBooking.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Video, FileText, User, Mail, Phone, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface AppointmentBookingProps {
  language?: 'english' | 'arabic'
  assessmentId?: string
  patientEmail?: string
  patientName?: string
}

interface TimeSlot {
  time: string
  available: boolean
  clinicianName?: string
}

interface BookingFormData {
  patientName: string
  patientEmail: string
  patientPhone: string
  appointmentType: 'LAB_TESTING' | 'VIRTUAL_CONSULTATION' | 'VIDEO_CALL'
  selectedDate: string
  selectedTime: string
  duration: number
  notes: string
  language: 'ENGLISH' | 'ARABIC'
  clinicianId?: string
}

export default function AppointmentBooking({ 
  language = 'english', 
  assessmentId, 
  patientEmail = '',
  patientName = ''
}: AppointmentBookingProps) {
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [formData, setFormData] = useState<BookingFormData>({
    patientName: patientName || session?.user?.name || '',
    patientEmail: patientEmail || session?.user?.email || '',
    patientPhone: '',
    appointmentType: 'VIRTUAL_CONSULTATION',
    selectedDate: '',
    selectedTime: '',
    duration: 30,
    notes: '',
    language: language === 'arabic' ? 'ARABIC' : 'ENGLISH'
  })

  const isArabic = language === 'arabic'

  const appointmentTypes = [
    {
      value: 'LAB_TESTING',
      label: isArabic ? 'فحص مختبري' : 'Lab Testing',
      icon: FileText,
      description: isArabic ? 'للفحوصات والتحاليل المطلوبة' : 'For required tests and examinations',
      duration: 60
    },
    {
      value: 'VIRTUAL_CONSULTATION',
      label: isArabic ? 'استشارة افتراضية' : 'Virtual Consultation',
      icon: Video,
      description: isArabic ? 'استشارة طبية عبر الإنترنت' : 'Online medical consultation',
      duration: 30
    },
    {
      value: 'VIDEO_CALL',
      label: isArabic ? 'مكالمة فيديو' : 'Video Call',
      icon: Video,
      description: isArabic ? 'مكالمة مرئية مع الطبيب' : 'Video call with healthcare provider',
      duration: 45
    }
  ]

  // Load available time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate)
    }
  }, [selectedDate])

  const loadAvailableSlots = async (date: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/appointments/slots?date=${date}&type=${formData.appointmentType}`)
      const data = await response.json()
      
      if (response.ok) {
        setAvailableSlots(data.slots || [])
      } else {
        toast.error('Failed to load available slots')
      }
    } catch (error) {
      console.error('Error loading slots:', error)
      toast.error('Error loading available times')
    } finally {
      setLoading(false)
    }
  }

  const handleTypeSelection = (type: 'LAB_TESTING' | 'VIRTUAL_CONSULTATION' | 'VIDEO_CALL') => {
    const selectedType = appointmentTypes.find(t => t.value === type)
    setFormData(prev => ({
      ...prev,
      appointmentType: type,
      duration: selectedType?.duration || 30
    }))
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.patientName || !formData.patientEmail || !formData.selectedDate || !formData.selectedTime) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const appointmentDateTime = new Date(`${formData.selectedDate}T${formData.selectedTime}`)
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: formData.patientName,
          patientEmail: formData.patientEmail,
          patientPhone: formData.patientPhone,
          type: formData.appointmentType,
          scheduledAt: appointmentDateTime.toISOString(),
          duration: formData.duration,
          notes: formData.notes,
          language: formData.language,
          assessmentId
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        toast.success(isArabic ? 'تم حجز الموعد بنجاح!' : 'Appointment booked successfully!')
        setCurrentStep(4) // Success step
      } else {
        toast.error(result.error || 'Failed to book appointment')
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      toast.error(isArabic ? 'حدث خطأ في حجز الموعد' : 'Error booking appointment')
    } finally {
      setLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
          </div>
          {step < 3 && (
            <div className={`w-12 h-1 mx-2 ${
              currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {isArabic ? 'اختر نوع الموعد' : 'Select Appointment Type'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {appointmentTypes.map((type) => {
          const Icon = type.icon
          const isSelected = formData.appointmentType === type.value
          
          return (
            <div
              key={type.value}
              onClick={() => handleTypeSelection(type.value as any)}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="text-center">
                <Icon className={`w-12 h-12 mx-auto mb-3 ${
                  isSelected ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <h4 className="font-medium text-gray-900 mb-2">{type.label}</h4>
                <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                <span className="text-xs text-gray-500">
                  {type.duration} {isArabic ? 'دقيقة' : 'minutes'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setCurrentStep(2)}
          disabled={!formData.appointmentType}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isArabic ? 'التالي' : 'Next'}
        </button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {isArabic ? 'اختر التاريخ والوقت' : 'Select Date & Time'}
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'التاريخ' : 'Date'}
          </label>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value)
              setFormData(prev => ({ ...prev, selectedDate: e.target.value }))
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'الوقت المتاح' : 'Available Times'}
          </label>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : selectedDate ? (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {availableSlots.length > 0 ? (
                availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => setFormData(prev => ({ ...prev, selectedTime: slot.time }))}
                    disabled={!slot.available}
                    className={`p-2 text-sm rounded border transition-colors ${
                      formData.selectedTime === slot.time
                        ? 'bg-blue-600 text-white border-blue-600'
                        : slot.available
                        ? 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))
              ) : (
                <p className="text-gray-500 col-span-2 text-center py-4">
                  {isArabic ? 'لا توجد مواعيد متاحة لهذا التاريخ' : 'No available slots for this date'}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              {isArabic ? 'اختر تاريخاً أولاً' : 'Select a date first'}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-6 py-2 text-gray-600 hover:text-gray-800"
        >
          {isArabic ? 'السابق' : 'Previous'}
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          disabled={!formData.selectedDate || !formData.selectedTime}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isArabic ? 'التالي' : 'Next'}
        </button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {isArabic ? 'معلومات المريض' : 'Patient Information'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'الاسم الكامل' : 'Full Name'} *
          </label>
          <input
            type="text"
            value={formData.patientName}
            onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'البريد الإلكتروني' : 'Email'} *
          </label>
          <input
            type="email"
            value={formData.patientEmail}
            onChange={(e) => setFormData(prev => ({ ...prev, patientEmail: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'رقم الهاتف' : 'Phone Number'}
          </label>
          <input
            type="tel"
            value={formData.patientPhone}
            onChange={(e) => setFormData(prev => ({ ...prev, patientPhone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isArabic ? 'المدة' : 'Duration'}
          </label>
          <select
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={15}>15 {isArabic ? 'دقيقة' : 'minutes'}</option>
            <option value={30}>30 {isArabic ? 'دقيقة' : 'minutes'}</option>
            <option value={45}>45 {isArabic ? 'دقيقة' : 'minutes'}</option>
            <option value={60}>60 {isArabic ? 'دقيقة' : 'minutes'}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isArabic ? 'ملاحظات إضافية' : 'Additional Notes'}
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder={isArabic ? 'أي معلومات إضافية تريد مشاركتها...' : 'Any additional information you\'d like to share...'}
        />
      </div>

      {/* Appointment Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">
          {isArabic ? 'ملخص الموعد' : 'Appointment Summary'}
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{isArabic ? 'النوع:' : 'Type:'}</span>
            <span>{appointmentTypes.find(t => t.value === formData.appointmentType)?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{isArabic ? 'التاريخ:' : 'Date:'}</span>
            <span>{new Date(formData.selectedDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{isArabic ? 'الوقت:' : 'Time:'}</span>
            <span>{formData.selectedTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{isArabic ? 'المدة:' : 'Duration:'}</span>
            <span>{formData.duration} {isArabic ? 'دقيقة' : 'minutes'}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(2)}
          className="px-6 py-2 text-gray-600 hover:text-gray-800"
        >
          {isArabic ? 'السابق' : 'Previous'}
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : null}
          {isArabic ? 'تأكيد الحجز' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  )

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900">
        {isArabic ? 'تم تأكيد الموعد!' : 'Appointment Confirmed!'}
      </h3>
      
      <p className="text-gray-600">
        {isArabic 
          ? 'تم حجز موعدك بنجاح. ستتلقى رسالة تأكيد عبر البريد الإلكتروني مع جميع التفاصيل.'
          : 'Your appointment has been successfully booked. You will receive a confirmation email with all details.'
        }
      </p>
      
      {(formData.appointmentType === 'VIRTUAL_CONSULTATION' || formData.appointmentType === 'VIDEO_CALL') && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <Video className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-blue-800 text-sm">
            {isArabic 
              ? 'ستجد رابط الاجتماع في رسالة التأكيد. يرجى الانضمام قبل 5 دقائق من الموعد المحدد.'
              : 'You will find the meeting link in your confirmation email. Please join 5 minutes before your scheduled time.'
            }
          </p>
        </div>
      )}
      
      <button
        onClick={() => window.location.href = '/appointments'}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {isArabic ? 'عرض مواعيدي' : 'View My Appointments'}
      </button>
    </div>
  )

  return (
    <div className={`max-w-4xl mx-auto p-6 ${isArabic ? 'rtl' : 'ltr'}`}>
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            {isArabic ? 'حجز موعد' : 'Book Appointment'}
          </h2>
          <p className="text-gray-600 text-center">
            {isArabic ? 'احجز موعدك للاستشارة أو الفحص' : 'Schedule your consultation or examination'}
          </p>
        </div>

        {currentStep < 4 && renderStepIndicator()}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderSuccessStep()}
      </div>
    </div>
  )
}