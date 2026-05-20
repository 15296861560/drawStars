import type { DirectiveBinding } from 'vue'
import type { AppDirective, DirectiveElement } from './types'
import { runDirectiveCleanup, setDirectiveCleanup } from './types'
import { parseDelay } from './utils'

const throttle: AppDirective<() => void> = {
  mounted(el: DirectiveElement, binding: DirectiveBinding<() => void>) {
    if (typeof binding.value !== 'function') {
      throw new Error('v-throttle: binding value 必须是函数')
    }

    const delay = parseDelay(binding, 1000)
    let lastRun = 0
    let trailingTimer: ReturnType<typeof setTimeout> | null = null

    const invoke = () => binding.value()

    const onClick = () => {
      const now = Date.now()
      const remaining = delay - (now - lastRun)
      if (remaining <= 0) {
        if (trailingTimer) {
          clearTimeout(trailingTimer)
          trailingTimer = null
        }
        lastRun = now
        invoke()
      } else if (!trailingTimer) {
        trailingTimer = setTimeout(() => {
          trailingTimer = null
          lastRun = Date.now()
          invoke()
        }, remaining)
      }
    }

    el.addEventListener('click', onClick)
    setDirectiveCleanup(el, () => {
      if (trailingTimer) clearTimeout(trailingTimer)
      el.removeEventListener('click', onClick)
    })
  },
  unmounted(el: DirectiveElement) {
    runDirectiveCleanup(el)
  }
}

export default throttle
