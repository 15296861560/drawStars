/**
 * 基础数据埋点：路由页面访问上报到 analyticsApi/collect
 */
import router from '@/router'
import analyticsApi from '@/assets/js/api/analyticsController/analyticsApi.js'
import { userInfoStore } from '@/stores/user-info'

/** 与后端 analytics 站点配置对应的 websiteId */
const WEBSITE_ID = {
  production: '840178da-f09b-4420-a4c6-68e2b13555ff',
  development: 'e4daa6d4-3c40-427e-9224-f02464076f49'
}

let installed = false
let lastPath = ''

function getWebsiteId() {
  return process.env.NODE_ENV === 'production'
    ? WEBSITE_ID.production
    : WEBSITE_ID.development
}

function getUsername() {
  try {
    const store = userInfoStore()
    return store.getUserName || store.userInfo?.name || ''
  } catch {
    return ''
  }
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
  if (!path || path === lastPath) return
  lastPath = path

  const metaTitle = to?.meta?.title
  const title = metaTitle
    ? (Array.isArray(metaTitle) ? metaTitle : [metaTitle]).join(' / ')
    : typeof document !== 'undefined'
      ? document.title
      : ''

  analyticsApi.collectSilent({
    type: 'pageview',
    payload: {
      website: getWebsiteId(),
      hostname:
        typeof window !== 'undefined' ? window.location.hostname : 'localhost',
      screen:
        typeof window !== 'undefined'
          ? `${window.screen.width}x${window.screen.height}`
          : '',
      language: typeof navigator !== 'undefined' ? navigator.language : '',
      url: path,
      referrer:
        typeof document !== 'undefined' ? document.referrer || '' : '',
      title,
      username: getUsername()
    }
  })
}

export function trackEvent(event: string, extra: Record<string, unknown> = {}) {
  analyticsApi.collectSilent({
    type: 'event',
    payload: {
      website: getWebsiteId(),
      hostname:
        typeof window !== 'undefined' ? window.location.hostname : 'localhost',
      url: typeof window !== 'undefined' ? window.location.pathname : '',
      event_type: 'custom',
      event_value: String(event || '').slice(0, 50),
      ...extra
    }
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
