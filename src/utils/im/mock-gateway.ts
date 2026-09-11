/**
 * IM Mock 网关 — VITE_IM_MOCK=true 时使用
 * 内存模拟后端 WS 行为，仍遵守「先写后推」：先将消息落库到内存，再推送 MESSAGE + ACK
 * 用于无后端联调 UI 与交互。
 */
import { userInfoStore } from '@/stores/user-info'
import { MsgStatus, MsgType, WsEvent } from '@/api/im/types'
import {
  buildEnvelope,
  type WsEnvelope,
  type WsIncoming,
  type MessageEventData,
  type AckEventData
} from './protocol'

type Emit = (env: WsEnvelope) => void

class MockGateway {
  private emit: Emit | null = null
  private convMessages = new Map<string, MessageEventData[]>()
  private convMaxSeq = new Map<string, number>()
  private subscribed = new Set<string>()

  attach(emit: Emit) {
    this.emit = emit
  }

  detach() {
    this.emit = null
    this.subscribed.clear()
  }

  private uid(): string {
    try {
      return String(userInfoStore().getUserId || 'mock-self')
    } catch {
      return 'mock-self'
    }
  }

  handleIncoming(cmd: WsIncoming) {
    if (!this.emit) return
    switch (cmd.type) {
      case 'PING':
        this.emit(buildEnvelope(WsEvent.PONG, { ts: Date.now() }))
        break
      case 'SUBSCRIBE':
        this.subscribed.add(cmd.conversationId)
        // 模拟服务端补推该会话未读
        this.emit(
          buildEnvelope('SUBSCRIBED', { conversationId: cmd.conversationId })
        )
        break
      case 'UNSUBSCRIBE':
        this.subscribed.delete(cmd.conversationId)
        break
      case 'READ':
        this.emit(
          buildEnvelope(WsEvent.READ, {
            conversationId: cmd.conversationId,
            userId: this.uid(),
            seq: cmd.seq
          })
        )
        break
      case 'ROOM_PRESENCE':
        this.emit(
          buildEnvelope(WsEvent.MEMBER_JOIN, {
            roomId: cmd.roomId,
            userId: this.uid()
          })
        )
        break
      case 'SEND':
        this.handleSend(cmd)
        break
    }
  }

  /** 先写后推：分配 seq → 落内存 → 推 MESSAGE + ACK */
  private handleSend(cmd: Extract<WsIncoming, { type: 'SEND' }>) {
    if (!this.emit) return
    const convId =
      cmd.conversationId ||
      `mock-${cmd.target?.convType || 'c2c'}-${cmd.target?.bizId || 'x'}`
    const seq = (this.convMaxSeq.get(convId) || 0) + 1
    this.convMaxSeq.set(convId, seq)
    const msgId = `mock-msg-${Date.now()}-${seq}`
    const now = BigInt(Date.now()).toString()
    const msg: MessageEventData = {
      conversationId: convId,
      msgId,
      clientMsgId: cmd.clientMsgId,
      senderId: this.uid(),
      msgType: cmd.msgType,
      content: cmd.content,
      seq,
      status: MsgStatus.NORMAL,
      serverTime: now,
      atUserIds: cmd.atUserIds,
      atAll: cmd.atAll
    }
    const list = this.convMessages.get(convId) || []
    list.push(msg)
    this.convMessages.set(convId, list)
    // ACK 先行
    const ack: AckEventData = {
      clientMsgId: cmd.clientMsgId,
      msgId,
      seq,
      serverTime: now,
      status: 'SUCCESS'
    }
    this.emit(buildEnvelope(WsEvent.ACK, ack))
    // 再推 MESSAGE
    this.emit(buildEnvelope(WsEvent.MESSAGE, msg))
  }

  /** 读取某会话内存消息（供 store 初始化/mock 拉历史） */
  getMessages(conversationId: string): MessageEventData[] {
    return this.convMessages.get(conversationId) || []
  }

  /** 模拟对端发来一条消息（便于调试接收 UI） */
  injectRemoteMessage(conversationId: string, senderId: string, text: string) {
    if (!this.emit) return
    const seq = (this.convMaxSeq.get(conversationId) || 0) + 1
    this.convMaxSeq.set(conversationId, seq)
    const msg: MessageEventData = {
      conversationId,
      msgId: `mock-remote-${Date.now()}-${seq}`,
      senderId,
      msgType: MsgType.TEXT,
      content: { text },
      seq,
      status: MsgStatus.NORMAL,
      serverTime: BigInt(Date.now()).toString()
    }
    const list = this.convMessages.get(conversationId) || []
    list.push(msg)
    this.convMessages.set(conversationId, list)
    this.emit(buildEnvelope(WsEvent.MESSAGE, msg))
  }
}

export const mockGateway = new MockGateway()
export default mockGateway
