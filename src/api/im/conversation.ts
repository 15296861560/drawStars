/**
 * 会话 API — 会话列表 / 历史消息 / 同步 / 已读 / 置顶 / 免打扰 / 草稿 / 删除
 * 路由前缀：/im/conversations
 */
import { post, get, formatPath } from './base'
import type { ImConversation, ImMessage, PageResult } from './types'

export function listConversations(curPage = 1, pageSize = 50) {
  return get<PageResult<ImConversation>>({ curPage, pageSize }, '/im/conversations')
}

/** 拉取历史消息（分页：beforeSeq 之前 limit 条） */
export function listMessages(conversationId: string, beforeSeq?: number, limit = 20) {
  return get<{ list: ImMessage[]; hasMore: boolean }>(
    { beforeSeq, limit },
    formatPath('/im/conversations/:id/messages', { id: conversationId })
  )
}

/** 增量同步消息（afterSeq 之后 limit 条） */
export function syncMessages(conversationId: string, afterSeq: number, limit = 50) {
  return get<{ list: ImMessage[] }>(
    { afterSeq, limit },
    formatPath('/im/conversations/:id/messages/sync', { id: conversationId })
  )
}

export function markRead(conversationId: string, seq: number) {
  return post<{ unreadCount: number }>({ seq }, formatPath('/im/conversations/:id/read', { id: conversationId }))
}

export function pinConversation(conversationId: string, pinned: boolean) {
  return post<ImConversation>({ pinned }, formatPath('/im/conversations/:id/pin', { id: conversationId }))
}

export function muteConversation(conversationId: string, muted: boolean) {
  return post<ImConversation>({ muted }, formatPath('/im/conversations/:id/mute', { id: conversationId }))
}

export function saveDraft(conversationId: string, draft: string) {
  return post<ImConversation>({ draft }, formatPath('/im/conversations/:id/draft', { id: conversationId }))
}

export function deleteConversation(conversationId: string) {
  return post<{}>({}, formatPath('/im/conversations/:id/delete', { id: conversationId }))
}

export default {
  listConversations,
  listMessages,
  syncMessages,
  markRead,
  pinConversation,
  muteConversation,
  saveDraft,
  deleteConversation
}
