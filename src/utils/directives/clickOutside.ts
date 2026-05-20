import type { DirectiveBinding } from 'vue'
import type { AppDirective, DirectiveElement } from './types'
import { runDirectiveCleanup, setDirectiveCleanup } from './types'

const clickOutside: AppDirective<() => void> = {
  mounted(el: DirectiveElement, binding: DirectiveBinding<() => void>) {
    if (typeof binding.value !== 'function') {
      throw new Error('v-click-outside: binding value 必须是函数')
    }

    const onDocumentClick = (e: MouseEvent) => {
      const target = e.target as Node | null
      if (!target || el.contains(target)) return
      binding.value()
    }

    const timer = window.setTimeout(() => {
      document.addEventListener('click', onDocumentClick)
    }, 0)
    setDirectiveCleanup(el, () => {
      window.clearTimeout(timer)
      document.removeEventListener('click', onDocumentClick)
    })
  },
  unmounted(el: DirectiveElement) {
    runDirectiveCleanup(el)
  }
}

export default clickOutside
