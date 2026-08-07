import type { Question, QuestionType, QuestionConfig } from '@/types/survey'

export interface QuestionTypeDef {
  type: QuestionType
  label: string
  icon: string
  category?: 'basic' | 'advanced'
  defaultConfig: () => QuestionConfig
  createQuestion: (partial?: Partial<Question>) => Question
  validate: (answer: any, question: Question) => string | null
}

let _seq = 0
export function nextClientKey() {
  _seq += 1
  return `q_${Date.now()}_${_seq}`
}

export function createBaseQuestion(
  type: QuestionType,
  label: string,
  defaultConfig: () => QuestionConfig,
  partial?: Partial<Question>
): Question {
  const { type: _ignoredType, config: partialConfig, ...rest } = partial || {}
  return {
    _key: nextClientKey(),
    title: `${label}`,
    description: '',
    required: false,
    pageIndex: 1,
    sortOrder: 0,
    extra: {},
    ...rest,
    type,
    config: {
      ...defaultConfig(),
      ...(partialConfig || {})
    }
  }
}

export function requiredCheck(answer: any, question: Question): string | null {
  if (!question.required) return null
  if (answer === undefined || answer === null || answer === '') {
    return '此题为必填'
  }
  if (Array.isArray(answer) && answer.length === 0) {
    return '此题为必填'
  }
  if (typeof answer === 'object' && !Array.isArray(answer)) {
    const vals = Object.values(answer)
    if (!vals.length || vals.every(v => v === '' || v == null)) {
      return '此题为必填'
    }
  }
  return null
}
