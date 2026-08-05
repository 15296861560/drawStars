import type { DirectiveBinding } from 'vue'
import type { AppDirective, DirectiveElement } from './types'

export type LoadingValue = boolean | string

interface LoadingElement extends DirectiveElement {
  __loadingMask?: HTMLDivElement
}

const STYLE_ID = 'v-loading-directive-style'

const SPINNER_SVG = `
<svg class="v-loading-spinner" viewBox="0 0 50 50" aria-hidden="true">
  <circle class="v-loading-path" cx="25" cy="25" r="20" fill="none" />
</svg>
`.trim()

function ensureStyle() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
.v-loading-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fff;
  z-index: 10;
  font-size: 14px;
  color: #909399;
  pointer-events: none;
  border-radius: inherit;
}
.v-loading-spinner {
  width: 32px;
  height: 32px;
  animation: v-loading-rotate 1.5s linear infinite;
}
.v-loading-path {
  stroke: #409eff;
  stroke-width: 3;
  stroke-linecap: round;
  animation: v-loading-dash 1.5s ease-in-out infinite;
}
.v-loading-text {
  line-height: 1;
  color: #909399;
}
@keyframes v-loading-rotate {
  100% { transform: rotate(360deg); }
}
@keyframes v-loading-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
`
  document.head.appendChild(style)
}

function ensureMask(el: LoadingElement): HTMLDivElement {
  if (el.__loadingMask) return el.__loadingMask

  ensureStyle()

  const position = getComputedStyle(el).position
  if (position === 'static') {
    el.style.position = 'relative'
  }

  const mask = document.createElement('div')
  mask.className = 'v-loading-mask'
  mask.innerHTML = `${SPINNER_SVG}<span class="v-loading-text"></span>`

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

  const textEl = mask.querySelector('.v-loading-text') as HTMLSpanElement | null
  if (!textEl) return

  const customText =
    typeof binding.value === 'string' && binding.value ? binding.value : ''
  textEl.textContent = customText
  textEl.style.display = customText ? 'block' : 'none'
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
