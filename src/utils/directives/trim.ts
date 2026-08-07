import type { AppDirective, DirectiveElement } from './types'
import { runDirectiveCleanup, setDirectiveCleanup } from './types'
import { dispatchInputEvent, findInputLike } from './utils'

const trim: AppDirective = {
  mounted(el: DirectiveElement) {
    const input = findInputLike(el)
    const onBlur = () => {
      const next = input.value.trim()
      if (next !== input.value) {
        input.value = next
        dispatchInputEvent(input)
      }
    }
    input.addEventListener('blur', onBlur)
    setDirectiveCleanup(el, () => input.removeEventListener('blur', onBlur))
  },
  unmounted(el: DirectiveElement) {
    runDirectiveCleanup(el)
  }
}

export default trim
