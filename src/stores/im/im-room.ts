/**
 * 聊天室 store — 当前房间 / 成员 / 大厅列表
 */
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { roomApi, hallApi } from '@/api/im'
import { RoomStatus, type ImRoom } from '@/api/im/types'

export const imRoomStore = defineStore('im-room', () => {
  const currentRoom = ref<ImRoom | null>(null)
  const members = ref<Array<Record<string, unknown>>>([])
  const hallList = ref<ImRoom[]>([])
  const hallLoading = ref(false)
  const hallHasMore = ref(false)
  const hallCurPage = ref(1)

  async function fetchHall(params: { categoryId?: string; keyword?: string; reset?: boolean } = {}) {
    if (hallLoading.value) return
    if (params.reset) hallCurPage.value = 1
    hallLoading.value = true
    try {
      const res = await hallApi.hallRooms({ ...params, curPage: hallCurPage.value, pageSize: 20 })
      if (res.status && res.data?.list) {
        if (hallCurPage.value === 1) hallList.value = res.data.list
        else hallList.value = [...hallList.value, ...res.data.list]
        hallHasMore.value = Boolean(res.data.hasMore)
      }
      return res
    } finally {
      hallLoading.value = false
    }
  }

  async function loadMoreHall(params: { categoryId?: string; keyword?: string } = {}) {
    if (!hallHasMore.value || hallLoading.value) return
    hallCurPage.value += 1
    await fetchHall(params)
  }

  async function enterRoom(roomId: string) {
    const res = await roomApi.getRoom(roomId)
    if (res.status && res.data) {
      currentRoom.value = res.data
      if (res.data.onlineCount != null) {
        // onlineCount 由 presence 接口维护
      }
    }
    await roomApi.joinRoom(roomId)
    await loadMembers(roomId)
    return res
  }

  async function loadMembers(roomId: string) {
    const res = await roomApi.roomMembers(roomId)
    if (res.status && res.data?.list) members.value = res.data.list
  }

  async function leaveCurrent() {
    if (currentRoom.value?.roomId) {
      await roomApi.leaveRoom(currentRoom.value.roomId)
    }
    currentRoom.value = null
    members.value = []
  }

  async function createRoom(data: Record<string, unknown>) {
    const res = await roomApi.createRoom(data)
    if (res.status && res.data) {
      // 新建后可拉取大厅
    }
    return res
  }

  function patchCurrent(patch: Partial<ImRoom>) {
    if (currentRoom.value) currentRoom.value = { ...currentRoom.value, ...patch }
  }

  function clear() {
    currentRoom.value = null
    members.value = []
    hallList.value = []
    hallCurPage.value = 1
    hallHasMore.value = false
  }

  return {
    currentRoom, members, hallList, hallLoading, hallHasMore, hallCurPage, RoomStatus,
    fetchHall, loadMoreHall, enterRoom, loadMembers, leaveCurrent, createRoom, patchCurrent, clear
  }
})
