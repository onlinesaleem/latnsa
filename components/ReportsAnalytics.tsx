'use client'
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  FileText, 
  Download, 
  Mail, 
  BarChart3, 
  TrendingUp,
  Users,
  Calendar,
  Globe,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import toast from 'react-hot-toast'

interface ReportsAnalyticsProps {
  language?: 'english' | 'arabic'
}

interface AnalyticsData {
  summary: {
    totalAssessments: number
    completedAssessments: number
    completionRate: string
    avgPatientAge: string
  }
  distribution: {
    byType: Array<{ type: string, count: number }>
    byLanguage: Array<{ language: string, count: number }>
    byStatus: Array<{ status: string, count: number }>
  }
  trends: {
    dailySubmissions: Array<{ date: string, count: number }>
  }
  period: number
  generatedAt: string
}

interface ReportFormData {
  assessmentId: string
  language: string
  reportType: string
  fromDate: string
  toDate: string
}

export default function ReportsAnalytics({ language = 'english' }: ReportsAnalyticsProps) {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState(30)
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'analytics'>('overview')
  const [reportLoading, setReportLoading] = useState<string | null>(null)
  const [reportForm, setReportForm] = useState<ReportFormData>({
    assessmentId: '',
    language: 'english',
    reportType: 'summary',
    fromDate: '',
    toDate: ''
  })
  
  const isArabic = language === 'arabic'

  // Load analytics data
  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/reports/analytics?period=${period}`)
      const data = await response.json()
      
      if (response.ok) {
        setAnalytics(data.analytics)
      } else {
        toast.error('Failed to load analytics data')
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Error loading analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [period])

  // Generate individual report
  const generateIndividualReport = async (format: 'pdf' | 'email') => {
    if (!reportForm.assessmentId) {
      toast.error('Please enter an assessment ID')
      return
    }

    setReportLoading(reportForm.assessmentId)
    try {
      const response = await fetch(`/api/admin/assessment/${reportForm.assessmentId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          language: reportForm.language,
          includeCharts: true,
          includeClinicalNotes: true
        })
      })

      if (response.ok) {
        if (format === 'email') {
          toast.success('Report sent via email successfully')
        } else {
          // Download PDF
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `assessment-report-${reportForm.assessmentId}.pdf`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          toast.success('Report downloaded successfully')
        }
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

  // Generate analytics report
  const generateAnalyticsReport = async () => {
    if (!reportForm.fromDate || !reportForm.toDate) {
      toast.error('Please select date range')
      return
    }

    setReportLoading('analytics')
    try {
      const response = await fetch('/api/admin/reports/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromDate: reportForm.fromDate,
          toDate: reportForm.toDate,
          type: reportForm.reportType,
          format: 'pdf'
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-report-${reportForm.fromDate}-to-${reportForm.toDate}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Analytics report downloaded successfully')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to generate analytics report')
      }
    } catch (error) {
      console.error('Error generating analytics report:', error)
      toast.error('Error generating analytics report')
    } finally {
      setReportLoading(null)
    }
  }

  // Chart colors
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  // Fixed custom label renderer for Pie chart
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isArabic ? 'التقارير والتحليلات' : 'Reports & Analytics'}
              </h1>
              <p className="text-gray-600">
                {isArabic ? 'تحليل بيانات التقييمات وإنشاء التقارير' : 'Assessment data analysis and report generation'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={period}
                onChange={(e) => setPeriod(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={7}>{isArabic ? 'آخر 7 أيام' : 'Last 7 days'}</option>
                <option value={30}>{isArabic ? 'آخر 30 يوم' : 'Last 30 days'}</option>
                <option value={90}>{isArabic ? 'آخر 90 يوم' : 'Last 90 days'}</option>
                <option value={365}>{isArabic ? 'السنة الماضية' : 'Last year'}</option>
              </select>
              
              <button
                onClick={loadAnalytics}
                disabled={loading}
                className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''} mr-2`} />
                {isArabic ? 'تحديث' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              {isArabic ? 'نظرة عامة' : 'Overview'}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              {isArabic ? 'التحليلات' : 'Analytics'}
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              {isArabic ? 'التقارير' : 'Reports'}
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {isArabic ? 'إجمالي التقييمات' : 'Total Assessments'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.summary.totalAssessments}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {isArabic ? 'التقييمات المكتملة' : 'Completed'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.summary.completedAssessments}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {isArabic ? 'معدل الإكمال' : 'Completion Rate'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.summary.completionRate}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {isArabic ? 'متوسط العمر' : 'Average Age'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.summary.avgPatientAge}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Assessment Types Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isArabic ? 'توزيع أنواع التقييمات' : 'Assessment Types Distribution'}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.distribution.byType.map(item => ({
                        name: item.type === 'SELF' ? 
                          (isArabic ? 'تقييم شخصي' : 'Self Assessment') :
                          (isArabic ? 'تقييم نيابي' : 'Proxy Assessment'),
                        value: item.count
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.distribution.byType.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        value, 
                        name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Language Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isArabic ? 'توزيع اللغات' : 'Language Distribution'}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.distribution.byLanguage.map(item => ({
                        name: item.language === 'ENGLISH' ? 
                          (isArabic ? 'الإنجليزية' : 'English') :
                          (isArabic ? 'العربية' : 'Arabic'),
                        value: item.count
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.distribution.byLanguage.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        value, 
                        name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8">
            {/* Trends Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isArabic ? 'اتجاه التقييمات اليومية' : 'Daily Assessment Submissions'}
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.trends.dailySubmissions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#0ea5e9" 
                    strokeWidth={2}
                    dot={{ fill: '#0ea5e9' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isArabic ? 'توزيع حالات التقييمات' : 'Assessment Status Distribution'}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.distribution.byStatus.map(item => ({
                  status: item.status.replace('_', ' '),
                  count: item.count
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {isArabic ? 'إنشاء التقارير' : 'Generate Reports'}
            </h3>
            
            <div className="space-y-6">
              {/* Individual Assessment Report */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">
                  {isArabic ? 'تقرير تقييم فردي' : 'Individual Assessment Report'}
                </h4>
                <p className="text-gray-600 mb-4">
                  {isArabic 
                    ? 'قم بإنشاء تقرير مفصل لتقييم محدد بصيغة PDF.'
                    : 'Generate a detailed PDF report for a specific assessment.'
                  }
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic ? 'رقم التقييم' : 'Assessment ID'}
                    </label>
                    <input
                      type="text"
                      value={reportForm.assessmentId}
                      onChange={(e) => setReportForm({...reportForm, assessmentId: e.target.value})}
                      placeholder={isArabic ? 'أدخل رقم التقييم' : 'Enter assessment ID'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic ? 'اللغة' : 'Language'}
                    </label>
                    <select 
                      value={reportForm.language}
                      onChange={(e) => setReportForm({...reportForm, language: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="english">{isArabic ? 'الإنجليزية' : 'English'}</option>
                      <option value="arabic">{isArabic ? 'العربية' : 'Arabic'}</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button 
                    onClick={() => generateIndividualReport('pdf')}
                    disabled={reportLoading === reportForm.assessmentId}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {reportLoading === reportForm.assessmentId ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {isArabic ? 'تحميل PDF' : 'Download PDF'}
                  </button>
                  
                  <button 
                    onClick={() => generateIndividualReport('email')}
                    disabled={reportLoading === reportForm.assessmentId}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {reportLoading === reportForm.assessmentId ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    {isArabic ? 'إرسال بالبريد' : 'Email Report'}
                  </button>
                </div>
              </div>
              
              {/* Comprehensive Analytics Report */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">
                  {isArabic ? 'تقرير تحليلي شامل' : 'Comprehensive Analytics Report'}
                </h4>
                <p className="text-gray-600 mb-4">
                  {isArabic 
                    ? 'قم بإنشاء تقرير تحليلي شامل لجميع التقييمات في فترة محددة.'
                    : 'Generate a comprehensive analytics report for all assessments in a specific period.'
                  }
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic ? 'من تاريخ' : 'From Date'}
                    </label>
                    <input
                      type="date"
                      value={reportForm.fromDate}
                      onChange={(e) => setReportForm({...reportForm, fromDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic ? 'إلى تاريخ' : 'To Date'}
                    </label>
                    <input
                      type="date"
                      value={reportForm.toDate}
                      onChange={(e) => setReportForm({...reportForm, toDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic ? 'نوع التقرير' : 'Report Type'}
                    </label>
                    <select 
                      value={reportForm.reportType}
                      onChange={(e) => setReportForm({...reportForm, reportType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="summary">{isArabic ? 'ملخص' : 'Summary'}</option>
                      <option value="detailed">{isArabic ? 'مفصل' : 'Detailed'}</option>
                      <option value="statistical">{isArabic ? 'إحصائي' : 'Statistical'}</option>
                    </select>
                  </div>
                </div>
                
                <button 
                  onClick={generateAnalyticsReport}
                  disabled={reportLoading === 'analytics'}
                  className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {reportLoading === 'analytics' ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <BarChart3 className="w-4 h-4 mr-2" />
                  )}
                  {isArabic ? 'إنشاء التقرير التحليلي' : 'Generate Analytics Report'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}