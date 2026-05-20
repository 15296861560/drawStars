import type { AppDirective, DirectiveElement } from './types'
import { runDirectiveCleanup, setDirectiveCleanup } from './types'
import { dispatchInputEvent, EMOJI_REG, findInputLike } from './utils'

interface EmojiElement extends DirectiveElement {
  __emojiInput?: HTMLInputElement | HTMLTextAreaElement
}

const emoji: AppDirective = {
  mounted(el: EmojiElement) {
    const input = findInputLike(el)
    const onKeyup = () => {
      const cleaned = input.value.replace(EMOJI_REG, '')
      if (cleaned !== input.value) {
        input.value = cleaned
        dispatchInputEvent(input)
      }
    }
    input.addEventListener('keyup', onKeyup)
    el.__emojiInput = input
    setDirectiveCleanup(el, () => input.removeEventListener('keyup', onKeyup))
  },
  unmounted(el: EmojiElement) {
    runDirectiveCleanup(el)
  }
}

export default emoji
