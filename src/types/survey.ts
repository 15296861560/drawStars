/** Survey / questionnaire management types */

export type SurveyStatus = 'draft' | 'published' | 'paused' | 'closed'

export type SurveyType = 'normal' | 'exam' | 'signup'

export type QuestionType =
  | 'radio'
  | 'checkbox'
  | 'input'
  | 'textarea'
  | 'number'
  | 'rating'
  | 'date'
  | 'image'
  | 'matrix_radio'
  | 'matrix_input'
  | 'sort'
  | 'slider'
  | 'file'
  | 'signature'
  | 'location'
  | 'judge'
  | 'page_break'

export type LogicActionType = 'show' | 'hide' | 'jump' | 'required'

export type RequireLoginMode = 'none' | 'optional' | 'required'

export type ResponseStatus = 'draft' | 'submitted' | 'invalid'

export type ExportFormat = 'excel' | 'csv' | 'json' | 'pdf'

export interface SurveyOption {
  id?: number | string
  questionId?: number
  content: string
  sortOrder?: number
  isOther?: boolean
  config?: Record<string, any>
}

export interface QuestionScoringConfig {
  enabled?: boolean
  points?: number
  scoringType?: 'auto' | 'manual' | 'hybrid'
  correctAnswer?: {
    value?: any
    alternatives?: any[]
  }
  partialScoring?: {
    strategy?: 'half_for_missing' | 'none' | 'custom'
    wrongPenalty?: number
  }
  explanation?: string
}

export interface QuestionConfig {
  options?: SurveyOption[]
  minSelect?: number
  maxSelect?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  min?: number
  max?: number
  step?: number
  ratingMax?: number
  ratingStyle?: 'star' | 'number' | 'nps'
  rows?: Array<{ id: string; label: string }>
  columns?: Array<{ id: string; label: string }>
  accept?: string
  maxSizeMB?: number
  dateType?: 'date' | 'datetime' | 'daterange'
  placeholder?: string
  scoring?: QuestionScoringConfig
  [key: string]: any
}

export interface Question {
  id?: number | string
  surveyId?: number
  type: QuestionType
  title: string
  description?: string
  sortOrder?: number
  pageIndex?: number
  required?: boolean
  config?: QuestionConfig
  extra?: Record<string, any>
  /** temporary client key for editor */
  _key?: string
}

export interface LogicCondition {
  questionId: number | string
  operator:
    | 'eq'
    | 'neq'
    | 'includes'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'empty'
    | 'not_empty'
  value?: any
}

export interface LogicRule {
  id?: number | string
  surveyId?: number
  sourceQuestionId: number | string
  condition: LogicCondition | { logic: 'and' | 'or'; items: LogicCondition[] }
  actionType: LogicActionType
  targetQuestionId?: number | string
  targetPage?: number
  sortOrder?: number
}

export interface ThemeConfig {
  primaryColor?: string
  backgroundColor?: string
  backgroundImage?: string
  showProgress?: boolean
  showQuestionNumber?: boolean
  submitText?: string
  nextText?: string
  prevText?: string
  thankYouMessage?: string
  thankYouRedirect?: string
  /** aliases used by editor UI */
  thankYouText?: string
  thankYouLink?: string
}

export interface SurveySettings {
  displayMode?: 'single' | 'multi'
  shuffleQuestions?: boolean
  minDurationSec?: number
  [key: string]: any
}

export interface GradeRange {
  min: number
  max: number
  label: string
  color?: string
}

export interface ScoringConfig {
  mode?: 'manual' | 'auto' | 'hybrid'
  maxScore?: number
  passScore?: number
  showPassLine?: boolean
  resultVisibility?: 'immediate' | 'scheduled' | 'admin_only'
  resultPublishAt?: string
  showCorrectAnswer?: boolean
  showScoreAfterSubmit?: boolean
  allowRetake?: boolean
  retakeStrategy?: 'highest' | 'latest' | 'average' | 'unlimited'
  maxRetakes?: number
  retakeCooldownMin?: number
  enableRanking?: boolean
  enableCertificate?: boolean
  certificateEnabled?: boolean
}

export interface ScoringRule {
  type: 'weight' | 'bonus' | 'penalty' | 'grade_mapping' | 'dimension'
  description?: string
  config?: Record<string, any>
}

export interface PublishConfig {
  id?: number
  surveyId?: number
  publishTime?: string | null
  expireTime?: string | null
  maxResponses?: number | null
  limitPerUser?: number
  requireLogin?: RequireLoginMode
  accessPassword?: string
  ipLimit?: number
  deviceLimit?: number
  shareCode?: string
  whitelistUserIds?: number[]
  whitelistDeptIds?: number[]
}

export interface Survey {
  id?: number
  title: string
  description?: string
  type?: SurveyType
  status?: SurveyStatus
  creatorId?: number
  creatorName?: string
  coverImage?: string
  themeConfig?: ThemeConfig
  settings?: SurveySettings
  scoringEnabled?: boolean
  scoringConfig?: ScoringConfig
  scoringRules?: ScoringRule[]
  publishConfig?: PublishConfig
  questions?: Question[]
  logicRules?: LogicRule[]
  responseCount?: number
  validResponseCount?: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export interface AnswerItem {
  questionId: number | string
  answerData: any
  textContent?: string
}

export interface SurveyResponse {
  id?: number
  surveyId?: number
  userId?: number | null
  status?: ResponseStatus
  isValid?: boolean
  invalidReason?: string
  duration?: number
  ip?: string
  deviceInfo?: Record<string, any>
  source?: string
  attemptNumber?: number
  submittedAt?: string
  answers?: AnswerItem[]
  scoreResult?: ScoringResult
}

export interface ScoringDetailItem {
  questionId: number | string
  score: number
  max: number
  isCorrect?: boolean
  comment?: string
}

export interface ScoringResult {
  id?: number
  responseId: number
  surveyId: number
  totalScore: number
  maxScore: number
  passScore?: number
  isPassed?: boolean
  gradeLabel?: string
  rank?: number
  detail?: ScoringDetailItem[]
  gradedBy?: number
  gradedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface SurveyListQuery {
  title?: string
  status?: SurveyStatus | ''
  type?: SurveyType | ''
  curPage?: number
  pageSize?: number
  startTime?: string
  endTime?: string
}

export interface PageResult<T> {
  list: T[]
  total: number
}

export interface StatisticsOverview {
  totalResponses: number
  validResponses: number
  invalidResponses: number
  recoveryRate?: number
  completionRate?: number
  avgDuration?: number
  medianDuration?: number
  todayCount?: number
  trend?: Array<{ date: string; count: number }>
  sourceDistribution?: Array<{ name: string; value: number }>
  deviceDistribution?: Array<{ name: string; value: number }>
  regionDistribution?: Array<{ name: string; value: number }>
}

export interface QuestionStatistics {
  questionId: number | string
  type: QuestionType
  title: string
  totalAnswers: number
  emptyRate?: number
  options?: Array<{ label: string; count: number; percent: number }>
  numericStats?: {
    avg?: number
    median?: number
    min?: number
    max?: number
    std?: number
  }
  textTop?: Array<{ word: string; count: number }>
  answers?: any[]
}

export interface CrossAnalysisRequest {
  rowDimension: string | number
  colDimension: string | number
  valueType?: 'count' | 'row_percent' | 'col_percent' | 'total_percent'
  filters?: Record<string, any>
}

export interface CrossAnalysisResult {
  rows: string[]
  cols: string[]
  matrix: number[][]
}

export interface QualityItem {
  responseId: number
  reason: string
  duration?: number
  ip?: string
  submittedAt?: string
  isValid: boolean
}

export interface QualityStatistics {
  invalidCount: number
  duplicateCount: number
  shortDurationCount: number
  missingRates?: Array<{
    questionId: number | string
    title: string
    emptyRate: number
  }>
  list: QualityItem[]
}

export interface ExportTask {
  taskId: string
  status: 'pending' | 'running' | 'done' | 'failed'
  downloadUrl?: string
  message?: string
}

export interface GradingListItem {
  questionId: number | string
  questionTitle: string
  pendingCount: number
  items: Array<{
    responseId: number
    answerData: any
    currentScore?: number
    maxScore: number
    userName?: string
  }>
}

export interface SurveyTemplate {
  id?: number
  title: string
  description?: string
  type?: SurveyType
  coverImage?: string
  category?: string
  /** Template body consumed by /template/:id/use */
  content?: {
    title?: string
    description?: string
    type?: SurveyType
    questions?: Question[]
    scoringEnabled?: boolean
    scoringConfig?: any
    settings?: any
    themeConfig?: any
    logicRules?: LogicRule[]
  }
  questions?: Question[]
  isPublic?: boolean
  createdAt?: string
}

export interface QuestionBankItem {
  id?: number
  title: string
  type: QuestionType
  description?: string
  config?: QuestionConfig
  tags?: string[]
  createdAt?: string
}

export interface FillSurveyPayload {
  survey: Survey
  questions: Question[]
  logicRules?: LogicRule[]
  publishConfig?: PublishConfig
  needPassword?: boolean
  passwordPassed?: boolean
}

export interface SubmitResponsePayload {
  answers: AnswerItem[]
  duration?: number
  source?: string
  deviceFingerprint?: string
  deviceInfo?: Record<string, any>
  password?: string
}

export interface ScoreDistribution {
  buckets: Array<{ label: string; count: number }>
  avgScore?: number
  maxScore?: number
  minScore?: number
  passRate?: number
  excellentRate?: number
  std?: number
}

export interface RankingItem {
  rank: number
  responseId: number
  userName?: string
  totalScore: number
  submittedAt?: string
}

export interface ItemAnalysis {
  questionId: number | string
  title: string
  difficulty: number
  discrimination: number
  correctRate: number
}
