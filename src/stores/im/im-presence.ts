/**
 * 在线态 store — 用户在线 / 房间在线人数
 */
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api/im'

export const imPresenceStore = defineStore('im-presence', () => {
  const onlineMap = ref<Record<string, boolean>>({})
  const roomOnlineCount = ref<Record<string, number>>({})

  function setOnline(userId: string, online: boolean) {
    onlineMap.value[userId] = online
  }

  function setRoomOnline(roomId: string, count: number) {
    roomOnlineCount.value[roomId] = count
  }

  async function batchCheck(userIds: string[]) {
    if (!userIds.length) return
    const res = await authApi.batchStatus(userIds)
    if (res.status && res.data?.list) {
      for (const it of res.data.list) {
        onlineMap.value[it.userId] = it.online
      }
    }
  }

  function isOnline(userId: string): boolean {
    return !!onlineMap.value[userId]
  }

  function roomCount(roomId: string): number {
    return roomOnlineCount.value[roomId] || 0
  }

  function clear() {
    onlineMap.value = {}
    roomOnlineCount.value = {}
  }

  return {
    onlineMap,
    roomOnlineCount,
    setOnline,
    setRoomOnline,
    batchCheck,
    isOnline,
    roomCount,
    clear
  }
})
