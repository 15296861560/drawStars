import type {
  AiChatResponse,
  AiConversation,
  AiMessage,
  AiSendMessagePayload
} from '@/types/ai-assistant'
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from './mock-data'
import { buildAssistantReply } from './reply-engine'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

const conversations = [...MOCK_CONVERSATIONS]
const messagesMap: Record<string, AiMessage[]> = Object.fromEntries(
  Object.entries(MOCK_MESSAGES).map(([k, v]) => [k, [...v]])
)

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function sortConversations() {
  conversations.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export async function fetchConversations(): Promise<AiConversation[]> {
  await delay(200)
  sortConversations()
  return conversations.map(c => ({ ...c }))
}

export async function fetchMessages(
  conversationId: string
): Promise<AiMessage[]> {
  await delay(150)
  return [...(messagesMap[conversationId] || [])]
}

export async function createConversation(
  title = '新对话'
): Promise<AiConversation> {
  await delay(200)
  const conv: AiConversation = {
    id: uid('conv'),
    title,
    group: 'today',
    preview: '',
    updatedAt: new Date().toISOString(),
    messageCount: 0
  }
  conversations.unshift(conv)
  messagesMap[conv.id] = []
  return { ...conv }
}

export async function sendChatMessage(
  payload: AiSendMessagePayload
): Promise<AiChatResponse> {
  await delay(500 + Math.random() * 400)

  const list = messagesMap[payload.conversationId] || []
  const userMessage: AiMessage = {
    id: uid('msg'),
    conversationId: payload.conversationId,
    role: 'user',
    type: payload.type || 'text',
    content: payload.content,
    createdAt: new Date().toISOString()
  }

  if (payload.type === 'voice') {
    userMessage.payload = {
      durationSec: 2 + Math.random() * 2,
      transcript: payload.content,
      audioUrl: ''
    }
  }

  if (payload.file) {
    userMessage.type = 'file'
    userMessage.content = `上传文件：${payload.file.name}`
    userMessage.payload = {
      name: payload.file.name,
      size: payload.file.size,
      mimeType: payload.file.type || 'application/octet-stream'
    }
  }

  list.push(userMessage)

  const assistantMessage = buildAssistantReply(
    payload.content,
    payload.conversationId,
    userMessage.type
  )
  list.push(assistantMessage)
  messagesMap[payload.conversationId] = list

  const conv = conversations.find(c => c.id === payload.conversationId)
  if (conv) {
    conv.preview = assistantMessage.content.replace(/<[^>]+>/g, '').slice(0, 40)
    conv.updatedAt = assistantMessage.createdAt
    conv.messageCount = list.length
    if (conv.title === '新对话' && payload.content) {
      conv.title = payload.content.slice(0, 16)
    }
    sortConversations()
  }

  return { userMessage, assistantMessage }
}

export async function mockVoiceToText(): Promise<string> {
  await delay(300)
  const samples = [
    '上海今天天气怎么样',
    '帮我生成一张销售趋势图',
    '翻译 hello world',
    '展示本周任务表格'
  ]
  return samples[Math.floor(Math.random() * samples.length)]
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await delay(100)
  const idx = conversations.findIndex(c => c.id === conversationId)
  if (idx >= 0) conversations.splice(idx, 1)
  delete messagesMap[conversationId]
}
