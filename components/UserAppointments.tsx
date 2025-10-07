// ==================================================================
// 5. USER APPOINTMENTS COMPONENT - /components/UserAppointments.tsx
// ==================================================================

'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Calendar, Video, FileText, Clock, CheckCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface UserAppointment {
  id: string
  patientName: string
  type: string
  status: string
  scheduledAt: string
  duration: number
  meetingUrl?: string
  notes?: string
}

export default function UserAppointments() {
  const { data: session } = useSession()
  const [appointments, setAppointments] = useState<UserAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming')

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
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

  const getFilteredAppointments = () => {
    const now = new Date()
    
    switch (filter) {
      case 'upcoming':
        return appointments.filter(apt => 
          new Date(apt.scheduledAt) > now && 
          apt.status !== 'COMPLETED' && 
          apt.status !== 'CANCELLED'
        )
      case 'completed':
        return appointments.filter(apt => 
          apt.status === 'COMPLETED' || new Date(apt.scheduledAt) < now
        )
      default:
        return appointments
    }
  }

  const joinMeeting = (appointment: UserAppointment) => {
    if (appointment.meetingUrl) {
      window.open(appointment.meetingUrl, '_blank')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getTypeIcon = (type: string) => {
    if (type === 'LAB_TESTING') return <FileText className="w-5 h-5" />
    return <Video className="w-5 h-5" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const filteredAppointments = getFilteredAppointments()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-600">View and manage your medical appointments</p>
            </div>
            
            <Link
              href="/appointments/book"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Book New Appointment
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex space-x-4">
            {[
              { key: 'upcoming', label: 'Upcoming', count: appointments.filter(a => new Date(a.scheduledAt) > new Date() && a.status !== 'COMPLETED').length },
              { key: 'completed', label: 'Completed', count: appointments.filter(a => a.status === 'COMPLETED').length },
              { key: 'all', label: 'All', count: appointments.length }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === filterOption.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-500 mb-6">You don't have any appointments yet.</p>
            <Link
              href="/appointments/book"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAppointments.map(appointment => (
              <div key={appointment.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {getTypeIcon(appointment.type)}
                      <span className="ml-2 font-medium text-gray-900">
                        {appointment.type.replace('_', ' ')}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(appointment.scheduledAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {new Date(appointment.scheduledAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} ({appointment.duration} min)
                    </div>
                  </div>

                  {appointment.notes && (
                    <p className="text-sm text-gray-600 mb-4">{appointment.notes}</p>
                  )}

                  <div className="flex space-x-2">
                    <Link
                      href={`/appointments/${appointment.id}`}
                      className="flex-1 px-3 py-2 text-center text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      View Details
                    </Link>
                    
                    {appointment.meetingUrl && appointment.status === 'CONFIRMED' && (
                      <button
                        onClick={() => joinMeeting(appointment)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 flex items-center justify-center"
                      >
                        <Video className="w-4 h-4 mr-1" />
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}