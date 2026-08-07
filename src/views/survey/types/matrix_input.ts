import type { Question } from '@/types/survey'
import { createBaseQuestion, requiredCheck, type QuestionTypeDef } from './base'

const def: QuestionTypeDef = {
  type: 'matrix_input',
  label: '矩阵填空',
  icon: 'Menu',
  category: 'advanced',
  defaultConfig: () => ({ rows: [{ id: 'r1', label: '行1' }], columns: [{ id: 'c1', label: '列1' }] }),
  createQuestion(partial) {
    return createBaseQuestion('matrix_input', '矩阵填空', this.defaultConfig, partial)
  },
  validate(answer, question: Question) {
    const req = requiredCheck(answer?.value ?? answer, question)
    if (req) return req
    const v = (answer?.value ?? answer) || {}
    if (!question.required) return null
    const rows = question.config?.rows || []
    const cols = question.config?.columns || []
    for (const r of rows) {
      for (const c of cols) {
        const key = r.id + '_' + c.id
        if (!v[key] && !(v[r.id] && v[r.id][c.id])) return '请完成矩阵填写'
      }
    }
    return null
  }
}

export default def
