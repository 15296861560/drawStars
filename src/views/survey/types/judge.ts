import type { Question } from '@/types/survey'
import { createBaseQuestion, requiredCheck, type QuestionTypeDef } from './base'

const def: QuestionTypeDef = {
  type: 'judge',
  label: '判断题',
  icon: 'Select',
  category: 'basic',
  defaultConfig: () => ({ options: [{ content: '对', sortOrder: 1 }, { content: '错', sortOrder: 2 }] }),
  createQuestion(partial) {
    return createBaseQuestion('judge', '判断题', this.defaultConfig, partial)
  },
  validate(answer, question: Question) {
    const req = requiredCheck(answer?.value ?? answer, question)
    if (req) return req
    const v = answer?.value ?? answer
    if (question.required && (v === undefined || v === null || v === '')) return '请选择'
    return null
  }
}

export default def
