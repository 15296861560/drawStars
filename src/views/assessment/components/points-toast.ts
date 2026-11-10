import { reactive } from 'vue'

/** 积分飘分 Toast 全局单例状态（各 H5 页面挂 <PointsToast /> 即可消费） */
export interface PointsToastState {
  visible: boolean
  text: string
}

export const pointsToastState = reactive<PointsToastState>({
  visible: false,
  text: ''
})

let timer: number | undefined

/** 展示积分到账提示（多次调用会重置关闭计时并覆盖文案） */
export function showPointsToast(text: string, duration = 2600) {
  pointsToastState.text = text
  pointsToastState.visible = true
  if (timer) window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    pointsToastState.visible = false
  }, duration)
}

/** 延时串行飘分（如 +20 到账后 1.4s 再播补发 +5） */
export function showPointsToastQueue(items: Array<{ text: string; delay?: number }>) {
  items.forEach((item, i) => {
    window.setTimeout(() => showPointsToast(item.text), i === 0 ? 0 : (item.delay ?? 1400))
  })
}
