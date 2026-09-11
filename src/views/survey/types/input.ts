import type { Question } from '@/types/survey'
import { createBaseQuestion, requiredCheck, type QuestionTypeDef } from './base'

const def: QuestionTypeDef = {
  type: 'input',
  label: '填空题',
  icon: 'Edit',
  category: 'basic',
  defaultConfig: () => ({ placeholder: '请输入', maxLength: 200 }),
  createQuestion(partial) {
    return createBaseQuestion('input', '填空题', this.defaultConfig, partial)
  },
  validate(answer, question: Question) {
    const req = requiredCheck(answer?.value ?? answer, question)
    if (req) return req
    const v = String(answer?.value ?? answer ?? '')
    if (question.required && !v.trim()) return '请填写'
    const max = question.config?.maxLength
    if (max && v.length > max) return '超出字数限制'
    const pat = question.config?.pattern
    if (pat && v && !new RegExp(pat).test(v)) return '格式不正确'
    return null
  }
}

export default def
