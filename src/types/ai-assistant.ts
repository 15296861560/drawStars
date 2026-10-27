/** AI 语音助手 — 消息与对话类型（对接真实 API 时保持结构稳定） */

export type AiMessageRole = 'user' | 'assistant' | 'system'

export type AiMessageType =
  | 'text'
  | 'rich'
  | 'voice'
  | 'file'
  | 'table'
  | 'chart'

export type AiConversationGroup = 'today' | 'yesterday' | 'earlier'

export interface AiVoicePayload {
  durationSec: number
  transcript: string
  audioUrl?: string
  /** 转写来源：v1.0 浏览器本地识别；v1.1+ 预留服务端 ASR 回填（PRD 2.2） */
  asrSource?: 'web-speech' | 'server'
}

export interface AiFilePayload {
  name: string
  size: number
  mimeType: string
  url?: string
}

export interface AiTablePayload {
  columns: { prop: string; label: string }[]
  rows: Record<string, string | number>[]
}

export interface AiChartPayload {
  /** ECharts option */
  option: Record<string, unknown>
  height?: number
}

export interface AiThinkingPayload {
  thinking?: string
}

export interface AiMessage {
  id: string
  conversationId: string
  role: AiMessageRole
  type: AiMessageType
  content: string
  payload?:
    | AiVoicePayload
    | AiFilePayload
    | AiTablePayload
    | AiChartPayload
    | AiThinkingPayload
  createdAt: string
  capabilityId?: string
}

export interface AiConversation {
  id: string
  title: string
  group: AiConversationGroup
  preview: string
  updatedAt: string
  messageCount: number
}

export interface AiSendMessagePayload {
  conversationId: string
  content: string
  type?: AiMessageType
  file?: File
  /** 上传接口返回的解析摘要，供大模型与流式对话使用 */
  fileExcerpt?: string
  /** 客户端已选文件元信息（Mock / 展示用） */
  fileMeta?: AiFilePayload
}

export interface AiChatResponse {
  userMessage: AiMessage
  assistantMessage: AiMessage
}

/** 数据问数接口响应（PRD 7.3：POST /api/ai-assistant/data-query） */
export interface AiDataQueryResponse {
  /** 成功时 type 为 table / chart；拒绝或澄清时为 text */
  assistantMessage: AiMessage
  /** 服务端 SQL 审计流水号，用于问数行为留痕（PRD 4.5.4） */
  sqlAuditId: string
}

export interface AiPanelLayout {
  x: number
  y: number
  width: number
  height: number
}

export interface AiFabPosition {
  x: number
  y: number
}
