import type { DirectiveBinding } from 'vue'
import type { AppDirective, DirectiveElement } from './types'
import { runDirectiveCleanup, setDirectiveCleanup } from './types'

const DEFAULT_DURATION = 2000

const longpress: AppDirective<(e: Event) => void> = {
  mounted(el: DirectiveElement, binding: DirectiveBinding<(e: Event) => void>) {
    if (typeof binding.value !== 'function') {
      throw new Error('v-longpress: binding value 必须是函数')
    }

    const duration = binding.arg ? Number(binding.arg) : DEFAULT_DURATION
    const waitMs =
      Number.isNaN(duration) || duration <= 0 ? DEFAULT_DURATION : duration

    let pressTimer: ReturnType<typeof setTimeout> | null = null

    const onStart = (e: MouseEvent | TouchEvent) => {
      if (e.type === 'mousedown' && (e as MouseEvent).button !== 0) return
      if (pressTimer !== null) return
      pressTimer = setTimeout(() => {
        pressTimer = null
        binding.value(e)
      }, waitMs)
    }

    const onCancel = () => {
      if (pressTimer !== null) {
        clearTimeout(pressTimer)
        pressTimer = null
      }
    }

    el.addEventListener('mousedown', onStart)
    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('click', onCancel)
    el.addEventListener('mouseout', onCancel)
    el.addEventListener('touchend', onCancel)
    el.addEventListener('touchcancel', onCancel)

    setDirectiveCleanup(el, () => {
      onCancel()
      el.removeEventListener('mousedown', onStart)
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('click', onCancel)
      el.removeEventListener('mouseout', onCancel)
      el.removeEventListener('touchend', onCancel)
      el.removeEventListener('touchcancel', onCancel)
    })
  },
  unmounted(el: DirectiveElement) {
    runDirectiveCleanup(el)
  }
}

export default longpress
