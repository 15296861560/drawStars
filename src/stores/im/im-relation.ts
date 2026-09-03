/**
 * 关系链 store — 好友 / 黑名单 / 申请审批
 */
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { friendApi, blacklistApi } from '@/api/im'
import type { ImFriendship, ImBlacklistItem } from '@/api/im/types'

export const imRelationStore = defineStore('im-relation', () => {
  const friends = ref<ImFriendship[]>([])
  const pendingReceived = ref<ImFriendship[]>([])
  const blacklist = ref<ImBlacklistItem[]>([])

  async function fetchFriends() {
    const res = await friendApi.listFriends()
    if (res.status && res.data?.list) friends.value = res.data.list
    return friends.value
  }

  async function fetchPending() {
    const res = await friendApi.pendingReceived()
    if (res.status && res.data?.list) pendingReceived.value = res.data.list
    return pendingReceived.value
  }

  async function requestFriend(friendId: string, remark?: string) {
    return friendApi.requestFriend(friendId, remark)
  }

  async function respondFriend(friendId: string, accept: boolean) {
    const res = await friendApi.respondFriend(friendId, accept)
    if (res.status) {
      pendingReceived.value = pendingReceived.value.filter(f => String(f.friendId) !== String(friendId))
      if (accept) await fetchFriends()
    }
    return res
  }

  async function removeFriend(friendId: string) {
    const res = await friendApi.removeFriend(friendId)
    if (res.status) friends.value = friends.value.filter(f => String(f.friendId) !== String(friendId))
    return res
  }

  async function fetchBlacklist() {
    const res = await blacklistApi.listBlacklist()
    if (res.status && res.data?.list) blacklist.value = res.data.list
    return blacklist.value
  }

  async function addBlacklist(targetId: string) {
    const res = await blacklistApi.addBlacklist(targetId)
    if (res.status) await fetchBlacklist()
    return res
  }

  async function removeBlacklist(targetId: string) {
    const res = await blacklistApi.removeBlacklist(targetId)
    if (res.status) blacklist.value = blacklist.value.filter(b => String(b.targetId) !== String(targetId))
    return res
  }

  function clear() {
    friends.value = []
    pendingReceived.value = []
    blacklist.value = []
  }

  return {
    friends, pendingReceived, blacklist,
    fetchFriends, fetchPending, requestFriend, respondFriend, removeFriend,
    fetchBlacklist, addBlacklist, removeBlacklist, clear
  }
})
