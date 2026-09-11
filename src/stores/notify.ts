/*
 * @Description: 站内信状态（未读角标 / 列表缓存）
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import notifyApi from '@/assets/js/api/notifyController/notifyApi.js'
import { userInfoStore } from '@/stores/user-info'

export type NotifyItem = {
  id: number | string
  title?: string
  content?: string
  rawMsg?: string
  tag?: string
  notifyType?: string
  createTime?: number | null
  updateTime?: number | null
  isRead?: boolean
  sendId?: number | null
  receiveId?: number | null
}

export const notifyStore = defineStore('notify', () => {
  const list = ref<NotifyItem[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const hasMore = ref(false)
  const curPage = ref(1)
  const pageSize = ref(20)
  const filterStatus = ref<'all' | 'read' | 'unread'>('all')
  const total = ref(0)

  const getUnreadCount = computed(() => unreadCount.value)
  const getList = computed(() => list.value)

  function resolveUserId() {
    const user = userInfoStore()
    return Number(user.getUserId) || 0
  }

  async function fetchUnreadCount() {
    const userId = resolveUserId()
    if (!userId) {
      unreadCount.value = 0
      return 0
    }
    try {
      const res = await notifyApi.getUnreadCount({ userId })
      if (res?.status) {
        unreadCount.value = Number(res.data?.count) || 0
      }
    } catch {
      /* ignore */
    }
    return unreadCount.value
  }

  async function fetchList(options: { reset?: boolean } = {}) {
    const userId = resolveUserId()
    if (!userId) {
      list.value = []
      total.value = 0
      hasMore.value = false
      return []
    }

    if (options.reset) {
      curPage.value = 1
    }

    loading.value = true
    try {
      const res = await notifyApi.queryMyAllNotify({
        userId,
        status: filterStatus.value,
        curPage: curPage.value,
        pageSize: pageSize.value
      })
      if (!res?.status || !res.data) {
        if (options.reset) list.value = []
        return list.value
      }

      const payload = res.data
      // 兼容旧接口直接返回数组
      const records: NotifyItem[] = Array.isArray(payload)
        ? payload
        : payload.list || []
      const nextTotal = Array.isArray(payload)
        ? records.length
        : Number(payload.total) || records.length

      if (options.reset || curPage.value === 1) {
        list.value = records
      } else {
        const exist = new Set(list.value.map(i => String(i.id)))
        list.value = [
          ...list.value,
          ...records.filter(i => !exist.has(String(i.id)))
        ]
      }

      total.value = nextTotal
      hasMore.value = Array.isArray(payload) ? false : Boolean(payload.hasMore)
      return list.value
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (!hasMore.value || loading.value) return
    curPage.value += 1
    await fetchList()
  }

  async function setFilter(status: 'all' | 'read' | 'unread') {
    filterStatus.value = status
    await fetchList({ reset: true })
  }

  async function markRead(id: number | string) {
    const userId = resolveUserId()
    if (!userId || id == null) return false
    const res = await notifyApi.markRead({ id, userId })
    if (res?.status) {
      const item = list.value.find(i => String(i.id) === String(id))
      if (item && !item.isRead) {
        item.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      } else {
        await fetchUnreadCount()
      }
      return true
    }
    return false
  }

  async function markAllRead() {
    const userId = resolveUserId()
    if (!userId) return false
    const res = await notifyApi.markAllRead({ userId })
    if (res?.status) {
      list.value.forEach(i => {
        i.isRead = true
      })
      unreadCount.value = 0
      if (filterStatus.value === 'unread') {
        await fetchList({ reset: true })
      }
      return true
    }
    return false
  }

  function prependFromPush(item?: Partial<NotifyItem>) {
    unreadCount.value += 1
    if (item && item.id != null) {
      const exists = list.value.some(i => String(i.id) === String(item.id))
      if (!exists) {
        list.value = [
          {
            id: item.id,
            title: item.title || '',
            content: item.content || '',
            tag: item.tag || item.notifyType || '系统',
            notifyType: item.notifyType,
            createTime: item.createTime || Date.now(),
            isRead: false
          },
          ...list.value
        ]
      }
    }
  }

  function clear() {
    list.value = []
    unreadCount.value = 0
    curPage.value = 1
    hasMore.value = false
    total.value = 0
    filterStatus.value = 'all'
  }

  return {
    list,
    unreadCount,
    loading,
    hasMore,
    curPage,
    pageSize,
    filterStatus,
    total,
    getUnreadCount,
    getList,
    fetchUnreadCount,
    fetchList,
    loadMore,
    setFilter,
    markRead,
    markAllRead,
    prependFromPush,
    clear
  }
})
