'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

// Types for our assessment
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

interface AssessmentFormProps {
  onComplete?: (assessmentData: any) => void
  language?: 'english' | 'arabic'
}

export default function AssessmentForm({ onComplete, language = 'english' }: AssessmentFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  
  // Form state
  const [currentStep, setCurrentStep] = useState<'selection' | 'form' | 'complete'>('selection')
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [formType, setFormType] = useState<'SELF' | 'PROXY'>('SELF')
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([])
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [isArabic, setIsArabic] = useState(language === 'arabic')

  // Proxy details state
  const [proxyDetails, setProxyDetails] = useState({
    subjectName: '',
    subjectAge: '',
    subjectGender: '',
    relationship: ''
  })

  // Load questions on component mount
  useEffect(() => {
    loadQuestions()
  }, [])

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
    if (type === 'SELF') {
      setCurrentStep('form')
    }
    // If PROXY, user needs to fill proxy details first
  }

  // Handle proxy details submission
  const handleProxyDetailsSubmit = () => {
    if (!proxyDetails.subjectName || !proxyDetails.subjectAge || !proxyDetails.subjectGender || !proxyDetails.relationship) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields')
      return
    }
    setCurrentStep('form')
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

  // Save progress
  const saveProgress = async () => {
    setLoading(true)
    try {
      const assessmentData = {
        formType,
        language: isArabic ? 'arabic' : 'english',
        proxyDetails: formType === 'PROXY' ? proxyDetails : null,
        responses,
        isComplete: false
      }

      const response = await fetch('/api/assessment/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      })

      if (response.ok) {
        toast.success(isArabic ? 'تم حفظ التقدم بنجاح' : 'Progress saved successfully')
      } else {
        toast.error(isArabic ? 'فشل في حفظ التقدم' : 'Failed to save progress')
      }
    } catch (error) {
      toast.error(isArabic ? 'خطأ في حفظ التقدم' : 'Error saving progress')
    } finally {
      setLoading(false)
    }
  }

  // Submit final assessment
  const submitAssessment = async () => {
    setLoading(true)
    try {
      const assessmentData = {
        formType,
        language: isArabic ? 'arabic' : 'english',
        proxyDetails: formType === 'PROXY' ? proxyDetails : null,
        responses,
        isComplete: true
      }

      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      })

      const result = await response.json()

      if (response.ok) {
        setCurrentStep('complete')
        toast.success(isArabic ? 'تم إرسال التقييم بنجاح' : 'Assessment submitted successfully')
        onComplete?.(result)
      } else {
        toast.error(isArabic ? result.errorAr : result.error)
      }
    } catch (error) {
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

        {formType === 'PROXY' ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isArabic ? 'معلومات الشخص المعني' : 'Subject Information'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'اسم الشخص المعني' : 'Subject Name'}
                </label>
                <input
                  type="text"
                  value={proxyDetails.subjectName}
                  onChange={(e) => setProxyDetails(prev => ({ ...prev, subjectName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={isArabic ? 'أدخل الاسم الكامل' : 'Enter full name'}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'العمر' : 'Age'}
                  </label>
                  <input
                    type="number"
                    value={proxyDetails.subjectAge}
                    onChange={(e) => setProxyDetails(prev => ({ ...prev, subjectAge: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="120"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'الجنس' : 'Gender'}
                  </label>
                  <select
                    value={proxyDetails.subjectGender}
                    onChange={(e) => setProxyDetails(prev => ({ ...prev, subjectGender: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{isArabic ? 'اختر' : 'Select'}</option>
                    <option value="male">{isArabic ? 'ذكر' : 'Male'}</option>
                    <option value="female">{isArabic ? 'أنثى' : 'Female'}</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'العلاقة بالشخص' : 'Relationship to Subject'}
                </label>
                <input
                  type="text"
                  value={proxyDetails.relationship}
                  onChange={(e) => setProxyDetails(prev => ({ ...prev, relationship: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={isArabic ? 'مثل: ابن، زوج، صديق' : 'e.g., Son, Spouse, Friend'}
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setFormType('SELF')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {isArabic ? 'العودة' : 'Back'}
              </button>
              <button
                onClick={handleProxyDetailsSubmit}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                {isArabic ? 'المتابعة' : 'Continue'}
              </button>
            </div>
          </div>
        ) : (
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
              onClick={() => setFormType('PROXY')}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
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
        )}
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
            <div className="flex items-center">
              <Play className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                {isArabic ? 'فيديو توضيحي' : 'Explanatory Video'}
              </span>
            </div>
            <a 
              href={currentGroup.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {currentGroup.videoUrl}
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
            className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800"
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