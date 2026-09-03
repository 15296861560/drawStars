/**
 * IM 鉴权 API — 换取 IM Access Token / WS Ticket / 登出 / 批量在线状态
 * 路由前缀：/im
 */
import { post, get } from './base'
import type { ImUserProfile } from './types'

/** 颁发 IM Access Token（独立于站点登录态，后端复用 buildUserToken） */
export function issueToken() {
  return post<{ token: string; expireAt: string; uid: string }>({}, '/im/token')
}

/** 颁发一次性 WS Ticket（HMAC，≤2min，单次有效） */
export function issueWsTicket() {
  return post<{ ticket: string; expireAt: string }>({}, '/im/ws-ticket')
}

/** 刷新 IM Access Token */
export function refreshToken() {
  return post<{ token: string; expireAt: string }>({}, '/im/token/refresh')
}

/** IM 登出（清除在线态） */
export function logout() {
  return post<{}>({}, '/im/logout')
}

/** 批量查询用户在线状态（userIds 逗号分隔） */
export function batchStatus(userIds: string[]) {
  return get<{ list: Array<{ userId: string; online: boolean }> }>(
    { userIds: userIds.join(',') },
    '/im/users/status'
  )
}

export function getProfile() {
  return get<ImUserProfile>({}, '/im/profile')
}

export function updateProfile(data: Record<string, unknown>) {
  return post<ImUserProfile>(data, '/im/profile')
}

export default { issueToken, issueWsTicket, refreshToken, logout, batchStatus, getProfile, updateProfile }
