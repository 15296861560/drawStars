import type { Question } from '@/types/survey'
import { createBaseQuestion, requiredCheck, type QuestionTypeDef } from './base'

const def: QuestionTypeDef = {
  type: 'slider',
  label: '滑动条',
  icon: 'Minus',
  category: 'advanced',
  defaultConfig: () => ({ min: 0, max: 100, step: 1 }),
  createQuestion(partial) {
    return createBaseQuestion('slider', '滑动条', this.defaultConfig, partial)
  },
  validate(answer, question: Question) {
    const req = requiredCheck(answer?.value ?? answer, question)
    if (req) return req
    const v = answer?.value ?? answer
    if (question.required && (v === undefined || v === null || v === '')) return '请选择数值'
    return null
  }
}

export default def
