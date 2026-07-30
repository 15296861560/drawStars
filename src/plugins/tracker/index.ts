/**
 * 基础数据埋点：路由页面访问 + 自定义事件上报到后端 logApi/track
 *（与 umami 并存，业务日志可在「业务日志」中查看）
 */
import router from '@/router'
import { requests } from '@/assets/js/axios-api/axios-config.js'
import { apiInfoStore } from '@/stores/api-info'
import { userInfoStore } from '@/stores/user-info'

let installed = false

function getUsername() {
  try {
    const store = userInfoStore()
    return store.getUserName || store.userInfo?.name || ''
  } catch {
    return ''
  }
}

function postTrack(payload: Record<string, unknown>) {
  try {
    const base = apiInfoStore().getURL.value || ''
    // 静默上报，失败不弹 toast
    requests.post(`${base}/logApi/track`, payload).catch(() => {})
  } catch {
    // ignore
  }
}

export function trackEvent(event: string, extra: Record<string, unknown> = {}) {
  postTrack({
    type: 'click',
    event: String(event || '').slice(0, 200),
    path: typeof window !== 'undefined' ? window.location.pathname : '',
    title: typeof document !== 'undefined' ? document.title : '',
    module: 'frontend',
    username: getUsername(),
    extra
  })
}

export function trackPageview(to?: {
  fullPath?: string
  path?: string
  meta?: { title?: string | string[] }
}) {
  const path =
    to?.fullPath ||
    to?.path ||
    (typeof window !== 'undefined' ? window.location.pathname : '')
  const metaTitle = to?.meta?.title
  const title = metaTitle
    ? (Array.isArray(metaTitle) ? metaTitle : [metaTitle]).join(' / ')
    : typeof document !== 'undefined'
      ? document.title
      : ''
  postTrack({
    type: 'pageview',
    event: 'pageview',
    path,
    title,
    module: 'frontend',
    username: getUsername()
  })
}

export function installTracker() {
  if (installed) return
  installed = true

  router.afterEach((to, from) => {
    if (to.path === from.path && to.fullPath === from.fullPath) return
    if (to.path === '/login' || to.path === '/') return
    trackPageview(to)
  })
}
