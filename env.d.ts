/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 为 true 时跳过登录校验，且不依赖后端会话 */
  readonly VITE_SKIP_LOGIN?: string;
}
