import type { DirectiveBinding } from 'vue'
import type { AppDirective, DirectiveElement } from './types'

export type LoadingValue = boolean | string

interface LoadingElement extends DirectiveElement {
  __loadingMask?: HTMLDivElement
}

function ensureMask(el: LoadingElement): HTMLDivElement {
  if (el.__loadingMask) return el.__loadingMask

  const position = getComputedStyle(el).position
  if (position === 'static') {
    el.style.position = 'relative'
  }

  const mask = document.createElement('div')
  mask.className = 'v-loading-mask'
  mask.style.cssText = [
    'position:absolute',
    'inset:0',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'background:rgba(255,255,255,0.65)',
    'z-index:10',
    'font-size:14px',
    'color:#606266',
    'pointer-events:none'
  ].join(';')

  el.appendChild(mask)
  el.__loadingMask = mask
  return mask
}

function setLoading(
  el: LoadingElement,
  binding: DirectiveBinding<LoadingValue>
) {
  const active = Boolean(binding.value)
  const mask = ensureMask(el)
  mask.style.display = active ? 'flex' : 'none'
  mask.textContent =
    typeof binding.value === 'string' && binding.value
      ? binding.value
      : '加载中...'
}

const loading: AppDirective<LoadingValue> = {
  mounted(el: LoadingElement, binding: DirectiveBinding<LoadingValue>) {
    setLoading(el, binding)
  },
  updated(el: LoadingElement, binding: DirectiveBinding<LoadingValue>) {
    setLoading(el, binding)
  },
  unmounted(el: LoadingElement) {
    el.__loadingMask?.remove()
    el.__loadingMask = undefined
  }
}

export default loading
