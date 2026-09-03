/**
 * 消息 API — 发送 / 撤回 / 删除（仅自己）/ 转发
 * 路由前缀：/im/messages
 */
import { post, formatPath } from './base'
import type { SendResult, SendMessagePayload, SendTarget } from './types'

export function sendMessage(payload: SendMessagePayload) {
  return post<SendResult>(payload as unknown as Record<string, unknown>, '/im/messages/send')
}

export function recallMessage(msgId: string) {
  return post<{}>({}, formatPath('/im/messages/:msgId/recall', { msgId }))
}

export function deleteMessageForMe(msgId: string) {
  return post<{}>({}, formatPath('/im/messages/:msgId/delete', { msgId }))
}

export function forwardMessage(msgId: string, target: SendTarget) {
  return post<SendResult>(
    { target },
    formatPath('/im/messages/:msgId/forward', { msgId })
  )
}

export default { sendMessage, recallMessage, deleteMessageForMe, forwardMessage }
