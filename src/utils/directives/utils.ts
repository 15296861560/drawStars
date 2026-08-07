export function findInputLike(
  parent: HTMLElement
): HTMLInputElement | HTMLTextAreaElement {
  const tag = parent.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea') {
    return parent as HTMLInputElement | HTMLTextAreaElement
  }
  const nested = parent.querySelector('input, textarea')
  if (!nested) {
    throw new Error('v-emoji / v-trim: 未找到 input 或 textarea 元素')
  }
  return nested as HTMLInputElement | HTMLTextAreaElement
}

export function dispatchInputEvent(el: HTMLElement): void {
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

/** 常见 emoji 正则（与历史实现保持一致） */
export const EMOJI_REG =
  // eslint-disable-next-line no-misleading-character-class
  /[\uD83C\uD83D\uD83E][\uDC00-\uDFFF][\u200D\uFE0F]|[\uD83C\uD83D\uD83E][\uDC00-\uDFFF]|[0-9*#]\uFE0F\u20E3|[0-9#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\u00A9\u00AE]\u3030|\u00A9|\u00AE|\u3030/gi

export function parseDelay(
  binding: { value?: unknown; arg?: string },
  defaultMs: number
): number {
  const fromArg = binding.arg ? Number(binding.arg) : NaN
  if (!Number.isNaN(fromArg) && fromArg > 0) return fromArg
  if (typeof binding.value === 'object' && binding.value !== null) {
    const delay = (binding.value as { delay?: number }).delay
    if (typeof delay === 'number' && delay > 0) return delay
  }
  return defaultMs
}
