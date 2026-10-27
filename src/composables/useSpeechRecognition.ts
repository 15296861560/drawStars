/**
 * F01 语音输入 Web Speech API 封装（PRD 4.1）
 * - 浏览器不支持：Mock 演示模式保留假文本降级；真实模式直接返回 MIC_UNAVAILABLE
 *   （修复 v0 不支持时静默注入假文本的缺陷，PRD 9.4 缺陷 1）
 * - onerror 错误码统一映射为业务错误码（PRD 4.1.3），aborted 视为用户主动取消
 * - Promise 使用 settled 守卫：手动 stop() 后无文本时以 VOICE_ABORTED 结束，避免悬挂
 */
import { ref, onBeforeUnmount } from 'vue'
import { mockVoiceToText } from '@/services/ai-assistant'

/** 语音输入统一错误码（PRD 4.1.3；ASR_TIMEOUT 为超时预留） */
export type AiVoiceErrorCode =
  | 'MIC_PERMISSION_DENIED'
  | 'MIC_UNAVAILABLE'
  | 'ASR_NO_SPEECH'
  | 'ASR_NETWORK'
  | 'ASR_TIMEOUT'
  | 'VOICE_ABORTED'

/** 带错误码的语音异常，供 UI 层映射固定话术 */
export class AiVoiceError extends Error {
  code: AiVoiceErrorCode
  constructor(code: AiVoiceErrorCode, message?: string) {
    super(message || code)
    this.code = code
  }
}

/** Mock 演示模式下不支持语音识别时仍返回假文本，便于无麦环境演示 */
const USE_MOCK = import.meta.env.VITE_AI_ASSISTANT_MOCK !== 'false'

/** Web Speech onerror 原始码 → 统一错误码（PRD 4.1.3） */
const SPEECH_ERROR_CODE_MAP: Record<string, AiVoiceErrorCode> = {
  'not-allowed': 'MIC_PERMISSION_DENIED',
  'service-not-allowed': 'MIC_PERMISSION_DENIED',
  'audio-capture': 'MIC_UNAVAILABLE',
  'no-speech': 'ASR_NO_SPEECH',
  network: 'ASR_NETWORK',
  aborted: 'VOICE_ABORTED'
}

type SpeechRecognitionCtor = new () => {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult:
    | ((e: {
        results: { [i: number]: { [j: number]: { transcript: string } } }
      }) => void)
    | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export function useSpeechRecognition() {
  const listening = ref(false)
  const supported = ref(!!getSpeechRecognition())
  const interimText = ref('')
  let recognition: InstanceType<SpeechRecognitionCtor> | null = null

  const stop = () => {
    listening.value = false
    try {
      // 触发 onend：已有最终文本则已 resolve，否则以 VOICE_ABORTED 结束
      recognition?.stop()
    } catch {
      /* ignore */
    }
  }

  const start = (): Promise<string> => {
    const Ctor = getSpeechRecognition()

    if (!Ctor) {
      if (USE_MOCK) {
        listening.value = true
        interimText.value = '…'
        return mockVoiceToText().then(text => {
          listening.value = false
          interimText.value = ''
          return text
        })
      }
      return Promise.reject(new AiVoiceError('MIC_UNAVAILABLE'))
    }

    return new Promise((resolve, reject) => {
      let settled = false
      const reset = () => {
        listening.value = false
        interimText.value = ''
      }
      const finish = (text: string) => {
        if (settled) return
        settled = true
        reset()
        resolve(text)
      }
      const fail = (err: AiVoiceError) => {
        if (settled) return
        settled = true
        reset()
        reject(err)
      }

      recognition = new Ctor()
      recognition.lang = 'zh-CN'
      recognition.continuous = false
      recognition.interimResults = true
      listening.value = true
      interimText.value = ''

      recognition.onresult = e => {
        const last = e.results[e.results.length - 1]
        const text = last?.[0]?.transcript || ''
        interimText.value = text
        if ((last as unknown as { isFinal?: boolean })?.isFinal !== false) {
          finish(text.trim())
        }
      }

      recognition.onerror = e => {
        const code = SPEECH_ERROR_CODE_MAP[e.error] || 'ASR_NETWORK'
        fail(new AiVoiceError(code))
      }

      recognition.onend = () => {
        // 兜底：识别结束仍未拿到最终文本（如手动 stop），视为主动取消
        if (settled) return
        const text = interimText.value.trim()
        if (text) finish(text)
        else fail(new AiVoiceError('VOICE_ABORTED'))
      }

      try {
        recognition.start()
      } catch {
        fail(new AiVoiceError('ASR_NETWORK'))
      }
    })
  }

  onBeforeUnmount(stop)

  return { listening, supported, interimText, start, stop }
}
