import type { Question } from '@/types/survey'
import { createBaseQuestion, requiredCheck, type QuestionTypeDef } from './base'

const def: QuestionTypeDef = {
  type: 'number',
  label: '数字输入',
  icon: 'Odometer',
  category: 'basic',
  defaultConfig: () => ({ step: 1, placeholder: '请输入数字' }),
  createQuestion(partial) {
    return createBaseQuestion('number', '数字输入', this.defaultConfig, partial)
  },
  validate(answer, question: Question) {
    const req = requiredCheck(answer?.value ?? answer, question)
    if (req) return req
    const v = answer?.value ?? answer
    if (question.required && (v === undefined || v === null || v === '')) return '请输入数字'
    if (v === '' || v == null) return null
    const n = Number(v)
    if (Number.isNaN(n)) return '请输入有效数字'
    const min = question.config?.min
    const max = question.config?.max
    if (min != null && n < min) return '不能小于' + min
    if (max != null && n > max) return '不能大于' + max
    return null
  }
}

export default def
