import type { Question } from '@/types/survey'
import { createBaseQuestion, requiredCheck, type QuestionTypeDef } from './base'

const def: QuestionTypeDef = {
  type: 'image',
  label: '图片上传',
  icon: 'Picture',
  category: 'basic',
  defaultConfig: () => ({ accept: 'image/*', maxSizeMB: 5 }),
  createQuestion(partial) {
    return createBaseQuestion('image', '图片上传', this.defaultConfig, partial)
  },
  validate(answer, question: Question) {
    const req = requiredCheck(answer?.value ?? answer, question)
    if (req) return req
    const v = answer?.value ?? answer
    if (question.required && !v) return '请上传图片'
    return null
  }
}

export default def
