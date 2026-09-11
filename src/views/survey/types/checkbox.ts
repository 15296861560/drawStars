import type { Question } from '@/types/survey'
import { createBaseQuestion, requiredCheck, type QuestionTypeDef } from './base'

const def: QuestionTypeDef = {
  type: 'checkbox',
  label: '多选题',
  icon: 'Checked',
  category: 'basic',
  defaultConfig: () => ({
    options: [
      { content: '选项A', sortOrder: 1 },
      { content: '选项B', sortOrder: 2 }
    ],
    minSelect: 0,
    maxSelect: 0
  }),
  createQuestion(partial) {
    return createBaseQuestion('checkbox', '多选题', this.defaultConfig, partial)
  },
  validate(answer, question: Question) {
    const req = requiredCheck(answer?.value ?? answer, question)
    if (req) return req
    const v = answer?.value ?? answer
    const arr = Array.isArray(v) ? v : []
    if (question.required && !arr.length) return '请至少选择一项'
    const min = question.config?.minSelect || 0
    const max = question.config?.maxSelect || 0
    if (min && arr.length < min) return '至少选择' + min + '项'
    if (max && arr.length > max) return '最多选择' + max + '项'
    return null
  }
}

export default def
