import type { DirectiveBinding } from 'vue'
import type { AppDirective, DirectiveElement } from './types'
import { findInputLike } from './utils'

/** 为 true 时在 mounted 后聚焦；也可传入选择器字符串 */
const focus: AppDirective<boolean | string> = {
  mounted(el: DirectiveElement, binding: DirectiveBinding<boolean | string>) {
    if (binding.value === false) return

    const target =
      typeof binding.value === 'string'
        ? (el.querySelector(binding.value) as HTMLElement | null)
        : findInputLike(el)

    requestAnimationFrame(() => {
      target?.focus?.()
    })
  },
  updated(el: DirectiveElement, binding: DirectiveBinding<boolean | string>) {
    if (binding.value === true && binding.oldValue !== true) {
      const target = findInputLike(el)
      requestAnimationFrame(() => target.focus())
    }
  }
}

export default focus
