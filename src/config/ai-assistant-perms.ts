/**
 * AI 语音助手 RBAC 权限码（PRD《AI语音助手 v1.0》附录 B）
 * 三段式 {域}:{资源}:{动作}；字典登记于服务端 RBAC，此处仅作前端引用的单一来源。
 * 上线时 `use` 默认授予全员角色（决策 D01），其余按角色分配。
 */
export const AI_PERM = {
  /** 使用助手（悬浮球 / 面板 / 对话） */
  use: 'system:ai-assistant:use',
  /** 语音输入 + 语音消息存档 */
  voice: 'system:ai-assistant:voice',
  /** 数据问数（NL2SQL） */
  query: 'system:ai-assistant:query',
  /** 问数审计查询页（v1.2+ 预留） */
  audit: 'system:ai-assistant:audit'
} as const
