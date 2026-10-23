/**
 * 全局在途请求计数（模块级单例）
 * 由 axios 请求拦截器维护增减；通用表格 BaseTable 默认跟随该状态展示 loading
 */
import { ref } from 'vue'

/** 当前在途（已发出未返回）的请求数量 */
export const reqInflight = ref(0)

/** 请求发出时计数 +1（放在请求拦截器首行） */
export const trackRequestBegin = () => {
  reqInflight.value++
}

/** 请求结束（成功/失败）时计数 -1，防负数兜底 */
export const trackRequestEnd = () => {
  reqInflight.value = Math.max(0, reqInflight.value - 1)
}
