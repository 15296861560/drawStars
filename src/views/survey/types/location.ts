import type { Question } from '@/types/survey'
import { createBaseQuestion, requiredCheck, type QuestionTypeDef } from './base'

function hasLocationValue(v: any): boolean {
  if (v == null || v === '') return false
  if (typeof v === 'string') {
    return !(v.includes('定位失败') || v.includes('不支持') || !v.trim())
  }
  if (typeof v === 'object') {
    const lng = v.longitude
    const lat = v.latitude
    const address = v.address
    const hasCoord =
      lng !== '' &&
      lng != null &&
      lat !== '' &&
      lat != null &&
      !Number.isNaN(Number(lng)) &&
      !Number.isNaN(Number(lat))
    const hasAddress = typeof address === 'string' && !!address.trim()
    return hasCoord || hasAddress
  }
  return false
}

const def: QuestionTypeDef = {
  type: 'location',
  label: '定位题',
  icon: 'Location',
  category: 'advanced',
  defaultConfig: () => ({}),
  createQuestion(partial) {
    return createBaseQuestion('location', '定位题', this.defaultConfig, partial)
  },
  validate(answer, question: Question) {
    const raw = answer?.value !== undefined ? answer.value : answer
    if (!question.required) return null
    const req = requiredCheck(raw, question)
    if (req && !hasLocationValue(raw)) return '请获取或填写定位'
    if (!hasLocationValue(raw)) return '请获取或填写定位'
    return null
  }
}

export default def
