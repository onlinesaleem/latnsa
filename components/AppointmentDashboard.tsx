// components/AppointmentDashboard.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  Video, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Play,
  Edit,
  Trash2,
  Filter,
  Plus,
  Download
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import AppointmentDetailsModal from './AppointmentDetailsModal'

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
  assessment?: {
    id: string
    status: string
    clinicalScore?: string
  }
}

interface AppointmentDashboardProps {
  language?: 'english' | 'arabic'
  userRole?: 'admin' | 'clinical_staff' | 'user'
}

export default function AppointmentDashboard({ 
  language = 'english',
  userRole = 'admin'
}: AppointmentDashboardProps) {
  const { data: session } = useSession()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  
  const isArabic = language === 'arabic'
  const canManage = userRole === 'admin' || userRole === 'clinical_staff'

  const statusOptions = [
    { value: 'all', label: isArabic ? 'الجميع' : 'All' },
    { value: 'SCHEDULED', label: isArabic ? 'مجدول' : 'Scheduled' },
    { value: 'CONFIRMED', label: isArabic ? 'مؤكد' : 'Confirmed' },
    { value: 'IN_PROGRESS', label: isArabic ? 'جاري' : 'In Progress' },
    { value: 'COMPLETED', label: isArabic ? 'مكتمل' : 'Completed' },
    { value: 'CANCELLED', label: isArabic ? 'ملغي' : 'Cancelled' }
  ]

  const typeOptions = [
    { value: 'all', label: isArabic ? 'الجميع' : 'All' },
    { value: 'LAB_TESTING', label: isArabic ? 'فحص مختبري' : 'Lab Testing' },
    { value: 'VIRTUAL_CONSULTATION', label: isArabic ? 'استشارة افتراضية' : 'Virtual Consultation' },
    { value: 'VIDEO_CALL', label: isArabic ? 'مكالمة فيديو' : 'Video Call' }
  ]

  useEffect(() => {
    loadAppointments()
  }, [selectedDate, statusFilter, typeFilter])

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        date: selectedDate,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter })
      })

      const response = await fetch(`/api/appointments?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setAppointments(data.appointments || [])
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

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success(isArabic ? 'تم تحديث الحالة' : 'Status updated')
        loadAppointments()
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Error updating appointment')
    }
  }

  const joinMeeting = (appointment: Appointment) => {
    if (appointment.meetingUrl) {
      window.open(appointment.meetingUrl, '_blank')
      
      // Update status to IN_PROGRESS if it's CONFIRMED
      if (appointment.status === 'CONFIRMED' && canManage) {
        updateAppointmentStatus(appointment.id, 'IN_PROGRESS')
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

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      SCHEDULED: <Clock className="w-4 h-4" />,
      CONFIRMED: <CheckCircle className="w-4 h-4" />,
      IN_PROGRESS: <Play className="w-4 h-4" />,
      COMPLETED: <CheckCircle className="w-4 h-4" />,
      CANCELLED: <XCircle className="w-4 h-4" />,
      NO_SHOW: <AlertCircle className="w-4 h-4" />
    }
    return icons[status] || <Clock className="w-4 h-4" />
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      LAB_TESTING: <FileText className="w-5 h-5" />,
      VIRTUAL_CONSULTATION: <Video className="w-5 h-5" />,
      VIDEO_CALL: <Video className="w-5 h-5" />
    }
    return icons[type] || <FileText className="w-5 h-5" />
  }

  const todayAppointments = appointments.filter(apt => 
    new Date(apt.scheduledAt).toDateString() === new Date().toDateString()
  )
  const upcomingVirtual = appointments.filter(apt => 
    (apt.type === 'VIRTUAL_CONSULTATION' || apt.type === 'VIDEO_CALL') && 
    apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED'
  )

  
  return (
    <div className={`min-h-screen bg-gray-50 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isArabic ? 'إدارة المواعيد' : 'Appointment Management'}
              </h1>
              <p className="text-gray-600">
                {isArabic ? 'إدارة وتتبع المواعيد الطبية' : 'Manage and track medical appointments'}
              </p>
            </div>
            
            {canManage && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isArabic ? 'موعد جديد' : 'New Appointment'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isArabic ? 'مواعيد اليوم' : "Today's Appointments"}
                </p>
                <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Video className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isArabic ? 'استشارات افتراضية' : 'Virtual Consultations'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{upcomingVirtual.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isArabic ? 'مكتملة هذا الأسبوع' : 'Completed This Week'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isArabic ? 'تحتاج تأكيد' : 'Need Confirmation'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(a => a.status === 'SCHEDULED').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'التاريخ' : 'Date'}
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'الحالة' : 'Status'}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'النوع' : 'Type'}
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedDate(new Date().toISOString().split('T')[0])
                  setStatusFilter('all')
                  setTypeFilter('all')
                }}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md border border-gray-300"
              >
                {isArabic ? 'إعادة تعيين' : 'Reset'}
              </button>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              {isArabic ? 'قائمة المواعيد' : 'Appointments List'}
            </h3>
            <button
              onClick={loadAppointments}
              className="text-blue-600 hover:text-blue-800"
            >
              {isArabic ? 'تحديث' : 'Refresh'}
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {isArabic ? 'لا توجد مواعيد للتاريخ المحدد' : 'No appointments found for the selected date'}
              </p>
            </div>
          ) : (
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
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-8 h-8 text-gray-400" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patientName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.patientEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTypeIcon(appointment.type)}
                          <span className="ml-2 text-sm text-gray-900">
                            {typeOptions.find(t => t.value === appointment.type)?.label}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(appointment.scheduledAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(appointment.scheduledAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1">
                            {statusOptions.find(s => s.value === appointment.status)?.label}
                          </span>
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {appointment.meetingUrl && (
                            <button
                              onClick={() => joinMeeting(appointment)}
                              className="text-green-600 hover:text-green-900 flex items-center"
                              title={isArabic ? 'انضم إلى الاجتماع' : 'Join Meeting'}
                            >
                              <Video className="w-4 h-4" />
                            </button>
                          )}
                          
                          {canManage && (
                            <>
                              <button
                                onClick={() => setSelectedAppointment(appointment)}
                                className="text-blue-600 hover:text-blue-900"
                                title={isArabic ? 'عرض التفاصيل' : 'View Details'}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              
                              {appointment.status === 'SCHEDULED' && (
                                <button
                                  onClick={() => updateAppointmentStatus(appointment.id, 'CONFIRMED')}
                                  className="text-green-600 hover:text-green-900"
                                  title={isArabic ? 'تأكيد' : 'Confirm'}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              
                              {appointment.status === 'IN_PROGRESS' && (
                                <button
                                  onClick={() => updateAppointmentStatus(appointment.id, 'COMPLETED')}
                                  className="text-purple-600 hover:text-purple-900"
                                  title={isArabic ? 'إنهاء' : 'Complete'}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, 'CANCELLED')}
                                className="text-red-600 hover:text-red-900"
                                title={isArabic ? 'إلغاء' : 'Cancel'}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdate={loadAppointments}
          language={language}
          canManage={canManage}
        />
      )}
    </div>
  )
}
