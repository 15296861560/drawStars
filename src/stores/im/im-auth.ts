/**
 * IM 鉴权 store — IM Access Token / WS 连接态
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api/im'
import { WsState } from '@/api/im/types'
import imWsClient from '@/utils/im/ws-client'

export const imAuthStore = defineStore('im-auth', () => {
  const token = ref('')
  const tokenExpireAt = ref('')
  const wsState = ref<WsState>(WsState.IDLE)
  const degraded = ref(false)

  const connected = computed(() => wsState.value === WsState.CONNECTED)
  const isLoggedIn = computed(() => !!token.value)

  // 订阅 WS 状态变化
  imWsClient.on('STATE', (env) => {
    const s = (env.data as { state: WsState }).state
    wsState.value = s
    degraded.value = s === WsState.DISCONNECTED
  })
  imWsClient.on('WS_DEGRADED', () => {
    degraded.value = true
  })

  async function ensureToken() {
    if (token.value && !expired()) return token.value
    const res = await authApi.issueToken()
    if (res.status && res.data?.token) {
      token.value = res.data.token
      tokenExpireAt.value = res.data.expireAt
    }
    return token.value
  }

  function expired(): boolean {
    if (!tokenExpireAt.value) return true
    return Number(tokenExpireAt.value) < Date.now() + 60_000
  }

  async function connect() {
    await ensureToken()
    await imWsClient.connect()
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      /* ignore */
    }
    imWsClient.disconnect()
    token.value = ''
    tokenExpireAt.value = ''
    wsState.value = WsState.IDLE
  }

  return { token, tokenExpireAt, wsState, degraded, connected, isLoggedIn, ensureToken, connect, logout }
})
