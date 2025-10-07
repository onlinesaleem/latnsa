
// ==================================================================
// SingleAppointmentView Component - /components/SingleAppointmentView.tsx
// ==================================================================

'use client'

import React from 'react'
import { Calendar, Clock, Video, FileText, User, Mail, Phone, MapPin, ArrowLeft, XCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface SingleAppointmentViewProps {
  appointment: {
    id: string
    patientName: string
    patientEmail: string
    patientPhone?: string
    type: string
    status: string
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
}

export default function SingleAppointmentView({ appointment }: SingleAppointmentViewProps) {
  const isVirtual = appointment.type === 'VIRTUAL_CONSULTATION' || appointment.type === 'VIDEO_CALL'
  const canJoinMeeting = appointment.meetingUrl && 
    (appointment.status === 'CONFIRMED' || appointment.status === 'IN_PROGRESS')

  const joinMeeting = () => {
    if (appointment.meetingUrl) {
      window.open(appointment.meetingUrl, '_blank')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
      IN_PROGRESS: 'bg-green-100 text-green-800 border-green-200',
      COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getTypeIcon = () => {
    if (appointment.type === 'LAB_TESTING') return <FileText className="w-6 h-6 text-blue-600" />
    return <Video className="w-6 h-6 text-green-600" />
  }

  const getTypeLabel = () => {
    const types: Record<string, string> = {
      'LAB_TESTING': 'Lab Testing',
      'VIRTUAL_CONSULTATION': 'Virtual Consultation',
      'VIDEO_CALL': 'Video Call'
    }
    return types[appointment.type] || appointment.type
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Link
              href="/appointments"
              className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Appointments
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
              <p className="text-gray-600">View your appointment information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Status Banner */}
          <div className={`px-6 py-4 border-l-4 ${getStatusColor(appointment.status)} border-l-current`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {appointment.status.replace('_', ' ')} Appointment
                </h2>
                <p className="text-sm opacity-75">
                  Appointment ID: {appointment.id.substring(0, 8)}...
                </p>
              </div>
              {canJoinMeeting && (
                <button
                  onClick={joinMeeting}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Meeting
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Appointment Type and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center">
                {getTypeIcon()}
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">{getTypeLabel()}</h3>
                  <p className="text-sm text-gray-600">
                    Duration: {appointment.duration} minutes
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="w-6 h-6 text-blue-600" />
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">
                    {new Date(appointment.scheduledAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.scheduledAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{appointment.patientName}</p>
                    <p className="text-sm text-gray-600">Patient Name</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{appointment.patientEmail}</p>
                    <p className="text-sm text-gray-600">Email Address</p>
                  </div>
                </div>

                {appointment.patientPhone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{appointment.patientPhone}</p>
                      <p className="text-sm text-gray-600">Phone Number</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Virtual Meeting Information */}
            {isVirtual && appointment.meetingUrl && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Virtual Meeting</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Video className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Meeting Instructions</h4>
                      <ul className="text-sm text-blue-800 space-y-1 mb-4">
                        <li>• Join the meeting 5 minutes before your scheduled time</li>
                        <li>• Ensure you have a stable internet connection</li>
                        <li>• Test your camera and microphone beforehand</li>
                        <li>• Find a quiet, well-lit location</li>
                      </ul>
                      
                      {canJoinMeeting ? (
                        <button
                          onClick={joinMeeting}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Join Meeting Now
                        </button>
                      ) : (
                        <p className="text-sm text-blue-700">
                          Meeting link will be available when the appointment is confirmed.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {appointment.notes && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Additional Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{appointment.notes}</p>
              </div>
            )}

            {/* Related Assessment */}
            {appointment.assessment && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Related Assessment</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Assessment #{appointment.assessment.id.substring(0, 8)}...
                      </p>
                      <p className="text-sm text-gray-600">
                        Status: {appointment.assessment.status}
                        {appointment.assessment.clinicalScore && (
                          <span className="ml-2">• Score: {appointment.assessment.clinicalScore}</span>
                        )}
                      </p>
                    </div>
                    <Link
                      href={`/assessments/${appointment.assessment.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Assessment
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                {appointment.status === 'SCHEDULED' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex-1">
                    <div className="flex">
                      <Clock className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Awaiting Confirmation</h4>
                        <p className="text-sm text-yellow-800 mt-1">
                          Your appointment is scheduled and awaiting confirmation from our staff. 
                          You will receive an email notification once confirmed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {appointment.status === 'COMPLETED' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex-1">
                    <div className="flex">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-green-900">Appointment Completed</h4>
                        <p className="text-sm text-green-800 mt-1">
                          Thank you for attending your appointment. Follow-up information will be sent if needed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {appointment.status === 'CANCELLED' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex-1">
                    <div className="flex">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-red-900">Appointment Cancelled</h4>
                        <p className="text-sm text-red-800 mt-1">
                          This appointment has been cancelled. Please contact us to reschedule if needed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Support */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Need to reschedule or have questions about your appointment?
                </p>
                <Link
                  href="/contact"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}