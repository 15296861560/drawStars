/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2023-06-15 23:59:00
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-17 22:32:35
 */

function resolveNotifyUrl() {
  if (import.meta.env.VITE_NOTIFY_URL) {
    return import.meta.env.VITE_NOTIFY_URL
  }
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    // release 默认 8030，可用 VITE_NOTIFY_PORT 覆盖
    const port = import.meta.env.VITE_NOTIFY_PORT || '8030'
    return `${proto}://${window.location.hostname}:${port}/`
  }
  return 'ws://localhost:8031/'
}

export const NOTIFY_URL = resolveNotifyUrl()
export const WEBSITE_CHANNEL = 'drawstars-web'
