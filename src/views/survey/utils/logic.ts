import type { LogicRule, LogicCondition, Question } from '@/types/survey'

function matchCondition(cond: LogicCondition, answers: Record<string, any>): boolean {
  const raw = answers[String(cond.questionId)]
  const val = raw?.value !== undefined ? raw.value : raw
  switch (cond.operator) {
    case 'eq':
      return val == cond.value
    case 'neq':
      return val != cond.value
    case 'includes':
      return Array.isArray(val) ? val.includes(cond.value) : String(val || '').includes(String(cond.value))
    case 'gt':
      return Number(val) > Number(cond.value)
    case 'gte':
      return Number(val) >= Number(cond.value)
    case 'lt':
      return Number(val) < Number(cond.value)
    case 'lte':
      return Number(val) <= Number(cond.value)
    case 'empty':
      return val === undefined || val === null || val === '' || (Array.isArray(val) && !val.length)
    case 'not_empty':
      return !(val === undefined || val === null || val === '' || (Array.isArray(val) && !val.length))
    default:
      return false
  }
}

function evalCondition(
  condition: LogicRule['condition'],
  answers: Record<string, any>
): boolean {
  if (!condition) return false
  if ('logic' in condition && Array.isArray((condition as any).items)) {
    const items = (condition as any).items as LogicCondition[]
    if ((condition as any).logic === 'or') {
      return items.some(c => matchCondition(c, answers))
    }
    return items.every(c => matchCondition(c, answers))
  }
  return matchCondition(condition as LogicCondition, answers)
}

export interface LogicRuntime {
  visibleMap: Record<string, boolean>
  requiredMap: Record<string, boolean>
  jumpPage?: number
}

/** Evaluate show/hide/required/jump against current answers */
export function evaluateLogic(
  questions: Question[],
  rules: LogicRule[],
  answers: Record<string, any>
): LogicRuntime {
  const visibleMap: Record<string, boolean> = {}
  const requiredMap: Record<string, boolean> = {}
  questions.forEach(q => {
    const key = String(q.id ?? q._key)
    visibleMap[key] = true
    requiredMap[key] = !!q.required
  })

  let jumpPage: number | undefined
  const sorted = [...(rules || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

  for (const rule of sorted) {
    const ok = evalCondition(rule.condition, answers)
    const target = String(rule.targetQuestionId ?? '')
    if (rule.actionType === 'show' && target) {
      visibleMap[target] = ok
    } else if (rule.actionType === 'hide' && target) {
      if (ok) visibleMap[target] = false
    } else if (rule.actionType === 'required' && target) {
      if (ok) requiredMap[target] = true
    } else if (rule.actionType === 'jump' && ok && rule.targetPage != null) {
      jumpPage = rule.targetPage
    }
  }

  return { visibleMap, requiredMap, jumpPage }
}

export function groupByPage(questions: Question[]): Map<number, Question[]> {
  const map = new Map<number, Question[]>()
  const list = [...questions]
    .filter(q => q.type !== 'page_break')
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  list.forEach(q => {
    const page = q.pageIndex || 1
    if (!map.has(page)) map.set(page, [])
    map.get(page)!.push(q)
  })
  return map
}
