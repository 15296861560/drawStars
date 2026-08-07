import type { AppDirective, DirectiveElement } from './types'
import { runDirectiveCleanup, setDirectiveCleanup } from './types'

const draggable: AppDirective = {
  mounted(el: DirectiveElement) {
    el.style.cursor = 'move'
    el.style.position = el.style.position || 'relative'

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      const parent = el.parentElement
      if (!parent) return

      const parentRect = parent.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      const offsetX = e.clientX - elRect.left
      const offsetY = e.clientY - elRect.top
      const maxX = parentRect.width - elRect.width
      const maxY = parentRect.height - elRect.height

      const onMouseMove = (moveEvent: MouseEvent) => {
        let x = moveEvent.clientX - parentRect.left - offsetX
        let y = moveEvent.clientY - parentRect.top - offsetY
        x = Math.min(Math.max(0, x), Math.max(0, maxX))
        y = Math.min(Math.max(0, y), Math.max(0, maxY))
        el.style.left = `${x}px`
        el.style.top = `${y}px`
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    el.addEventListener('mousedown', onMouseDown)
    setDirectiveCleanup(el, () => {
      el.removeEventListener('mousedown', onMouseDown)
    })
  },
  unmounted(el: DirectiveElement) {
    runDirectiveCleanup(el)
  }
}

export default draggable
