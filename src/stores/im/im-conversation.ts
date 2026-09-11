/**
 * 会话 store — 列表 / 未读 / 置顶 / 免打扰 / 草稿
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { conversationApi } from '@/api/im'
import type { ImConversation } from '@/api/im/types'

export const imConversationStore = defineStore('im-conversation', () => {
  const list = ref<ImConversation[]>([])
  const loading = ref(false)
  const activeId = ref<string>('')
  const draftMap = ref<Record<string, string>>({})

  const sortedList = computed(() => {
    return [...list.value].sort((a, b) => {
      if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1
      return Number(b.lastMsgTime || 0) - Number(a.lastMsgTime || 0)
    })
  })
  const totalUnread = computed(() =>
    list.value.reduce((s, c) => s + (c.unreadCount || 0), 0)
  )
  const activeConversation = computed(() =>
    list.value.find(c => c.id === activeId.value)
  )

  async function fetchList() {
    loading.value = true
    try {
      const res = await conversationApi.listConversations(1, 100)
      if (res.status && res.data?.list) {
        list.value = res.data.list
      }
      return list.value
    } finally {
      loading.value = false
    }
  }

  function setActive(id: string) {
    activeId.value = id
  }

  function upsert(conv: Partial<ImConversation> & { id: string }) {
    const idx = list.value.findIndex(c => c.id === conv.id)
    if (idx >= 0) {
      list.value[idx] = { ...list.value[idx], ...conv }
    } else {
      list.value.unshift({
        convType: conv.convType!,
        bizId: conv.bizId || '',
        ...conv
      } as ImConversation)
    }
  }

  function patch(id: string, patch: Partial<ImConversation>) {
    const idx = list.value.findIndex(c => c.id === id)
    if (idx >= 0) list.value[idx] = { ...list.value[idx], ...patch }
  }

  /** 收到新消息时更新会话最后消息与未读 */
  function onMessage(
    conversationId: string,
    seq: number,
    serverTime: string,
    isSelf: boolean
  ) {
    const conv = list.value.find(c => c.id === conversationId)
    if (!conv) return
    conv.lastMsgTime = serverTime
    if ((conv.maxSeq || 0) < seq) conv.maxSeq = seq
    if (!isSelf && !activeId.value.startsWith(conversationId)) {
      conv.unreadCount = (conv.unreadCount || 0) + 1
    }
  }

  async function markRead(conversationId: string, seq: number) {
    const res = await conversationApi.markRead(conversationId, seq)
    if (res.status) {
      patch(conversationId, {
        unreadCount: res.data?.unreadCount ?? 0,
        mentionUnread: 0,
        lastReadSeq: seq
      })
    }
  }

  async function togglePin(conversationId: string, pinned: boolean) {
    const res = await conversationApi.pinConversation(conversationId, pinned)
    if (res.status) patch(conversationId, { isPinned: pinned })
  }

  async function toggleMute(conversationId: string, muted: boolean) {
    const res = await conversationApi.muteConversation(conversationId, muted)
    if (res.status) patch(conversationId, { isMuted: muted })
  }

  function saveDraftLocal(conversationId: string, draft: string) {
    draftMap.value[conversationId] = draft
  }

  async function saveDraft(conversationId: string, draft: string) {
    saveDraftLocal(conversationId, draft)
    await conversationApi.saveDraft(conversationId, draft)
  }

  async function remove(conversationId: string) {
    await conversationApi.deleteConversation(conversationId)
    list.value = list.value.filter(c => c.id !== conversationId)
    if (activeId.value === conversationId) activeId.value = ''
  }

  function clear() {
    list.value = []
    activeId.value = ''
    draftMap.value = {}
  }

  return {
    list,
    loading,
    activeId,
    draftMap,
    sortedList,
    totalUnread,
    activeConversation,
    fetchList,
    setActive,
    upsert,
    patch,
    onMessage,
    markRead,
    togglePin,
    toggleMute,
    saveDraftLocal,
    saveDraft,
    remove,
    clear
  }
})
