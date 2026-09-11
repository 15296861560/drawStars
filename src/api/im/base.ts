/**
 * IM API 基础封装
 * - 复用项目统一的 $axios(POST) / $axiosGet(GET)
 * - 额外提供 del() 用于 DELETE 路由（项目无统一 DELETE 封装）
 * - 所有函数返回完整后端信封 { status, msg, data }，便于上层读取业务错误文案
 */
import {
  $axios,
  $axiosGet,
  requests
} from '@/assets/js/axios-api/axios-config.js'
import { apiInfoStore } from '@/stores/api-info'
import type { ApiResult } from './types'

export { $axios, $axiosGet }

/** POST：params 走 body */
export function post<T = unknown>(
  params: Record<string, unknown>,
  url: string
): Promise<ApiResult<T>> {
  return $axios(params, url) as unknown as Promise<ApiResult<T>>
}

/** GET：params 走 query */
export function get<T = unknown>(
  params: Record<string, unknown> = {},
  url: string,
  options: Record<string, unknown> = {}
): Promise<ApiResult<T>> {
  return $axiosGet(params, url, options) as unknown as Promise<ApiResult<T>>
}

/** DELETE：params 走 body（后端 @Delete 路由从 @Body 读取） */
export function del<T = unknown>(
  url: string,
  body: Record<string, unknown> = {}
): Promise<ApiResult<T>> {
  return requestMethod<T>('put-ignored', url, body, 'delete')
}

/** PUT：params 走 body（后端 @Put 路由） */
export function put<T = unknown>(
  url: string,
  body: Record<string, unknown> = {}
): Promise<ApiResult<T>> {
  return requestMethod<T>('put', url, body, 'put')
}

function requestMethod<T>(
  _tag: string,
  url: string,
  body: Record<string, unknown>,
  method: 'delete' | 'put'
): Promise<ApiResult<T>> {
  return new Promise(resolve => {
    const apiInfo = apiInfoStore()
    const fullUrl = `${apiInfo.getURL.value}${url}`
    const cfg = { data: body, timeout: 30000 }
    const call =
      method === 'delete'
        ? requests.delete(fullUrl, cfg)
        : requests.put(fullUrl, body, { timeout: 30000 })
    call
      .then(res => {
        resolve((res.data || {}) as ApiResult<T>)
      })
      .catch(() => {
        resolve({ status: false, msg: '请求失败', data: null as unknown as T })
      })
  })
}

/** 路径参数替换 helper：format('/im/messages/:msgId/recall', { msgId }) */
export function formatPath(
  tpl: string,
  params: Record<string, string | number>
): string {
  let out = tpl
  for (const [k, v] of Object.entries(params)) {
    out = out.replace(`:${k}`, encodeURIComponent(String(v)))
  }
  return out
}
