/**
 * 流程编排系统 API 层
 * 遵循项目现有 API 模式：支持 mock/真实 API 切换
 * 读操作校验 status 并返回 data；写操作返回原始响应（{ status, msg, data }），
 * 由页面按 res?.status === false 统一提示
 */
import type {
  WorkflowCategory,
  Workflow,
  WorkflowVersion,
  WorkflowExecution,
  ExecutionStepLog,
  WorkflowTool,
  WorkflowTemplate,
  WorkflowAlertRule,
  WorkflowOverview,
  TrendItem,
  WorkflowStatistics,
  GraphData,
  WorkflowListQuery,
  WorkflowPayload,
  AuditPayload,
  ExecutionListQuery,
  ExecutePayload,
  ToolListQuery,
  ToolPayload,
  TemplateListQuery,
  TemplatePayload,
  InstallTemplatePayload,
  AlertListQuery,
  AlertPayload,
  CategoryPayload
} from '@/types/workflow'
import {
  $axios,
  $axiosGet,
  requests
} from '@/assets/js/axios-api/axios-config.js'

/** 后端统一响应包装（写操作原样返回，页面判断 status） */
export interface ApiResponse<T = unknown> {
  status: boolean
  msg: string
  data: T
}

/** OpenAPI 工具导入载荷 */
export interface ImportToolPayload {
  spec: Record<string, unknown>
}

/** OpenAPI 工具导入结果 */
export interface ImportToolResult {
  imported: WorkflowTool[]
  skipped: number
}

/** 工具连通性测试结果 */
export interface ToolTestResult {
  ok: boolean
  mocked: boolean
  toolCode: string
  status?: number
  durationMs?: number
  data?: unknown
  params?: Record<string, unknown>
}

/** 执行数据导出查询条件 */
export interface ExportQuery {
  workflowId?: number | string
  status?: string
  startTime?: string
  endTime?: string
}

// ==================== Mock 数据 ====================

const USE_MOCK = import.meta.env.VITE_WORKFLOW_MOCK !== 'false'

async function delay(ms: number = 300) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** 过滤空查询参数，避免 undefined 被拼进 query string */
function cleanParams<T extends Record<string, unknown>>(params: T): T {
  const res: Record<string, unknown> = {}
  Object.keys(params).forEach(key => {
    const v = params[key]
    if (v !== undefined && v !== null && v !== '') {
      res[key] = v
    }
  })
  return res as T
}

function ok<T>(msg: string, data: T): ApiResponse<T> {
  return { status: true, msg, data }
}

const now = () => new Date().toISOString()
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()

let mockIdSeq = 100
const nextId = () => ++mockIdSeq
const nextNo = (prefix: string) => {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `${prefix}${ymd}${String(nextId()).slice(-3).padStart(3, '0')}`
}

function sampleGraph(): GraphData {
  return {
    nodes: [
      {
        id: 'n1',
        type: 'TRIGGER',
        name: '手动触发',
        position: { x: 80, y: 200 },
        config: { triggerType: 'MANUAL' }
      },
      {
        id: 'n2',
        type: 'AGENT',
        name: '内容生成',
        position: { x: 340, y: 200 },
        config: { prompt: '根据输入整理一份摘要', model: 'default' }
      },
      {
        id: 'n3',
        type: 'OUTPUT',
        name: '结果输出',
        position: { x: 600, y: 200 },
        config: { format: 'text' }
      }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' }
    ]
  }
}

const mockCategories: WorkflowCategory[] = [
  {
    id: 1,
    name: '办公协同',
    code: 'office',
    icon: 'OfficeBuilding',
    description: '审批、通知、日报类流程',
    sortOrder: 1,
    enabled: true,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(10)
  },
  {
    id: 2,
    name: '数据处理',
    code: 'data',
    icon: 'DataAnalysis',
    description: '清洗、同步、报表类流程',
    sortOrder: 2,
    enabled: true,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(10)
  },
  {
    id: 3,
    name: '客户服务',
    code: 'service',
    icon: 'Service',
    description: '工单、回访、提醒类流程',
    sortOrder: 3,
    enabled: true,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(10)
  }
]

const mockWorkflows: Workflow[] = [
  {
    id: 1,
    workflowNo: 'WF20260601001',
    name: '日报自动生成',
    description: '每日定时汇总业务数据并生成日报',
    icon: 'Document',
    categoryId: 1,
    category: { id: 1, name: '办公协同', code: 'office' },
    tags: ['日报', '定时'],
    status: 'PUBLISHED',
    currentVersion: 3,
    triggerType: 'CRON',
    graphData: sampleGraph(),
    globalConfig: { timeout: 300, retry: 1 },
    creatorId: 1,
    auditorId: 1,
    auditedAt: daysAgo(60),
    auditRemark: '审核通过',
    executionCount: 42,
    lastExecutedAt: daysAgo(1),
    createdAt: daysAgo(90),
    updatedAt: daysAgo(1),
    deletedAt: null
  },
  {
    id: 2,
    workflowNo: 'WF20260615002',
    name: '数据清洗同步',
    description: '从外部系统拉取数据并清洗入库',
    icon: 'DataAnalysis',
    categoryId: 2,
    category: { id: 2, name: '数据处理', code: 'data' },
    tags: ['ETL'],
    status: 'PUBLISHED',
    currentVersion: 2,
    triggerType: 'WEBHOOK',
    graphData: sampleGraph(),
    globalConfig: { timeout: 600, retry: 2 },
    creatorId: 1,
    auditorId: 1,
    auditedAt: daysAgo(40),
    auditRemark: '审核通过',
    executionCount: 128,
    lastExecutedAt: daysAgo(0),
    createdAt: daysAgo(70),
    updatedAt: daysAgo(0),
    deletedAt: null
  },
  {
    id: 3,
    workflowNo: 'WF20260720003',
    name: '工单自动分派',
    description: '按客户等级自动分派客服工单',
    icon: 'Service',
    categoryId: 3,
    category: { id: 3, name: '客户服务', code: 'service' },
    tags: ['工单'],
    status: 'PAUSED',
    currentVersion: 5,
    triggerType: 'EVENT',
    graphData: sampleGraph(),
    globalConfig: { timeout: 300, retry: 1 },
    creatorId: 1,
    auditorId: 1,
    auditedAt: daysAgo(30),
    auditRemark: '审核通过',
    executionCount: 310,
    lastExecutedAt: daysAgo(3),
    createdAt: daysAgo(60),
    updatedAt: daysAgo(3),
    deletedAt: null
  },
  {
    id: 4,
    workflowNo: 'WF20260828004',
    name: '营销周报生成',
    description: '汇总一周营销数据生成周报（草稿）',
    icon: 'PieChart',
    categoryId: 1,
    category: { id: 1, name: '办公协同', code: 'office' },
    tags: ['周报'],
    status: 'DRAFT',
    currentVersion: 1,
    triggerType: 'MANUAL',
    graphData: sampleGraph(),
    globalConfig: { timeout: 300, retry: 0 },
    creatorId: 1,
    auditorId: null,
    auditedAt: null,
    auditRemark: null,
    executionCount: 0,
    lastExecutedAt: null,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
    deletedAt: null
  },
  {
    id: 5,
    workflowNo: 'WF20260830005',
    name: '简历初筛助手',
    description: 'AI 初步筛选候选人简历',
    icon: 'User',
    categoryId: 2,
    category: { id: 2, name: '数据处理', code: 'data' },
    tags: ['AI', '招聘'],
    status: 'PENDING',
    currentVersion: 2,
    triggerType: 'MANUAL',
    graphData: sampleGraph(),
    globalConfig: { timeout: 600, retry: 1 },
    creatorId: 1,
    auditorId: null,
    auditedAt: null,
    auditRemark: null,
    executionCount: 0,
    lastExecutedAt: null,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(2),
    deletedAt: null
  }
]

const mockExecutions: WorkflowExecution[] = [
  {
    id: 1,
    executionNo: 'EX20260908001',
    workflowId: 1,
    workflowVersion: 3,
    workflow: { id: 1, name: '日报自动生成', workflowNo: 'WF20260601001' },
    status: 'SUCCEEDED',
    triggerType: 'CRON',
    triggerData: { cron: '0 9 * * *' },
    result: { summary: '日报已生成', output: '今日共处理 128 条数据' },
    errorMessage: null,
    errorNodeId: null,
    durationMs: 4200,
    startedAt: daysAgo(1),
    finishedAt: daysAgo(1),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1)
  },
  {
    id: 2,
    executionNo: 'EX20260908002',
    workflowId: 2,
    workflowVersion: 2,
    workflow: { id: 2, name: '数据清洗同步', workflowNo: 'WF20260615002' },
    status: 'FAILED',
    triggerType: 'WEBHOOK',
    triggerData: { source: 'crm' },
    result: null,
    errorMessage: '节点[调用接口]请求超时',
    errorNodeId: 'n2',
    durationMs: 10000,
    startedAt: daysAgo(0),
    finishedAt: daysAgo(0),
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0)
  },
  {
    id: 3,
    executionNo: 'EX20260909003',
    workflowId: 3,
    workflowVersion: 5,
    workflow: { id: 3, name: '工单自动分派', workflowNo: 'WF20260720003' },
    status: 'RUNNING',
    triggerType: 'EVENT',
    triggerData: { event: 'ticket.created' },
    result: null,
    errorMessage: null,
    errorNodeId: null,
    durationMs: null,
    startedAt: daysAgo(0),
    finishedAt: null,
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0)
  },
  {
    id: 4,
    executionNo: 'EX20260907004',
    workflowId: 1,
    workflowVersion: 3,
    workflow: { id: 1, name: '日报自动生成', workflowNo: 'WF20260601001' },
    status: 'CANCELLED',
    triggerType: 'CRON',
    triggerData: { cron: '0 9 * * *' },
    result: null,
    errorMessage: '用户手动取消',
    errorNodeId: null,
    durationMs: 800,
    startedAt: daysAgo(2),
    finishedAt: daysAgo(2),
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2)
  }
]

const mockTools: WorkflowTool[] = [
  {
    id: 1,
    name: '发送站内信',
    code: 'send_message',
    category: 'NOTIFICATION',
    description: '向指定用户发送站内消息',
    icon: 'Bell',
    endpoint: null,
    method: 'GET',
    authConfig: null,
    paramSchema: { userId: 'number', content: 'string' },
    outputSchema: { success: 'boolean' },
    isBuiltin: true,
    enabled: true,
    creatorId: null,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90)
  },
  {
    id: 2,
    name: '数据表查询',
    code: 'db_query',
    category: 'DATA',
    description: '按 SQL 查询业务数据表',
    icon: 'Search',
    endpoint: null,
    method: 'GET',
    authConfig: null,
    paramSchema: { table: 'string', limit: 'number' },
    outputSchema: { rows: 'array' },
    isBuiltin: true,
    enabled: true,
    creatorId: null,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90)
  },
  {
    id: 3,
    name: '天气查询',
    code: 'weather_api',
    category: 'PLATFORM',
    description: '第三方天气开放接口',
    icon: 'Cloudy',
    endpoint: 'https://api.example.com/weather',
    method: 'GET',
    authConfig: { type: 'none' },
    paramSchema: { city: 'string' },
    outputSchema: { temp: 'number', text: 'string' },
    isBuiltin: false,
    enabled: true,
    creatorId: 1,
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20)
  }
]

const mockTemplates: WorkflowTemplate[] = [
  {
    id: 1,
    name: '每日数据日报',
    description: '定时拉取数据 → AI 总结 → 发送通知',
    icon: 'Document',
    category: 'office',
    graphData: sampleGraph(),
    globalConfig: { timeout: 300, retry: 1 },
    previewImage: null,
    authorId: 1,
    isOfficial: true,
    installCount: 36,
    rating: 4.8,
    enabled: true,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(10)
  },
  {
    id: 2,
    name: '客户反馈自动分类',
    description: '收集反馈 → AI 分类 → 分派处理人',
    icon: 'ChatDotRound',
    category: 'service',
    graphData: sampleGraph(),
    globalConfig: { timeout: 600, retry: 1 },
    previewImage: null,
    authorId: 1,
    isOfficial: false,
    installCount: 12,
    rating: 4.2,
    enabled: true,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5)
  }
]

const mockAlerts: WorkflowAlertRule[] = [
  {
    id: 1,
    workflowId: 1,
    workflow: { id: 1, name: '日报自动生成', workflowNo: 'WF20260601001' },
    ruleType: 'FAILURE_RATE',
    threshold: 20,
    windowMinutes: 60,
    notifyChannels: ['EMAIL'],
    notifyUsers: ['1'],
    enabled: true,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(30)
  },
  {
    id: 2,
    workflowId: null,
    workflow: null,
    ruleType: 'FAILURE_COUNT',
    threshold: 10,
    windowMinutes: 30,
    notifyChannels: ['EMAIL', 'MESSAGE'],
    notifyUsers: ['1'],
    enabled: true,
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15)
  }
]

/** 列表项不携带画布数据（与后端 list 行为一致） */
function toListWorkflow(w: Workflow): Workflow {
  const item = { ...w }
  delete item.graphData
  delete item.globalConfig
  return item
}

/** 为指定流程动态生成版本列表（v1..currentVersion，倒序） */
function mockVersions(workflow: Workflow): WorkflowVersion[] {
  const list: WorkflowVersion[] = []
  for (let v = workflow.currentVersion; v >= 1; v--) {
    list.push({
      id: workflow.id * 100 + v,
      workflowId: workflow.id,
      version: v,
      changeNote: v === 1 ? '初始版本' : `第 ${v} 次调整`,
      createdBy: workflow.creatorId,
      createdAt: daysAgo(workflow.currentVersion - v + 1)
    })
  }
  return list
}

/** 为指定执行生成节点日志（按流程画布节点） */
function mockLogs(execution: WorkflowExecution): ExecutionStepLog[] {
  const wf = mockWorkflows.find(w => w.id === execution.workflowId)
  const nodes = (wf?.graphData as GraphData | undefined)?.nodes || []
  return nodes.map((n, i) => {
    let status: ExecutionStepLog['status'] = 'SUCCEEDED'
    if (execution.status === 'FAILED') {
      status = n.id === execution.errorNodeId ? 'FAILED' : 'SUCCEEDED'
    } else if (execution.status === 'RUNNING') {
      status = i === nodes.length - 1 ? 'RUNNING' : 'SUCCEEDED'
    } else if (execution.status === 'CANCELLED') {
      status = i === nodes.length - 1 ? 'SKIPPED' : 'SUCCEEDED'
    }
    const duration = 300 + i * 400
    return {
      id: execution.id * 100 + i,
      executionId: execution.id,
      nodeId: n.id,
      nodeType: n.type,
      nodeName: n.name,
      status,
      inputData: i === 0 ? { trigger: true } : { from: nodes[i - 1].name },
      outputData: status === 'FAILED' ? null : { text: `${n.name} 输出内容` },
      errorMessage: status === 'FAILED' ? execution.errorMessage : null,
      retryCount: 0,
      durationMs: status === 'RUNNING' ? null : duration,
      startedAt: execution.startedAt,
      finishedAt: status === 'RUNNING' ? null : execution.finishedAt,
      createdAt: execution.createdAt
    }
  })
}

function paginate<T>(rows: T[], page = 1, pageSize = 10) {
  return {
    list: rows.slice((page - 1) * pageSize, page * pageSize),
    total: rows.length
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

// ==================== 流程管理 ====================

/** 流程列表（deleted=1 时查回收站） */
export async function getWorkflows(
  params?: WorkflowListQuery
): Promise<{ list: Workflow[]; total: number }> {
  if (USE_MOCK) {
    await delay()
    const deleted = params?.deleted === '1'
    const keyword = params?.keyword?.trim()
    const rows = mockWorkflows
      .filter(w => deleted === Boolean(w.deletedAt))
      .filter(w =>
        keyword
          ? w.name.includes(keyword) || (w.description || '').includes(keyword)
          : true
      )
      .filter(w => (params?.status ? w.status === params.status : true))
      .filter(w =>
        params?.categoryId ? w.categoryId === Number(params.categoryId) : true
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    const page = params?.page || 1
    const pageSize = params?.pageSize || 10
    return paginate(rows.map(toListWorkflow), page, pageSize)
  }
  const res = await $axiosGet(
    cleanParams((params || {}) as Record<string, unknown>),
    '/workflows'
  )
  if (!res?.status) {
    throw new Error(res?.msg || '加载流程列表失败')
  }
  return res.data
}

/** 创建流程 */
export async function createWorkflow(
  data: WorkflowPayload
): Promise<ApiResponse<Workflow>> {
  if (USE_MOCK) {
    await delay()
    const categoryId = Number(data.categoryId) || mockCategories[0].id
    const category = mockCategories.find(c => c.id === categoryId)
    const item: Workflow = {
      id: nextId(),
      workflowNo: nextNo('WF'),
      name: data.name,
      description: data.description ?? null,
      icon: data.icon ?? null,
      categoryId,
      category: category
        ? { id: category.id, name: category.name, code: category.code }
        : null,
      tags: data.tags ?? [],
      status: 'DRAFT',
      currentVersion: 1,
      triggerType: 'MANUAL',
      graphData: data.graphData || sampleGraph(),
      globalConfig: data.globalConfig || { timeout: 300, retry: 0 },
      creatorId: 1,
      auditorId: null,
      auditedAt: null,
      auditRemark: null,
      executionCount: 0,
      lastExecutedAt: null,
      createdAt: now(),
      updatedAt: now(),
      deletedAt: null
    }
    mockWorkflows.push(item)
    return ok('创建成功', toListWorkflow(item))
  }
  return $axios(data, '/workflows')
}

/** 流程详情（含画布数据） */
export async function getWorkflowDetail(
  id: number | string
): Promise<Workflow> {
  if (USE_MOCK) {
    await delay()
    const item = mockWorkflows.find(w => w.id === Number(id))
    if (!item) throw new Error('流程不存在')
    return { ...item }
  }
  const res = await $axiosGet({}, `/workflows/${id}`)
  if (!res?.status) {
    throw new Error(res?.msg || '加载流程详情失败')
  }
  return res.data
}

/** 更新流程（保存产生新版本快照） */
export async function updateWorkflow(
  id: number | string,
  data: Partial<WorkflowPayload>
): Promise<ApiResponse<Workflow>> {
  if (USE_MOCK) {
    await delay()
    const item = mockWorkflows.find(w => w.id === Number(id))
    if (!item) return { status: false, msg: '流程不存在', data: null }
    if (data.graphData) item.triggerType = extractTriggerType(data.graphData)
    Object.assign(item, {
      name: data.name ?? item.name,
      description: data.description ?? item.description,
      icon: data.icon ?? item.icon,
      categoryId:
        data.categoryId != null ? Number(data.categoryId) : item.categoryId,
      tags: data.tags ?? item.tags,
      graphData: data.graphData || item.graphData,
      globalConfig: data.globalConfig || item.globalConfig,
      currentVersion: item.currentVersion + 1,
      updatedAt: now()
    })
    const category = mockCategories.find(c => c.id === item.categoryId)
    item.category = category
      ? { id: category.id, name: category.name, code: category.code }
      : null
    return ok('保存成功', toListWorkflow(item))
  }
  return requests({
    url: `/api/workflows/${id}`,
    data,
    method: 'put'
  })
}

/** 从画布 TRIGGER 节点提取触发方式 */
function extractTriggerType(graph: GraphData): Workflow['triggerType'] {
  const trigger = graph.nodes.find(n => n.type === 'TRIGGER')
  const t = String(trigger?.config?.triggerType || 'MANUAL').toUpperCase()
  return (
    ['CRON', 'WEBHOOK', 'MANUAL', 'EVENT'].includes(t) ? t : 'MANUAL'
  ) as Workflow['triggerType']
}

/** 删除流程（软删除，进回收站） */
export async function deleteWorkflow(
  id: number | string
): Promise<ApiResponse<boolean>> {
  if (USE_MOCK) {
    await delay()
    const item = mockWorkflows.find(w => w.id === Number(id))
    if (!item) return { status: false, msg: '流程不存在', data: null }
    item.deletedAt = now()
    item.updatedAt = now()
    return ok('删除成功', true)
  }
  return requests({ url: `/api/workflows/${id}`, method: 'delete' })
}

/** 克隆流程 */
export async function copyWorkflow(
  id: number | string
): Promise<ApiResponse<Workflow>> {
  if (USE_MOCK) {
    await delay()
    const item = mockWorkflows.find(w => w.id === Number(id))
    if (!item) return { status: false, msg: '流程不存在', data: null }
    const copy: Workflow = {
      ...item,
      id: nextId(),
      workflowNo: nextNo('WF'),
      name: `${item.name}-副本`,
      status: 'DRAFT',
      currentVersion: 1,
      executionCount: 0,
      lastExecutedAt: null,
      auditorId: null,
      auditedAt: null,
      auditRemark: null,
      creatorId: 1,
      createdAt: now(),
      updatedAt: now(),
      deletedAt: null
    }
    mockWorkflows.push(copy)
    return ok('克隆成功', toListWorkflow(copy))
  }
  return $axios({}, `/workflows/${id}/copy`)
}

/** 提交发布审核（DRAFT/REJECTED → PENDING） */
export async function publishWorkflow(
  id: number | string
): Promise<ApiResponse<Workflow>> {
  if (USE_MOCK) {
    await delay()
    const item = mockWorkflows.find(w => w.id === Number(id))
    if (!item) return { status: false, msg: '流程不存在', data: null }
    if (!['DRAFT', 'REJECTED'].includes(item.status)) {
      return {
        status: false,
        msg: '仅草稿/驳回状态的流程可提交审核',
        data: null
      }
    }
    item.status = 'PENDING'
    item.updatedAt = now()
    return ok('已提交审核', toListWorkflow(item))
  }
  return $axios({}, `/workflows/${id}/publish`)
}

/** 审核（PENDING → PUBLISHED / REJECTED） */
export async function auditWorkflow(
  id: number | string,
  payload: AuditPayload
): Promise<ApiResponse<Workflow>> {
  if (USE_MOCK) {
    await delay()
    const item = mockWorkflows.find(w => w.id === Number(id))
    if (!item) return { status: false, msg: '流程不存在', data: null }
    item.status = payload.approved ? 'PUBLISHED' : 'REJECTED'
    item.auditorId = 1
    item.auditedAt = now()
    item.auditRemark = payload.remark ?? null
    item.updatedAt = now()
    return ok('审核完成', toListWorkflow(item))
  }
  return $axios(payload, `/workflows/${id}/audit`)
}

/** 暂停（PUBLISHED → PAUSED） */
export async function pauseWorkflow(
  id: number | string
): Promise<ApiResponse<Workflow>> {
  if (USE_MOCK) {
    await delay()
    const item = mockWorkflows.find(w => w.id === Number(id))
    if (!item) return { status: false, msg: '流程不存在', data: null }
    item.status = 'PAUSED'
    item.updatedAt = now()
    return ok('已暂停', toListWorkflow(item))
  }
  return $axios({}, `/workflows/${id}/pause`)
}

/** 恢复（PAUSED → PUBLISHED） */
export async function resumeWorkflow(
  id: number | string
): Promise<ApiResponse<Workflow>> {
  if (USE_MOCK) {
    await delay()
    const item = mockWorkflows.find(w => w.id === Number(id))
    if (!item) return { status: false, msg: '流程不存在', data: null }
    item.status = 'PUBLISHED'
    item.updatedAt = now()
    return ok('已恢复', toListWorkflow(item))
  }
  return $axios({}, `/workflows/${id}/resume`)
}

/** 下线（PUBLISHED/PAUSED → OFFLINE） */
export async function offlineWorkflow(
  id: number | string
): Promise<ApiResponse<Workflow>> {
  if (USE_MOCK) {
    await delay()
    const item = mockWorkflows.find(w => w.id === Number(id))
    if (!item) return { status: false, msg: '流程不存在', data: null }
    item.status = 'OFFLINE'
    item.updatedAt = now()
    return ok('已下线', toListWorkflow(item))
  }
  return $axios({}, `/workflows/${id}/offline`)
}

/** 从回收站恢复（→ DRAFT） */
export async function restoreWorkflow(
  id: number | string
): Promise<ApiResponse<Workflow>> {
  if (USE_MOCK) {
    await delay()
    const item = mockWorkflows.find(w => w.id === Number(id))
    if (!item || !item.deletedAt) {
      return { status: false, msg: '回收站中不存在该流程', data: null }
    }
    item.deletedAt = null
    item.status = 'DRAFT'
    item.updatedAt = now()
    return ok('已恢复', toListWorkflow(item))
  }
  return $axios({}, `/workflows/${id}/restore`)
}

/** 版本快照列表 */
export async function getWorkflowVersions(
  id: number | string
): Promise<{ list: WorkflowVersion[]; total: number }> {
  if (USE_MOCK) {
    await delay()
    const item = mockWorkflows.find(w => w.id === Number(id))
    if (!item) throw new Error('流程不存在')
    const list = mockVersions(item)
    return { list, total: list.length }
  }
  const res = await $axiosGet({}, `/workflows/${id}/versions`)
  if (!res?.status) {
    throw new Error(res?.msg || '加载版本列表失败')
  }
  return res.data
}

/** 回滚到指定版本（生成新版本快照） */
export async function rollbackWorkflow(
  id: number | string,
  version: number | string
): Promise<ApiResponse<Workflow>> {
  if (USE_MOCK) {
    await delay()
    const item = mockWorkflows.find(w => w.id === Number(id))
    if (!item) return { status: false, msg: '流程不存在', data: null }
    if (Number(version) > item.currentVersion) {
      return { status: false, msg: '目标版本不存在', data: null }
    }
    item.currentVersion += 1
    item.updatedAt = now()
    return ok('回滚成功', toListWorkflow(item))
  }
  return $axios({}, `/workflows/${id}/versions/${version}/rollback`)
}

// ==================== 流程执行 ====================

/** 手动触发执行（仅 PUBLISHED） */
export async function executeWorkflow(
  id: number | string,
  payload?: ExecutePayload
): Promise<WorkflowExecution> {
  if (USE_MOCK) {
    await delay(600)
    return mockRunExecution(id, payload, false)
  }
  const res = await $axios(payload || {}, `/workflows/${id}/execute`)
  if (!res?.status) {
    throw new Error(res?.msg || '触发执行失败')
  }
  return res.data
}

/** 测试运行（草稿态） */
export async function testWorkflow(
  id: number | string,
  payload?: ExecutePayload
): Promise<WorkflowExecution> {
  if (USE_MOCK) {
    await delay(600)
    return mockRunExecution(id, payload, true)
  }
  const res = await $axios(payload || {}, `/workflows/${id}/test`)
  if (!res?.status) {
    throw new Error(res?.msg || '测试运行失败')
  }
  return res.data
}

/** mock：生成一条执行记录 */
function mockRunExecution(
  id: number | string,
  payload?: ExecutePayload,
  isTest = false
): WorkflowExecution {
  const wf = mockWorkflows.find(w => w.id === Number(id))
  if (!wf) throw new Error('流程不存在')
  if (!isTest && wf.status !== 'PUBLISHED') {
    throw new Error('仅已发布的流程可手动执行')
  }
  if (isTest && !['DRAFT', 'REJECTED', 'PENDING'].includes(wf.status)) {
    throw new Error('仅草稿态流程可测试运行')
  }
  const execution: WorkflowExecution = {
    id: nextId(),
    executionNo: nextNo('EX'),
    workflowId: wf.id,
    workflowVersion: wf.currentVersion,
    workflow: { id: wf.id, name: wf.name, workflowNo: wf.workflowNo },
    status: 'SUCCEEDED',
    triggerType: 'MANUAL',
    triggerData: payload?.input || {},
    result: {
      output: `${wf.name} 执行完成`,
      nodes: ((wf.graphData as GraphData).nodes || []).map(n => n.name)
    },
    errorMessage: null,
    errorNodeId: null,
    durationMs: 1500 + Math.floor(Math.random() * 3000),
    startedAt: now(),
    finishedAt: now(),
    createdAt: now(),
    updatedAt: now()
  }
  mockExecutions.unshift(execution)
  wf.executionCount += 1
  wf.lastExecutedAt = now()
  wf.updatedAt = now()
  return execution
}

/** 执行历史列表（管理端） */
export async function getExecutions(
  params?: ExecutionListQuery
): Promise<{ list: WorkflowExecution[]; total: number }> {
  if (USE_MOCK) {
    await delay()
    const rows = filterExecutions(mockExecutions, params)
    const paged = paginate(rows, params?.page || 1, params?.pageSize || 10)
    return paged
  }
  const res = await $axiosGet(
    cleanParams((params || {}) as Record<string, unknown>),
    '/workflow-executions'
  )
  if (!res?.status) {
    throw new Error(res?.msg || '加载执行历史失败')
  }
  return res.data
}

/** 我创建的流程的执行记录（用户端，登录即可见） */
export async function getMyExecutions(
  params?: Pick<
    ExecutionListQuery,
    'page' | 'pageSize' | 'status' | 'triggerType'
  >
): Promise<{ list: WorkflowExecution[]; total: number }> {
  if (USE_MOCK) {
    await delay()
    const rows = filterExecutions(mockExecutions, params)
    const paged = paginate(rows, params?.page || 1, params?.pageSize || 10)
    return paged
  }
  const res = await $axiosGet(
    cleanParams((params || {}) as Record<string, unknown>),
    '/workflow-executions/mine'
  )
  if (!res?.status) {
    throw new Error(res?.msg || '加载我的执行失败')
  }
  return res.data
}

function filterExecutions(
  rows: WorkflowExecution[],
  params?: Partial<ExecutionListQuery>
) {
  return rows
    .filter(r =>
      params?.workflowId ? r.workflowId === Number(params.workflowId) : true
    )
    .filter(r => (params?.status ? r.status === params.status : true))
    .filter(r =>
      params?.triggerType ? r.triggerType === params.triggerType : true
    )
    .filter(r => (params?.startTime ? r.createdAt >= params.startTime : true))
    .filter(r => (params?.endTime ? r.createdAt <= params.endTime : true))
}

/** 执行详情 */
export async function getExecutionDetail(
  id: number | string
): Promise<WorkflowExecution> {
  if (USE_MOCK) {
    await delay()
    const item = mockExecutions.find(e => e.id === Number(id))
    if (!item) throw new Error('执行记录不存在')
    return { ...item }
  }
  const res = await $axiosGet({}, `/workflow-executions/${id}`)
  if (!res?.status) {
    throw new Error(res?.msg || '加载执行详情失败')
  }
  return res.data
}

/** 取消执行 */
export async function cancelExecution(
  id: number | string
): Promise<ApiResponse<WorkflowExecution>> {
  if (USE_MOCK) {
    await delay()
    const item = mockExecutions.find(e => e.id === Number(id))
    if (!item) return { status: false, msg: '执行记录不存在', data: null }
    if (!['PENDING', 'RUNNING', 'PAUSED'].includes(item.status)) {
      return {
        status: false,
        msg: '仅待执行/运行中/已暂停的记录可取消',
        data: null
      }
    }
    item.status = 'CANCELLED'
    item.finishedAt = now()
    item.updatedAt = now()
    return ok('已取消', item)
  }
  return $axios({}, `/workflow-executions/${id}/cancel`)
}

/** 基于历史执行输入重新执行 */
export async function rerunExecution(
  id: number | string
): Promise<WorkflowExecution> {
  if (USE_MOCK) {
    await delay(600)
    const item = mockExecutions.find(e => e.id === Number(id))
    if (!item) throw new Error('执行记录不存在')
    const execution = {
      ...item,
      id: nextId(),
      executionNo: nextNo('EX'),
      status: 'SUCCEEDED' as const,
      errorMessage: null,
      errorNodeId: null,
      durationMs: 1500 + Math.floor(Math.random() * 3000),
      startedAt: now(),
      finishedAt: now(),
      createdAt: now(),
      updatedAt: now()
    }
    mockExecutions.unshift(execution)
    return execution
  }
  const res = await $axios({}, `/workflow-executions/${id}/rerun`)
  if (!res?.status) {
    throw new Error(res?.msg || '重新执行失败')
  }
  return res.data
}

/** 节点执行日志 */
export async function getExecutionLogs(
  id: number | string
): Promise<{ list: ExecutionStepLog[]; total: number }> {
  if (USE_MOCK) {
    await delay()
    const item = mockExecutions.find(e => e.id === Number(id))
    if (!item) throw new Error('执行记录不存在')
    const list = mockLogs(item)
    return { list, total: list.length }
  }
  const res = await $axiosGet({}, `/workflow-executions/${id}/logs`)
  if (!res?.status) {
    throw new Error(res?.msg || '加载执行日志失败')
  }
  return res.data
}

// ==================== 工具管理 ====================

/** 工具列表 */
export async function getTools(
  params?: ToolListQuery
): Promise<{ list: WorkflowTool[]; total: number }> {
  if (USE_MOCK) {
    await delay()
    const rows = mockTools
      .filter(t =>
        params?.keyword
          ? t.name.includes(params.keyword) || t.code.includes(params.keyword)
          : true
      )
      .filter(t => (params?.category ? t.category === params.category : true))
      .filter(t =>
        params?.enabled === 'true' || params?.enabled === 'false'
          ? t.enabled === (params.enabled === 'true')
          : true
      )
      .filter(t =>
        params?.isBuiltin === 'true' || params?.isBuiltin === 'false'
          ? t.isBuiltin === (params.isBuiltin === 'true')
          : true
      )
      .sort((a, b) => Number(b.isBuiltin) - Number(a.isBuiltin))
    return paginate(rows, params?.page || 1, params?.pageSize || 10)
  }
  const res = await $axiosGet(
    cleanParams((params || {}) as Record<string, unknown>),
    '/workflow-tools'
  )
  if (!res?.status) {
    throw new Error(res?.msg || '加载工具列表失败')
  }
  return res.data
}

/** 创建工具 */
export async function createTool(
  data: ToolPayload
): Promise<ApiResponse<WorkflowTool>> {
  if (USE_MOCK) {
    await delay()
    if (mockTools.some(t => t.code === data.code)) {
      return { status: false, msg: '工具编码已存在', data: null }
    }
    const item: WorkflowTool = {
      id: nextId(),
      name: data.name,
      code: data.code,
      category: data.category,
      description: data.description ?? null,
      icon: data.icon ?? null,
      endpoint: data.endpoint ?? null,
      method: (data.method || 'GET').toUpperCase(),
      authConfig: data.authConfig ?? null,
      paramSchema: data.paramSchema ?? {},
      outputSchema: data.outputSchema ?? {},
      isBuiltin: false,
      enabled: data.enabled ?? true,
      creatorId: 1,
      createdAt: now(),
      updatedAt: now()
    }
    mockTools.push(item)
    return ok('创建成功', item)
  }
  return $axios(data, '/workflow-tools')
}

/** 从 OpenAPI 定义批量导入工具 */
export async function importTool(
  payload: ImportToolPayload
): Promise<ApiResponse<ImportToolResult>> {
  if (USE_MOCK) {
    await delay()
    const spec = payload.spec || {}
    const paths = (spec.paths || {}) as Record<
      string,
      Record<string, { operationId?: string; summary?: string }>
    >
    const servers = Array.isArray(spec.servers)
      ? (spec.servers as { url?: string }[])
      : []
    const baseUrl = servers[0]?.url || ''
    const methods = ['get', 'post', 'put', 'delete', 'patch']
    const imported: WorkflowTool[] = []
    let skipped = 0
    Object.keys(paths).forEach(route => {
      const item = paths[route] || {}
      Object.keys(item).forEach(m => {
        if (!methods.includes(m)) {
          return
        }
        const op = item[m]
        const code = String(op?.operationId || `${m}_${route}`).replace(
          /[^A-Za-z0-9_-]/g,
          '_'
        )
        if (mockTools.some(t => t.code === code) || !code) {
          skipped += 1
          return
        }
        const tool: WorkflowTool = {
          id: nextId(),
          name: op?.summary || code,
          code,
          category: 'PLATFORM',
          description: op?.summary || `${m.toUpperCase()} ${route}`,
          icon: null,
          endpoint: baseUrl ? `${baseUrl}${route}` : null,
          method: m.toUpperCase(),
          authConfig: null,
          paramSchema: {},
          outputSchema: {},
          isBuiltin: false,
          enabled: true,
          creatorId: 1,
          createdAt: now(),
          updatedAt: now()
        }
        mockTools.push(tool)
        imported.push(tool)
      })
    })
    return ok('导入成功', { imported, skipped })
  }
  return $axios(payload, '/workflow-tools/import')
}

/** 工具连通性测试 */
export async function testTool(
  id: number | string,
  params?: Record<string, unknown>
): Promise<ToolTestResult> {
  if (USE_MOCK) {
    await delay()
    const tool = mockTools.find(t => t.id === Number(id))
    if (!tool) throw new Error('工具不存在')
    return {
      ok: true,
      mocked: true,
      toolCode: tool.code,
      params: params || {}
    }
  }
  const res = await $axios(
    { params: params || {} },
    `/workflow-tools/${id}/test`
  )
  if (!res?.status) {
    throw new Error(res?.msg || '测试失败')
  }
  return res.data
}

/** 更新工具 */
export async function updateTool(
  id: number | string,
  data: Partial<ToolPayload>
): Promise<ApiResponse<WorkflowTool>> {
  if (USE_MOCK) {
    await delay()
    const item = mockTools.find(t => t.id === Number(id))
    if (!item) return { status: false, msg: '工具不存在', data: null }
    Object.assign(item, {
      name: data.name ?? item.name,
      category: data.category ?? item.category,
      description: data.description ?? item.description,
      icon: data.icon ?? item.icon,
      endpoint: data.endpoint ?? item.endpoint,
      method: (data.method || item.method).toUpperCase(),
      authConfig: data.authConfig ?? item.authConfig,
      paramSchema: data.paramSchema ?? item.paramSchema,
      outputSchema: data.outputSchema ?? item.outputSchema,
      enabled: data.enabled ?? item.enabled,
      updatedAt: now()
    })
    return ok('更新成功', item)
  }
  return requests({
    url: `/api/workflow-tools/${id}`,
    data,
    method: 'put'
  })
}

/** 删除工具 */
export async function deleteTool(
  id: number | string
): Promise<ApiResponse<boolean>> {
  if (USE_MOCK) {
    await delay()
    const idx = mockTools.findIndex(t => t.id === Number(id))
    if (idx < 0) return { status: false, msg: '工具不存在', data: null }
    if (mockTools[idx].isBuiltin) {
      return { status: false, msg: '内置工具不允许删除', data: null }
    }
    mockTools.splice(idx, 1)
    return ok('删除成功', true)
  }
  return requests({ url: `/api/workflow-tools/${id}`, method: 'delete' })
}

// ==================== 模板市场 ====================

/** 模板列表 */
export async function getTemplates(
  params?: TemplateListQuery
): Promise<{ list: WorkflowTemplate[]; total: number }> {
  if (USE_MOCK) {
    await delay()
    const rows = mockTemplates
      .filter(t =>
        params?.keyword
          ? t.name.includes(params.keyword) ||
            (t.description || '').includes(params.keyword)
          : true
      )
      .filter(t => (params?.category ? t.category === params.category : true))
      .filter(t =>
        params?.isOfficial === 'true' || params?.isOfficial === 'false'
          ? t.isOfficial === (params.isOfficial === 'true')
          : true
      )
      .sort(
        (a, b) =>
          Number(b.isOfficial) - Number(a.isOfficial) ||
          b.installCount - a.installCount
      )
    return paginate(rows, params?.page || 1, params?.pageSize || 10)
  }
  const res = await $axiosGet(
    cleanParams((params || {}) as Record<string, unknown>),
    '/workflow-templates'
  )
  if (!res?.status) {
    throw new Error(res?.msg || '加载模板列表失败')
  }
  return res.data
}

/** 发布模板（以当前流程画布为蓝本） */
export async function createTemplate(
  data: TemplatePayload
): Promise<ApiResponse<WorkflowTemplate>> {
  if (USE_MOCK) {
    await delay()
    const item: WorkflowTemplate = {
      id: nextId(),
      name: data.name,
      description: data.description ?? null,
      icon: data.icon ?? null,
      category: data.category,
      graphData: data.graphData,
      globalConfig: data.globalConfig ?? { timeout: 300, retry: 0 },
      previewImage: null,
      authorId: 1,
      isOfficial: false,
      installCount: 0,
      rating: 0,
      enabled: true,
      createdAt: now(),
      updatedAt: now()
    }
    mockTemplates.push(item)
    const { graphData: _g, globalConfig: _c, ...rest } = item
    return ok('发布成功', rest as WorkflowTemplate)
  }
  return $axios(data, '/workflow-templates')
}

/** 模板详情（含画布数据） */
export async function getTemplateDetail(
  id: number | string
): Promise<WorkflowTemplate> {
  if (USE_MOCK) {
    await delay()
    const item = mockTemplates.find(t => t.id === Number(id))
    if (!item) throw new Error('模板不存在')
    return { ...item }
  }
  const res = await $axiosGet({}, `/workflow-templates/${id}`)
  if (!res?.status) {
    throw new Error(res?.msg || '加载模板详情失败')
  }
  return res.data
}

/** 一键安装模板：以模板画布创建 DRAFT 流程 */
export async function installTemplate(
  id: number | string,
  payload: InstallTemplatePayload
): Promise<ApiResponse<Workflow>> {
  if (USE_MOCK) {
    await delay()
    const tpl = mockTemplates.find(t => t.id === Number(id))
    if (!tpl) return { status: false, msg: '模板不存在', data: null }
    const categoryId = Number(payload.categoryId) || mockCategories[0].id
    const category = mockCategories.find(c => c.id === categoryId)
    const item: Workflow = {
      id: nextId(),
      workflowNo: nextNo('WF'),
      name: payload.name || `${tpl.name}(来自模板)`,
      description: tpl.description,
      icon: tpl.icon,
      categoryId,
      category: category
        ? { id: category.id, name: category.name, code: category.code }
        : null,
      tags: ['模板安装'],
      status: 'DRAFT',
      currentVersion: 1,
      triggerType: 'MANUAL',
      graphData: (tpl.graphData as GraphData) || sampleGraph(),
      globalConfig: tpl.globalConfig || { timeout: 300, retry: 0 },
      creatorId: 1,
      auditorId: null,
      auditedAt: null,
      auditRemark: null,
      executionCount: 0,
      lastExecutedAt: null,
      createdAt: now(),
      updatedAt: now(),
      deletedAt: null
    }
    mockWorkflows.push(item)
    tpl.installCount += 1
    return ok('安装成功', toListWorkflow(item))
  }
  return $axios(payload, `/workflow-templates/${id}/install`)
}

// ==================== 统计 ====================

/** 执行总览 */
export async function getWorkflowOverview(): Promise<WorkflowOverview> {
  if (USE_MOCK) {
    await delay()
    const total = mockExecutions.length
    const succeeded = mockExecutions.filter(
      e => e.status === 'SUCCEEDED'
    ).length
    const failed = mockExecutions.filter(e => e.status === 'FAILED').length
    const durations = mockExecutions
      .filter(e => e.status === 'SUCCEEDED' && e.durationMs != null)
      .map(e => e.durationMs as number)
    const statusCount: Record<string, number> = {}
    mockWorkflows.forEach(w => {
      statusCount[w.status] = (statusCount[w.status] || 0) + 1
    })
    const triggerCount: Record<string, number> = {}
    mockWorkflows.forEach(w => {
      triggerCount[w.triggerType] = (triggerCount[w.triggerType] || 0) + 1
    })
    return {
      todayTotal: total,
      todaySucceeded: succeeded,
      todayFailed: failed,
      successRate: total ? round2((succeeded / total) * 100) : 0,
      avgDurationMs: durations.length
        ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
        : 0,
      activeWorkflowCount: mockWorkflows.filter(
        w => w.status === 'PUBLISHED' && !w.deletedAt
      ).length,
      backlog: mockExecutions.filter(e =>
        ['PENDING', 'RUNNING'].includes(e.status)
      ).length,
      workflowStatus: Object.keys(statusCount).map(status => ({
        status,
        count: statusCount[status]
      })),
      triggerTypeDistribution: Object.keys(triggerCount).map(triggerType => ({
        triggerType,
        count: triggerCount[triggerType]
      }))
    }
  }
  const res = await $axiosGet({}, '/workflows/statistics/overview')
  if (!res?.status) {
    throw new Error(res?.msg || '加载统计概览失败')
  }
  return res.data
}

/** 近 N 天执行趋势 */
export async function getWorkflowTrend(days?: number): Promise<TrendItem[]> {
  if (USE_MOCK) {
    await delay()
    const n = days && days > 0 ? Math.min(days, 90) : 7
    const list: TrendItem[] = []
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      const seed = d.getDate() + d.getMonth() * 31
      const total = 6 + (seed % 10)
      const succeeded = Math.max(1, total - (seed % 3))
      const failed = total - succeeded
      list.push({
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        total,
        succeeded,
        failed,
        successRate: round2((succeeded / total) * 100),
        avgDurationMs: 2000 + (seed % 5) * 500
      })
    }
    return list
  }
  const res = await $axiosGet(
    days ? { days } : {},
    '/workflows/statistics/trend'
  )
  if (!res?.status) {
    throw new Error(res?.msg || '加载执行趋势失败')
  }
  // 后端返回 { days, list }，此处取趋势数组
  return Array.isArray(res.data) ? res.data : res.data?.list || []
}

/** 单流程分析 */
export async function getWorkflowStatistics(
  id: number | string,
  days?: number
): Promise<WorkflowStatistics> {
  if (USE_MOCK) {
    await delay()
    const wf = mockWorkflows.find(w => w.id === Number(id))
    if (!wf) throw new Error('流程不存在')
    const rows = mockExecutions.filter(e => e.workflowId === wf.id)
    const succeeded = rows.filter(e => e.status === 'SUCCEEDED').length
    const failed = rows.filter(e => e.status === 'FAILED').length
    const durations = rows
      .filter(e => e.status === 'SUCCEEDED' && e.durationMs != null)
      .map(e => e.durationMs as number)
    const n = days && days > 0 ? Math.min(days, 90) : 30
    const trend: TrendItem[] = []
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      const seed = (d.getDate() + wf.id) % 7
      const total = seed
      const s = Math.max(0, total - (seed % 2))
      trend.push({
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        total,
        succeeded: s,
        failed: total - s,
        successRate: total ? round2((s / total) * 100) : 100,
        avgDurationMs: 1800 + seed * 300
      })
    }
    const triggerCount: Record<string, number> = {}
    rows.forEach(e => {
      triggerCount[e.triggerType] = (triggerCount[e.triggerType] || 0) + 1
    })
    return {
      workflow: {
        id: wf.id,
        workflowNo: wf.workflowNo,
        name: wf.name,
        status: wf.status
      },
      total: rows.length,
      succeeded,
      failed,
      successRate: rows.length ? round2((succeeded / rows.length) * 100) : 0,
      avgDurationMs: durations.length
        ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
        : 0,
      days: n,
      triggerDistribution: Object.keys(triggerCount).map(triggerType => ({
        triggerType,
        count: triggerCount[triggerType]
      })),
      trend
    }
  }
  const res = await $axiosGet(
    days ? { days } : {},
    `/workflows/statistics/${id}`
  )
  if (!res?.status) {
    throw new Error(res?.msg || '加载流程分析失败')
  }
  return res.data
}

/** 导出执行数据（返回 CSV 内容，页面负责另存为文件） */
export async function exportWorkflowStatistics(
  params?: ExportQuery
): Promise<string> {
  if (USE_MOCK) {
    await delay()
    const rows = filterExecutions(mockExecutions, params)
    const header = [
      '执行编号',
      '流程名称',
      '流程编号',
      '版本',
      '状态',
      '触发方式',
      '耗时(ms)',
      '开始时间',
      '结束时间',
      '错误信息'
    ]
    const lines = rows.map(r =>
      [
        r.executionNo,
        r.workflow?.name || '',
        r.workflow?.workflowNo || '',
        r.workflowVersion,
        r.status,
        r.triggerType,
        r.durationMs ?? '',
        r.startedAt ?? '',
        r.finishedAt ?? '',
        (r.errorMessage || '').replace(/[,\n]/g, ' ')
      ].join(',')
    )
    return '\uFEFF' + [header.join(','), ...lines].join('\n')
  }
  const res = await $axios(params || {}, '/workflows/statistics/export')
  if (!res?.status) {
    throw new Error(res?.msg || '导出失败')
  }
  return res.data
}

// ==================== 告警规则 ====================

/** 告警规则列表 */
export async function getAlertRules(
  params?: AlertListQuery
): Promise<{ list: WorkflowAlertRule[]; total: number }> {
  if (USE_MOCK) {
    await delay()
    const rows = mockAlerts
      .filter(r =>
        params?.workflowId ? r.workflowId === Number(params.workflowId) : true
      )
      .filter(r =>
        params?.enabled === 'true' || params?.enabled === 'false'
          ? r.enabled === (params.enabled === 'true')
          : true
      )
    return paginate(rows, params?.page || 1, params?.pageSize || 10)
  }
  const res = await $axiosGet(
    cleanParams((params || {}) as Record<string, unknown>),
    '/workflow-alerts'
  )
  if (!res?.status) {
    throw new Error(res?.msg || '加载告警规则失败')
  }
  return res.data
}

/** 创建告警规则 */
export async function createAlertRule(
  data: AlertPayload
): Promise<ApiResponse<WorkflowAlertRule>> {
  if (USE_MOCK) {
    await delay()
    const workflowId =
      data.workflowId != null && data.workflowId !== ''
        ? Number(data.workflowId)
        : null
    const wf = mockWorkflows.find(w => w.id === workflowId)
    const item: WorkflowAlertRule = {
      id: nextId(),
      workflowId,
      workflow: wf
        ? { id: wf.id, name: wf.name, workflowNo: wf.workflowNo }
        : null,
      ruleType: data.ruleType,
      threshold: data.threshold,
      windowMinutes: data.windowMinutes ?? 30,
      notifyChannels: data.notifyChannels,
      notifyUsers: data.notifyUsers ?? [],
      enabled: data.enabled ?? true,
      createdAt: now(),
      updatedAt: now()
    }
    mockAlerts.push(item)
    return ok('创建成功', item)
  }
  return $axios(data, '/workflow-alerts')
}

/** 更新告警规则 */
export async function updateAlertRule(
  id: number | string,
  data: Partial<AlertPayload>
): Promise<ApiResponse<WorkflowAlertRule>> {
  if (USE_MOCK) {
    await delay()
    const item = mockAlerts.find(r => r.id === Number(id))
    if (!item) return { status: false, msg: '规则不存在', data: null }
    const workflowId =
      data.workflowId != null && data.workflowId !== ''
        ? Number(data.workflowId)
        : null
    const wf = mockWorkflows.find(w => w.id === workflowId)
    Object.assign(item, {
      workflowId: data.workflowId !== undefined ? workflowId : item.workflowId,
      workflow:
        data.workflowId !== undefined
          ? wf
            ? { id: wf.id, name: wf.name, workflowNo: wf.workflowNo }
            : null
          : item.workflow,
      ruleType: data.ruleType ?? item.ruleType,
      threshold: data.threshold ?? item.threshold,
      windowMinutes: data.windowMinutes ?? item.windowMinutes,
      notifyChannels: data.notifyChannels ?? item.notifyChannels,
      notifyUsers: data.notifyUsers ?? item.notifyUsers,
      enabled: data.enabled ?? item.enabled,
      updatedAt: now()
    })
    return ok('更新成功', item)
  }
  return requests({
    url: `/api/workflow-alerts/${id}`,
    data,
    method: 'put'
  })
}

/** 删除告警规则 */
export async function deleteAlertRule(
  id: number | string
): Promise<ApiResponse<boolean>> {
  if (USE_MOCK) {
    await delay()
    const idx = mockAlerts.findIndex(r => r.id === Number(id))
    if (idx < 0) return { status: false, msg: '规则不存在', data: null }
    mockAlerts.splice(idx, 1)
    return ok('删除成功', true)
  }
  return requests({ url: `/api/workflow-alerts/${id}`, method: 'delete' })
}

// ==================== 流程分类 ====================

/** 分类列表（全量小表） */
export async function getCategories(params?: {
  enabled?: string
  keyword?: string
}): Promise<{ list: WorkflowCategory[]; total: number }> {
  if (USE_MOCK) {
    await delay()
    const rows = mockCategories
      .filter(c =>
        params?.keyword
          ? c.name.includes(params.keyword) || c.code.includes(params.keyword)
          : true
      )
      .filter(c =>
        params?.enabled === 'true' || params?.enabled === 'false'
          ? c.enabled === (params.enabled === 'true')
          : true
      )
      .sort((a, b) => a.sortOrder - b.sortOrder)
    return { list: rows, total: rows.length }
  }
  const res = await $axiosGet(
    cleanParams((params || {}) as Record<string, unknown>),
    '/workflow-categories'
  )
  if (!res?.status) {
    throw new Error(res?.msg || '加载分类失败')
  }
  return res.data
}

/** 创建分类 */
export async function createCategory(
  data: CategoryPayload
): Promise<ApiResponse<WorkflowCategory>> {
  if (USE_MOCK) {
    await delay()
    if (mockCategories.some(c => c.code === data.code)) {
      return { status: false, msg: '分类编码已存在', data: null }
    }
    const item: WorkflowCategory = {
      id: nextId(),
      name: data.name,
      code: data.code,
      icon: data.icon ?? null,
      description: data.description ?? null,
      sortOrder: data.sortOrder ?? 0,
      enabled: data.enabled ?? true,
      createdAt: now(),
      updatedAt: now()
    }
    mockCategories.push(item)
    return ok('创建成功', item)
  }
  return $axios(data, '/workflow-categories')
}

/** 更新分类 */
export async function updateCategory(
  id: number | string,
  data: Partial<CategoryPayload>
): Promise<ApiResponse<WorkflowCategory>> {
  if (USE_MOCK) {
    await delay()
    const item = mockCategories.find(c => c.id === Number(id))
    if (!item) return { status: false, msg: '分类不存在', data: null }
    Object.assign(item, {
      name: data.name ?? item.name,
      code: data.code ?? item.code,
      icon: data.icon ?? item.icon,
      description: data.description ?? item.description,
      sortOrder: data.sortOrder ?? item.sortOrder,
      enabled: data.enabled ?? item.enabled,
      updatedAt: now()
    })
    return ok('更新成功', item)
  }
  return requests({
    url: `/api/workflow-categories/${id}`,
    data,
    method: 'put'
  })
}

/** 删除分类（有关联流程时后端会拒绝） */
export async function deleteCategory(
  id: number | string
): Promise<ApiResponse<boolean>> {
  if (USE_MOCK) {
    await delay()
    if (mockWorkflows.some(w => w.categoryId === Number(id) && !w.deletedAt)) {
      return { status: false, msg: '分类下存在流程，无法删除', data: null }
    }
    const idx = mockCategories.findIndex(c => c.id === Number(id))
    if (idx < 0) return { status: false, msg: '分类不存在', data: null }
    mockCategories.splice(idx, 1)
    return ok('删除成功', true)
  }
  return requests({
    url: `/api/workflow-categories/${id}`,
    method: 'delete'
  })
}
