import type { Question } from '@/types/survey'
import { createBaseQuestion, requiredCheck, type QuestionTypeDef } from './base'

const def: QuestionTypeDef = {
  type: 'file',
  label: '文件上传',
  icon: 'Upload',
  category: 'advanced',
  defaultConfig: () => ({ accept: '*/*', maxSizeMB: 20 }),
  createQuestion(partial) {
    return createBaseQuestion('file', '文件上传', this.defaultConfig, partial)
  },
  validate(answer, question: Question) {
    const req = requiredCheck(answer?.value ?? answer, question)
    if (req) return req
    const v = answer?.value ?? answer
    if (question.required && !v) return '请上传文件'
    return null
  }
}

export default def
