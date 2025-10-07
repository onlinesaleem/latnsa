'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  Users, 
  Calendar,
  Clock,
  FileText,
  Save,
  CheckCircle,
  AlertTriangle,
  Eye,
  Calculator,
  MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Patient } from '@prisma/client'
import { calculateAge } from '@/app/utils/dateUtils'

interface Assessment {
  id: string
  assessmentNumber: string
  registrantEmail?: string
  formType: 'SELF' | 'PROXY'
  language: 'ENGLISH' | 'ARABIC'
  status: string
  subjectName?: string
  subjectAge?: number
  subjectGender?: string
  relationship?: string
  submittedAt?: string
  isReviewed: boolean
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  clinicalScore?: string
  recommendations?: string
  responses: AssessmentResponse[]
  patient: Patient
}


interface AssessmentResponse {
  id: string
  questionId: string
  questionText: string
  answerValue: string
  answerType: string
}

interface AssessmentReviewProps {
  assessmentId: string
}

export default function AssessmentReview({ assessmentId }: AssessmentReviewProps) {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [clinicalScore, setClinicalScore] = useState('')
  const [recommendations, setRecommendations] = useState('')
  const [activeTab, setActiveTab] = useState<'responses' | 'scoring' | 'review'>('responses')

  useEffect(() => {
    loadAssessment()
  }, [assessmentId])

  const loadAssessment = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/assessment/${assessmentId}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Assessment data:",data)
        setAssessment(data.assessment)
        setClinicalScore(data.assessment.clinicalScore || '')
        setRecommendations(data.assessment.recommendations || '')
        setReviewNotes(data.assessment.reviewNotes || '')
      } else {
        toast.error('Failed to load assessment')
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error loading assessment:', error)
      toast.error('Error loading assessment details')
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }

  const saveReview = async () => {
    if (!assessment) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/assessment/${assessmentId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewNotes,
          clinicalScore,
          recommendations,
          status: 'UNDER_REVIEW'
        })
      })

      if (response.ok) {
        toast.success('Review saved successfully')
        loadAssessment() // Refresh data
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save review')
      }
    } catch (error) {
      console.error('Error saving review:', error)
      toast.error('Error saving review')
    } finally {
      setSaving(false)
    }
  }

  const completeReview = async () => {
    if (!reviewNotes.trim()) {
      toast.error('Please add review notes before completing')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/assessment/${assessmentId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewNotes,
          clinicalScore,
          recommendations,
          status: 'COMPLETED'
        })
      })

      if (response.ok) {
        toast.success('Assessment review completed')
        loadAssessment()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to complete review')
      }
    } catch (error) {
      console.error('Error completing review:', error)
      toast.error('Error completing review')
    } finally {
      setSaving(false)
    }
  }

// Updated calculateBristolScore function for the complete questionnaire
const calculateBristolScore = () => {
  if (!assessment || !assessment.responses) return 0
  
  let total = 0
  let bristolResponses = 0
  
  console.log("=== Bristol Score Calculation ===")
  console.log("Total responses:", assessment.responses.length)
  
  assessment.responses.forEach((response, index) => {
    // Only calculate Bristol scores for Bristol questions
    // Bristol questions are typically in the "Bristol Activities of Daily Living Scale" group
    const isBristolQuestion = response.questionText && (
      response.questionText.includes("Food preparation") ||
      response.questionText.includes("Eating") ||
      response.questionText.includes("Drink preparation") ||
      response.questionText.includes("Drinking") ||
      response.questionText.includes("Dressing") ||
      response.questionText.includes("Personal hygiene") ||
      response.questionText.includes("Teeth") ||
      response.questionText.includes("Bathing") ||
      response.questionText.includes("Toilet use") ||
      response.questionText.includes("Transferring") ||
      response.questionText.includes("Walking") ||
      response.questionText.includes("Time orientation") ||
      response.questionText.includes("Place orientation") ||
      response.questionText.includes("Communication") ||
      response.questionText.includes("Telephone use") ||
      response.questionText.includes("Housework") ||
      response.questionText.includes("Shopping") ||
      response.questionText.includes("Managing financial") ||
      response.questionText.includes("Games and hobbies") ||
      response.questionText.includes("Transportation")
    )
    
    if (!isBristolQuestion) {
      return // Skip non-Bristol questions
    }
    
    bristolResponses++
    const answerValue = response.answerValue?.toString() || ''
    let score = 0
    
    console.log(`\nBristol Question ${bristolResponses}:`, response.questionText)
    console.log(`Answer: "${answerValue}"`)
    
    // Handle different possible answer formats
    if (answerValue.includes('A)') || answerValue.startsWith('A)') || answerValue.includes('أ)')) {
      score = 0
    } else if (answerValue.includes('B)') || answerValue.startsWith('B)') || answerValue.includes('ب)')) {
      score = 1
    } else if (answerValue.includes('C)') || answerValue.startsWith('C)') || answerValue.includes('ج)')) {
      score = 2
    } else if (answerValue.includes('D)') || answerValue.startsWith('D)') || answerValue.includes('د)')) {
      score = 3
    } else if (answerValue.includes('E)') || answerValue.startsWith('E)') || answerValue.includes('هـ)')) {
      score = 0 // Not applicable
    } else {
      // Try alternative patterns
      const upperAnswer = answerValue.toUpperCase()
      if (upperAnswer.includes('CHOOSES AND PREPARES') || upperAnswer.includes('INDEPENDENTLY')) {
        score = 0
      } else if (upperAnswer.includes('INGREDIENTS PROVIDED') || upperAnswer.includes('IF ASSISTED')) {
        score = 1
      } else if (upperAnswer.includes('STEP BY STEP') || upperAnswer.includes('SUPERVISION')) {
        score = 2
      } else if (upperAnswer.includes('CANNOT') || upperAnswer.includes('NEEDS FULL')) {
        score = 3
      } else if (upperAnswer.includes('NOT APPLICABLE')) {
        score = 0
      }
      
      console.log(`Alternative matching used for: "${answerValue}"`)
    }
    
    console.log(`Score: ${score}`)
    total += score
  })
  
  console.log(`\n=== Bristol Score Summary ===`)
  console.log(`Bristol questions found: ${bristolResponses}`)
  console.log(`Total Bristol Score: ${total}`)
  console.log(`Expected Bristol questions: 20`)
  
  if (bristolResponses < 20) {
    console.warn(`Warning: Only ${bristolResponses} Bristol questions found, expected 20`)
  }
  
  return total
}


  const renderResponseValue = (response: AssessmentResponse) => {
    if (response.answerType === 'MULTIPLE_CHOICE') {
      try {
        const values = JSON.parse(response.answerValue)
        if (Array.isArray(values)) {
          return (
            <ul className="list-disc list-inside space-y-1">
              {values.map((value, index) => (
                <li key={index} className="text-sm text-gray-700">{value}</li>
              ))}
            </ul>
          )
        }
      } catch (e) {
        // Fall through to default rendering
      }
    }
    
    return <p className="text-sm text-gray-700">{response.answerValue}</p>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment details...</p>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Assessment not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin')}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Assessment Review
                </h1>
                <p className="text-gray-600">Assessment #: {assessment.assessmentNumber}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {assessment.status !== 'COMPLETED' && (
                <>
                  <button
                    onClick={saveReview}
                    disabled={saving}
                    className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Review
                  </button>
                  <button
                    onClick={completeReview}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Review
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient/Subject Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center mb-4">
                {assessment.formType === 'PROXY' ? (
                  <Users className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <User className="w-5 h-5 text-blue-600 mr-2" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {assessment.formType === 'PROXY' ? 'Proxy Assessment' : 'Self Assessment'}
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Patient MRN</label>
                  <p className="text-gray-900">
                    {assessment.formType === 'PROXY' ?  assessment.patient.mrn : assessment.patient.mrn}
                  </p>
                </div>
                      {assessment.patient.fullName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Patient Name</label>
                    <p className="text-gray-900">{assessment.patient.fullName}</p>
                  </div>
                )}
                     {assessment.patient.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Mobile</label>
                    <p className="text-gray-900">{assessment.patient.phone}</p>
                  </div>
                )}


                {assessment.patient.dateOfBirth && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Age</label>
                    <p className="text-gray-900">{calculateAge(assessment.patient.dateOfBirth)}</p>
                      
                  </div>
                )}

                {assessment.subjectGender && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-gray-900">{assessment.subjectGender}</p>
                  </div>
                )}

                {assessment.formType === 'PROXY' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Filled by</label>
                      <p className="text-gray-900">{assessment.registrantName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Relationship</label>
                      <p className="text-gray-900">{assessment.relationship}</p>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Language</label>
                  <p className="text-gray-900">{assessment.language}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Submitted</label>
                  <p className="text-gray-900">
                    {assessment.submittedAt 
                      ? new Date(assessment.submittedAt).toLocaleDateString() + ' ' + 
                        new Date(assessment.submittedAt).toLocaleTimeString()
                      : 'Draft'
                    }
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    assessment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    assessment.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {assessment.status.replace('_', ' ')}
                  </span>
                </div>

                {assessment.isReviewed && assessment.reviewedBy && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reviewed by</label>
                    <p className="text-gray-900">{assessment.reviewedBy}</p>
                    {assessment.reviewedAt && (
                      <p className="text-sm text-gray-500">
                        {new Date(assessment.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Responses</span>
                  <span className="text-sm font-medium text-gray-900">{assessment.responses.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Bristol Score</span>
                  <span className="text-sm font-medium text-gray-900">{calculateBristolScore()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Completion</span>
                  <span className="text-sm font-medium text-green-600">100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('responses')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'responses'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Responses
                  </button>
                  <button
                    onClick={() => setActiveTab('scoring')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'scoring'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Calculator className="w-4 h-4 inline mr-2" />
                    Scoring
                  </button>
                  <button
                    onClick={() => setActiveTab('review')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'review'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Clinical Review
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'responses' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Assessment Responses</h3>
                    {assessment.responses.length > 0 ? (
                      <div className="space-y-4">
                        {assessment.responses.map((response, index) => (
                          <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-900">
                                Question {index + 1}
                              </h4>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {response.answerType}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{response.questionText}</p>
                            <div className="bg-gray-50 p-3 rounded">
                              {renderResponseValue(response)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No responses recorded</p>
                    )}
                  </div>
                )}

                {activeTab === 'scoring' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Assessment Scoring</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Bristol Activities Scale</h4>
                        <div className="text-2xl font-bold text-blue-600">{calculateBristolScore()}</div>
                        <p className="text-sm text-blue-700">Total Score</p>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Clinical Assessment</h4>
                        <input
                          type="text"
                          placeholder="Enter clinical score"
                          value={clinicalScore}
                          onChange={(e) => setClinicalScore(e.target.value)}
                          className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Scoring Guidelines</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                        <p><strong>Bristol Scale:</strong> A=0, B=1, C=2, D=3, E=0 (Not applicable)</p>
                        <p><strong>Interpretation:</strong></p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>0-10: Minimal impairment</li>
                          <li>11-20: Mild impairment</li>
                          <li>21-40: Moderate impairment</li>
                          <li>41-60: Severe impairment</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'review' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Clinical Review</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Clinical Notes *
                      </label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Enter your clinical assessment notes, observations, and findings..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        rows={8}
                        disabled={assessment.status === 'COMPLETED'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recommendations
                      </label>
                      <textarea
                        value={recommendations}
                        onChange={(e) => setRecommendations(e.target.value)}
                        placeholder="Enter recommendations for follow-up care, additional testing, or treatment..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        rows={6}
                        disabled={assessment.status === 'COMPLETED'}
                      />
                    </div>

                    {assessment.status === 'COMPLETED' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-green-800 font-medium">Review Completed</span>
                        </div>
                        <p className="text-green-700 text-sm mt-1">
                          This assessment has been reviewed and completed by {assessment.reviewedBy} on{' '}
                          {assessment.reviewedAt && new Date(assessment.reviewedAt).toLocaleDateString()}.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}