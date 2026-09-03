/**
 * IM 管理端 API — 举报处置 / 消息检索 / 数据看板 / 房间封禁加权 / 配置 / 分类 / 敏感词
 * 路由前缀：/manage/im  （后端 @RequirePermissions 鉴权）
 */
import { post, get, put, formatPath } from './base'
import type { PageResult, ReportStatus } from './types'

export function adminReports(params: { status?: string; curPage?: number; pageSize?: number } = {}) {
  return get<PageResult<{ id: string; reporterId: string; targetType: string; targetId: string; reason: string; status: string; remark?: string; handledBy?: string; createdAt: string }>>(
    { status: params.status || '', curPage: params.curPage || 1, pageSize: params.pageSize || 20 },
    '/manage/im/reports'
  )
}

export function handleReport(id: string, status: ReportStatus, remark?: string) {
  return put<{}>(formatPath('/manage/im/reports/:id', { id }), { status, remark })
}

export function searchMessages(params: {
  roomId?: string
  conversationId?: string
  keyword?: string
  startTime?: string
  endTime?: string
  curPage?: number
  pageSize?: number
} = {}) {
  return get<PageResult<Record<string, unknown>>>(
    {
      roomId: params.roomId || '',
      conversationId: params.conversationId || '',
      keyword: params.keyword || '',
      startTime: params.startTime || '',
      endTime: params.endTime || '',
      curPage: params.curPage || 1,
      pageSize: params.pageSize || 20
    },
    '/manage/im/messages/search'
  )
}

export function analyticsOverview() {
  return get<Record<string, number>>({}, '/manage/im/analytics/overview')
}

export function analyticsTrends(days = 7) {
  return get<{ list: Array<{ date: string; count: number }> }>({ days }, '/manage/im/analytics/trends')
}

export function analyticsRooms() {
  return get<{ list: Array<Record<string, unknown>> }>({}, '/manage/im/analytics/rooms')
}

export function banRoom(roomId: string, banned: boolean) {
  return post<{}>({ banned }, formatPath('/manage/im/rooms/:roomId/ban', { roomId }))
}

export function setRoomWeight(roomId: string, data: { manualWeight?: number; official?: boolean }) {
  return post<{}>(data as unknown as Record<string, unknown>, formatPath('/manage/im/rooms/:roomId/weight', { roomId }))
}

export function getSettings() {
  return get<Record<string, string>>({}, '/manage/im/settings')
}

export function updateSettings(items: Record<string, string>) {
  return put<unknown>('/manage/im/settings', items)
}

export function listCategories() {
  return get<Array<{ id: string; code: string; name: string; sort: number; status: string }>>({}, '/manage/im/categories')
}

export function createCategory(code: string, name: string, sort?: number) {
  return post<{}>({ code, name, sort: sort || 0 }, '/manage/im/categories')
}

export function listSensitiveWords() {
  return get<Array<{ id: string; word: string; action: string; createdAt: string }>>({}, '/manage/im/sensitive-words')
}

export function addSensitiveWord(word: string, action = 'BLOCK') {
  return post<{}>({ word, action }, '/manage/im/sensitive-words')
}

export function reloadSensitiveWords() {
  return post<{}>({}, '/manage/im/sensitive-words/reload')
}

export default {
  adminReports, handleReport, searchMessages, analyticsOverview, analyticsTrends, analyticsRooms,
  banRoom, setRoomWeight, getSettings, updateSettings, listCategories, createCategory,
  listSensitiveWords, addSensitiveWord, reloadSensitiveWords
}
