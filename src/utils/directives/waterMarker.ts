import type { DirectiveBinding } from 'vue'
import type { AppDirective } from './types'

export interface WaterMarkerOptions {
  text: string
  font?: string
  textColor?: string
}

function paintWaterMarker(
  text: string,
  parentNode: HTMLElement,
  font?: string,
  textColor?: string
): void {
  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 150
  canvas.style.display = 'none'
  parentNode.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.rotate((-20 * Math.PI) / 180)
  ctx.font = font ?? '16px Microsoft YaHei, sans-serif'
  ctx.fillStyle = textColor ?? 'rgba(180, 180, 180, 0.3)'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, canvas.width / 10, canvas.height / 2)
  parentNode.style.backgroundImage = `url(${canvas.toDataURL('image/png')})`
}

const waterMarker: AppDirective<WaterMarkerOptions> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<WaterMarkerOptions>) {
    const { text, font, textColor } = binding.value ?? { text: '' }
    if (text) paintWaterMarker(text, el, font, textColor)
  },
  updated(el: HTMLElement, binding: DirectiveBinding<WaterMarkerOptions>) {
    const { text, font, textColor } = binding.value ?? { text: '' }
    el.style.backgroundImage = ''
    if (text) paintWaterMarker(text, el, font, textColor)
  }
}

export default waterMarker
