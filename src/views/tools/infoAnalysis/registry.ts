import type { AnalysisToolItem } from './types'

/**
 * Info analysis tool registry.
 * Add a new entry here when extending capabilities later.
 */
export const analysisTools: AnalysisToolItem[] = [
  {
    key: 'idCard',
    path: '/home/toolHomePage/infoAnalysis/idCard',
    icon: 'users',
    i18nKey: 'idCard'
  },
  {
    key: 'phoneLocation',
    path: '/home/toolHomePage/infoAnalysis/phoneLocation',
    icon: 'location',
    i18nKey: 'phoneLocation'
  }
]
