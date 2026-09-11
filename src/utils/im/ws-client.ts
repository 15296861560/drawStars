/**
 * IM WebSocket 客户端单例
 * - 状态机：IDLE/CONNECTING/CONNECTED/RECONNECTING/DISCONNECTED
 * - 指数退避重连（1s 起 / 上限 30s / 最多 10 次）
 * - 心跳 25s（PONG 超时 90s 视为掉线）
 * - 订阅/退订会话；重连后自动重订阅并触发 resync
 * - 多 Tab 互踢（IM_TAB_TAKEOVER）→ 断开并通知
 * - Mock 模式（VITE_IM_MOCK=true）委托给 mockGateway，不打开真实连接
 */
import { ref } from 'vue'
import { WsState } from '@/api/im/types'
import { authApi } from '@/api/im'
import {
  parseEnvelope,
  buildEnvelope,
  type WsEnvelope,
  type WsIncoming
} from './protocol'
import { mockGateway } from './mock-gateway'

type Handler = (env: WsEnvelope) => void

const HEARTBEAT_MS = 25000
const RECONNECT_BASE_MS = 1000
const RECONNECT_MAX_MS = 30000
const MAX_RETRIES = 10

function defaultWsUrl(): string {
  const env = import.meta.env.VITE_IM_WS_URL as string | undefined
  if (env) return env
  const proto = globalThis.location?.protocol === 'https:' ? 'wss' : 'ws'
  const host = globalThis.location?.host || '127.0.0.1:8041'
  return `${proto}://${host}/im/ws`
}

class ImWsClient {
  private ws: WebSocket | null = null
  private state = ref<WsState>(WsState.IDLE)
  private handlers = new Map<string, Set<Handler>>()
  private subscriptions = new Set<string>()
  private roomPresence = new Set<string>()
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private retries = 0
  private manualClose = false
  private wsUrl = defaultWsUrl()
  private isMock = String(import.meta.env.VITE_IM_MOCK) === 'true'

  readonly stateRef = this.state

  get getState() {
    return this.state.value
  }

  on(event: string, handler: Handler): () => void {
    let set = this.handlers.get(event)
    if (!set) {
      set = new Set()
      this.handlers.set(event, set)
    }
    set.add(handler)
    return () => this.off(event, handler)
  }

  off(event: string, handler: Handler) {
    this.handlers.get(event)?.delete(handler)
  }

  private dispatch(env: WsEnvelope) {
    // 通配
    this.handlers.get('*')?.forEach(h => h(env))
    this.handlers.get(env.event)?.forEach(h => h(env))
  }

  async connect(): Promise<void> {
    if (
      this.state.value === WsState.CONNECTING ||
      this.state.value === WsState.CONNECTED
    )
      return
    this.manualClose = false
    if (this.isMock) {
      this.setState(WsState.CONNECTING)
      mockGateway.attach(env => this.dispatch(env))
      this.setState(WsState.CONNECTED)
      this.resubscribe()
      return
    }
    this.setState(WsState.CONNECTING)
    try {
      const ticketRes = await authApi.issueWsTicket()
      if (!ticketRes.status || !ticketRes.data?.ticket) {
        throw new Error(ticketRes.msg || '获取 WS Ticket 失败')
      }
      const url = `${this.wsUrl}?ticket=${encodeURIComponent(ticketRes.data.ticket)}`
      this.openSocket(url)
    } catch (e) {
      this.setState(WsState.RECONNECTING)
      this.scheduleReconnect()
    }
  }

  private openSocket(url: string) {
    try {
      this.ws = new WebSocket(url)
    } catch {
      this.scheduleReconnect()
      return
    }
    this.ws.onopen = () => {
      this.retries = 0
      this.setState(WsState.CONNECTED)
      this.startHeartbeat()
      this.resubscribe()
      // 重连后通知上层补洞
      this.dispatch(buildEnvelope('RESYNC', { ts: Date.now() }))
    }
    this.ws.onmessage = ev => this.onMessage(ev)
    this.ws.onclose = () => this.onClose()
    this.ws.onerror = () => {
      // 错误一般伴随 close，交给 onClose 处理
    }
  }

  private onMessage(ev: MessageEvent) {
    const env = parseEnvelope(typeof ev.data === 'string' ? ev.data : '')
    if (!env) return
    // 互踢：收到后立即断开
    if (env.event === 'IM_TAB_TAKEOVER') {
      this.manualClose = true
      this.dispatch(env)
      this.cleanupSocket()
      this.setState(WsState.DISCONNECTED)
      return
    }
    this.dispatch(env)
  }

  private onClose() {
    this.cleanupSocket()
    if (this.manualClose) {
      this.setState(WsState.DISCONNECTED)
      return
    }
    this.setState(WsState.RECONNECTING)
    this.scheduleReconnect()
  }

  private scheduleReconnect() {
    if (this.retries >= MAX_RETRIES) {
      // 降级：停止重连，通知上层走 REST 轮询
      this.setState(WsState.DISCONNECTED)
      this.dispatch(buildEnvelope('WS_DEGRADED', { reason: 'max_retries' }))
      return
    }
    const delay = Math.min(
      RECONNECT_BASE_MS * 2 ** this.retries,
      RECONNECT_MAX_MS
    )
    this.retries += 1
    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(
      () => this.send({ type: 'PING' }),
      HEARTBEAT_MS
    )
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private cleanupSocket() {
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.onopen = null
      this.ws.onmessage = null
      this.ws.onclose = null
      this.ws.onerror = null
      try {
        this.ws.close()
      } catch {
        /* ignore */
      }
      this.ws = null
    }
  }

  private setState(s: WsState) {
    this.state.value = s
    this.dispatch(buildEnvelope('STATE', { state: s }))
  }

  private resubscribe() {
    for (const convId of this.subscriptions) {
      this.send({ type: 'SUBSCRIBE', conversationId: convId })
    }
    for (const roomId of this.roomPresence) {
      this.send({ type: 'ROOM_PRESENCE', roomId })
    }
  }

  subscribe(conversationId: string) {
    this.subscriptions.add(conversationId)
    if (this.state.value === WsState.CONNECTED) {
      this.send({ type: 'SUBSCRIBE', conversationId })
    }
  }

  unsubscribe(conversationId: string) {
    this.subscriptions.delete(conversationId)
    if (this.state.value === WsState.CONNECTED) {
      this.send({ type: 'UNSUBSCRIBE', conversationId })
    }
  }

  sendRead(conversationId: string, seq: number) {
    if (this.state.value === WsState.CONNECTED) {
      this.send({ type: 'READ', conversationId, seq })
    }
  }

  enterRoom(roomId: string) {
    this.roomPresence.add(roomId)
    if (this.state.value === WsState.CONNECTED) {
      this.send({ type: 'ROOM_PRESENCE', roomId })
    }
  }

  leaveRoom(roomId: string) {
    this.roomPresence.delete(roomId)
  }

  private send(cmd: WsIncoming) {
    if (this.isMock) {
      mockGateway.handleIncoming(cmd)
      return
    }
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    try {
      this.ws.send(JSON.stringify(cmd))
    } catch {
      /* ignore */
    }
  }

  disconnect() {
    this.manualClose = true
    this.cleanupSocket()
    this.subscriptions.clear()
    this.roomPresence.clear()
    this.setState(WsState.DISCONNECTED)
    if (this.isMock) mockGateway.detach()
  }
}

export const imWsClient = new ImWsClient()
export default imWsClient
