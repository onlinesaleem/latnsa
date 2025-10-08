"use client"
import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  ChevronDown, 
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  List,
  Settings,
  Eye,
  Copy
} from 'lucide-react'
import toast from 'react-hot-toast'
import { QuestionGroup, Question } from '@/app/types/QuestionGroupTypes' // Import your types

export default function QuestionAdminSystem() {
 const [view, setView] = useState('groups') // 'groups' or 'questions'
  const [groups, setGroups] = useState<QuestionGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<QuestionGroup | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  
  // Modals
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<QuestionGroup | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  useEffect(() => {
    loadGroups()
  }, [])

  useEffect(() => {
    if (selectedGroup) {
      loadQuestions(selectedGroup.id)
    }
  }, [selectedGroup])

  // Load question groups
  const loadGroups = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/question-groups')
      const data = await response.json()
      if (data.success) {
        setGroups(data.groups)
      }
    } catch (error) {
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  // Load questions for a group
  const loadQuestions = async (groupId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/questions?groupId=${groupId}`)
      const data = await response.json()
      if (data.success) {
        setQuestions(data.questions)
      }
    } catch (error) {
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  // Delete group
  const deleteGroup = async (id: string | undefined) => {
    if (!confirm('Delete this group and all its questions?')) return
    
    try {
      const response = await fetch(`/api/admin/question-groups/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        toast.success('Group deleted')
        loadGroups()
        if (selectedGroup?.id === id) {
          setSelectedGroup(null)
          setQuestions([])
        }
      }
    } catch (error) {
      toast.error('Failed to delete group')
    }
  }

// Delete question
const deleteQuestion = async (id: string) => {
  if (!confirm('Delete this question?')) return
  
  try {
    const response = await fetch(`/api/admin/questions/${id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      toast.success('Question deleted')
      if (selectedGroup) { // Add this null check
        loadQuestions(selectedGroup.id)
      }
    }
  } catch (error) {
    toast.error('Failed to delete question')
  }
}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Question Management</h1>
              <p className="text-gray-600 text-sm">Manage assessment questions and groups</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView('groups')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  view === 'groups' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
                Groups
              </button>
              <button
                onClick={() => setView('questions')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  view === 'questions' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={!selectedGroup}
              >
                <Settings className="w-4 h-4" />
                Questions
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar - Groups List */}
          <div className="col-span-3 bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">Question Groups</h2>
              <button
                onClick={() => {
                  setEditingGroup(null)
                  setShowGroupModal(true)
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Plus className="w-5 h-5 text-blue-600" />
              </button>
            </div>

            {loading && groups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-2">
                {groups.map(group => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className={`p-3 rounded-lg cursor-pointer border ${
                      selectedGroup?.id === group.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{group.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {group._count?.questions || 0} questions
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingGroup(group)
                            setShowGroupModal(true)
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteGroup(group.id)
                          }}
                          className="p-1 hover:bg-red-100 rounded text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main Content - Questions or Group Details */}
          <div className="col-span-9">
            {!selectedGroup ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <List className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Question Group
                </h3>
                <p className="text-gray-600">
                  Choose a group from the sidebar to manage its questions
                </p>
              </div>
            ) : (
              <>
                {/* Group Header */}
                <div className="bg-white rounded-lg shadow p-6 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedGroup.name}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {selectedGroup.nameAr}
                      </p>
                      {selectedGroup.description && (
                        <p className="text-sm text-gray-500 mt-2">
                          {selectedGroup.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setEditingQuestion(null)
                        setShowQuestionModal(true)
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Question
                    </button>
                  </div>
                </div>

                {/* Questions List */}
                <div className="bg-white rounded-lg shadow">
                  {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading questions...</div>
                  ) : questions.length === 0 ? (
                    <div className="p-8 text-center">
                      <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Questions Yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Start by adding your first question to this group
                      </p>
                      <button
                        onClick={() => {
                          setEditingQuestion(null)
                          setShowQuestionModal(true)
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add First Question
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {questions.map((question, index) => (
                        <QuestionItem
                          key={question.id}
                          question={question}
                          index={index}
                          onEdit={() => {
                            setEditingQuestion(question)
                            setShowQuestionModal(true)
                          }}
                          onDelete={() => deleteQuestion(question.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Group Modal */}
      {showGroupModal && (
        <GroupModal
          group={editingGroup}
          onClose={() => {
            setShowGroupModal(false)
            setEditingGroup(null)
          }}
          onSave={() => {
            setShowGroupModal(false)
            setEditingGroup(null)
            loadGroups()
          }}
        />
      )}

      {/* Question Modal */}
      {showQuestionModal && selectedGroup && (
        <QuestionModal
          question={editingQuestion}
          groupId={selectedGroup.id}
          onClose={() => {
            setShowQuestionModal(false)
            setEditingQuestion(null)
          }}
          onSave={() => {
            setShowQuestionModal(false)
            setEditingQuestion(null)
            loadQuestions(selectedGroup.id)
          }}
        />
      )}
    </div>
  )
}

// Question Item Component
function QuestionItem({ 
  question, 
  index, 
  onEdit, 
  onDelete 
}: { 
  question: Question
  index: number
  onEdit: () => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  
  const options = question.options ? JSON.parse(question.options) : null
  const scoringConfig = question.scoringConfig ? JSON.parse(question.scoringConfig) : null

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1"
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-500">Q{index + 1}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  question.hasScoring 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {question.type}
                </span>
                {question.hasScoring && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    Scored
                  </span>
                )}
              </div>
              <h4 className="font-medium text-gray-900">{question.text}</h4>
              <p className="text-sm text-gray-600 mt-1">{question.textAr}</p>
            </div>
          </div>

          {expanded && (
            <div className="ml-7 mt-4 space-y-3">
              {/* Options */}
              {options && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Answer Options:</p>
                  <div className="space-y-1">
                    {options.english.map((opt:any, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                          {i + 1}
                        </span>
                        <span>{opt}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{options.arabic[i]}</span>
                        {question.hasScoring && scoringConfig?.scores?.[opt] !== undefined && (
                          <span className="ml-auto px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                            {scoringConfig.scores[opt]} {question.scoreUnit || 'pt'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scoring Info */}
              {question.hasScoring && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-xs font-semibold text-blue-900 mb-1">Scoring Configuration</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-blue-700">Type:</span>
                      <span className="ml-1 font-medium">{question.scoringType}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Range:</span>
                      <span className="ml-1 font-medium">
                        {question.minScore} - {question.maxScore}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Unit:</span>
                      <span className="ml-1 font-medium">{question.scoreUnit || 'point'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-200 rounded text-gray-600"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-100 rounded text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Group Modal Component
function GroupModal({ group, onClose, onSave }: { 
  group: QuestionGroup | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({ // Add this state
    name: group?.name || '',
    nameAr: group?.nameAr || '',
    description: group?.description || '',
    descriptionAr: group?.descriptionAr || '',
    order: group?.order || 0,
    videoUrl: group?.videoUrl || '',
    isActive: group?.isActive ?? true
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => { // Add type for event
    e.preventDefault()
    setSaving(true)

    try {
      const url = group 
        ? `/api/admin/question-groups/${group.id}`
        : '/api/admin/question-groups'
      
      const response = await fetch(url, {
        method: group ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(group ? 'Group updated' : 'Group created')
        onSave()
      } else {
        toast.error('Failed to save group')
      }
    } catch (error) {
      toast.error('Error saving group')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold">
            {group ? 'Edit Question Group' : 'New Question Group'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Group Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Group Name (Arabic) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Description (English)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description (Arabic)
              </label>
              <textarea
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Video URL (YouTube)</label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="isActive" className="text-sm font-medium">Active</label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4" />
                  Save Group
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Question Modal Component (Simplified for brevity - full version would be larger)
function QuestionModal({ 
  question, 
  groupId, 
  onClose, 
  onSave 
}: { 
  question: Question | null
  groupId: string
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    questionGroupId: groupId,
    text: question?.text || '',
    textAr: question?.textAr || '',
    type: question?.type || 'RADIO',
    isRequired: question?.isRequired ?? false,
    order: question?.order || 0,
    options: question?.options ? JSON.parse(question.options) : { english: [''], arabic: [''] },
    hasScoring: question?.hasScoring ?? false,
    scoringType: question?.scoringType || 'WEIGHTED',
    scoreRules: question?.scoringConfig ? JSON.parse(question.scoringConfig).scores : {},
    minScore: question?.minScore || 0,
    maxScore: question?.maxScore || 1,
    scoreUnit: question?.scoreUnit || 'point',
    applicableFor: question?.applicableFor || ['SELF', 'PROXY']
  })
  const [saving, setSaving] = useState(false)

  const addOption = () => {
    setFormData({
      ...formData,
      options: {
        english: [...formData.options.english, ''],
        arabic: [...formData.options.arabic, '']
      }
    })
  }

  const updateOption = (index: string | number, lang: string, value: string) => {
    const newOptions = { ...formData.options }
    newOptions[lang][index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const removeOption = (index: any) => {
    setFormData({
      ...formData,
      options: {
        english: formData.options.english.filter((_:any, i:any) => i !== index),
        arabic: formData.options.arabic.filter((_:any, i:any) => i !== index)
      }
    })
  }

  const updateScore = (optionText: any, score: string) => {
    setFormData({
      ...formData,
      scoreRules: {
        ...formData.scoreRules,
        [optionText]: parseFloat(score) || 0
      }
    })
  }

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        ...formData,
        options: JSON.stringify(formData.options),
        scoringConfig: formData.hasScoring ? JSON.stringify({
          type: 'answer_match',
          scores: formData.scoreRules
        }) : null
      }

      const url = question 
        ? `/api/admin/questions/${question.id}`
        : '/api/admin/questions'
      
      const response = await fetch(url, {
        method: question ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success(question ? 'Question updated' : 'Question created')
        onSave()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to save question')
      }
    } catch (error) {
      toast.error('Error saving question')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">
            {question ? 'Edit Question' : 'New Question'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Question Text */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Question Text (English) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Question Text (Arabic) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.textAr}
                onChange={(e) => setFormData({ ...formData, textAr: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                dir="rtl"
              />
            </div>
          </div>

          {/* Question Type & Settings */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Question Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="RADIO">Radio (Single Choice)</option>
                <option value="CHECKBOX">Checkbox (Multiple)</option>
                <option value="SINGLE_SELECT">Dropdown</option>
                <option value="TEXT">Text Input</option>
                <option value="TEXTAREA">Text Area</option>
                <option value="NUMBER">Number</option>
                <option value="SCALE">Scale</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                />
                <span className="text-sm font-medium">Required</span>
              </label>
            </div>
          </div>

          {/* Answer Options */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold">Answer Options</label>
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                <Plus className="w-3 h-3" />
                Add Option
              </button>
            </div>

            <div className="space-y-3">
              {formData.options.english.map((opt:any, idx:any) => (
                <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Option {idx + 1}</span>
                    {formData.options.english.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(idx, 'english', e.target.value)}
                      placeholder="English option"
                      className="px-3 py-2 border rounded text-sm"
                    />
                    <input
                      type="text"
                      value={formData.options.arabic[idx]}
                      onChange={(e) => updateOption(idx, 'arabic', e.target.value)}
                      placeholder="Arabic option"
                      className="px-3 py-2 border rounded text-sm"
                      dir="rtl"
                    />
                  </div>

                  {formData.hasScoring && (
                    <div className="pt-3 border-t">
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        Score if selected
                      </label>
                      <input
                        type="number"
                        value={formData.scoreRules[opt] || 0}
                        onChange={(e) => updateScore(opt, e.target.value)}
                        className="w-32 px-3 py-2 border rounded text-sm"
                        step="0.5"
                      />
                      <span className="ml-2 text-xs text-gray-500">{formData.scoreUnit}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Scoring Toggle */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Enable Scoring</h3>
                <p className="text-sm text-gray-600">Calculate scores based on answers</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hasScoring: !formData.hasScoring })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  formData.hasScoring
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {formData.hasScoring ? (
                  <>
                    <ToggleRight className="w-5 h-5" />
                    Enabled
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5" />
                    Disabled
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Scoring Configuration */}
          {formData.hasScoring && (
            <div className="space-y-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">Scoring Configuration</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Scoring Type</label>
                  <select
                    value={formData.scoringType}
                    onChange={(e) => setFormData({ ...formData, scoringType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="SIMPLE">Simple</option>
                    <option value="WEIGHTED">Weighted</option>
                    <option value="RANGE">Range</option>
                    <option value="FORMULA">Formula</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Score</label>
                  <input
                    type="number"
                    value={formData.minScore}
                    onChange={(e) => setFormData({ ...formData, minScore: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Score</label>
                  <input
                    type="number"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                    step="0.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Score Unit</label>
                <input
                  type="text"
                  value={formData.scoreUnit}
                  onChange={(e) => setFormData({ ...formData, scoreUnit: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., point, stage, level"
                />
              </div>
            </div>
          )}

          {/* Applicable For */}
          <div>
            <label className="block text-sm font-semibold mb-2">Applicable For</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.applicableFor.includes('SELF')}
                  onChange={(e) => {
                    const newApplicable = e.target.checked
                      ? [...formData.applicableFor, 'SELF']
                      : formData.applicableFor.filter(t => t !== 'SELF')
                    setFormData({ ...formData, applicableFor: newApplicable })
                  }}
                />
                <span className="text-sm">Self Assessment</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.applicableFor.includes('PROXY')}
                  onChange={(e) => {
                    const newApplicable = e.target.checked
                      ? [...formData.applicableFor, 'PROXY']
                      : formData.applicableFor.filter(t => t !== 'PROXY')
                    setFormData({ ...formData, applicableFor: newApplicable })
                  }}
                />
                <span className="text-sm">Proxy Assessment</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {question ? 'Update Question' : 'Create Question'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}