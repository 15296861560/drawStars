/**
 * 好友 API — 列表 / 申请 / 同意拒绝 / 撤回 / 删除
 * 路由前缀：/im/friends
 */
import { post, get, del, formatPath } from './base'
import type { ImFriendship } from './types'

export function listFriends() {
  return get<{ list: ImFriendship[] }>({}, '/im/friends')
}

export function pendingReceived() {
  return get<{ list: ImFriendship[] }>({}, '/im/friends/pending')
}

export function requestFriend(friendId: string, remark?: string) {
  return post<ImFriendship>({ friendId, remark }, '/im/friends/request')
}

export function respondFriend(friendId: string, accept: boolean) {
  return post<ImFriendship>({ friendId, accept }, '/im/friends/respond')
}

/** 撤回我发起的好友申请 */
export function withdrawRequest(friendId: string) {
  return del<{}>('/im/friends/request', { friendId })
}

/** 删除好友 */
export function removeFriend(friendId: string) {
  return del<{}>(formatPath('/im/friends/:friendId', { friendId }))
}

export default {
  listFriends,
  pendingReceived,
  requestFriend,
  respondFriend,
  withdrawRequest,
  removeFriend
}
