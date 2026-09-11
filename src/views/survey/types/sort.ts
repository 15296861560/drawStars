import type { Question } from '@/types/survey'
import { createBaseQuestion, requiredCheck, type QuestionTypeDef } from './base'

const def: QuestionTypeDef = {
  type: 'sort',
  label: '排序题',
  icon: 'Sort',
  category: 'advanced',
  defaultConfig: () => ({
    options: [
      { content: '选项A', sortOrder: 1 },
      { content: '选项B', sortOrder: 2 },
      { content: '选项C', sortOrder: 3 }
    ]
  }),
  createQuestion(partial) {
    return createBaseQuestion('sort', '排序题', this.defaultConfig, partial)
  },
  validate(answer, question: Question) {
    const req = requiredCheck(answer?.value ?? answer, question)
    if (req) return req
    const v = answer?.value ?? answer
    const arr = Array.isArray(v) ? v : []
    if (question.required && !arr.length) return '请完成排序'
    return null
  }
}

export default def
