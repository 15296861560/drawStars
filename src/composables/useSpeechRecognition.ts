import { ref, onBeforeUnmount } from 'vue'
import { mockVoiceToText } from '@/services/ai-assistant'

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
      recognition?.stop()
    } catch {
      /* ignore */
    }
  }

  const start = (): Promise<string> => {
    const Ctor = getSpeechRecognition()
    if (!Ctor) {
      listening.value = true
      interimText.value = '…'
      return mockVoiceToText().then(text => {
        listening.value = false
        interimText.value = ''
        return text
      })
    }

    return new Promise((resolve, reject) => {
      recognition = new Ctor()
      recognition.lang = 'zh-CN'
      recognition.continuous = false
      recognition.interimResults = true
      listening.value = true
      interimText.value = ''

      recognition.onresult = e => {
        const last = e.results[e.results.length - 1]
        const text = last[0]?.transcript || ''
        if (
          last &&
          (e.results as unknown as { isFinal?: boolean }).isFinal !== false
        ) {
          interimText.value = text
        } else {
          interimText.value = text
        }
        if ((last as unknown as { isFinal?: boolean })?.isFinal !== false) {
          resolve(text.trim())
        }
      }

      recognition.onerror = e => {
        listening.value = false
        reject(new Error(e.error || 'speech-error'))
      }

      recognition.onend = () => {
        listening.value = false
        if (interimText.value && !interimText.value.endsWith('…')) {
          resolve(interimText.value.trim())
        }
      }

      try {
        recognition.start()
      } catch (err) {
        listening.value = false
        reject(err)
      }
    })
  }

  onBeforeUnmount(stop)

  return { listening, supported, interimText, start, stop }
}
