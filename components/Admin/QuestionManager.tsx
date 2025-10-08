"use client"

import React, { useState } from 'react'
import { Plus, Save, Trash2, Edit2, ToggleLeft, ToggleRight } from 'lucide-react'

export default function QuestionManager() {
  const [question, setQuestion] = useState<{
    text: string;
    textAr: string;
    type: string;
    options: { english: string[]; arabic: string[] };
    hasScoring: boolean;
    scoringType: string;
    scoreRules: { [key: string]: number };
  }>({
    text: '',
    textAr: '',
    type: 'RADIO',
    options: { english: [''], arabic: [''] },
    hasScoring: false,
    scoringType: 'WEIGHTED',
    scoreRules: {}
  })

  const [previewAnswer, setPreviewAnswer] = useState('')
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null)

  // Add option
  const addOption = () => {
    setQuestion(prev => ({
      ...prev,
      options: {
        english: [...prev.options.english, ''],
        arabic: [...prev.options.arabic, '']
      }
    }))
  }

  // Update option
  const updateOption = (index: number, lang: 'english' | 'arabic', value: string) => {
    setQuestion(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [lang]: prev.options[lang].map((opt, i) => i === index ? value : opt)
      }
    }))
  }

  // Remove option
  const removeOption = (index: number) => {
    setQuestion(prev => ({
      ...prev,
      options: {
        english: prev.options.english.filter((_, i) => i !== index),
        arabic: prev.options.arabic.filter((_, i) => i !== index)
      }
    }))
  }

  // Update score rule for an option
  const updateScoreRule = (optionText: string, score: string) => {
    setQuestion(prev => ({
      ...prev,
      scoreRules: {
        ...prev.scoreRules,
        [optionText]: parseFloat(score)
      }
    }))
  }

  // Preview score calculation
  const previewScore = (answer: string) => {
    setPreviewAnswer(answer)
    if (question.hasScoring && question.scoreRules[answer] !== undefined) {
      setCalculatedScore(question.scoreRules[answer])
    } else {
      setCalculatedScore(null)
    }
  }

  // Save question
  const saveQuestion = async () => {
    const payload = {
      text: question.text,
      textAr: question.textAr,
      type: question.type,
      options: JSON.stringify(question.options),
      hasScoring: question.hasScoring,
      scoringType: question.hasScoring ? question.scoringType : null,
      scoringConfig: question.hasScoring ? JSON.stringify({
        type: 'answer_match',
        scores: question.scoreRules
      }) : null,
      minScore: question.hasScoring ? Math.min(...Object.values(question.scoreRules)) : null,
      maxScore: question.hasScoring ? Math.max(...Object.values(question.scoreRules)) : null,
      scoreUnit: question.hasScoring ? 'point' : null
    }

    console.log('Saving question:', payload)
    alert('Question configuration ready! Check console for payload.')
    
    // In real app:
    // const response = await fetch('/api/admin/questions', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Question Manager</h1>
          <p className="text-gray-600">Create and configure assessment questions with scoring</p>
        </div>

        {/* Question Text */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Question Text (English) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={question.text}
            onChange={(e) => setQuestion(prev => ({ ...prev, text: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Are you basically satisfied with your life?"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Question Text (Arabic) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={question.textAr}
            onChange={(e) => setQuestion(prev => ({ ...prev, textAr: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="هل أنت راضٍ عن حياتك بشكل أساسي؟"
            dir="rtl"
          />
        </div>

        {/* Question Type */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Question Type
          </label>
          <select
            value={question.type}
            onChange={(e) => setQuestion(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="RADIO">Radio (Single Choice)</option>
            <option value="CHECKBOX">Checkbox (Multiple Choice)</option>
            <option value="SINGLE_SELECT">Dropdown (Single Select)</option>
            <option value="SCALE">Scale (1-10)</option>
          </select>
        </div>

        {/* Answer Options */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-semibold text-gray-700">
              Answer Options
            </label>
            <button
              onClick={addOption}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Option
            </button>
          </div>

          <div className="space-y-4">
            {question.options.english.map((option, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700">Option {index + 1}</span>
                  {question.options.english.length > 1 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">English</label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, 'english', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Yes"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Arabic</label>
                    <input
                      type="text"
                      value={question.options.arabic[index]}
                      onChange={(e) => updateOption(index, 'arabic', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="نعم"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Scoring for this option */}
                {question.hasScoring && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Score if selected
                    </label>
                    <input
                      type="number"
                      value={question.scoreRules[option] || 0}
                      onChange={(e) => updateScoreRule(option, e.target.value)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="0"
                      step="0.5"
                    />
                    <span className="ml-2 text-xs text-gray-500">points</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enable Scoring Toggle */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Enable Scoring</h3>
              <p className="text-sm text-gray-600">
                Calculate scores based on answer selection
              </p>
            </div>
            <button
              onClick={() => setQuestion(prev => ({ ...prev, hasScoring: !prev.hasScoring }))}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                question.hasScoring
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {question.hasScoring ? (
                <>
                  <ToggleRight className="w-5 h-5 mr-2" />
                  Enabled
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 mr-2" />
                  Disabled
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scoring Preview */}
        {question.hasScoring && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Scoring Preview</h3>
            <p className="text-sm text-gray-600 mb-3">
              Test how scoring works by selecting an answer:
            </p>
            
            <div className="space-y-2 mb-4">
              {question.options.english.map((option, index) => (
                <label key={index} className="flex items-center p-3 bg-white rounded-md cursor-pointer hover:bg-gray-50 border border-gray-200">
                  <input
                    type="radio"
                    name="preview"
                    value={option}
                    onChange={(e) => previewScore(e.target.value)}
                    className="mr-3"
                  />
                  <span className="flex-1">{option}</span>
                  {question.scoreRules[option] !== undefined && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {question.scoreRules[option]} point{question.scoreRules[option] !== 1 ? 's' : ''}
                    </span>
                  )}
                </label>
              ))}
            </div>

            {calculatedScore !== null && (
              <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Result:</strong> Selected "{previewAnswer}" = <strong>{calculatedScore} point{calculatedScore !== 1 ? 's' : ''}</strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            onClick={() => {
              setQuestion({
                text: '',
                textAr: '',
                type: 'RADIO',
                options: { english: [''], arabic: [''] },
                hasScoring: false,
                scoringType: 'WEIGHTED',
                scoreRules: {}
              })
              setPreviewAnswer('')
              setCalculatedScore(null)
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            onClick={saveQuestion}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Question
          </button>
        </div>

        {/* Configuration Display */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Generated Configuration:</h4>
          <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
            {JSON.stringify({
              text: question.text,
              textAr: question.textAr,
              type: question.type,
              options: question.options,
              hasScoring: question.hasScoring,
              scoringConfig: question.hasScoring ? {
                type: 'answer_match',
                scores: question.scoreRules
              } : null
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}