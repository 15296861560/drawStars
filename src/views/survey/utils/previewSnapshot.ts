import type { LogicRule, Question, Survey } from '@/types/survey'

const PREFIX = 'survey_preview_snapshot_'

export interface SurveyPreviewSnapshot {
  surveyId: number | string
  survey: Pick<
    Survey,
    | 'title'
    | 'description'
    | 'type'
    | 'scoringEnabled'
    | 'settings'
    | 'themeConfig'
  >
  questions: Question[]
  logicRules: LogicRule[]
  savedAt: number
}

export function setSurveyPreviewSnapshot(
  snapshot: Omit<SurveyPreviewSnapshot, 'savedAt'>
) {
  try {
    const payload: SurveyPreviewSnapshot = { ...snapshot, savedAt: Date.now() }
    sessionStorage.setItem(
      PREFIX + String(snapshot.surveyId),
      JSON.stringify(payload)
    )
  } catch (_e) {
    /* ignore quota */
  }
}

export function getSurveyPreviewSnapshot(
  surveyId: number | string
): SurveyPreviewSnapshot | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + String(surveyId))
    if (!raw) return null
    return JSON.parse(raw) as SurveyPreviewSnapshot
  } catch (_e) {
    return null
  }
}

export function clearSurveyPreviewSnapshot(surveyId: number | string) {
  try {
    sessionStorage.removeItem(PREFIX + String(surveyId))
  } catch (_e) {
    /* ignore */
  }
}
