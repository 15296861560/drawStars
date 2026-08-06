const PREFIX = 'survey_draft_'
const TTL_MS = 7 * 24 * 60 * 60 * 1000

export interface LocalDraft {
  answers: Record<string, any>
  pageIndex?: number
  savedAt: number
  surveyId?: number | string
}

export function saveLocalDraft(shareCode: string, data: Omit<LocalDraft, 'savedAt'>) {
  try {
    const payload: LocalDraft = { ...data, savedAt: Date.now() }
    localStorage.setItem(PREFIX + shareCode, JSON.stringify(payload))
  } catch (_e) {
    /* ignore quota */
  }
}

export function loadLocalDraft(shareCode: string): LocalDraft | null {
  try {
    const raw = localStorage.getItem(PREFIX + shareCode)
    if (!raw) return null
    const data = JSON.parse(raw) as LocalDraft
    if (!data.savedAt || Date.now() - data.savedAt > TTL_MS) {
      clearLocalDraft(shareCode)
      return null
    }
    return data
  } catch (_e) {
    return null
  }
}

export function clearLocalDraft(shareCode: string) {
  try {
    localStorage.removeItem(PREFIX + shareCode)
  } catch (_e) {
    /* ignore */
  }
}
