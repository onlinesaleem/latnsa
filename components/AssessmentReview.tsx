"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  Users, 
  Save,
  CheckCircle,
  AlertTriangle,
  Calculator,
  MessageSquare,
  FileText,
  TrendingUp,
  Award
} from 'lucide-react'
import toast from 'react-hot-toast'
import UnscoredResponses from './UnscoredResponse'


interface QuestionScore {
  questionId: string
  questionText: string
  answerValue: string
  score: number | null
  scoreLabel: string | null
  maxScore: number | null
  scoreUnit: string | null
}

interface GroupScore {
  groupId: string
  groupName: string
  groupNameAr: string
  questions: QuestionScore[]
  totalScore: number
  maxScore: number
  percentage: number
  interpretation?: string
}

interface Assessment {
  id: string
  assessmentNumber: string
  formType: 'SELF' | 'PROXY'
  language: 'ENGLISH' | 'ARABIC'
  status: string
  submittedAt?: string
  isReviewed: boolean
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  clinicalScore?: string
  recommendations?: string
  patient: {
    id: string
    mrn: string
    fullName: string
    email?: string
    phone?: string
    dateOfBirth?: string
    gender?: string
  }
  proxyName?: string
  proxyRelationship?: string
  responses: Array<{
    id: string
    questionId: string
    questionText: string
    answerValue: string
    answerType: string
    score: number | null
    scoreLabel: string | null
    question?: {
      questionGroupId: string
      hasScoring: boolean
      maxScore: number | null
      scoreUnit: string | null
      questionGroup?: {
        name: string
        nameAr: string
      }
    }
  }>
}

interface AssessmentReviewProps {
  assessmentId: string
}

export default function AssessmentReview({ assessmentId }: AssessmentReviewProps) {
  const router = useRouter()
  
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [groupScores, setGroupScores] = useState<GroupScore[]>([])
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
        console.log("Assessment data:", data)
        setAssessment(data.assessment)
        setClinicalScore(data.assessment.clinicalScore || '')
        setRecommendations(data.assessment.recommendations || '')
        setReviewNotes(data.assessment.reviewNotes || '')
        
        // Use group scores from API
        if (data.groupScores) {
          const enrichedGroupScores = data.groupScores.map((group: any) => {
            // Get questions for this group from enriched responses
            const groupQuestions = data.assessment.responses
              .filter((r: any) => r.question?.questionGroupId === group.groupId && r.question?.hasScoring)
              .map((r: any) => ({
                questionId: r.questionId,
                questionText: r.questionText,
                answerValue: r.answerValue,
                score: r.score,
                scoreLabel: r.scoreLabel,
                maxScore: r.question?.maxScore,
                scoreUnit: r.question?.scoreUnit
              }))

            return {
              ...group,
              questions: groupQuestions,
              interpretation: getInterpretation(group.groupName, group.totalScore, group.maxScore)
            }
          })
          
          console.log('Enriched group scores:', enrichedGroupScores)
          setGroupScores(enrichedGroupScores)
        }
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

  const getInterpretation = (groupName: string, score: number, maxScore: number): string => {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0

    // GDS-15 (Depression)
    if (groupName.includes('GDS') || groupName.includes('Depression')) {
      if (score <= 4) return 'Normal (no depression)'
      if (score <= 9) return 'Mild depression'
      return 'Moderate to severe depression'
    }

    // FAST (Functional Assessment)
    if (groupName.includes('FAST')) {
      if (score <= 2) return 'Normal / No dementia'
      if (score <= 4) return 'Mild cognitive decline'
      if (score === 5) return 'Moderate dementia'
      if (score === 6) return 'Moderately severe dementia'
      return 'Severe dementia'
    }

    // Bristol Activities Scale
    if (groupName.includes('Bristol')) {
      if (score <= 10) return 'Minimal impairment'
      if (score <= 20) return 'Mild impairment'
      if (score <= 40) return 'Moderate impairment'
      return 'Severe impairment'
    }

    // Generic percentage-based
    if (percentage <= 25) return 'Low severity'
    if (percentage <= 50) return 'Moderate severity'
    if (percentage <= 75) return 'High severity'
    return 'Critical severity'
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
        loadAssessment()
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

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const renderResponseValue = (response: any) => {
    if (response.answerType === 'MULTIPLE_CHOICE') {
      try {
        const values = JSON.parse(response.answerValue)
        if (Array.isArray(values)) {
          return (
            <ul className="list-disc list-inside space-y-1">
              {values.map((value: string, index: number) => (
                <li key={index} className="text-sm text-gray-700">{value}</li>
              ))}
            </ul>
          )
        }
      } catch (e) {
        // Fall through
      }
    }
    
    return <p className="text-sm text-gray-700">{response.answerValue}</p>
  }

  const getSeverityColor = (percentage: number) => {
    if (percentage <= 25) return 'text-green-600 bg-green-50 border-green-200'
    if (percentage <= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    if (percentage <= 75) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  // NEW: Helper function to add text to review notes
  const handleAddToNotes = (text: string) => {
    if (reviewNotes.trim()) {
      setReviewNotes(reviewNotes + text)
    } else {
      setReviewNotes(text)
    }
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

  const totalResponses = assessment.responses.length
  const scoredResponses = assessment.responses.filter(r => r.score !== null).length

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
                <h1 className="text-2xl font-bold text-gray-900">Assessment Review</h1>
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
          {/* Patient Information Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Patient Card */}
            <div className="bg-white rounded-lg shadow p-6">
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
                  <label className="text-xs font-medium text-gray-500 uppercase">MRN</label>
                  <p className="text-sm font-mono font-semibold text-blue-600">
                    {assessment.patient.mrn}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Patient Name</label>
                  <p className="text-sm text-gray-900 font-medium">{assessment.patient.fullName}</p>
                </div>

                {assessment.patient.dateOfBirth && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Age / Gender</label>
                    <p className="text-sm text-gray-900">
                      {calculateAge(assessment.patient.dateOfBirth)} years / {assessment.patient.gender || 'N/A'}
                    </p>
                  </div>
                )}

                {assessment.patient.phone && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Contact</label>
                    <p className="text-sm text-gray-900">{assessment.patient.phone}</p>
                  </div>
                )}

                {assessment.formType === 'PROXY' && (
                  <>
                    <div className="pt-3 border-t">
                      <label className="text-xs font-medium text-gray-500 uppercase">Submitted By</label>
                      <p className="text-sm text-gray-900">{assessment.proxyName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Relationship</label>
                      <p className="text-sm text-gray-900">{assessment.proxyRelationship}</p>
                    </div>
                  </>
                )}

                <div className="pt-3 border-t">
                  <label className="text-xs font-medium text-gray-500 uppercase">Submitted</label>
                  <p className="text-sm text-gray-900">
                    {assessment.submittedAt 
                      ? new Date(assessment.submittedAt).toLocaleString()
                      : 'Draft'
                    }
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      assessment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      assessment.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {assessment.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Assessment Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Questions</span>
                  <span className="text-lg font-bold text-gray-900">{totalResponses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Scored Questions</span>
                  <span className="text-lg font-bold text-blue-600">{scoredResponses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Question Groups</span>
                  <span className="text-lg font-bold text-purple-600">{groupScores.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('responses')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === 'responses'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Responses
                  </button>
                  <button
                    onClick={() => setActiveTab('scoring')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === 'scoring'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Calculator className="w-4 h-4" />
                    Scoring ({groupScores.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('review')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === 'review'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Clinical Review
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'responses' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">All Responses</h3>
                      <span className="text-sm text-gray-500">{totalResponses} questions answered</span>
                    </div>
                    
                    {assessment.responses.length > 0 ? (
                      <div className="space-y-4">
                        {assessment.responses.map((response, index) => (
                          <div key={response.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                  {index + 1}
                                </span>
                                <h4 className="text-sm font-medium text-gray-900">
                                  {response.questionText}
                                </h4>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {response.answerType}
                                </span>
                                {response.score !== null && (
                                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded flex items-center gap-1">
                                    <Award className="w-3 h-3" />
                                    {response.score} {response.scoreLabel && `• ${response.scoreLabel}`}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded mt-2">
                              {renderResponseValue(response)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No responses recorded</p>
                    )}
                  </div>
                )}

                {activeTab === 'scoring' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Assessment Scoring</h3>
                      <span className="text-sm text-gray-500">{groupScores.length} scored groups</span>
                    </div>

                    {groupScores.length > 0 ? (
                      <div className="space-y-6">
                        {groupScores.map((group) => (
                          <div key={group.groupId} className="border rounded-lg overflow-hidden">
                            {/* Group Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{group.groupName}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{group.groupNameAr}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {group.totalScore} <span className="text-sm text-gray-500">/ {group.maxScore}</span>
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {group.percentage.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min(group.percentage, 100)}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Interpretation */}
                              {group.interpretation && (
                                <div className={`mt-3 px-3 py-2 rounded-lg border ${getSeverityColor(group.percentage)}`}>
                                  <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-sm font-medium">{group.interpretation}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Individual Question Scores */}
                            <div className="p-4 bg-white">
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Question Breakdown</p>
                              <div className="space-y-2">
                                {group.questions.map((q, idx) => (
                                  <div key={q.questionId} className="flex justify-between items-start text-sm py-2 border-b border-gray-100 last:border-0">
                                    <div className="flex-1 pr-4">
                                      <span className="text-gray-600">Q{idx + 1}:</span>
                                      <span className="text-gray-900 ml-2">{q.questionText.substring(0, 80)}...</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span className="text-gray-500">{q.answerValue.substring(0, 20)}</span>
                                      <span className="font-semibold text-blue-600 min-w-[60px] text-right">
                                        {q.score} / {q.maxScore} {q.scoreUnit}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calculator className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No Scoring Data</h4>
                        <p className="text-gray-600">This assessment doesn't have any scored questions.</p>
                      </div>
                    )}

                    {/* Clinical Score Input */}
                    <div className="border-t pt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Clinical Assessment Score</h4>
                      <input
                        type="text"
                        placeholder="Enter overall clinical score (optional)"
                        value={clinicalScore}
                        onChange={(e) => setClinicalScore(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={assessment.status === 'COMPLETED'}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Add an overall clinical assessment score or severity rating
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'review' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Clinical Review</h3>
                    
                    {/* NEW: Unscored Responses Component */}
                    <UnscoredResponses 
                      responses={assessment.responses}
                      onAddToNotes={handleAddToNotes}
                    />
                    
                    {/* Clinical Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Clinical Notes <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Enter your clinical assessment notes, observations, and findings..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={12}
                        disabled={assessment.status === 'COMPLETED'}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Use the buttons above to add contextual information to your notes
                      </p>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recommendations
                      </label>
                      <textarea
                        value={recommendations}
                        onChange={(e) => setRecommendations(e.target.value)}
                        placeholder="Enter recommendations for follow-up care, additional testing, or treatment..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={6}
                        disabled={assessment.status === 'COMPLETED'}
                      />
                    </div>

                    {/* Completed Status */}
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