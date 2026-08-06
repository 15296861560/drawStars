import type { Question } from '@/types/survey'
import { createBaseQuestion, requiredCheck, type QuestionTypeDef } from './base'

const def: QuestionTypeDef = {
  type: 'radio',
  label: '单选题',
  icon: 'CircleCheck',
  category: 'basic',
  defaultConfig: () => ({ options: [{ content: '选项A', sortOrder: 1 }, { content: '选项B', sortOrder: 2 }] }),
  createQuestion(partial) {
    return createBaseQuestion('radio', '单选题', this.defaultConfig, partial)
  },
  validate(answer, question: Question) {
    const req = requiredCheck(answer?.value ?? answer, question)
    if (req) return req
    const v = answer?.value ?? answer
    if (question.required && (v === undefined || v === null || v === '')) return '请选择一项'
    return null
  }
}

export default def
