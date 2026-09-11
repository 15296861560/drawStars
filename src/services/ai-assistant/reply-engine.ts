import type { AiMessage, AiMessageType } from '@/types/ai-assistant'

export interface AiCapabilityHandler {
  id: string
  /** 匹配用户输入 */
  match: (text: string) => boolean
  buildReply: (
    text: string,
    conversationId: string
  ) => Omit<AiMessage, 'id' | 'createdAt'>
}

const uid = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const capabilities: AiCapabilityHandler[] = [
  {
    id: 'weather',
    match: t => /天气|气温|温度|下雨|forecast/i.test(t),
    buildReply: (text, conversationId) => {
      const city = text.match(/([\u4e00-\u9fa5]{2,8})(的)?天气/)?.[1] || '上海'
      return {
        conversationId,
        role: 'assistant',
        type: 'rich',
        content: `<p><strong>${city}</strong> · 晴 · <span style="color:#4C5EDB;font-size:1.15em">26°C</span></p><p>湿度 55% · 微风 · 空气质量 良（Mock 数据）</p>`,
        capabilityId: 'weather'
      }
    }
  },
  {
    id: 'translate',
    match: t => /翻译|translate/i.test(t),
    buildReply: (text, conversationId) => {
      const raw =
        text.replace(/翻译[：:]\s*/i, '').replace(/translate[：:]\s*/i, '') ||
        'hello'
      return {
        conversationId,
        role: 'assistant',
        type: 'text',
        content: `「${raw.trim()}」→ 「${raw.trim()}」（Mock 译义，后续对接翻译 API）`,
        capabilityId: 'translate'
      }
    }
  },
  {
    id: 'chart',
    match: t => /图表|chart|趋势|折线|柱状/i.test(t),
    buildReply: (_text, conversationId) => ({
      conversationId,
      role: 'assistant',
      type: 'chart',
      content: '根据您的描述生成的趋势图（Mock）：',
      capabilityId: 'chart',
      payload: {
        height: 200,
        option: {
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: ['一', '二', '三', '四', '五'] },
          yAxis: { type: 'value' },
          series: [{ type: 'line', smooth: true, data: [8, 15, 12, 22, 18] }]
        }
      }
    })
  },
  {
    id: 'table',
    match: t => /表格|table|列表|数据表/i.test(t),
    buildReply: (_text, conversationId) => ({
      conversationId,
      role: 'assistant',
      type: 'table',
      content: '数据表格（Mock）：',
      capabilityId: 'table',
      payload: {
        columns: [
          { prop: 'name', label: '项目' },
          { prop: 'value', label: '数值' },
          { prop: 'status', label: '状态' }
        ],
        rows: [
          { name: '任务 A', value: 92, status: '完成' },
          { name: '任务 B', value: 76, status: '进行中' },
          { name: '任务 C', value: 45, status: '待开始' }
        ]
      }
    })
  },
  {
    id: 'code',
    match: t => /代码|code|vue|函数|组件/i.test(t),
    buildReply: (_text, conversationId) => ({
      conversationId,
      role: 'assistant',
      type: 'rich',
      content:
        '<p>示例代码（Mock）：</p><pre><code>// composable\nexport function useCounter() {\n  const n = ref(0)\n  return { n, inc: () => n.value++ }\n}</code></pre>',
      capabilityId: 'code'
    })
  },
  {
    id: 'file',
    match: t => /文件|上传|附件|pdf|excel/i.test(t),
    buildReply: (_text, conversationId) => ({
      conversationId,
      role: 'assistant',
      type: 'file',
      content: '已接收并解析文件（Mock）：',
      capabilityId: 'file',
      payload: {
        name: 'analysis-result.xlsx',
        size: 102400,
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        url: '#'
      }
    })
  },
  {
    id: 'reminder',
    match: t => /提醒|日程|闹钟|todo/i.test(t),
    buildReply: (_text, conversationId) => ({
      conversationId,
      role: 'assistant',
      type: 'rich',
      content:
        '<p>已记录提醒（Mock）：</p><ul><li>明日 09:00 团队站会</li><li>周五 18:00 提交周报</li></ul>',
      capabilityId: 'reminder'
    })
  }
]

/** 注册新能力：在 capabilities 数组末尾 push 即可 */
export function registerAiCapability(handler: AiCapabilityHandler) {
  capabilities.push(handler)
}

export function buildAssistantReply(
  userText: string,
  conversationId: string,
  userType: AiMessageType = 'text'
): AiMessage {
  const trimmed = userText.trim()
  const handler = capabilities.find(c => c.match(trimmed))

  const base = handler
    ? handler.buildReply(trimmed, conversationId)
    : {
        conversationId,
        role: 'assistant' as const,
        type: 'rich' as const,
        content: `<p>收到：「${trimmed || '…'}」</p><p>当前为 <em>Mock</em> 模式。可尝试：<code>天气</code>、<code>翻译 hello</code>、<code>图表</code>、<code>表格</code>、<code>代码</code>、<code>提醒</code>。</p>`,
        capabilityId: 'default'
      }

  if (userType === 'voice' && !handler) {
    base.content = `<p>语音识别结果已收到。${base.content}</p>`
  }

  if (userType === 'file' && !handler) {
    base.content = `<p>已收到文件「${trimmed}」。</p><p>当前为 <em>Mock</em> 模式，已模拟解析完成。对接真实 API 后将返回文件摘要与问答。</p>`
    base.capabilityId = 'file'
  }

  return {
    ...base,
    id: uid(),
    createdAt: new Date().toISOString()
  }
}

export function listCapabilityHints(): string[] {
  return [
    '天气 上海',
    '翻译 hello',
    '生成图表',
    '展示表格',
    '写一段 vue 代码',
    '设置提醒',
    '上传文件说明'
  ]
}
