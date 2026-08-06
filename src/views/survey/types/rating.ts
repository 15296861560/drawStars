import type { Question } from '@/types/survey'
import { createBaseQuestion, requiredCheck, type QuestionTypeDef } from './base'

const def: QuestionTypeDef = {
  type: 'rating',
  label: '评分题',
  icon: 'Star',
  category: 'basic',
  defaultConfig: () => ({ ratingMax: 5, ratingStyle: 'star' }),
  createQuestion(partial) {
    return createBaseQuestion('rating', '评分题', this.defaultConfig, partial)
  },
  validate(answer, question: Question) {
    const req = requiredCheck(answer?.value ?? answer, question)
    if (req) return req
    const v = answer?.value ?? answer
    if (question.required && (v === undefined || v === null || v === '')) return '请评分'
    return null
  }
}

export default def
