import type { QuestionType } from '@/types/survey'
import type { QuestionTypeDef } from './base'
import radio from './radio'
import checkbox from './checkbox'
import input from './input'
import textarea from './textarea'
import number from './number'
import rating from './rating'
import date from './date'
import image from './image'
import matrix_radio from './matrix_radio'
import matrix_input from './matrix_input'
import sort from './sort'
import slider from './slider'
import file from './file'
import signature from './signature'
import location from './location'
import judge from './judge'

const registry: Record<string, QuestionTypeDef> = {
  radio,
  checkbox,
  input,
  textarea,
  number,
  rating,
  date,
  image,
  matrix_radio,
  matrix_input,
  sort,
  slider,
  file,
  signature,
  location,
  judge
}

export function getQuestionType(
  type: QuestionType | string
): QuestionTypeDef | undefined {
  return registry[type]
}

export function listQuestionTypes(
  category?: 'basic' | 'advanced'
): QuestionTypeDef[] {
  const all = Object.values(registry)
  if (!category) return all
  return all.filter(t => t.category === category)
}

export { registry }
export type { QuestionTypeDef }
