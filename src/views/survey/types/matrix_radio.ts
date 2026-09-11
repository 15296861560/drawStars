import type { Question } from '@/types/survey'
import { createBaseQuestion, requiredCheck, type QuestionTypeDef } from './base'

const def: QuestionTypeDef = {
  type: 'matrix_radio',
  label: '矩阵单选',
  icon: 'Grid',
  category: 'advanced',
  defaultConfig: () => ({
    rows: [
      { id: 'r1', label: '行1' },
      { id: 'r2', label: '行2' }
    ],
    columns: [
      { id: 'c1', label: '列1' },
      { id: 'c2', label: '列2' }
    ]
  }),
  createQuestion(partial) {
    return createBaseQuestion(
      'matrix_radio',
      '矩阵单选',
      this.defaultConfig,
      partial
    )
  },
  validate(answer, question: Question) {
    const req = requiredCheck(answer?.value ?? answer, question)
    if (req) return req
    const v = (answer?.value ?? answer) || {}
    if (!question.required) return null
    const rows = question.config?.rows || []
    for (const r of rows) {
      if (v[r.id] == null || v[r.id] === '') return '请完成矩阵填写'
    }
    return null
  }
}

export default def
