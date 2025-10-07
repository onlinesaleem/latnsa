'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Send, 
  CheckCircle,
  AlertCircle,
  Play
} from 'lucide-react'
import toast from 'react-hot-toast'

// Types
interface QuestionOption {
  english: string[]
  arabic: string[]
}

interface Question {
  id: string
  text: string
  textAr: string
  type: string
  isRequired: boolean
  options?: QuestionOption | string
  description?: string
  descriptionAr?: string
  validationRules?: any
}

interface QuestionGroup {
  id: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  videoUrl?: string
  questions: Question[]
}

interface PatientInfo {
  fullName: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER' | ''
  email: string
  phone: string
  address?: string
}

interface ProxyInfo {
  proxyName: string
  proxyEmail: string
  proxyPhone: string
  proxyRelationship: string
}

interface AssessmentFormProps {
  onComplete?: (assessmentData: any) => void
  language?: 'english' | 'arabic'
}

export default function AssessmentForm({ onComplete, language = 'english' }: AssessmentFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  
  // Form state
  const [currentStep, setCurrentStep] = useState<'selection' | 'patient-info' | 'form' | 'complete'>('selection')
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [formType, setFormType] = useState<'SELF' | 'PROXY'>('SELF')
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([])
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [isArabic, setIsArabic] = useState(language === 'arabic')

  // Patient information (the person being assessed)
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    address: ''
  })

  // Proxy information (if filling for someone else)
  const [proxyInfo, setProxyInfo] = useState<ProxyInfo>({
    proxyName: '',
    proxyEmail: '',
    proxyPhone: '',
    proxyRelationship: ''
  })

  // Created patient ID (after patient creation)
  const [patientId, setPatientId] = useState<string | null>(null)
  const [patientMRN, setPatientMRN] = useState<string | null>(null)

  // Load questions on component mount
  useEffect(() => {
    loadQuestions()
    // Pre-fill user data for SELF assessments
    if (session?.user) {
      setPatientInfo(prev => ({
        ...prev,
        fullName: session.user.name || '',
        email: session.user.email || ''
      }))
      setProxyInfo(prev => ({
        ...prev,
        proxyName: session.user.name || '',
        proxyEmail: session.user.email || ''
      }))
    }
  }, [session])

  const loadQuestions = async () => {
    try {
      const response = await fetch('/api/assessment/questions')
      const data = await response.json()
      
      if (response.ok) {
        setQuestionGroups(data.questionGroups)
      } else {
        toast.error('Failed to load questions')
      }
    } catch (error) {
      console.error('Error loading questions:', error)
      toast.error('Error loading assessment form')
    }
  }

  // Handle self/proxy selection
  const handleFormTypeSelection = (type: 'SELF' | 'PROXY') => {
    setFormType(type)
    setCurrentStep('patient-info')
  }

  // Validate patient information
  const validatePatientInfo = (): boolean => {
    if (!patientInfo.fullName.trim()) {
      toast.error(isArabic ? 'يرجى إدخال الاسم الكامل' : 'Please enter full name')
      return false
    }

    if (!patientInfo.dateOfBirth) {
      toast.error(isArabic ? 'يرجى إدخال تاريخ الميلاد' : 'Please enter date of birth')
      return false
    }

    if (!patientInfo.gender) {
      toast.error(isArabic ? 'يرجى اختيار الجنس' : 'Please select gender')
      return false
    }

    // For SELF, email is required (they're logged in)
    if (formType === 'SELF' && !patientInfo.email) {
      toast.error(isArabic ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter email')
      return false
    }

    // For PROXY, validate proxy information
    if (formType === 'PROXY') {
      if (!proxyInfo.proxyName.trim()) {
        toast.error(isArabic ? 'يرجى إدخال اسمك' : 'Please enter your name')
        return false
      }
      if (!proxyInfo.proxyRelationship.trim()) {
        toast.error(isArabic ? 'يرجى إدخال علاقتك بالمريض' : 'Please enter your relationship to the patient')
        return false
      }
      if (!proxyInfo.proxyEmail && !proxyInfo.proxyPhone) {
        toast.error(isArabic ? 'يرجى إدخال بريد إلكتروني أو رقم هاتف' : 'Please enter email or phone number')
        return false
      }
    }

    return true
  }

  // Create or find patient and proceed to assessment
  const handlePatientInfoSubmit = async () => {
    if (!validatePatientInfo()) return

    setLoading(true)
    try {
      const response = await fetch('/api/assessment/create-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType,
          patientInfo,
          proxyInfo: formType === 'PROXY' ? proxyInfo : null
        })
      })

      const result = await response.json()

      if (response.ok) {
        setPatientId(result.patient.id)
        setPatientMRN(result.patient.mrn)
        
        toast.success(
          isArabic 
            ? `تم إنشاء السجل الطبي: ${result.patient.mrn}` 
            : `Medical record created: ${result.patient.mrn}`
        )
        
        setCurrentStep('form')
      } else {
        toast.error(isArabic ? result.errorAr || result.error : result.error)
      }
    } catch (error) {
      console.error('Error creating patient:', error)
      toast.error(isArabic ? 'خطأ في إنشاء السجل الطبي' : 'Error creating patient record')
    } finally {
      setLoading(false)
    }
  }

  // Handle question response
  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  // Navigate between groups
  const goToNextGroup = () => {
    if (currentGroupIndex < questionGroups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1)
    }
  }

  const goToPreviousGroup = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1)
    }
  }

  // Save progress (draft)
  const saveProgress = async () => {
    if (!patientId) {
      toast.error(isArabic ? 'خطأ: لم يتم العثور على معلومات المريض' : 'Error: Patient information not found')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/assessment/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          formType,
          language: isArabic ? 'ARABIC' : 'ENGLISH',
          responses,
          proxyInfo: formType === 'PROXY' ? proxyInfo : null
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(
          isArabic 
            ? `تم حفظ التقدم - رقم التقييم: ${result.assessmentNumber}` 
            : `Progress saved - Assessment #${result.assessmentNumber}`
        )
      } else {
        toast.error(isArabic ? result.errorAr || result.error : result.error)
      }
    } catch (error) {
      toast.error(isArabic ? 'خطأ في حفظ التقدم' : 'Error saving progress')
    } finally {
      setLoading(false)
    }
  }

  // Submit final assessment
  const submitAssessment = async () => {
    if (!patientId) {
      toast.error(isArabic ? 'خطأ: لم يتم العثور على معلومات المريض' : 'Error: Patient information not found')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          formType,
          language: isArabic ? 'ARABIC' : 'ENGLISH',
          responses,
          proxyInfo: formType === 'PROXY' ? proxyInfo : null
        })
      })

      const result = await response.json()

      if (response.ok) {
        setCurrentStep('complete')
        toast.success(
          isArabic 
            ? `تم إرسال التقييم - رقم التقييم: ${result.assessmentNumber}` 
            : `Assessment submitted - Assessment #${result.assessmentNumber}`
        )
        onComplete?.(result)
      } else {
        toast.error(isArabic ? result.errorAr || result.error : result.error)
      }
    } catch (error) {
      console.error('Error submitting assessment:', error)
      toast.error(isArabic ? 'خطأ في إرسال التقييم' : 'Error submitting assessment')
    } finally {
      setLoading(false)
    }
  }

  // Render question based on type
  const renderQuestion = (question: Question) => {
    const questionText = isArabic ? question.textAr : question.text

    let parsedOptions: { english: string[]; arabic: string[] } | null = null

    if (typeof question.options === "string") {
      try {
        parsedOptions = JSON.parse(question.options)
      } catch (error) {
        console.error("Failed to parse options for question:", question.id, error)
      }
    } else if (typeof question.options === "object" && question.options !== null) {
      parsedOptions = question.options as { english: string[]; arabic: string[] }
    }

    const options = parsedOptions
      ? isArabic
        ? parsedOptions.arabic
        : parsedOptions.english
      : []

    const currentValue = responses[question.id]

    switch (question.type) {
      case 'SINGLE_SELECT':
      case 'RADIO':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {questionText}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.description && (
              <p className="text-sm text-gray-600">
                {isArabic ? question.descriptionAr : question.description}
              </p>
            )}
            <div className="space-y-2">
              {options.map((option: string, index: number) => (
                <label key={index} className="flex items-center">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={currentValue === option}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'MULTI_SELECT':
      case 'CHECKBOX':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {questionText}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.description && (
              <p className="text-sm text-gray-600">
                {isArabic ? question.descriptionAr : question.description}
              </p>
            )}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {options.map((option: string, index: number) => (
                <label key={index} className="flex items-start">
                  <input
                    type="checkbox"
                    value={option}
                    checked={Array.isArray(currentValue) && currentValue.includes(option)}
                    onChange={(e) => {
                      const newValue = Array.isArray(currentValue) ? [...currentValue] : []
                      if (e.target.checked) {
                        newValue.push(option)
                      } else {
                        const index = newValue.indexOf(option)
                        if (index > -1) newValue.splice(index, 1)
                      }
                      handleResponseChange(question.id, newValue)
                    }}
                    className="mr-2 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'NUMBER':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {questionText}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={currentValue || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min={question.validationRules?.min}
              max={question.validationRules?.max}
            />
          </div>
        )

      case 'TEXT':
      case 'TEXTAREA':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {questionText}
              {question.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.type === 'TEXTAREA' ? (
              <textarea
                value={currentValue || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            ) : (
              <input
                type="text"
                value={currentValue || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>
        )

      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Question type "{question.type}" not implemented yet
            </p>
          </div>
        )
    }
  }

  // Self/Proxy Selection Screen
  if (currentStep === 'selection') {
    return (
      <div className={`max-w-2xl mx-auto p-6 ${isArabic ? 'rtl' : 'ltr'}`}>
        {/* Language Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setIsArabic(false)}
              className={`px-3 py-1 rounded-md text-sm ${!isArabic ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            >
              English
            </button>
            <button
              onClick={() => setIsArabic(true)}
              className={`px-3 py-1 rounded-md text-sm ${isArabic ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            >
              العربية
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {isArabic ? 'تقييم صحي شامل' : 'Comprehensive Health Assessment'}
          </h1>
          <p className="text-lg text-gray-600">
            {isArabic 
              ? 'يرجى تحديد من تملأ الاستبيان له'
              : 'Please specify who you are filling out the questionnaire for'
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div 
            onClick={() => handleFormTypeSelection('SELF')}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
          >
            <div className="text-center">
              <User className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {isArabic ? 'لنفسي' : 'For Myself'}
              </h3>
              <p className="text-gray-600">
                {isArabic 
                  ? 'سأملأ الاستبيان لنفسي'
                  : 'I will fill out the questionnaire for myself'
                }
              </p>
            </div>
          </div>

          <div 
            onClick={() => handleFormTypeSelection('PROXY')}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-500"
          >
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {isArabic ? 'لشخص آخر' : 'For Someone Else'}
              </h3>
              <p className="text-gray-600">
                {isArabic 
                  ? 'سأملأ الاستبيان نيابة عن شخص آخر'
                  : 'I will fill out the questionnaire on behalf of another person'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Patient Information Screen
  if (currentStep === 'patient-info') {
    return (
      <div className={`max-w-2xl mx-auto p-6 ${isArabic ? 'rtl' : 'ltr'}`}>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {formType === 'SELF' 
              ? (isArabic ? 'معلوماتك الشخصية' : 'Your Information')
              : (isArabic ? 'معلومات المريض' : 'Patient Information')
            }
          </h2>

          <div className="space-y-4">
            {/* Patient Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isArabic ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={patientInfo.fullName}
                onChange={(e) => setPatientInfo(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={isArabic ? 'أدخل الاسم الكامل' : 'Enter full name'}
                disabled={formType === 'SELF' && !!session?.user?.name}
              />
            </div>

            {/* Date of Birth */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'تاريخ الميلاد' : 'Date of Birth'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={patientInfo.dateOfBirth}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الجنس' : 'Gender'} <span className="text-red-500">*</span>
                </label>
                <select
                  value={patientInfo.gender}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, gender: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{isArabic ? 'اختر' : 'Select'}</option>
                  <option value="MALE">{isArabic ? 'ذكر' : 'Male'}</option>
                  <option value="FEMALE">{isArabic ? 'أنثى' : 'Female'}</option>
                  <option value="OTHER">{isArabic ? 'آخر' : 'Other'}</option>
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'البريد الإلكتروني' : 'Email'}
                  {formType === 'SELF' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="email"
                  value={patientInfo.email}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={isArabic ? 'email@example.com' : 'email@example.com'}
                  disabled={formType === 'SELF' && !!session?.user?.email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  value={patientInfo.phone}
                  onChange={(e) => setPatientInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={isArabic ? '+966 5X XXX XXXX' : '+966 5X XXX XXXX'}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isArabic ? 'العنوان' : 'Address'}
              </label>
              <textarea
                value={patientInfo.address}
                onChange={(e) => setPatientInfo(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder={isArabic ? 'العنوان الكامل' : 'Full address'}
              />
            </div>

            {/* Proxy Information (if PROXY) */}
            {formType === 'PROXY' && (
              <>
                <div className="border-t pt-4 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {isArabic ? 'معلوماتك (الممثل)' : 'Your Information (Proxy)'}
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'اسمك' : 'Your Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={proxyInfo.proxyName}
                    onChange={(e) => setProxyInfo(prev => ({ ...prev, proxyName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder={isArabic ? 'أدخل اسمك' : 'Enter your name'}
                    disabled={!!session?.user?.name}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'علاقتك بالمريض' : 'Your Relationship to Patient'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={proxyInfo.proxyRelationship}
                    onChange={(e) => setProxyInfo(prev => ({ ...prev, proxyRelationship: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder={isArabic ? 'مثل: ابن، زوج، صديق، ولي أمر' : 'e.g., Son, Spouse, Friend, Guardian'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isArabic ? 'بريدك الإلكتروني' : 'Your Email'}
                    </label>
                    <input
                      type="email"
                      value={proxyInfo.proxyEmail}
                      onChange={(e) => setProxyInfo(prev => ({ ...prev, proxyEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      disabled={!!session?.user?.email}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isArabic ? 'رقم هاتفك' : 'Your Phone'}
                    </label>
                    <input
                      type="tel"
                      value={proxyInfo.proxyPhone}
                      onChange={(e) => setProxyInfo(prev => ({ ...prev, proxyPhone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder={isArabic ? '+966 5X XXX XXXX' : '+966 5X XXX XXXX'}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentStep('selection')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              {isArabic ? 'العودة' : 'Back'}
            </button>
            <button
              onClick={handlePatientInfoSubmit}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isArabic ? 'جاري المعالجة...' : 'Processing...'}
                </>
              ) : (
                <>{isArabic ? 'المتابعة' : 'Continue'}</>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Completion Screen
  if (currentStep === 'complete') {
    return (
      <div className={`max-w-2xl mx-auto p-6 text-center ${isArabic ? 'rtl' : 'ltr'}`}>
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {isArabic ? 'تم إرسال التقييم بنجاح!' : 'Assessment Submitted Successfully!'}
        </h2>
        
        {patientMRN && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">
              {isArabic ? 'رقم السجل الطبي' : 'Medical Record Number'}
            </p>
            <p className="text-2xl font-bold text-blue-600">{patientMRN}</p>
          </div>
        )}
        
        <p className="text-lg text-gray-600 mb-8">
          {isArabic 
            ? 'شكراً لك على إكمال التقييم الصحي. سيتواصل معك فريقنا الطبي قريباً.'
            : 'Thank you for completing the health assessment. Our clinical team will contact you soon.'
          }
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
        >
          {isArabic ? 'العودة للصفحة الرئيسية' : 'Return to Home'}
        </button>
      </div>
    )
  }

  // Main Assessment Form
  const currentGroup = questionGroups[currentGroupIndex]

  if (!currentGroup) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isArabic ? 'جاري تحميل الأسئلة...' : 'Loading questions...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Patient MRN Display */}
      {patientMRN && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-600">
              {isArabic ? 'رقم السجل الطبي:' : 'Medical Record:'}
            </span>
            <span className="font-bold text-blue-600 ml-2">{patientMRN}</span>
          </div>
          <div className="text-sm text-gray-600">
            {patientInfo.fullName}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {isArabic ? 'التقدم' : 'Progress'}
          </span>
          <span className="text-sm text-gray-500">
            {currentGroupIndex + 1} / {questionGroups.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentGroupIndex + 1) / questionGroups.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Group Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isArabic ? currentGroup.nameAr : currentGroup.name}
        </h2>
        {currentGroup.description && (
          <p className="text-gray-600">
            {isArabic ? currentGroup.descriptionAr : currentGroup.description}
          </p>
        )}
        
        {/* YouTube Video */}
        {currentGroup.videoUrl && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center mb-2">
              <Play className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                {isArabic ? 'فيديو توضيحي' : 'Explanatory Video'}
              </span>
            </div>
            <a 
              href={currentGroup.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              {isArabic ? 'مشاهدة الفيديو' : 'Watch Video'}
            </a>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="space-y-8">
          {currentGroup.questions.map((question) => (
            <div key={question.id}>
              {renderQuestion(question)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation and Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={goToPreviousGroup}
            disabled={currentGroupIndex === 0}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {isArabic ? 'السابق' : 'Previous'}
          </button>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={saveProgress}
            disabled={loading}
            className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1" />
            {isArabic ? 'حفظ التقدم' : 'Save Progress'}
          </button>

          {currentGroupIndex === questionGroups.length - 1 ? (
            <button
              onClick={submitAssessment}
              disabled={loading}
              className="flex items-center bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Send className="w-4 h-4 mr-1" />
              )}
              {isArabic ? 'إرسال التقييم' : 'Submit Assessment'}
            </button>
          ) : (
            <button
              onClick={goToNextGroup}
              className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              {isArabic ? 'التالي' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}