/**
 * 群组 API — 创建 / 列表 / 详情 / 更新 / 进出群 / 成员 / 禁言 / 踢人 / 管理员 / 转让 / 解散
 * 路由前缀：/im/groups
 */
import { post, get, formatPath } from './base'
import type { ImGroup } from './types'
import type { MuteDuration } from './room'

export function createGroup(data: Record<string, unknown>) {
  return post<ImGroup>(data, '/im/groups')
}

export function listGroups() {
  return get<{ list: ImGroup[] }>({}, '/im/groups')
}

export function getGroup(groupId: string) {
  return get<ImGroup>({}, formatPath('/im/groups/:groupId', { groupId }))
}

export function updateGroup(groupId: string, data: Record<string, unknown>) {
  return post<ImGroup>(data, formatPath('/im/groups/:groupId', { groupId }))
}

export function joinGroup(groupId: string) {
  return post<{ status: string; conversationId?: string }>({}, formatPath('/im/groups/:groupId/join', { groupId }))
}

export function leaveGroup(groupId: string) {
  return post<{}>({}, formatPath('/im/groups/:groupId/leave', { groupId }))
}

export function groupMembers(groupId: string) {
  return get<{ list: Array<Record<string, unknown>> }>({}, formatPath('/im/groups/:groupId/members', { groupId }))
}

export function muteGroupMember(groupId: string, targetUserId: string, duration: MuteDuration) {
  return post<{}>({ targetUserId, duration }, formatPath('/im/groups/:groupId/mute', { groupId }))
}

export function kickGroupMember(groupId: string, targetUserId: string) {
  return post<{}>({ targetUserId }, formatPath('/im/groups/:groupId/kick', { groupId }))
}

export function setGroupAdmin(groupId: string, targetUserId: string, isAdmin: boolean) {
  return post<{}>({ targetUserId, isAdmin }, formatPath('/im/groups/:groupId/admins', { groupId }))
}

export function transferGroup(groupId: string, targetUserId: string) {
  return post<ImGroup>({ targetUserId }, formatPath('/im/groups/:groupId/transfer', { groupId }))
}

export function dissolveGroup(groupId: string) {
  return post<{}>({}, formatPath('/im/groups/:groupId/dissolve', { groupId }))
}

export default {
  createGroup, listGroups, getGroup, updateGroup, joinGroup, leaveGroup,
  groupMembers, muteGroupMember, kickGroupMember, setGroupAdmin, transferGroup, dissolveGroup
}
