/**
 * F05 权限感知数据问数（NL2SQL）— 前端问数能力（PRD 4.5）
 * 流程：问数意图识别 → 第一层功能权限 system:ai-assistant:query
 *      → 数据集路由 → 第二层数据集前置业务权限 → Mock 只读查询 → 表格渲染（F06）
 * 真实模式下由后端网关执行同样流程，流式回复结构与本文件返回的消息同构（PRD 7.3）。
 */
import type { AiCapabilityHandler } from './reply-engine'
import type { AiMessage } from '@/types/ai-assistant'
import { permissionStore } from '@/stores/permission'
import { AI_PERM } from '@/config/ai-assistant-perms'
import { trackEvent } from '@/plugins/tracker'
import i18n from '@/lang'

/** 组件外翻译（data-query 在 store/service 层被调用） */
function t(key: string, params?: Record<string, unknown>): string {
  return params
    ? i18n.global.t(key, params as Record<string, string>)
    : i18n.global.t(key)
}

interface DatasetDef {
  code: 'points' | 'workflow' | 'tasks' | 'survey' | 'logs'
  /** 命中该数据集的关键词 */
  match: RegExp
  /** 数据集查看所需前置业务权限（第二层校验，PRD 4.5.2） */
  requiredPermission: string
  /** 表格上方的数据结论自述（F06 答案先行） */
  answer: string
  columns: { prop: string; label: string }[]
  rows: Record<string, string | number>[]
}

/** 近 24 小时操作日志：构造 230 行用于验证 >200 行截断话术（PRD 4.6） */
function buildLogsRows(): Record<string, string | number>[] {
  const users = ['王莉', '陈晨', '刘洋', '张伟', '李娜']
  const actions = [
    '登录系统',
    '导出报表',
    '编辑任务',
    '审批流程',
    '查看积分明细'
  ]
  const results = ['成功', '成功', '成功', '成功', '失败']
  const now = Date.now()
  return Array.from({ length: 230 }, (_, i) => ({
    time: new Date(now - (i % 24) * 3600_000)
      .toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
      .replace(/\//g, '-'),
    user: users[i % users.length],
    action: actions[(i * 3) % actions.length],
    result: results[i % results.length]
  }))
}

/** 数据集注册表（PRD 4.5.2：数据集 + 前置业务权限码） */
const DATASETS: DatasetDef[] = [
  {
    code: 'points',
    match: /积分|分数|point/i,
    requiredPermission: 'system:points:list',
    answer: '本月积分发放共计 12,340 分，环比增长 8.2%，明细如下：',
    columns: [
      { prop: 'item', label: '发放项' },
      { prop: 'total', label: '发放量' },
      { prop: 'persons', label: '受益人数' },
      { prop: 'trend', label: '环比' }
    ],
    rows: [
      { item: '签到奖励', total: 4120, persons: 386, trend: '+12.4%' },
      { item: '任务完成', total: 5230, persons: 176, trend: '+6.1%' },
      { item: '流程审批', total: 2080, persons: 95, trend: '-3.2%' },
      { item: '活动奖励', total: 1010, persons: 210, trend: '+21.8%' }
    ]
  },
  {
    code: 'workflow',
    match: /流程|审批|工作流|workflow/i,
    requiredPermission: 'system:workflow:list',
    answer: '本周审批流程共流转 1,286 次，平均节点耗时 4.2 小时：',
    columns: [
      { prop: 'name', label: '流程名称' },
      { prop: 'count', label: '流转次数' },
      { prop: 'avgHours', label: '平均耗时(h)' },
      { prop: 'status', label: '状态' }
    ],
    rows: [
      { name: '请假申请', count: 486, avgHours: 2.1, status: '运行中' },
      { name: '报销审批', count: 322, avgHours: 8.5, status: '运行中' },
      { name: '用章申请', count: 214, avgHours: 1.4, status: '运行中' },
      { name: '转岗申请', count: 42, avgHours: 12.0, status: '已暂停' }
    ]
  },
  {
    code: 'tasks',
    match: /任务|工单|task/i,
    requiredPermission: 'system:task:list',
    answer: '近 30 天任务平均完成率 86.4%，超期任务集中在研发域：',
    columns: [
      { prop: 'domain', label: '任务域' },
      { prop: 'total', label: '任务数' },
      { prop: 'done', label: '已完成' },
      { prop: 'overdue', label: '超期' },
      { prop: 'rate', label: '完成率' }
    ],
    rows: [
      { domain: '研发', total: 186, done: 142, overdue: 18, rate: '76.3%' },
      { domain: '运营', total: 96, done: 91, overdue: 2, rate: '94.8%' },
      { domain: '设计', total: 64, done: 62, overdue: 0, rate: '96.9%' },
      { domain: '市场', total: 58, done: 52, overdue: 1, rate: '89.7%' }
    ]
  },
  {
    code: 'survey',
    match: /问卷|调研|回访|survey/i,
    requiredPermission: 'survey:questionnaire:list',
    answer: '3 月调研问卷回收率 72.5%，共回收 1,450 份：',
    columns: [
      { prop: 'name', label: '问卷名称' },
      { prop: 'sent', label: '发放' },
      { prop: 'collected', label: '回收' },
      { prop: 'rate', label: '回收率' }
    ],
    rows: [
      { name: '首页改版满意度', sent: 620, collected: 458, rate: '73.9%' },
      { name: 'NPS 月度调研', sent: 520, collected: 361, rate: '69.4%' },
      { name: '功能期望收集', sent: 310, collected: 249, rate: '80.3%' }
    ]
  },
  {
    code: 'logs',
    match: /日志|操作记录|登录记录|log/i,
    requiredPermission: 'system:logs:list',
    answer: '近 24 小时系统操作共 230 次：',
    columns: [
      { prop: 'time', label: '时间' },
      { prop: 'user', label: '操作人' },
      { prop: 'action', label: '操作内容' },
      { prop: 'result', label: '结果' }
    ],
    rows: buildLogsRows()
  }
]

/** 问数特征词：命中才进入问数流程，避免误抢既有能力（F08 零改动） */
const QUERY_INTENT_RE =
  /多少|几条|几个|几人|统计|汇总|排行|排名|榜单|top\s*\d*|总量|总数|总计|占比|比例|完成率|发放量|明细|分布|趋势|有没有|哪些|情况如何|看一下|查询|查一下|帮我查|数量/i

/** 空结果演示词（须被 QUERY_INTENT_RE 命中，用于演示空结果话术） */
const EMPTY_RE = /无数据|没有记录|空结果|查不到/i

/** 单次问数最大返回行数（服务端强制 LIMIT 200，PRD 4.5.4） */
const MAX_ROWS = 200

function matchDataset(text: string): DatasetDef | undefined {
  return DATASETS.find(d => d.match.test(text))
}

/** 构造问数回复（Mock）：权限校验 + 数据集路由 + 固定话术 */
function buildDataQueryReply(
  text: string,
  conversationId: string
): Omit<AiMessage, 'id' | 'createdAt'> {
  trackEvent('ai_query_submit', { question: text.slice(0, 50) })
  const permission = permissionStore()

  // 第一层：功能权限（无权时不展示快捷问数入口，此处兜底直接对话，PRD 4.5.1）
  if (!permission.hasPermission(AI_PERM.query)) {
    trackEvent('ai_query_deny', { code: 'QUERY_PERM_DENIED' })
    return {
      conversationId,
      role: 'assistant',
      type: 'text',
      content: t('aiAssistant.queryNoPerm'),
      capabilityId: 'data-query'
    }
  }

  // 数据集路由：未命中时引导澄清（支持的数据集清单）
  const dataset = matchDataset(text)
  if (!dataset) {
    return {
      conversationId,
      role: 'assistant',
      type: 'text',
      content: t('aiAssistant.queryDatasetNone'),
      capabilityId: 'data-query'
    }
  }

  // 第二层：数据集前置业务权限
  if (!permission.hasPermission(dataset.requiredPermission)) {
    trackEvent('ai_query_deny', {
      code: 'QUERY_PERM_DENIED',
      dataset: dataset.code
    })
    return {
      conversationId,
      role: 'assistant',
      type: 'text',
      content: t('aiAssistant.queryDatasetNoPerm', {
        dataset: t(`aiAssistant.datasets.${dataset.code}`)
      }),
      capabilityId: 'data-query'
    }
  }

  // 空结果：固定话术 + 条件回显（PRD 4.6）
  if (EMPTY_RE.test(text)) {
    trackEvent('ai_query_success', { dataset: dataset.code, rows: 0 })
    return {
      conversationId,
      role: 'assistant',
      type: 'text',
      content: `${t('aiAssistant.queryEmpty')}（${text}）`,
      capabilityId: 'data-query'
    }
  }

  // 行数超限：截断至 200 行并提示缩小时间范围追问
  if (dataset.rows.length > MAX_ROWS) {
    trackEvent('ai_query_success', {
      dataset: dataset.code,
      rows: MAX_ROWS
    })
    return {
      conversationId,
      role: 'assistant',
      type: 'table',
      content: `${dataset.answer}\n${t('aiAssistant.queryOverLimit')}`,
      capabilityId: 'data-query',
      payload: {
        columns: dataset.columns,
        rows: dataset.rows.slice(0, MAX_ROWS).map(r => ({ ...r }))
      }
    }
  }

  trackEvent('ai_query_success', {
    dataset: dataset.code,
    rows: dataset.rows.length
  })
  return {
    conversationId,
    role: 'assistant',
    type: 'table',
    content: dataset.answer,
    capabilityId: 'data-query',
    payload: {
      columns: dataset.columns,
      rows: dataset.rows.map(r => ({ ...r }))
    }
  }
}

/** 供 api 层 dataQuery Mock 分支使用：返回带 id / createdAt 的完整消息 */
export function buildDataQueryReplyMessage(
  text: string,
  conversationId: string
): AiMessage {
  return {
    ...buildDataQueryReply(text, conversationId),
    id: `dq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString()
  }
}

/** 问数能力 handler：注册在 capabilities 末尾，既有能力优先匹配（PRD 9.4 缺陷 4） */
export const dataQueryCapability: AiCapabilityHandler = {
  id: 'data-query',
  match: text => QUERY_INTENT_RE.test(text),
  buildReply: (text, conversationId) =>
    buildDataQueryReply(text, conversationId)
}

/** 问数快捷入口 chips（有 query 权限时置于 hint 列表首位） */
export const DATA_QUERY_HINTS = [
  '这个月积分发放了多少',
  '统计任务完成率',
  '查看最近的操作日志统计'
]
