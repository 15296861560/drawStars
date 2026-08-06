/*
 * @Description: Unified toast + request error message helpers
 */
import { ElMessage } from 'element-plus'

const recentTips = new Map()
const DEDUPE_MS = 2500

function shouldSkipDuplicate(type, msg) {
  const key = String(type) + ':' + String(msg)
  const now = Date.now()
  const last = recentTips.get(key)
  if (last && now - last < DEDUPE_MS) {
    return true
  }
  recentTips.set(key, now)
  if (recentTips.size > 80) {
    for (const [k, t] of recentTips) {
      if (now - t > DEDUPE_MS) recentTips.delete(k)
    }
  }
  return false
}

/**
 * Show message tip; identical type+msg within DEDUPE_MS is ignored.
 */
let showTips = function (type, msg) {
  if (msg == null || msg === '') return
  const text = String(msg)
  if (shouldSkipDuplicate(type, text)) return
  ElMessage({
    type: type,
    message: text
  })
}

const AXIOS_STATUS_RE = /^Request failed with status code (\d+)$/i

/**
 * Prefer backend business message over axios default status text.
 */
function getRequestErrorMessage(error, fallback) {
  const fb = fallback || '请求失败'
  if (error == null) return fb
  if (typeof error === 'string') {
    return AXIOS_STATUS_RE.test(error.trim()) ? fb : error
  }

  const data = error.response && error.response.data
  if (data != null) {
    if (typeof data === 'string' && data.trim()) return data
    if (typeof data.msg === 'string' && data.msg) return data.msg
    if (typeof data.message === 'string' && data.message) return data.message
    if (Array.isArray(data.message) && data.message.length) {
      return data.message
        .map(function (m) {
          if (typeof m === 'string') return m
          if (m && typeof m.message === 'string') return m.message
          if (m && typeof m.msg === 'string') return m.msg
          return ''
        })
        .filter(Boolean)
        .join('; ')
    }
  }

  if (typeof error.msg === 'string' && error.msg) return error.msg

  const message = error.message || ''
  if (AXIOS_STATUS_RE.test(message.trim())) {
    return fb
  }
  return message || fb
}

export { showTips, getRequestErrorMessage }
