import { onBeforeUnmount, type Ref } from 'vue'

export type BoundaryRect = {
  left: number
  top: number
  width: number
  height: number
}

export function useBoundaryDrag(options: {
  targetRef: Ref<HTMLElement | null>
  handleRef?: Ref<HTMLElement | null>
  position: Ref<{ x: number; y: number }>
  size: Ref<{ width: number; height: number }>
  boundary?: () => BoundaryRect
  onDragEnd?: () => void
}) {
  let dragging = false
  let didMove = false
  let startX = 0
  let startY = 0
  let originX = 0
  let originY = 0

  const getBoundary = (): BoundaryRect => {
    if (options.boundary) return options.boundary()
    return {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight
    }
  }

  const clamp = (x: number, y: number) => {
    const b = getBoundary()
    const maxX = b.left + b.width - options.size.value.width
    const maxY = b.top + b.height - options.size.value.height
    return {
      x: Math.min(Math.max(b.left, x), Math.max(b.left, maxX)),
      y: Math.min(Math.max(b.top, y), Math.max(b.top, maxY))
    }
  }

  const onMove = (e: MouseEvent) => {
    if (!dragging) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (Math.abs(dx) + Math.abs(dy) > 4) didMove = true
    const next = clamp(originX + dx, originY + dy)
    options.position.value = next
  }

  const onUp = () => {
    if (!dragging) return
    dragging = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    options.onDragEnd?.()
  }

  const onDown = (e: MouseEvent) => {
    if (e.button !== 0) return
    const el = options.handleRef?.value || options.targetRef.value
    if (!el) return
    dragging = true
    didMove = false
    startX = e.clientX
    startY = e.clientY
    originX = options.position.value.x
    originY = options.position.value.y
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    e.preventDefault()
  }

  const bind = () => {
    const handle = options.handleRef?.value || options.targetRef.value
    handle?.addEventListener('mousedown', onDown)
  }

  const unbind = () => {
    const handle = options.handleRef?.value || options.targetRef.value
    handle?.removeEventListener('mousedown', onDown)
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }

  onBeforeUnmount(unbind)

  const hasMoved = () => didMove

  return { bind, unbind, onDown, hasMoved }
}
