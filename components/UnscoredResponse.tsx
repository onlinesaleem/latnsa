"use client"
import React, { useState, useEffect } from 'react'
import { FileText, Plus, ChevronDown, ChevronUp, Info } from 'lucide-react'

interface UnscoredResponse {
  questionText: string
  answerValue: string
  answerType: string
  questionGroupName?: string
}

interface UnscoredResponsesProps {
  responses: any[]
  onAddToNotes: (text: string) => void
}

// Question groups to EXCLUDE from unscored responses
// These are typically demographic info or already scored assessments
const EXCLUDED_QUESTION_GROUPS = [
  "Introductory Questions",
  "Basic Demographics",
  "Memory Word List (to recall later)",
  "Bristol Activities of Daily Living Scale",
  "Word Recall and Recognition",
  "Geriatric Depression Scale"
]

export default function UnscoredResponses({ responses, onAddToNotes }: UnscoredResponsesProps) {
  const [unscoredResponses, setUnscoredResponses] = useState<UnscoredResponse[]>([])
  const [groupedResponses, setGroupedResponses] = useState<Map<string, UnscoredResponse[]>>(new Map())
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    filterUnscoredResponses()
  }, [responses])

  const filterUnscoredResponses = () => {
    const unscored = responses.filter(r => {
      // Check if question has a score
      const hasScore = r.score !== null
      
      // Check if question group is in excluded list
      const questionGroupName = r.question?.questionGroup?.name || ''
      const isExcludedGroup = EXCLUDED_QUESTION_GROUPS.some(excludedGroup => 
        questionGroupName.includes(excludedGroup)
      )
      
      // Check if has answer
      const hasAnswer = r.answerValue && r.answerValue.trim() !== ''
      
      return !hasScore && !isExcludedGroup && hasAnswer
    })

    // Group by question group
    const grouped = new Map<string, UnscoredResponse[]>()
    
    unscored.forEach(r => {
      const groupName = r.question?.questionGroup?.name || 'Other'
      const response: UnscoredResponse = {
        questionText: r.questionText,
        answerValue: r.answerValue,
        answerType: r.answerType,
        questionGroupName: groupName
      }
      
      if (!grouped.has(groupName)) {
        grouped.set(groupName, [])
      }
      grouped.get(groupName)!.push(response)
    })

    setUnscoredResponses(unscored)
    setGroupedResponses(grouped)
  }

  const formatAnswer = (response: UnscoredResponse) => {
    if (response.answerType === 'MULTIPLE_CHOICE') {
      try {
        const values = JSON.parse(response.answerValue)
        if (Array.isArray(values)) {
          return values.join(', ')
        }
      } catch (e) {
        return response.answerValue
      }
    }
    return response.answerValue
  }

  const addAllToNotes = () => {
    let notesText = '\n\n=== CONTEXTUAL INFORMATION ===\n\n'
    
    // Add by group for better organization
    groupedResponses.forEach((responses, groupName) => {
      notesText += `--- ${groupName} ---\n\n`
      responses.forEach((response, index) => {
        notesText += `${index + 1}. ${response.questionText}\n`
        notesText += `   Answer: ${formatAnswer(response)}\n\n`
      })
    })
    
    notesText += '=== CLINICAL ASSESSMENT ===\n\n'
    
    onAddToNotes(notesText)
  }

  const addGroupToNotes = (groupName: string, responses: UnscoredResponse[]) => {
    let notesText = `\n--- ${groupName} ---\n\n`
    
    responses.forEach((response, index) => {
      notesText += `${index + 1}. ${response.questionText}\n`
      notesText += `   Answer: ${formatAnswer(response)}\n\n`
    })
    
    onAddToNotes(notesText)
  }

  const addSingleToNotes = (response: UnscoredResponse) => {
    const noteText = `\n${response.questionText}\nAnswer: ${formatAnswer(response)}\n`
    onAddToNotes(noteText)
  }

  if (unscoredResponses.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Info className="w-5 h-5" />
          <p className="text-sm">
            No additional contextual information available. All responses are either scored or demographic data.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-blue-200 rounded-lg bg-blue-50 mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">
                Contextual Information ({unscoredResponses.length} responses)
              </h4>
              <p className="text-sm text-gray-600">
                {groupedResponses.size} question groups with unscored data
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={addAllToNotes}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Add All to Notes
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-600 hover:bg-blue-100 rounded-lg transition"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4 max-h-[500px] overflow-y-auto">
            {Array.from(groupedResponses.entries()).map(([groupName, responses]) => (
              <div key={groupName} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Group Header */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-900">{groupName}</h5>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {responses.length} response{responses.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => addGroupToNotes(groupName, responses)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                    >
                      <Plus className="w-3 h-3" />
                      Add Group
                    </button>
                  </div>
                </div>

                {/* Group Responses */}
                <div className="p-3 space-y-2">
                  {responses.map((response, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1.5">
                            {response.questionText}
                          </p>
                          <div className="bg-white p-2 rounded border border-gray-200">
                            <p className="text-sm text-gray-700 break-words">
                              {formatAnswer(response)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => addSingleToNotes(response)}
                          className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Add this response to notes"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info about excluded groups */}
        <div className="mt-3 pt-3 border-t border-blue-200">
          <details className="text-xs text-gray-600">
            <summary className="cursor-pointer hover:text-gray-900 font-medium">
              Excluded question groups (click to view)
            </summary>
            <ul className="mt-2 ml-4 space-y-1 list-disc">
              {EXCLUDED_QUESTION_GROUPS.map(group => (
                <li key={group}>{group}</li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </div>
  )
}