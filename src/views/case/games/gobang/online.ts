import notifySdk from 'drawstarts-notify'
import { NOTIFY_URL } from '@/assets/js/notify/notify-config.js'
import { userInfoStore } from '@/stores/user-info'
import type { OnlineMessage, OnlineTransport } from './types'

/** notifyType for gobang room messages (drawstarts-notify) */
export const GOBANG_NOTIFY_TYPE = 'gobang'

type Handler = (msg: OnlineMessage, memberId: string) => void

function resolveNotifyClient(): any {
  const mod: any = notifySdk as any
  if (mod?.notifyClient?.createInstance) return mod.notifyClient
  if (mod?.default?.notifyClient?.createInstance) return mod.default.notifyClient
  if (typeof mod?.createInstance === 'function') return mod
  throw new Error('drawstarts-notify client not found')
}

export class GobangOnline {
  client: any = null
  account = ''
  channelName = ''
  connected = false
  transport: OnlineTransport = 'notify'
  private handler: Handler | null = null
  private boundCallback: ((data: OnlineMessage) => void) | null = null

  onMessage(handler: Handler) {
    this.handler = handler
  }

  /**
   * Reuse Index.vue singleton when already connected;
   * otherwise createInstance + login via notify SDK.
   */
  async connect(): Promise<void> {
    this.client = resolveNotifyClient()
    const user = userInfoStore()
    const tokenRaw: any = user.getToken
    const token = (tokenRaw && tokenRaw.value != null ? tokenRaw.value : tokenRaw) || ''

    if (!this.client.isReady) {
      await this.client.createInstance(NOTIFY_URL)
    }
    if (!this.client.isLogin) {
      const ok = await this.client.login(token)
      if (!ok) {
        throw new Error('notify login failed')
      }
    }

    const uid = this.client.userId || user.getUserId || ''
    this.account = String(uid || randomAccount())
    this.transport = 'notify'
  }

  /** @deprecated use connect() */
  async login(_account?: string): Promise<void> {
    await this.connect()
  }

  async joinRoom(roomCode: string) {
    if (!this.client) await this.connect()
    this.channelName = `gobang_${roomCode}`

    const joined = await this.client.joinChannel(this.channelName)
    if (!joined) {
      throw new Error('joinChannel failed')
    }

    this.boundCallback = (data: OnlineMessage) => {
      if (!data || typeof data !== 'object') return
      this.handler?.(data, String(data.from || 'peer'))
    }
    this.client.addNotifyCallback(
      GOBANG_NOTIFY_TYPE,
      this.channelName,
      this.boundCallback
    )
    this.connected = true
  }

  async leaveRoom() {
    if (this.client && this.channelName) {
      try {
        if (this.boundCallback) {
          this.client.deleteCallback(
            GOBANG_NOTIFY_TYPE,
            this.channelName,
            this.boundCallback
          )
        }
        this.client.deleteNotifyCallback(GOBANG_NOTIFY_TYPE, this.channelName)
        await this.client.leaveChannel(this.channelName)
      } catch (_) {
        /* ignore */
      }
    }
    this.boundCallback = null
    this.connected = false
    this.channelName = ''
  }

  async logout() {
    // Do not logout the global notify client (site-wide channel still needs it).
    await this.leaveRoom()
  }

  async send(msg: OnlineMessage) {
    if (!this.connected || !this.channelName || !this.client) return
    const payload: OnlineMessage = { ...msg, from: this.account }
    this.client.sendNotify({
      notifyType: GOBANG_NOTIFY_TYPE,
      notifyMsg: JSON.stringify(payload),
      channelName: this.channelName
    })
  }
}

export function randomRoomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function randomAccount(): string {
  return 'gb_' + Math.random().toString(36).slice(2, 10)
}
