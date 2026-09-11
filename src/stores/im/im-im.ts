/**
 * IM 根协调 store — 统一 WS + REST，全局事件总线
 * 将下行 WS 事件分发到各子 store；对外暴露高层业务动作
 */
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { WsEvent, MsgStatus } from '@/api/im/types'
import imWsClient from '@/utils/im/ws-client'
import { imAuthStore } from './im-auth'
import { imConversationStore } from './im-conversation'
import { imMessageStore } from './im-message'
import { imPresenceStore } from './im-presence'
import { mockGateway } from '@/utils/im/mock-gateway'
import type { WsEnvelope } from '@/utils/im/protocol'
import type {
  MessageEventData,
  AckEventData,
  ReadEventData,
  MemberEventData
} from '@/utils/im/protocol'
import { userInfoStore } from '@/stores/user-info'

export const imStore = defineStore('im', () => {
  const initialized = ref(false)
  const unsubscribers: Array<() => void> = []

  function selfUid(): string {
    try {
      return String(userInfoStore().getUserId || '0')
    } catch {
      return '0'
    }
  }

  function init() {
    if (initialized.value) return
    initialized.value = true
    bindEvents()
    // 站点已登录态下连接 IM WS
    if (userInfoStore().getToken.value) {
      imAuthStore()
        .connect()
        .catch(() => {})
    }
  }

  function bindEvents() {
    unsubscribers.push(
      imWsClient.on(WsEvent.MESSAGE, onMessage),
      imWsClient.on(WsEvent.ACK, onAck),
      imWsClient.on(WsEvent.RECALL, onRecall),
      imWsClient.on(WsEvent.READ, onRead),
      imWsClient.on(WsEvent.MEMBER_JOIN, onMemberJoin),
      imWsClient.on(WsEvent.MEMBER_LEAVE, onMemberLeave),
      imWsClient.on('RESYNC', onResync),
      imWsClient.on(WsEvent.IM_TAB_TAKEOVER, onTakeover)
    )
  }

  function onMessage(env: WsEnvelope) {
    const data = env.data as MessageEventData
    const msg = imMessageStore()
    const conv = imConversationStore()
    const isSelf = String(data.senderId) === selfUid()
    msg.appendRemote(data)
    conv.onMessage(data.conversationId, data.seq, data.serverTime, isSelf)
    if (!isSelf && data.status !== MsgStatus.RECALLED) {
      // 离线/站内通知兜底由后端 notify 表写入；前端仅维持未读角标
    }
  }

  function onAck(env: WsEnvelope) {
    imMessageStore().applyAck(env.data as AckEventData)
  }

  function onRecall(env: WsEnvelope) {
    const data = env.data as { msgId: string }
    imMessageStore().applyRecall(data.msgId)
  }

  function onRead(env: WsEnvelope) {
    imMessageStore().applyRead(env.data as ReadEventData)
  }

  function onMemberJoin(env: WsEnvelope) {
    const data = env.data as MemberEventData
    if (data.userId) imPresenceStore().setOnline(data.userId, true)
  }

  function onMemberLeave(env: WsEnvelope) {
    const data = env.data as MemberEventData
    if (data.userId) imPresenceStore().setOnline(data.userId, false)
  }

  function onResync() {
    const conv = imConversationStore()
    const msg = imMessageStore()
    for (const c of conv.list) {
      msg.sync(c.id).catch(() => {})
    }
  }

  function onTakeover() {
    // 多 Tab 互踢：通知用户当前会话已被新 Tab 接管
    // 视图层可通过 imAuthStore.degraded / wsState 展示横幅
  }

  /** 打开会话：订阅 + 拉历史 + 清未读 */
  async function openConversation(conversationId: string) {
    const conv = imConversationStore()
    const msg = imMessageStore()
    conv.setActive(conversationId)
    imWsClient.subscribe(conversationId)
    await msg.loadHistory(conversationId)
    const max = msg.maxSeq[conversationId] || 0
    if (max > 0) {
      await conv.markRead(conversationId, max)
      imWsClient.sendRead(conversationId, max)
    }
  }

  function closeConversation(conversationId: string) {
    imWsClient.unsubscribe(conversationId)
    imConversationStore().setActive('')
  }

  function mockInjectRemote(
    conversationId: string,
    senderId: string,
    text: string
  ) {
    mockGateway.injectRemoteMessage(conversationId, senderId, text)
  }

  function destroy() {
    for (const u of unsubscribers) u()
    unsubscribers.length = 0
    imWsClient.disconnect()
    initialized.value = false
  }

  return {
    initialized,
    init,
    destroy,
    openConversation,
    closeConversation,
    mockInjectRemote
  }
})
