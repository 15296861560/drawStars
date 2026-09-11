/**
 * IM WebSocket 协议层 — 上行/下行信封类型与构造器
 * 对齐后端 gateway/im-ws.gateway.ts
 */
import { WsEvent } from '@/api/im/types'

/** 下行统一信封 */
export interface WsEnvelope<T = unknown> {
  event: WsEvent | string
  requestId?: string
  ts: number
  data: T
}

/** 上行指令 */
export type WsIncoming =
  | { type: 'PING' }
  | { type: 'SUBSCRIBE'; conversationId: string }
  | { type: 'UNSUBSCRIBE'; conversationId: string }
  | { type: 'READ'; conversationId: string; seq: number }
  | { type: 'ROOM_PRESENCE'; roomId: string }
  | {
      type: 'SEND'
      clientMsgId: string
      conversationId?: string
      target?: { convType: string; bizId: string }
      msgType: string
      content: Record<string, unknown>
      atUserIds?: string[]
      atAll?: boolean
    }

/** MESSAGE 事件 data */
export interface MessageEventData {
  conversationId: string
  msgId: string
  clientMsgId?: string
  senderId: string
  msgType: string
  content: Record<string, unknown>
  seq: number
  status: string
  serverTime: string
  atUserIds?: string[]
  atAll?: boolean
}

/** ACK 事件 data */
export interface AckEventData {
  clientMsgId: string
  msgId?: string
  seq?: number
  serverTime?: string
  status: string
  error?: string
}

/** READ 事件 data（对方已读回执） */
export interface ReadEventData {
  conversationId: string
  userId: string
  seq: number
}

/** ROOM_UPDATE / 等通用成员事件 */
export interface MemberEventData {
  conversationId?: string
  roomId?: string
  userId: string
  role?: string
}

export function buildEnvelope<T>(
  event: WsEvent | string,
  data: T,
  requestId?: string
): WsEnvelope<T> {
  return { event, requestId, ts: Date.now(), data }
}

export function parseEnvelope(raw: string): WsEnvelope | null {
  try {
    const obj = JSON.parse(raw)
    if (obj && typeof obj.event === 'string') return obj as WsEnvelope
    return null
  } catch {
    return null
  }
}
