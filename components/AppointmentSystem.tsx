'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail,
  MapPin,
  Video,
  TestTube,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Filter,
  Search
} from 'lucide-react'
import toast from 'react-hot-toast'

const appointmentSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required'),
  patientEmail: z.string().email('Valid email is required'),
  patientPhone: z.string().min(8, 'Valid phone number is required'),
  type: z.enum(['LAB_TESTING', 'VIRTUAL_CONSULTATION', 'VIDEO_CALL']),
  preferredDate: z.string().min(1, 'Preferred date is required'),
  preferredTime: z.string().min(1, 'Preferred time is required'),
  notes: z.string().optional(),
  duration: z.number().min(15).max(120).default(30)
})

type AppointmentForm = z.infer<typeof appointmentSchema>

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
  createdAt: string
  updatedAt: string
}

interface AppointmentSystemProps {
  language?: 'english' | 'arabic'
}

export default function AppointmentSystem({ language = 'english' }: AppointmentSystemProps) {
  const { data: session } = useSession()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const isArabic = language === 'arabic'

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      duration: 30
    }
  })

  // Load appointments
  const loadAppointments = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/appointments')
      const data = await response.json()
      
      if (response.ok) {
        setAppointments(data.appointments)
      } else {
        toast.error('Failed to load appointments')
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
      toast.error('Error loading appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  // Create new appointment
  const handleCreateAppointment = async (data: AppointmentForm) => {
    setLoading(true)
    try {
      const scheduledAt = new Date(`${data.preferredDate}T${data.preferredTime}`)
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          scheduledAt: scheduledAt.toISOString()
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(isArabic ? 'تم حجز الموعد بنجاح' : 'Appointment booked successfully')
        setShowNewAppointment(false)
        reset()
        loadAppointments()
      } else {
        toast.error(isArabic ? result.errorAr : result.error)
      }
    } catch (error) {
      toast.error(isArabic ? 'خطأ في حجز الموعد' : 'Error booking appointment')
    } finally {
      setLoading(false)
    }
  }

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success('Appointment status updated')
        loadAppointments()
      } else {
        toast.error('Failed to update appointment')
      }
    } catch (error) {
      toast.error('Error updating appointment')
    }
  }

  // Cancel appointment
  const cancelAppointment = async (appointmentId: string) => {
    if (!confirm(isArabic ? 'هل أنت متأكد من إلغاء هذا الموعد؟' : 'Are you sure you want to cancel this appointment?')) {
      return
    }

    await updateAppointmentStatus(appointmentId, 'CANCELLED')
  }

  // Get appointment type icon
  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'LAB_TESTING':
        return <TestTube className="w-5 h-5" />
      case 'VIRTUAL_CONSULTATION':
        return <Video className="w-5 h-5" />
      case 'VIDEO_CALL':
        return <Video className="w-5 h-5" />
      default:
        return <Calendar className="w-5 h-5" />
    }
  }

  // Get appointment type label
  const getAppointmentTypeLabel = (type: string) => {
    const types = {
      LAB_TESTING: { en: 'Lab Testing', ar: 'فحص مخبري' },
      VIRTUAL_CONSULTATION: { en: 'Virtual Consultation', ar: 'استشارة افتراضية' },
      VIDEO_CALL: { en: 'Video Call', ar: 'مكالمة فيديو' }
    }
    return types[type] ? (isArabic ? types[type].ar : types[type].en) : type
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    const colors = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-orange-100 text-orange-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.patientEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus
    const matchesType = filterType === 'all' || appointment.type === filterType
    const matchesDate = !selectedDate || 
      new Date(appointment.scheduledAt).toDateString() === new Date(selectedDate).toDateString()
    
    return matchesSearch && matchesStatus && matchesType && matchesDate
  })

  // Get available time slots
  const getAvailableTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isArabic ? 'نظام المواعيد' : 'Appointment System'}
              </h1>
              <p className="text-gray-600">
                {isArabic ? 'إدارة وحجز المواعيد الطبية' : 'Manage and book medical appointments'}
              </p>
            </div>
            
            <button
              onClick={() => setShowNewAppointment(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isArabic ? 'موعد جديد' : 'New Appointment'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={isArabic ? 'البحث في المواعيد...' : 'Search appointments...'}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{isArabic ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="SCHEDULED">{isArabic ? 'مجدول' : 'Scheduled'}</option>
              <option value="CONFIRMED">{isArabic ? 'مؤكد' : 'Confirmed'}</option>
              <option value="COMPLETED">{isArabic ? 'مكتمل' : 'Completed'}</option>
              <option value="CANCELLED">{isArabic ? 'ملغى' : 'Cancelled'}</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{isArabic ? 'جميع الأنواع' : 'All Types'}</option>
              <option value="LAB_TESTING">{isArabic ? 'فحص مخبري' : 'Lab Testing'}</option>
              <option value="VIRTUAL_CONSULTATION">{isArabic ? 'استشارة افتراضية' : 'Virtual Consultation'}</option>
              <option value="VIDEO_CALL">{isArabic ? 'مكالمة فيديو' : 'Video Call'}</option>
            </select>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isArabic ? 'المريض' : 'Patient'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isArabic ? 'النوع' : 'Type'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isArabic ? 'التاريخ والوقت' : 'Date & Time'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isArabic ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isArabic ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.patientEmail}
                          </div>
                          {appointment.patientPhone && (
                            <div className="text-sm text-gray-500">
                              {appointment.patientPhone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="mr-3 text-gray-400">
                            {getAppointmentTypeIcon(appointment.type)}
                          </div>
                          <span className="text-sm text-gray-900">
                            {getAppointmentTypeLabel(appointment.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {new Date(appointment.scheduledAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(appointment.scheduledAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="text-xs text-gray-400">
                            {appointment.duration} {isArabic ? 'دقيقة' : 'min'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {appointment.status === 'SCHEDULED' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'CONFIRMED')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => setEditingAppointment(appointment.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => cancelAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p>{isArabic ? 'لا توجد مواعيد' : 'No appointments found'}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* New Appointment Modal */}
        {showNewAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {isArabic ? 'حجز موعد جديد' : 'Book New Appointment'}
                  </h3>
                  <button
                    onClick={() => setShowNewAppointment(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Patient Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isArabic ? 'اسم المريض' : 'Patient Name'}
                      </label>
                      <div className="relative">
                        <User className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                        <input
                          {...register('patientName')}
                          type="text"
                          className={`w-full ${isArabic ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                          placeholder={isArabic ? 'أدخل اسم المريض' : 'Enter patient name'}
                        />
                      </div>
                      {errors.patientName && (
                        <p className="text-red-500 text-sm mt-1">{errors.patientName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                      </label>
                      <div className="relative">
                        <Mail className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                        <input
                          {...register('patientEmail')}
                          type="email"
                          className={`w-full ${isArabic ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                          placeholder={isArabic ? 'أدخل البريد الإلكتروني' : 'Enter email address'}
                        />
                      </div>
                      {errors.patientEmail && (
                        <p className="text-red-500 text-sm mt-1">{errors.patientEmail.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isArabic ? 'رقم الهاتف' : 'Phone Number'}
                      </label>
                      <div className="relative">
                        <Phone className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                        <input
                          {...register('patientPhone')}
                          type="tel"
                          className={`w-full ${isArabic ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                          placeholder={isArabic ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                        />
                      </div>
                      {errors.patientPhone && (
                        <p className="text-red-500 text-sm mt-1">{errors.patientPhone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isArabic ? 'نوع الموعد' : 'Appointment Type'}
                      </label>
                      <select
                        {...register('type')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="LAB_TESTING">{isArabic ? 'فحص مخبري' : 'Lab Testing'}</option>
                        <option value="VIRTUAL_CONSULTATION">{isArabic ? 'استشارة افتراضية' : 'Virtual Consultation'}</option>
                        <option value="VIDEO_CALL">{isArabic ? 'مكالمة فيديو' : 'Video Call'}</option>
                      </select>
                      {errors.type && (
                        <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isArabic ? 'التاريخ المفضل' : 'Preferred Date'}
                      </label>
                      <input
                        {...register('preferredDate')}
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.preferredDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.preferredDate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isArabic ? 'الوقت المفضل' : 'Preferred Time'}
                      </label>
                      <select
                        {...register('preferredTime')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">{isArabic ? 'اختر الوقت' : 'Select time'}</option>
                        {getAvailableTimeSlots().map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      {errors.preferredTime && (
                        <p className="text-red-500 text-sm mt-1">{errors.preferredTime.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isArabic ? 'المدة (دقيقة)' : 'Duration (minutes)'}
                      </label>
                      <select
                        {...register('duration', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={15}>15 {isArabic ? 'دقيقة' : 'minutes'}</option>
                        <option value={30}>30 {isArabic ? 'دقيقة' : 'minutes'}</option>
                        <option value={45}>45 {isArabic ? 'دقيقة' : 'minutes'}</option>
                        <option value={60}>60 {isArabic ? 'دقيقة' : 'minutes'}</option>
                        <option value={90}>90 {isArabic ? 'دقيقة' : 'minutes'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isArabic ? 'ملاحظات إضافية' : 'Additional Notes'}
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder={isArabic ? 'أي ملاحظات خاصة بالموعد...' : 'Any special notes for the appointment...'}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowNewAppointment(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      {isArabic ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      onClick={handleSubmit(handleCreateAppointment)}
                      disabled={loading}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isArabic ? 'جاري الحجز...' : 'Booking...'}
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 mr-2" />
                          {isArabic ? 'حجز الموعد' : 'Book Appointment'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}