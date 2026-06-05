import type { AiConversation, AiMessage } from '@/types/ai-assistant'

const now = Date.now()
const iso = (offsetMs: number) => new Date(now - offsetMs).toISOString()

export const MOCK_CONVERSATIONS: AiConversation[] = [
  {
    id: 'conv-demo',
    title: '功能演示对话',
    group: 'today',
    preview: '已为您生成销售趋势图',
    updatedAt: iso(120000),
    messageCount: 6
  },
  {
    id: 'conv-weather',
    title: '天气查询',
    group: 'today',
    preview: '上海 晴 26°C',
    updatedAt: iso(3600000),
    messageCount: 2
  },
  {
    id: 'conv-translate',
    title: '中英翻译',
    group: 'yesterday',
    preview: 'Hello → 你好',
    updatedAt: iso(86400000),
    messageCount: 2
  },
  {
    id: 'conv-code',
    title: '代码助手',
    group: 'earlier',
    preview: 'Vue3 组合式 API 示例',
    updatedAt: iso(172800000),
    messageCount: 2
  }
]

export const MOCK_MESSAGES: Record<string, AiMessage[]> = {
  'conv-demo': [
    {
      id: 'm1',
      conversationId: 'conv-demo',
      role: 'user',
      type: 'text',
      content: '你好，介绍一下你能做什么？',
      createdAt: iso(600000)
    },
    {
      id: 'm2',
      conversationId: 'conv-demo',
      role: 'assistant',
      type: 'rich',
      content:
        '<p>我是 <strong>DrawStars AI 语音助手</strong>，当前为 Mock 模式，支持：</p><ul><li>文本 / 富文本对话</li><li>语音输入（Web Speech API）</li><li>文件上传解析</li><li>表格与图表展示</li><li>天气、翻译、代码等扩展能力</li></ul><p>试试发送：<code>天气</code>、<code>翻译 hello</code>、<code>图表</code>、<code>表格</code></p>',
      createdAt: iso(590000),
      capabilityId: 'intro'
    },
    {
      id: 'm3',
      conversationId: 'conv-demo',
      role: 'user',
      type: 'voice',
      content: '帮我看一下本周销售情况',
      payload: {
        durationSec: 3.2,
        transcript: '帮我看一下本周销售情况',
        audioUrl: ''
      },
      createdAt: iso(300000)
    },
    {
      id: 'm4',
      conversationId: 'conv-demo',
      role: 'assistant',
      type: 'table',
      content: '本周各渠道销售汇总如下：',
      payload: {
        columns: [
          { prop: 'channel', label: '渠道' },
          { prop: 'orders', label: '订单' },
          { prop: 'amount', label: '金额(万)' }
        ],
        rows: [
          { channel: '官网', orders: 128, amount: 42.6 },
          { channel: '小程序', orders: 256, amount: 68.3 },
          { channel: '线下', orders: 89, amount: 31.2 }
        ]
      },
      createdAt: iso(290000),
      capabilityId: 'table'
    },
    {
      id: 'm5',
      conversationId: 'conv-demo',
      role: 'assistant',
      type: 'chart',
      content: '销售趋势折线图：',
      payload: {
        height: 220,
        option: {
          tooltip: { trigger: 'axis' },
          legend: { data: ['销售额', '订单量'], bottom: 0 },
          grid: { left: 40, right: 20, top: 30, bottom: 50 },
          xAxis: {
            type: 'category',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          },
          yAxis: { type: 'value' },
          series: [
            {
              name: '销售额',
              type: 'line',
              smooth: true,
              data: [12, 18, 15, 22, 28, 35, 30]
            },
            {
              name: '订单量',
              type: 'bar',
              data: [40, 55, 48, 62, 70, 88, 75]
            }
          ]
        }
      },
      createdAt: iso(120000),
      capabilityId: 'chart'
    },
    {
      id: 'm6',
      conversationId: 'conv-demo',
      role: 'assistant',
      type: 'file',
      content: '已生成周报摘要文档（Mock）：',
      payload: {
        name: 'weekly-report-summary.pdf',
        size: 245760,
        mimeType: 'application/pdf',
        url: '#'
      },
      createdAt: iso(100000),
      capabilityId: 'file'
    }
  ],
  'conv-weather': [
    {
      id: 'w1',
      conversationId: 'conv-weather',
      role: 'user',
      type: 'text',
      content: '上海今天天气怎么样？',
      createdAt: iso(3700000)
    },
    {
      id: 'w2',
      conversationId: 'conv-weather',
      role: 'assistant',
      type: 'rich',
      content:
        '<p><strong>上海</strong> · 晴 · <span style="color:#409EFF;font-size:1.2em">26°C</span></p><p>湿度 58% · 东南风 2 级 · 空气质量 良</p>',
      createdAt: iso(3600000),
      capabilityId: 'weather'
    }
  ],
  'conv-translate': [
    {
      id: 't1',
      conversationId: 'conv-translate',
      role: 'user',
      type: 'text',
      content: '翻译：The stars are drawing',
      createdAt: iso(86500000)
    },
    {
      id: 't2',
      conversationId: 'conv-translate',
      role: 'assistant',
      type: 'text',
      content: '「The stars are drawing」→ 「繁星正在绘制」',
      createdAt: iso(86400000),
      capabilityId: 'translate'
    }
  ],
  'conv-code': [
    {
      id: 'c1',
      conversationId: 'conv-code',
      role: 'user',
      type: 'text',
      content: '写一个 Vue3 响应式计数器',
      createdAt: iso(173000000)
    },
    {
      id: 'c2',
      conversationId: 'conv-code',
      role: 'assistant',
      type: 'rich',
      content:
        '<pre><code>import { ref } from \'vue\'\nconst count = ref(0)\nfunction inc() { count.value++ }</code></pre>',
      createdAt: iso(172800000),
      capabilityId: 'code'
    }
  ]
}
