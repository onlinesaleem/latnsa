export interface QuestionGroup {
  id: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  order: number
  videoUrl?: string
  isActive: boolean
  _count?: {
    questions: number
  }
}

export interface Question {
  id: string
  text: string
  textAr: string
  type: string
  isRequired: boolean
  order: number
  options: string
  hasScoring: boolean
  scoringType?: string
  scoringConfig?: string
  minScore?: number
  maxScore?: number
  scoreUnit?: string
  applicableFor: string[]
  questionGroupId: string
}