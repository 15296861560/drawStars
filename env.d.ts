/// <reference types="vite/client" />

declare module '*.svg' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  /** 为 true 时跳过登录校验，且不依赖后端会话 */
  readonly VITE_SKIP_LOGIN?: string
  /** 为 false 时 AI 助手走真实 API（未实现前仍回退 Mock） */
  readonly VITE_AI_ASSISTANT_MOCK?: string
  /** 为 false 时积分模块走真实 API */
  readonly VITE_POINTS_MOCK?: string
  /** set to 'false' to use real task API */
  readonly VITE_TASK_MOCK?: string
}
