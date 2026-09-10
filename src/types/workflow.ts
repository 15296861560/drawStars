/**
 * 流程编排系统类型定义
 * 与后端 workflow 模块的响应结构对齐（BigInt 已转 Number，Date 已转 ISO 字符串）
 */

// ==================== 枚举与字面量类型 ====================

/** 流程生命周期状态（PRD 4.1.2） */
export type WorkflowStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'PAUSED'
  | 'OFFLINE'

/** 执行实例状态（PRD 4.4.5） */
export type ExecutionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'TIMEOUT'
  | 'CANCELLED'
  | 'PAUSED'

/** 触发方式（PRD 4.2.1） */
export type TriggerType = 'CRON' | 'WEBHOOK' | 'MANUAL' | 'EVENT'

/** 节点类型（PRD 4.3） */
export type NodeType =
  | 'TRIGGER'
  | 'AGENT'
  | 'TOOL'
  | 'CONDITION'
  | 'TRANSFORM'
  | 'OUTPUT'

/** 节点执行状态 */
export type StepStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'SKIPPED'

/** 工具分类 */
export type ToolCategory = 'NOTIFICATION' | 'DATA' | 'FILE' | 'AI' | 'PLATFORM'

// ==================== 数据模型 ====================

/** 流程分类 */
export interface WorkflowCategory {
  id: number
  name: string
  code: string
  icon: string | null
  description: string | null
  sortOrder: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

/** 流程定义（列表项） */
export interface Workflow {
  id: number
  workflowNo: string
  name: string
  description: string | null
  icon: string | null
  categoryId: number
  category: { id: number; name: string; code: string } | null
  tags: unknown
  status: WorkflowStatus
  currentVersion: number
  /** 触发方式（从画布 TRIGGER 节点提取，默认 MANUAL） */
  triggerType: TriggerType
  /** 详情接口才返回 */
  graphData?: unknown
  globalConfig?: unknown
  creatorId: number
  auditorId: number | null
  auditedAt: string | null
  auditRemark: string | null
  executionCount: number
  lastExecutedAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/** 流程版本快照 */
export interface WorkflowVersion {
  id: number
  workflowId: number
  version: number
  changeNote: string | null
  createdBy: number
  createdAt: string
}

/** 执行实例 */
export interface WorkflowExecution {
  id: number
  executionNo: string
  workflowId: number
  workflowVersion: number
  workflow: { id: number; name: string; workflowNo: string } | null
  status: ExecutionStatus
  triggerType: TriggerType
  triggerData: unknown
  result: unknown
  errorMessage: string | null
  errorNodeId: string | null
  durationMs: number | null
  startedAt: string | null
  finishedAt: string | null
  createdAt: string
  updatedAt: string
}

/** 节点执行日志 */
export interface ExecutionStepLog {
  id: number
  executionId: number
  nodeId: string
  nodeType: NodeType
  nodeName: string | null
  status: StepStatus
  inputData: unknown
  outputData: unknown
  errorMessage: string | null
  retryCount: number
  durationMs: number | null
  startedAt: string | null
  finishedAt: string | null
  createdAt: string
}

/** 工具定义 */
export interface WorkflowTool {
  id: number
  name: string
  code: string
  category: string
  description: string | null
  icon: string | null
  endpoint: string | null
  method: string
  authConfig: unknown
  paramSchema: unknown
  outputSchema: unknown
  isBuiltin: boolean
  enabled: boolean
  creatorId: number | null
  createdAt: string
  updatedAt: string
}

/** 流程模板 */
export interface WorkflowTemplate {
  id: number
  name: string
  description: string | null
  icon: string | null
  category: string
  graphData?: unknown
  globalConfig?: unknown
  previewImage: string | null
  authorId: number | null
  isOfficial: boolean
  installCount: number
  rating: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

/** 告警规则 */
export interface WorkflowAlertRule {
  id: number
  workflowId: number | null
  workflow?: { id: number; name: string; workflowNo: string } | null
  ruleType: string
  threshold: number
  windowMinutes: number
  notifyChannels: unknown
  notifyUsers: unknown
  enabled: boolean
  createdAt: string
  updatedAt: string
}

// ==================== 统计 ====================

/** 统计概览（PRD 4.7.1） */
export interface WorkflowOverview {
  todayTotal: number
  todaySucceeded: number
  todayFailed: number
  successRate: number
  avgDurationMs: number
  activeWorkflowCount: number
  backlog: number
  workflowStatus: { status: string; count: number }[]
  triggerTypeDistribution: { triggerType: string; count: number }[]
}

/** 趋势单日数据 */
export interface TrendItem {
  date: string
  total: number
  succeeded: number
  failed: number
  successRate: number
  avgDurationMs: number
}

/** 单流程分析（PRD 4.7.2） */
export interface WorkflowStatistics {
  workflow: { id: number; workflowNo: string; name: string; status: string }
  total: number
  succeeded: number
  failed: number
  successRate: number
  avgDurationMs: number
  days: number
  triggerDistribution: { triggerType: string; count: number }[]
  trend: TrendItem[]
}

// ==================== 画布结构（PRD 5.3） ====================

export interface GraphNode {
  id: string
  type: NodeType
  name: string
  position: { x: number; y: number }
  config: Record<string, unknown>
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  /** 连线标签（条件分支连线绑定的分支名） */
  label?: string
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

// ==================== 请求载荷 ====================

/** 流程列表查询 */
export interface WorkflowListQuery {
  page?: number
  pageSize?: number
  keyword?: string
  categoryId?: number | string
  status?: string
  /** 回收站模式：deleted=1 */
  deleted?: string
}

/** 创建/更新流程 */
export interface WorkflowPayload {
  name: string
  description?: string
  icon?: string
  categoryId: number | string
  tags?: unknown
  graphData?: GraphData
  globalConfig?: Record<string, unknown>
}

/** 审核载荷 */
export interface AuditPayload {
  approved: boolean
  remark?: string
}

/** 执行历史查询 */
export interface ExecutionListQuery {
  page?: number
  pageSize?: number
  workflowId?: number | string
  status?: string
  triggerType?: string
  startTime?: string
  endTime?: string
}

/** 触发执行载荷 */
export interface ExecutePayload {
  input?: Record<string, unknown>
}

/** 工具列表查询 */
export interface ToolListQuery {
  page?: number
  pageSize?: number
  keyword?: string
  category?: string
  enabled?: string
  isBuiltin?: string
}

/** 创建/更新工具 */
export interface ToolPayload {
  name: string
  code: string
  category: string
  description?: string
  icon?: string
  endpoint?: string
  method?: string
  authConfig?: Record<string, unknown>
  paramSchema?: Record<string, unknown>
  outputSchema?: Record<string, unknown>
  enabled?: boolean
}

/** 模板列表查询 */
export interface TemplateListQuery {
  page?: number
  pageSize?: number
  keyword?: string
  category?: string
  isOfficial?: string
}

/** 创建模板载荷 */
export interface TemplatePayload {
  name: string
  description?: string
  icon?: string
  category: string
  graphData: GraphData
  globalConfig?: Record<string, unknown>
}

/** 安装模板载荷 */
export interface InstallTemplatePayload {
  categoryId: number | string
  name?: string
}

/** 告警规则查询 */
export interface AlertListQuery {
  page?: number
  pageSize?: number
  workflowId?: number | string
  enabled?: string
}

/** 告警规则载荷 */
export interface AlertPayload {
  workflowId?: number | string | null
  ruleType: string
  threshold: number
  windowMinutes?: number
  notifyChannels: string[]
  notifyUsers?: string[]
  enabled?: boolean
}

/** 分类载荷 */
export interface CategoryPayload {
  name: string
  code: string
  icon?: string
  description?: string
  sortOrder?: number
  enabled?: boolean
}
