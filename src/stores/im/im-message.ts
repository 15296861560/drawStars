/**
 * 消息 store — 每会话消息缓存 + 发送状态机 + 撤回/删除/已读回执处理
 */
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { messageApi, conversationApi } from '@/api/im'
import { MsgStatus, MsgType, type ImMessage } from '@/api/im/types'
import type { AckEventData, MessageEventData, ReadEventData } from '@/utils/im/protocol'
import { userInfoStore } from '@/stores/user-info'

function genClientMsgId(): string {
  return `c${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const imMessageStore = defineStore('im-message', () => {
  /** conversationId -> 消息列表（按 seq 升序） */
  const cache = ref<Record<string, ImMessage[]>>({})
  const maxSeq = ref<Record<string, number>>({})
  const loadingHistory = ref<Record<string, boolean>>({})
  const hasMore = ref<Record<string, boolean>>({})

  function getMessages(conversationId: string): ImMessage[] {
    return cache.value[conversationId] || []
  }

  function ensureArr(conversationId: string): ImMessage[] {
    if (!cache.value[conversationId]) cache.value[conversationId] = []
    return cache.value[conversationId]
  }

  function selfUid(): string {
    try {
      return String(userInfoStore().getUserId || '0')
    } catch {
      return '0'
    }
  }

  /** 拉取历史消息（向前翻页） */
  async function loadHistory(conversationId: string, limit = 20) {
    if (loadingHistory.value[conversationId]) return
    loadingHistory.value[conversationId] = true
    try {
      const beforeSeq = maxSeq.value[conversationId]
      const res = await conversationApi.listMessages(conversationId, beforeSeq, limit)
      if (!res.status || !res.data) return
      const arr = ensureArr(conversationId)
      const incoming = res.data.list || []
      // 去重合并，按 seq 升序
      const map = new Map<number, ImMessage>()
      for (const m of incoming) map.set(m.seq, m)
      for (const m of arr) if (!map.has(m.seq)) map.set(m.seq, m)
      const merged = [...map.values()].sort((a, b) => a.seq - b.seq)
      cache.value[conversationId] = merged
      hasMore.value[conversationId] = res.data.hasMore !== false && incoming.length >= limit
      if (incoming.length) {
        const minSeq = Math.min(...incoming.map(m => m.seq))
        if (!maxSeq.value[conversationId] || minSeq < maxSeq.value[conversationId]) {
          // 历史向前加载不影响 maxSeq
        }
        const maxIncoming = Math.max(...incoming.map(m => m.seq), ...arr.map(m => m.seq))
        maxSeq.value[conversationId] = Math.max(maxSeq.value[conversationId] || 0, maxIncoming)
      }
    } finally {
      loadingHistory.value[conversationId] = false
    }
  }

  /** 增量同步（补洞） */
  async function sync(conversationId: string) {
    const after = maxSeq.value[conversationId] || 0
    const res = await conversationApi.syncMessages(conversationId, after, 100)
    if (!res.status || !res.data) return
    const arr = ensureArr(conversationId)
    const exist = new Set(arr.map(m => m.seq))
    for (const m of res.data.list || []) {
      if (!exist.has(m.seq)) arr.push(m)
    }
    arr.sort((a, b) => a.seq - b.seq)
    cache.value[conversationId] = [...arr]
    if (arr.length) maxSeq.value[conversationId] = Math.max(...arr.map(m => m.seq))
  }

  /** 乐观插入一条 SENDING 消息 */
  function insertPending(conversationId: string, clientMsgId: string, content: Record<string, unknown>, msgType: MsgType): ImMessage {
    const arr = ensureArr(conversationId)
    const localSeq = -Date.now()
    const msg: ImMessage = {
      msgId: '',
      clientMsgId,
      conversationId,
      senderId: selfUid(),
      msgType,
      content,
      seq: localSeq,
      status: MsgStatus.SENDING,
      serverTime: String(Date.now())
    }
    arr.push(msg)
    cache.value[conversationId] = [...arr]
    return msg
  }

  /** ACK 回来后更新本地 pending 状态 */
  function applyAck(ack: AckEventData) {
    if (!ack.clientMsgId) return
    for (const convId of Object.keys(cache.value)) {
      const arr = cache.value[convId]
      const idx = arr.findIndex(m => m.clientMsgId === ack.clientMsgId && m.status === MsgStatus.SENDING)
      if (idx >= 0) {
        if (ack.status === 'SUCCESS') {
          arr[idx] = {
            ...arr[idx],
            msgId: ack.msgId || arr[idx].msgId,
            seq: ack.seq || arr[idx].seq,
            serverTime: ack.serverTime || arr[idx].serverTime,
            status: MsgStatus.NORMAL,
            conversationId: convId
          }
        } else {
          arr[idx] = { ...arr[idx], status: MsgStatus.DELETED }
        }
        cache.value[convId] = [...arr]
        if (ack.seq) maxSeq.value[convId] = Math.max(maxSeq.value[convId] || 0, ack.seq)
        return
      }
    }
  }

  /** 收到 MESSAGE 推送（去重 by msgId/seq） */
  function appendRemote(event: MessageEventData) {
    const convId = event.conversationId
    const arr = ensureArr(convId)
    if (arr.some(m => m.msgId === event.msgId || (event.seq > 0 && m.seq === event.seq))) {
      // 已存在，更新状态
      const idx = arr.findIndex(m => m.msgId === event.msgId || (event.seq > 0 && m.seq === event.seq))
      if (idx >= 0) arr[idx] = { ...arr[idx], ...event } as ImMessage
      cache.value[convId] = [...arr]
      return
    }
    const msg: ImMessage = {
      msgId: event.msgId,
      clientMsgId: event.clientMsgId,
      conversationId: convId,
      senderId: event.senderId,
      msgType: event.msgType as MsgType,
      content: event.content,
      seq: event.seq,
      status: event.status as MsgStatus,
      serverTime: event.serverTime,
      atUserIds: event.atUserIds,
      atAll: event.atAll
    }
    arr.push(msg)
    arr.sort((a, b) => a.seq - b.seq)
    cache.value[convId] = [...arr]
    if (event.seq) maxSeq.value[convId] = Math.max(maxSeq.value[convId] || 0, event.seq)
  }

  /** 对方已读回执 */
  function applyRead(event: ReadEventData) {
    // 仅用于展示已读状态，暂不细化
  }

  async function recallMessage(msgId: string) {
    const res = await messageApi.recallMessage(msgId)
    if (res.status) {
      for (const convId of Object.keys(cache.value)) {
        const idx = cache.value[convId].findIndex(m => m.msgId === msgId)
        if (idx >= 0) {
          cache.value[convId][idx] = { ...cache.value[convId][idx], status: MsgStatus.RECALLED }
          cache.value[convId] = [...cache.value[convId]]
          break
        }
      }
    }
    return res
  }

  function applyRecall(msgId: string) {
    for (const convId of Object.keys(cache.value)) {
      const idx = cache.value[convId].findIndex(m => m.msgId === msgId)
      if (idx >= 0) {
        cache.value[convId][idx] = { ...cache.value[convId][idx], status: MsgStatus.RECALLED }
        cache.value[convId] = [...cache.value[convId]]
        return
      }
    }
  }

  async function deleteForMe(msgId: string) {
    const res = await messageApi.deleteMessageForMe(msgId)
    if (res.status) {
      for (const convId of Object.keys(cache.value)) {
        cache.value[convId] = cache.value[convId].filter(m => m.msgId !== msgId)
      }
    }
    return res
  }

  /** 发送文本消息（REST 先写后推） */
  async function sendText(conversationId: string, text: string, options: { atUserIds?: string[]; atAll?: boolean } = {}) {
    const clientMsgId = genClientMsgId()
    insertPending(conversationId, clientMsgId, { text }, MsgType.TEXT)
    const res = await messageApi.sendMessage({
      clientMsgId,
      msgType: MsgType.TEXT,
      content: { text },
      conversationId,
      atUserIds: options.atUserIds,
      atAll: options.atAll
    })
    if (res.status && res.data) {
      applyAck({ clientMsgId, msgId: res.data.msgId, seq: res.data.seq, serverTime: res.data.serverTime, status: 'SUCCESS' })
    } else {
      applyAck({ clientMsgId, status: 'FAILED', error: res.msg })
    }
    return res
  }

  async function sendImage(conversationId: string, url: string, width?: number, height?: number) {
    const clientMsgId = genClientMsgId()
    const content: Record<string, unknown> = { url, width, height }
    insertPending(conversationId, clientMsgId, content, MsgType.IMAGE)
    const res = await messageApi.sendMessage({ clientMsgId, msgType: MsgType.IMAGE, content, conversationId })
    if (res.status && res.data) {
      applyAck({ clientMsgId, msgId: res.data.msgId, seq: res.data.seq, serverTime: res.data.serverTime, status: 'SUCCESS' })
    } else {
      applyAck({ clientMsgId, status: 'FAILED', error: res.msg })
    }
    return res
  }

  function clearConversation(conversationId: string) {
    delete cache.value[conversationId]
    delete maxSeq.value[conversationId]
    delete loadingHistory.value[conversationId]
    delete hasMore.value[conversationId]
  }

  function clearAll() {
    cache.value = {}
    maxSeq.value = {}
    loadingHistory.value = {}
    hasMore.value = {}
  }

  return {
    cache, maxSeq, loadingHistory, hasMore,
    getMessages, loadHistory, sync, insertPending, applyAck, appendRemote, applyRead,
    recallMessage, applyRecall, deleteForMe, sendText, sendImage, clearConversation, clearAll
  }
})
