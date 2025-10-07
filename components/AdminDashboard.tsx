'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search,
  Filter,
  Eye,
  Calendar,
  BarChart3,
  Download,
  RefreshCw,
  User
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Patient {
  id: string
  mrn: string
  fullName: string
  email?: string
  phone?: string
  gender?: string
  dateOfBirth?: string
}

interface Assessment {
  id: string
  assessmentNumber: string
  formType: 'SELF' | 'PROXY'
  language: 'ENGLISH' | 'ARABIC'
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'COMPLETED' | 'ARCHIVED'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  
  // Patient relationship
  patient: Patient
  
  // Proxy information (if PROXY)
  proxyName?: string
  proxyEmail?: string
  proxyPhone?: string
  proxyRelationship?: string
  
  // Submitter information
  submitter?: {
    name?: string
    email?: string
  }
  
  submittedAt?: string
  isReviewed: boolean
  reviewedBy?: string
  reviewedAt?: string
  
  _count: {
    responses: number
  }
}

interface ReportFormData {
  assessmentId: string
  language: string
  reportType: string
  fromDate: string
  toDate: string
}

interface DashboardStats {
  total: number
  pending: number
  underReview: number
  completed: number
  todaySubmissions: number
  totalPatients: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // State management
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    underReview: 0,
    completed: 0,
    todaySubmissions: 0,
    totalPatients: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [formTypeFilter, setFormTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [reportLoading, setReportLoading] = useState<string | null>(null)
  const [reportForm, setReportForm] = useState<ReportFormData>({
    assessmentId: '',
    language: 'english',
    reportType: 'summary',
    fromDate: '',
    toDate: ''
  })

  // Check admin access
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'CLINICAL_STAFF') {
      toast.error('Access denied. Admin privileges required.')
      router.push('/')
      return
    }

    loadDashboardData()
  }, [session, status, router])

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [assessmentsRes, statsRes] = await Promise.all([
        fetch('/api/admin/assessments'),
        fetch('/api/admin/stats')
      ])

      if (assessmentsRes.ok) {
        const assessmentsData = await assessmentsRes.json()
        setAssessments(assessmentsData.assessments)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Filter assessments
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = 
      assessment.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.assessmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assessment.proxyName && assessment.proxyName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter
    const matchesFormType = formTypeFilter === 'all' || assessment.formType === formTypeFilter
    const matchesPriority = priorityFilter === 'all' || assessment.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesFormType && matchesPriority
  })

  // Pagination
  const totalPages = Math.ceil(filteredAssessments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAssessments = filteredAssessments.slice(startIndex, startIndex + itemsPerPage)

  // Status badge component
  const StatusBadge = ({ status }: { status: Assessment['status'] }) => {
    const badges: Record<Assessment['status'], string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-gray-100 text-gray-600',
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status]}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  // Priority badge component
  const PriorityBadge = ({ priority }: { priority: Assessment['priority'] }) => {
    const badges: Record<Assessment['priority'], string> = {
      LOW: 'bg-gray-100 text-gray-600',
      NORMAL: 'bg-blue-100 text-blue-600',
      HIGH: 'bg-orange-100 text-orange-600',
      URGENT: 'bg-red-100 text-red-600',
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[priority]}`}>
        {priority}
      </span>
    )
  }

  // Handle assessment review
  const handleViewAssessment = (assessmentId: string) => {
    router.push(`/admin/assessment/${assessmentId}`)
  }

  // Handle report download
  const handleDownload = async (assessmentId: string) => {
    setReportLoading(assessmentId)
    try {
      const response = await fetch(`/api/admin/assessment/${assessmentId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: reportForm.language,
          includeCharts: true,
          includeClinicalNotes: true
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `assessment-report-${assessmentId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Report downloaded successfully')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Error generating report')
    } finally {
      setReportLoading(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Healthcare Assessment Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadDashboardData}
                className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <div className="text-sm text-gray-600">
                Welcome, {session?.user.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.underReview}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Complete</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todaySubmissions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search MRN, name, assessment #..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formTypeFilter}
              onChange={(e) => setFormTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="SELF">Self Assessment</option>
              <option value="PROXY">Proxy Assessment</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW">Low</option>
            </select>

            <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Assessments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessment #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedAssessments.length > 0 ? (
                  paginatedAssessments.map((assessment) => (
                    <tr key={assessment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <User className="w-5 h-5 text-gray-400 mt-0.5 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {assessment.patient.fullName}
                            </div>
                            <div className="text-sm text-blue-600 font-mono">
                              MRN: {assessment.patient.mrn}
                            </div>
                            {assessment.formType === 'PROXY' && (
                              <div className="text-xs text-gray-500 mt-1">
                                via {assessment.proxyName} ({assessment.proxyRelationship})
                              </div>
                            )}
                            {assessment.patient.email && (
                              <div className="text-xs text-gray-500">
                                {assessment.patient.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-medium text-gray-900">
                          {assessment.assessmentNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {assessment._count.responses} responses
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {assessment.formType}
                          </span>
                          <span className="text-xs text-gray-500">
                            {assessment.language}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={assessment.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriorityBadge priority={assessment.priority} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assessment.submittedAt 
                          ? new Date(assessment.submittedAt).toLocaleDateString()
                          : 'Draft'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewAssessment(assessment.id)}
                            className="flex items-center text-blue-600 hover:text-blue-900"
                            title="Review Assessment"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(assessment.id)}
                            disabled={reportLoading === assessment.id}
                            className="flex items-center text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Download Report"
                          >
                            {reportLoading === assessment.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p>No assessments found matching your criteria</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(startIndex + itemsPerPage, filteredAssessments.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredAssessments.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}