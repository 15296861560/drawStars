/**
 * AI 语音助手 API 层
 * VITE_AI_ASSISTANT_MOCK=false 时走 Nest 后端 /api/ai-assistant/*
 */
import type {
  AiChatResponse,
  AiConversation,
  AiDataQueryResponse,
  AiMessage,
  AiSendMessagePayload
} from '@/types/ai-assistant'
import { $axios, $axiosGet } from '@/assets/js/axios-api/axios-config.js'
import { apiInfoStore } from '@/stores/api-info'
import { userInfoStore } from '@/stores/user-info'
import { trackEvent } from '@/plugins/tracker'
import { buildDataQueryReplyMessage } from '@/services/ai-assistant/data-query'
import * as mockService from '@/services/ai-assistant'

const USE_MOCK = import.meta.env.VITE_AI_ASSISTANT_MOCK !== 'false'

const USE_STREAM = import.meta.env.VITE_AI_ASSISTANT_STREAM !== 'false'

function unwrap<T>(res: { status?: boolean; data?: T }): T {
  if (res?.status && res.data != null) return res.data
  throw new Error('AI assistant API error')
}

export interface AiUploadResult {
  fileId: string
  name: string
  mimeType: string
  size: number
  url: string
  excerpt: string
}

export type AiStreamEventType =
  | 'userMessage'
  | 'thinkingStart'
  | 'thinkingDelta'
  | 'delta'
  | 'done'
  | 'error'

export interface AiStreamHandlers {
  onUserMessage?: (msg: AiMessage) => void
  onThinkingStart?: () => void
  onThinkingDelta?: (chunk: string, full: string) => void
  onDelta?: (chunk: string, full: string) => void
  onDone?: (res: AiChatResponse) => void
  onError?: (message: string) => void
}

/** 当前是否处于 AI Mock 演示模式（语音输入入口等场景判断用，真实模式隐藏不支持的能力） */
export function isAiMockMode(): boolean {
  return USE_MOCK
}

export async function getConversations(): Promise<AiConversation[]> {
  if (USE_MOCK) return mockService.fetchConversations()
  const res = await $axiosGet({}, '/api/ai-assistant/conversations')
  return unwrap<AiConversation[]>(res)
}

export async function getMessages(
  conversationId: string
): Promise<AiMessage[]> {
  if (USE_MOCK) return mockService.fetchMessages(conversationId)
  const res = await $axiosGet(
    {},
    `/api/ai-assistant/conversations/${conversationId}/messages`
  )
  return unwrap<AiMessage[]>(res)
}

export async function createConversation(
  title?: string
): Promise<AiConversation> {
  if (USE_MOCK) return mockService.createConversation(title)
  const res = await $axios(
    { title: title || '新对话' },
    '/api/ai-assistant/conversations'
  )
  return unwrap<AiConversation>(res)
}

export async function uploadFile(file: File): Promise<AiUploadResult> {
  if (USE_MOCK) {
    return {
      fileId: `mock-${Date.now()}`,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      url: '#',
      excerpt: `（Mock）已接收文件 ${file.name}，大小 ${file.size} 字节`
    }
  }

  const apiInfo = apiInfoStore()
  const userInfo = userInfoStore()
  const form = new FormData()
  form.append('file', file)

  const base = apiInfo.getURL.value
  const token = userInfo.getToken.value
  const headers: Record<string, string> = {}
  if (token) headers.accessToken = token

  const resp = await fetch(`${base}/api/ai-assistant/upload`, {
    method: 'POST',
    headers,
    body: form
  })
  const json = await resp.json()
  if (!json.status) throw new Error(json.msg || 'upload failed')
  return json.data as AiUploadResult
}

function parseSseBlock(
  block: string,
  handlers: AiStreamHandlers,
  state: {
    full: string
    thinking: string
    userMessage?: AiMessage
    assistantMessage?: AiMessage
  }
) {
  const lines = block.split('\n')
  let event = 'message'
  let dataLine = ''
  for (const line of lines) {
    if (line.startsWith('event:')) event = line.slice(6).trim()
    if (line.startsWith('data:')) dataLine += line.slice(5).trim()
  }
  if (!dataLine && event !== 'thinkingStart') return

  const payload = dataLine ? JSON.parse(dataLine) : {}
  if (event === 'userMessage') {
    state.userMessage = payload as AiMessage
    handlers.onUserMessage?.(state.userMessage)
  } else if (event === 'thinkingStart') {
    handlers.onThinkingStart?.()
  } else if (event === 'thinkingDelta') {
    const chunk = (payload as { content?: string }).content || ''
    state.thinking += chunk
    handlers.onThinkingDelta?.(chunk, state.thinking)
  } else if (event === 'delta') {
    const chunk = (payload as { content?: string }).content || ''
    state.full += chunk
    handlers.onDelta?.(chunk, state.full)
  } else if (event === 'done') {
    const done = payload as AiChatResponse
    state.userMessage = done.userMessage
    state.assistantMessage = done.assistantMessage
    handlers.onDone?.(done)
  } else if (event === 'error') {
    handlers.onError?.((payload as { message?: string }).message || 'error')
  }
}

export async function sendMessageStream(
  payload: AiSendMessagePayload,
  handlers: AiStreamHandlers
): Promise<AiChatResponse> {
  if (USE_MOCK) {
    const res = await mockService.sendChatMessage(payload)
    handlers.onUserMessage?.(res.userMessage)
    handlers.onThinkingStart?.()
    // 问数回复展示问数过程文案（PRD 4.5.1 思考过程），其余能力走通用文案
    const thinking =
      res.assistantMessage.capabilityId === 'data-query'
        ? '识别到数据查询意图…\n正在校验数据问数权限…\n检索可用数据集并生成只读查询…\n正在执行查询并装载结果…'
        : '分析问题意图…\n检索可用能力与上下文…\n组织回复结构…'
    let thinkingAcc = ''
    for (const ch of thinking) {
      thinkingAcc += ch
      handlers.onThinkingDelta?.(ch, thinkingAcc)
      await new Promise(r => setTimeout(r, 12))
    }
    const answer = res.assistantMessage.content
    let full = ''
    const step = Math.max(1, Math.ceil(answer.length / 24))
    for (let i = 0; i < answer.length; i += step) {
      const chunk = answer.slice(i, i + step)
      full += chunk
      handlers.onDelta?.(chunk, full)
      await new Promise(r => setTimeout(r, 30))
    }
    res.assistantMessage.payload = {
      ...res.assistantMessage.payload,
      thinking: thinkingAcc
    }
    handlers.onDone?.(res)
    return res
  }

  const apiInfo = apiInfoStore()
  const userInfo = userInfoStore()
  const base = apiInfo.getURL.value
  const token = userInfo.getToken.value
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (token) headers.accessToken = token

  const body: Record<string, unknown> = {
    conversationId: payload.conversationId,
    content: payload.content,
    type: payload.type || 'text'
  }
  if (payload.fileExcerpt) body.fileExcerpt = payload.fileExcerpt
  if (payload.fileMeta) body.fileMeta = payload.fileMeta

  const resp = await fetch(`${base}/api/ai-assistant/chat/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  if (!resp.ok || !resp.body) {
    throw new Error(`stream failed: ${resp.status}`)
  }

  const reader = resp.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  const state: {
    full: string
    thinking: string
    userMessage?: AiMessage
    assistantMessage?: AiMessage
  } = { full: '', thinking: '' }
  let result: AiChatResponse | null = null

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() || ''
    for (const part of parts) {
      if (!part.trim()) continue
      parseSseBlock(part, handlers, state)
      if (state.userMessage && state.assistantMessage) {
        result = {
          userMessage: state.userMessage,
          assistantMessage: state.assistantMessage
        }
      }
    }
  }

  if (buffer.trim()) {
    parseSseBlock(buffer, handlers, state)
    if (state.userMessage && state.assistantMessage) {
      result = {
        userMessage: state.userMessage,
        assistantMessage: state.assistantMessage
      }
    }
  }

  if (!result) throw new Error('stream ended without done event')
  return result
}

export async function sendMessage(
  payload: AiSendMessagePayload
): Promise<AiChatResponse> {
  if (USE_MOCK) return mockService.sendChatMessage(payload)

  if (USE_STREAM) {
    return sendMessageStream(payload, {})
  }

  const body: Record<string, unknown> = {
    conversationId: payload.conversationId,
    content: payload.content,
    type: payload.type || 'text'
  }
  if (payload.fileExcerpt) body.fileExcerpt = payload.fileExcerpt
  if (payload.fileMeta) body.fileMeta = payload.fileMeta

  const res = await $axios(body, '/api/ai-assistant/chat')
  return unwrap<AiChatResponse>(res)
}

export async function sendMessageWithOptions(
  payload: AiSendMessagePayload,
  handlers?: AiStreamHandlers
): Promise<AiChatResponse> {
  if (USE_MOCK) return mockService.sendChatMessage(payload)
  if (USE_STREAM && handlers) {
    return sendMessageStream(payload, handlers)
  }
  return sendMessage(payload)
}

export function preferStream(): boolean {
  return !USE_MOCK && USE_STREAM
}

export async function voiceToText(): Promise<string> {
  if (USE_MOCK) return mockService.mockVoiceToText()
  return mockService.mockVoiceToText()
}

/**
 * 数据问数同步接口（PRD 7.3：POST /api/ai-assistant/data-query）
 * 流式对话内问数由 /chat/stream 下发同构消息，此函数用于同步问数与审计对接。
 * Mock 分支复用 data-query 能力（权限校验/话术随 Mock 同构）。
 */
export async function dataQuery(payload: {
  conversationId: string
  question: string
}): Promise<AiDataQueryResponse> {
  if (USE_MOCK) {
    const assistantMessage = buildDataQueryReplyMessage(
      payload.question,
      payload.conversationId
    )
    return {
      assistantMessage,
      sqlAuditId: `mock-audit-${Date.now()}`
    }
  }

  trackEvent('ai_query_submit', { question: payload.question.slice(0, 50) })
  try {
    const res = await $axios(payload, '/api/ai-assistant/data-query')
    const data = unwrap<AiDataQueryResponse>(res)
    trackEvent('ai_query_success', {
      capabilityId: data.assistantMessage.capabilityId,
      type: data.assistantMessage.type
    })
    return data
  } catch (err) {
    trackEvent('ai_query_fail', {
      code: err instanceof Error ? err.message.slice(0, 50) : 'QUERY_DB_ERROR'
    })
    throw err
  }
}
