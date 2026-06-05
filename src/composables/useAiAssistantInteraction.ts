import { type Ref, watch, nextTick } from 'vue'
import { onClickOutside, useEventListener } from '@vueuse/core'
import { aiAssistantStore } from '@/stores/ai-assistant'

const CLICK_OUTSIDE_IGNORE = ['.ai-assistant-fab', '.ai-assistant-popper']

export function useAiAssistantInteraction(
  panelRef: Ref<HTMLElement | null | undefined>,
  options?: {
    focusInput?: () => void
    clampPanel?: () => void
  }
) {
  const store = aiAssistantStore()

  onClickOutside(
    panelRef,
    () => {
      if (store.panelOpen) store.closePanel()
    },
    { ignore: CLICK_OUTSIDE_IGNORE }
  )

  useEventListener(window, 'keydown', (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !store.panelOpen) return
    e.preventDefault()
    store.closePanel()
  })

  useEventListener(window, 'resize', () => {
    if (store.panelOpen) options?.clampPanel?.()
  })

  watch(
    () => store.panelOpen,
    open => {
      if (open) {
        nextTick(() => options?.focusInput?.())
      }
    }
  )

  watch(
    () => store.activeConversationId,
    () => {
      if (store.panelOpen) {
        nextTick(() => options?.focusInput?.())
      }
    }
  )
}
