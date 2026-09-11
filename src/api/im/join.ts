/**
 * 入房/入群申请 API — 列表（我发起/我管理）/ 申请 / 审批 / 拒绝 / 撤回
 * 路由前缀：/im/join-requests
 */
import { post, get, del, formatPath } from './base'
import type { ImJoinRequest } from './types'

export function listJoinRequests(scope: 'mine' | 'manage' = 'mine') {
  return get<{ list: ImJoinRequest[] }>({ scope }, '/im/join-requests')
}

export function createJoinRequest(
  targetType: string,
  targetId: string,
  remark?: string
) {
  return post<ImJoinRequest>(
    { targetType, targetId, remark },
    '/im/join-requests'
  )
}

export function approveJoinRequest(id: string) {
  return post<ImJoinRequest>(
    {},
    formatPath('/im/join-requests/:id/approve', { id })
  )
}

export function rejectJoinRequest(id: string) {
  return post<ImJoinRequest>(
    {},
    formatPath('/im/join-requests/:id/reject', { id })
  )
}

export function withdrawJoinRequest(id: string) {
  return del<{}>(formatPath('/im/join-requests/:id', { id }))
}

export default {
  listJoinRequests,
  createJoinRequest,
  approveJoinRequest,
  rejectJoinRequest,
  withdrawJoinRequest
}
