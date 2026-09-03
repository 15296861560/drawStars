/**
 * 聊天室 API — 创建 / 详情 / 更新 / 发布 / 进出房 / 成员 / 禁言 / 踢人 / 管理员 / 转让 / 关闭 / 在线态
 * 路由前缀：/im/rooms
 */
import { post, get, formatPath } from './base'
import type { ImRoom } from './types'

export type MuteDuration = '10min' | '1h' | 'permanent'

export function createRoom(data: Record<string, unknown>) {
  return post<ImRoom>(data, '/im/rooms')
}

export function getRoom(roomId: string) {
  return get<ImRoom>({}, formatPath('/im/rooms/:roomId', { roomId }))
}

export function updateRoom(roomId: string, data: Record<string, unknown>) {
  return post<ImRoom>(data, formatPath('/im/rooms/:roomId', { roomId }))
}

export function publishRoom(roomId: string) {
  return post<ImRoom>({}, formatPath('/im/rooms/:roomId/publish', { roomId }))
}

export function joinRoom(roomId: string) {
  return post<{ status: string; conversationId?: string }>({}, formatPath('/im/rooms/:roomId/join', { roomId }))
}

export function leaveRoom(roomId: string) {
  return post<{}>({}, formatPath('/im/rooms/:roomId/leave', { roomId }))
}

export function roomMembers(roomId: string) {
  return get<{ list: Array<Record<string, unknown>> }>({}, formatPath('/im/rooms/:roomId/members', { roomId }))
}

export function muteRoomMember(roomId: string, targetUserId: string, duration: MuteDuration) {
  return post<{}>({ targetUserId, duration }, formatPath('/im/rooms/:roomId/mute', { roomId }))
}

export function kickRoomMember(roomId: string, targetUserId: string) {
  return post<{}>({ targetUserId }, formatPath('/im/rooms/:roomId/kick', { roomId }))
}

export function setRoomAdmin(roomId: string, targetUserId: string, isAdmin: boolean) {
  return post<{}>({ targetUserId, isAdmin }, formatPath('/im/rooms/:roomId/admins', { roomId }))
}

export function transferRoom(roomId: string, targetUserId: string) {
  return post<ImRoom>({ targetUserId }, formatPath('/im/rooms/:roomId/transfer', { roomId }))
}

export function closeRoom(roomId: string) {
  return post<ImRoom>({}, formatPath('/im/rooms/:roomId/close', { roomId }))
}

export function roomPresence(roomId: string) {
  return post<{ onlineCount: number }>({}, formatPath('/im/rooms/:roomId/presence', { roomId }))
}

export default {
  createRoom, getRoom, updateRoom, publishRoom, joinRoom, leaveRoom,
  roomMembers, muteRoomMember, kickRoomMember, setRoomAdmin, transferRoom, closeRoom, roomPresence
}
