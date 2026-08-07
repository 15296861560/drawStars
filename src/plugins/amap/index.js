/**
 * 高德地图：从后端 app_info.amap 拉取 Key / 安全密钥后再加载 JS SDK
 */
import { $axiosGet } from '@/assets/js/axios-api/axios-config.js'

const AMAP_PLUGINS =
  'AMap.PolygonEditor,AMap.Geocoder,AMap.convertFrom,AMap.MouseTool'

let amapReadyPromise = null
let amapConfigCache = null

function loadAmapScript(key) {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.AMap) {
      resolve(window.AMap)
      return
    }
    const existing = document.querySelector('script[data-amap-sdk="1"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.AMap))
      existing.addEventListener('error', () =>
        reject(new Error('AMap script load failed'))
      )
      return
    }
    const script = document.createElement('script')
    script.setAttribute('data-amap-sdk', '1')
    script.async = true
    script.src =
      'https://webapi.amap.com/maps?v=2.0&key=' +
      encodeURIComponent(key) +
      '&plugin=' +
      AMAP_PLUGINS
    script.onload = () => resolve(window.AMap)
    script.onerror = () => reject(new Error('AMap script load failed'))
    document.head.appendChild(script)
  })
}

async function fetchAmapConfig() {
  if (amapConfigCache?.key) return amapConfigCache
  const body = await $axiosGet({}, '/amapApi/getMapApiKey')
  if (!body?.status || !body?.data?.key) {
    throw new Error(body?.msg || '未获取到高德地图 Key')
  }
  amapConfigCache = {
    key: body.data.key,
    securityJsCode: body.data.securityJsCode || '',
    webServiceKey: body.data.webServiceKey || ''
  }
  return amapConfigCache
}

/** 确保高德 SDK 已加载（地图页 / 逆地理编码前调用） */
export function ensureAmapReady() {
  if (!amapReadyPromise) {
    amapReadyPromise = (async () => {
      const cfg = await fetchAmapConfig()
      if (cfg.securityJsCode) {
        window._AMapSecurityConfig = {
          securityJsCode: cfg.securityJsCode
        }
      }
      await loadAmapScript(cfg.key)
      return window.AMap
    })().catch(err => {
      amapReadyPromise = null
      throw err
    })
  }
  return amapReadyPromise
}

export function getCachedAmapConfig() {
  return amapConfigCache
}

/** 在 app.use(pinia) 之后调用，避免 store 未就绪时请求 Key */
export function installAmap() {
  ensureAmapReady().catch(err => {
    console.warn('[amap] init skipped:', err?.message || err)
  })
}
