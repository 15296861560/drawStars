import type { Question } from '@/types/survey'
import { createBaseQuestion, requiredCheck, type QuestionTypeDef } from './base'

const def: QuestionTypeDef = {
  type: 'textarea',
  label: '多行填空',
  icon: 'Document',
  category: 'basic',
  defaultConfig: () => ({ placeholder: '请输入', maxLength: 2000 }),
  createQuestion(partial) {
    return createBaseQuestion('textarea', '多行填空', this.defaultConfig, partial)
  },
  validate(answer, question: Question) {
    const req = requiredCheck(answer?.value ?? answer, question)
    if (req) return req
    const v = String(answer?.value ?? answer ?? '')
    if (question.required && !v.trim()) return '请填写'
    const max = question.config?.maxLength
    if (max && v.length > max) return '超出字数限制'
    return null
  }
}

export default def
