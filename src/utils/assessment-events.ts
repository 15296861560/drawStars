/**
 * 心智测评埋点工具（PRD 4.6 / 8.3）
 *
 * - session_id：sessionStorage 保存，30 分钟无操作过期重置（E01 去重窗口）
 * - 渠道承接：URL query 的 source/refId 首次进入时写入 sessionStorage，
 *   同 session 内页面间跳转不丢失（PRD 6.4）
 * - E01 channel_visit：session+source+refId 三元组 + 会话级缓存去重
 * - pending_response_ids：游客答卷 id 池，注册后消费补领积分（5.7 化解）
 */
import { reportEvent } from '@/api/assessment'
import type { AssessmentEventType } from '@/types/assessment'
import { userInfoStore } from '@/stores/user-info'
import { isSkipLoginMode } from '@/config/skip-login'

const SESSION_KEY = 'asmt_session_id'
const SESSION_AT_KEY = 'asmt_session_at'
const SOURCE_KEY = 'asmt_channel_source'
const REFID_KEY = 'asmt_channel_ref_id'
const PENDING_KEY = 'asmt_pending_response_ids'
const SESSION_TTL = 30 * 60 * 1000

function sid(): string {
  let id = ''
  let at = 0
  try {
    id = sessionStorage.getItem(SESSION_KEY) || ''
    at = Number(sessionStorage.getItem(SESSION_AT_KEY) || 0)
  } catch (_e) {
    /* ignore */
  }
  // 会话 30 分钟无操作过期（与 session_id 同口径）
  if (!id || !at || Date.now() - at > SESSION_TTL) {
    id = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    at = Date.now()
  }
  try {
    sessionStorage.setItem(SESSION_KEY, id)
    sessionStorage.setItem(SESSION_AT_KEY, String(Date.now()))
  } catch (_e) {
    /* ignore */
  }
  return id
}

/** 渠道 query 参数承接（同一会话只记首个来源，不覆盖） */
export function captureChannelQuery(query: {
  source?: string | string[]
  refId?: string | string[]
}) {
  const source = Array.isArray(query.source) ? query.source[0] : query.source
  const refId = Array.isArray(query.refId) ? query.refId[0] : query.refId
  if (!source) return
  try {
    if (!sessionStorage.getItem(SOURCE_KEY)) {
      sessionStorage.setItem(SOURCE_KEY, source)
      sessionStorage.setItem(REFID_KEY, refId || '')
    } else {
      // 已有来源不覆盖；刷新当前来源时更新活跃时间
      sessionStorage.setItem(SESSION_AT_KEY, String(Date.now()))
    }
  } catch (_e) {
    /* ignore */
  }
}

/** 读取/生成 sessionId（PRD 4.3.4：游客分享时 source=share 链接的 refId 用 sessionId 标识） */
export function getSessionId(): string {
  return sid()
}

export function getSessionSource(): string | null {
  try {
    return sessionStorage.getItem(SOURCE_KEY)
  } catch (_e) {
    return null
  }
}

export function getSessionRefId(): string | null {
  try {
    return sessionStorage.getItem(REFID_KEY)
  } catch (_e) {
    return null
  }
}

function currentUserId(): number | null {
  try {
    const id = userInfoStore().getUserId
    if (id) return Number(id)
    if (isSkipLoginMode()) return 0
    return null
  } catch (_e) {
    return null
  }
}

function uaSummary(): string {
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/i.test(ua)
  const isAndroid = /Android/i.test(ua)
  const isWechat = /MicroMessenger/i.test(ua)
  const os = isIOS ? 'iOS' : isAndroid ? 'Android' : 'Other'
  return `${os}${isWechat ? ' · WeChat' : ''}`
}

export interface SendEventArgs {
  source?: string | null
  refId?: string | null
  target?: string | null
  position?: string | null
  surveyId?: number | string | null
  surveyResponseId?: string | null
  isNewUser?: boolean | null
}

/** 统一事件出口（fire-and-forget） */
export function sendEvent(eventType: AssessmentEventType, args: SendEventArgs = {}) {
  const sessionId = sid()
  void reportEvent({
    eventType,
    sessionId,
    userId: currentUserId(),
    source: args.source !== undefined ? args.source : getSessionSource(),
    refId: args.refId !== undefined ? args.refId : getSessionRefId(),
    target: args.target || null,
    position: args.position || null,
    surveyId: args.surveyId ?? null,
    surveyResponseId: args.surveyResponseId ?? null,
    isNewUser: args.isNewUser ?? null,
    userAgent: uaSummary()
  })
}

/** E01 渠道曝光：session+source+refId 三元组去重 */
export function trackChannelVisit(args: { source?: string; refId?: string; target?: string } = {}) {
  const source = args.source || getSessionSource()
  if (!source) return
  const refId = args.refId || getSessionRefId() || ''
  const dedupKey = `asmt_e01_${source}_${refId}`
  try {
    if (sessionStorage.getItem(dedupKey)) return
    sessionStorage.setItem(dedupKey, '1')
  } catch (_e) {
    /* ignore */
  }
  sendEvent('channel_visit', { source, refId, target: args.target || 'entry' })
}

// ===== pending_response_ids（游客答卷池，5.7） =====

export function pushPendingResponseId(responseId: string | number) {
  if (!responseId) return
  try {
    const ids = getPendingResponseIds()
    const val = String(responseId)
    if (!ids.includes(val)) {
      ids.push(val)
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(ids))
    }
  } catch (_e) {
    /* ignore */
  }
}

export function getPendingResponseIds(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(PENDING_KEY) || '[]')
  } catch (_e) {
    return []
  }
}

export function clearPendingResponseIds() {
  try {
    sessionStorage.removeItem(PENDING_KEY)
  } catch (_e) {
    /* ignore */
  }
}
