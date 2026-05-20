import type { DirectiveBinding } from 'vue'
import type { AppDirective, DirectiveElement } from './types'
import { runDirectiveCleanup, setDirectiveCleanup } from './types'
import { parseDelay } from './utils'

const debounce: AppDirective<() => void> = {
  mounted(el: DirectiveElement, binding: DirectiveBinding<() => void>) {
    if (typeof binding.value !== 'function') {
      throw new Error('v-debounce: binding value 必须是函数')
    }

    const delay = parseDelay(binding, 1000)
    let timer: ReturnType<typeof setTimeout> | null = null

    const onClick = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        binding.value()
      }, delay)
    }

    el.addEventListener('click', onClick)
    setDirectiveCleanup(el, () => {
      if (timer) clearTimeout(timer)
      el.removeEventListener('click', onClick)
    })
  },
  unmounted(el: DirectiveElement) {
    runDirectiveCleanup(el)
  }
}

export default debounce
