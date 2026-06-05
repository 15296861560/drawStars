import { onBeforeUnmount, type Ref } from 'vue'

export function useBoundaryResize(options: {
  position: Ref<{ x: number; y: number }>
  size: Ref<{ width: number; height: number }>
  minWidth?: number
  minHeight?: number
  maxWidth?: () => number
  maxHeight?: () => number
  onResizeEnd?: () => void
}) {
  const minW = options.minWidth ?? 380
  const minH = options.minHeight ?? 320
  let resizing = false
  let startX = 0
  let startY = 0
  let startW = 0
  let startH = 0

  const onMove = (e: MouseEvent) => {
    if (!resizing) return
    const maxW = options.maxWidth?.() ?? window.innerWidth - options.position.value.x - 8
    const maxH =
      options.maxHeight?.() ?? window.innerHeight - options.position.value.y - 8
    const w = Math.min(Math.max(minW, startW + e.clientX - startX), maxW)
    const h = Math.min(Math.max(minH, startH + e.clientY - startY), maxH)
    options.size.value = { width: w, height: h }
  }

  const onUp = () => {
    if (!resizing) return
    resizing = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    options.onResizeEnd?.()
  }

  const onDown = (e: MouseEvent) => {
    if (e.button !== 0) return
    resizing = true
    startX = e.clientX
    startY = e.clientY
    startW = options.size.value.width
    startH = options.size.value.height
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    e.preventDefault()
    e.stopPropagation()
  }

  onBeforeUnmount(() => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  })

  return { onDown }
}
