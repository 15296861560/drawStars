import type { Question } from '@/types/survey'
import { createBaseQuestion, requiredCheck, type QuestionTypeDef } from './base'

const def: QuestionTypeDef = {
  type: 'signature',
  label: '签名题',
  icon: 'EditPen',
  category: 'advanced',
  defaultConfig: () => ({}),
  createQuestion(partial) {
    return createBaseQuestion(
      'signature',
      '签名题',
      this.defaultConfig,
      partial
    )
  },
  validate(answer, question: Question) {
    const req = requiredCheck(answer?.value ?? answer, question)
    if (req) return req
    const v = answer?.value ?? answer
    if (question.required && !v) return '请签名'
    return null
  }
}

export default def
