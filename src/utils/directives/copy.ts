import type { DirectiveBinding } from 'vue'
import { showTips } from '@/utils/message/showTips.js'
import type { AppDirective, DirectiveElement } from './types'
import { runDirectiveCleanup, setDirectiveCleanup } from './types'

interface CopyElement extends DirectiveElement {
  __copyValue?: string
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return true
  }
  const textarea = document.createElement('textarea')
  textarea.readOnly = true
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  textarea.value = text
  document.body.appendChild(textarea)
  textarea.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(textarea)
  return ok
}

const copy: AppDirective<string> = {
  mounted(el: CopyElement, binding: DirectiveBinding<string>) {
    const runCopy = async () => {
      const text = el.__copyValue ?? ''
      if (!text) {
        showTips('error', '无复制内容')
        return
      }
      try {
        const ok = await copyTextToClipboard(text)
        showTips(ok ? 'success' : 'error', ok ? '复制成功' : '复制失败')
      } catch {
        showTips('error', '复制失败')
      }
    }
    el.__copyValue = binding.value
    el.addEventListener('click', runCopy)
    setDirectiveCleanup(el, () => el.removeEventListener('click', runCopy))
  },
  updated(el: CopyElement, binding: DirectiveBinding<string>) {
    el.__copyValue = binding.value
  },
  unmounted(el: CopyElement) {
    runDirectiveCleanup(el)
  }
}

export default copy
