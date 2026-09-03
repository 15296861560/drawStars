/**
 * 举报 API — 用户发起举报
 * 路由前缀：/im/reports
 */
import { post } from './base'

export function createReport(targetType: string, targetId: string, reason: string) {
  return post<{ id: string }>({ targetType, targetId, reason }, '/im/reports')
}

export default { createReport }
