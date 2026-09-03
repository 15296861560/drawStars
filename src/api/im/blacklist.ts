/**
 * 黑名单 API — 列表 / 拉黑 / 移出
 * 路由前缀：/im/blacklist
 */
import { post, get, del } from './base'
import type { ImBlacklistItem } from './types'

export function listBlacklist() {
  return get<{ list: ImBlacklistItem[] }>({}, '/im/blacklist')
}

export function addBlacklist(targetId: string) {
  return post<ImBlacklistItem>({ targetId }, '/im/blacklist')
}

export function removeBlacklist(targetId: string) {
  return del<{}>('/im/blacklist', { targetId })
}

export default { listBlacklist, addBlacklist, removeBlacklist }
