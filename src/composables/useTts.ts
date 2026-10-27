/**
 * F03 TTS 手动播报（PRD 4.3.1）
 * 浏览器 speechSynthesis 本地合成：lang=zh-CN / rate=1.0 / pitch=1.0
 * （修正 v1 死代码 AssistantChat 的 rate=3 异常速率 bug）
 */
import { ref } from 'vue'
import { trackEvent } from '@/plugins/tracker'

/** 模块级单例：所有消息气泡共享同一播报通道（新播报自动中断旧播报） */
const playingId = ref<string | null>(null)

/** TTS 引擎是否可用；不可用时播报按钮隐藏并埋点佐证（PRD 1.3） */
export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** 剥离 HTML 标签与多余空白，得到可播报纯文本 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function useTts() {
  const supported = ttsSupported()

  /** 播报一条消息的 content；点击新播报或发送消息时中断当前播报（PRD 4.3.1） */
  function speak(messageId: string, content: string) {
    if (!ttsSupported()) return
    const text = stripHtml(content)
    if (!text) return

    const synth = window.speechSynthesis
    synth.cancel()
    playingId.value = messageId
    trackEvent('ai_tts_play')

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 1.0
    utterance.pitch = 1.0
    const clear = () => {
      if (playingId.value === messageId) playingId.value = null
    }
    utterance.onend = clear
    utterance.onerror = clear
    synth.speak(utterance)
  }

  /** 停止指定消息的播报；不传 id 时停止当前任意播报（无播报时为 no-op） */
  function stop(messageId?: string) {
    if (!ttsSupported()) return
    const target = messageId ?? playingId.value
    if (!target) return
    if (messageId && playingId.value !== messageId) return
    window.speechSynthesis.cancel()
    playingId.value = null
    trackEvent('ai_tts_stop')
  }

  return { supported, playingId, speak, stop }
}

/** 顶层便捷方法：发送消息等场景中断当前播报（播放中才发埋点） */
export function stopTts() {
  useTts().stop()
}
