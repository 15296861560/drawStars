import type { Question } from '@/types/survey'
import { createBaseQuestion, requiredCheck, type QuestionTypeDef } from './base'

const def: QuestionTypeDef = {
  type: 'date',
  label: '日期/时间',
  icon: 'Calendar',
  category: 'basic',
  defaultConfig: () => ({
    dateType: 'datetime',
    placeholder: '请选择日期时间'
  }),
  createQuestion(partial) {
    return createBaseQuestion('date', '日期/时间', this.defaultConfig, partial)
  },
  validate(answer, question: Question) {
    const req = requiredCheck(answer?.value ?? answer, question)
    if (req) return req
    const v = answer?.value ?? answer
    if (question.required && !v) return '请选择日期'
    return null
  }
}

export default def
