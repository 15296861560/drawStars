import type { DirectiveBinding } from 'vue'
import {
  runDirectiveCleanup,
  setDirectiveCleanup,
  type AppDirective,
  type DirectiveElement
} from './types'

import defaultLazyImg from '@/assets/img/svg/lab.svg'

interface LazyElement extends DirectiveElement {
  __lazyObserver?: IntersectionObserver
}

function loadImage(
  el: HTMLImageElement,
  src: string,
  placeholder: string
): void {
  el.dataset.src = src
  el.src = placeholder
}

const lazyload: AppDirective<string> = {
  mounted(el: LazyElement, binding: DirectiveBinding<string>) {
    const img = el as HTMLImageElement
    if (img.tagName.toLowerCase() !== 'img') {
      console.warn('v-lazyload 建议用于 <img> 元素')
    }
    const placeholder = defaultLazyImg
    const realSrc = binding.value
    loadImage(img, realSrc, placeholder)

    if (typeof IntersectionObserver === 'undefined') {
      if (realSrc) img.src = realSrc
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (!entry?.isIntersecting) return
        const target = entry.target as HTMLImageElement
        const dataSrc = target.dataset.src
        if (dataSrc) {
          target.src = dataSrc
          target.removeAttribute('data-src')
        }
        observer.unobserve(target)
      },
      { rootMargin: '50px' }
    )
    observer.observe(img)
    el.__lazyObserver = observer
    setDirectiveCleanup(el, () => {
      observer.disconnect()
    })
  },
  updated(el: LazyElement, binding: DirectiveBinding<string>) {
    const img = el as HTMLImageElement
    if (binding.value && binding.value !== img.dataset.src) {
      img.dataset.src = binding.value
    }
  },
  unmounted(el: LazyElement) {
    runDirectiveCleanup(el)
  }
}

export default lazyload
