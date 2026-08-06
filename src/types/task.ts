/**
 * Task management types (PRD v1.0)
 */

export type TaskType = 'DAILY' | 'ONCE' | 'LIMITED' | 'ACHIEVEMENT' | 'CUSTOM'

export type ConditionType =
  | 'LOGIN'
  | 'CHECK_IN'
  | 'SHARE'
  | 'PURCHASE'
  | 'INVITE'
  | 'CONTENT'
  | 'SURVEY'
  | 'LEARN'
  | 'CUSTOM'
  | 'COMPOSITE'

export type RewardType =
  | 'POINTS'
  | 'PHYSICAL'
  | 'COUPON'
  | 'ITEM'
  | 'BADGE'
  | 'TITLE'
  | 'EXP'
  | 'LOTTERY'

export type TaskStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAUSED'
  | 'OFFLINE'
  | 'DELETED'

export type AssignMode =
  | 'PUBLIC'
  | 'ASSIGNED'
  | 'ROLE_BASED'
  | 'LEVEL_GATED'
  | 'CONDITIONAL'

export type InstanceStatus =
  | 'NONE'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'COMPLETED'
  | 'REWARD_PENDING'
  | 'REWARD_CLAIMED'
  | 'EXPIRED'
  | 'REJECTED'

export type CompletionMode = 'ALL' | 'ANY_N'
export type UnlockMode = 'SEQUENTIAL' | 'PARALLEL'

export interface TaskCategory {
  id: number
  name: string
  code: string
  parentId?: number | null
  sort?: number
}

export interface RewardItem {
  type: RewardType
  config: Record<string, any>
  description?: string
}

export interface RewardConfig {
  rewards: RewardItem[]
}

export interface TaskUserProgress {
  status: InstanceStatus
  currentCount: number
  targetCount?: number
  rewardClaimed: boolean
  instanceId?: number
  completedAt?: string | null
  progressPercent?: number
  completedSubTaskIds?: number[]
  claimStatus?: RewardClaimRecord['status']
}

export interface TaskSubTask {
  id: number
  title: string
  conditionType?: ConditionType
  conditionConfig?: Record<string, any>
  reward?: RewardConfig
  children?: TaskSubTask[]
}

export interface Task {
  id: number
  /** 任务编号，如 DLY202608070001 */
  taskNo?: string
  title: string
  description?: string
  icon?: string
  categoryId: number
  category?: TaskCategory
  taskType: TaskType
  conditionType: ConditionType
  conditionConfig?: Record<string, any>
  difficulty: 1 | 2 | 3 | 4
  tags?: string[]
  rewardConfig: RewardConfig
  targetCount: number
  status: TaskStatus
  assignMode: AssignMode
  completionMode?: CompletionMode
  unlockMode?: UnlockMode
  children?: TaskSubTask[]
  subTaskCount?: number
  startTime?: string | null
  endTime?: string | null
  dailyLimit?: number
  totalLimit?: number
  acceptValidHours?: number | null
  userProgress?: TaskUserProgress | null
  remainingTime?: number | null
  rejectReason?: string | null
  createdBy?: number
  createdAt?: string
  updatedAt?: string
  priority?: number
}

export interface TaskInstance {
  id: number
  taskId: number
  userId: number
  status: InstanceStatus
  currentCount: number
  targetCount: number
  rewardClaimed: boolean
  acceptedAt?: string
  completedAt?: string | null
  expiredAt?: string | null
  task?: Task
  shippingAddress?: ShippingAddress | null
  trackingNo?: string | null
  logisticsCompany?: string | null
}

export interface ShippingAddress {
  name: string
  phone: string
  address: string
}

export interface TaskNotification {
  id: number
  userId: number
  taskId?: number
  title: string
  content: string
  type: string
  read: boolean
  createdAt: string
}

export interface TaskStatisticsOverview {
  totalTasks: number
  onlineTasks: number
  pendingAudit: number
  todayAccept: number
  todayComplete: number
  todayRewardPoints: number
  participationRate: number
  completionRate: number
}

export interface HallStatistics {
  totalTasks: number
  completedToday: number
  availableTasks: number
  totalRewardToday: { points: number; items: number }
}

export interface TaskListQuery {
  categoryId?: number | null
  status?: string
  taskType?: string
  keyword?: string
  sort?: string
  page?: number
  pageSize?: number
  curPage?: number
}

export interface AdminTaskListQuery {
  title?: string
  status?: string
  taskType?: string
  categoryId?: number | ''
  curPage?: number
  pageSize?: number
}

export interface CreateTaskPayload {
  title: string
  description?: string
  icon?: string
  categoryId: number
  taskType: TaskType
  conditionType: ConditionType
  conditionConfig?: Record<string, any>
  difficulty: 1 | 2 | 3 | 4
  tags?: string[]
  rewardConfig: RewardConfig
  targetCount: number
  assignMode: AssignMode
  completionMode?: CompletionMode
  unlockMode?: UnlockMode
  priority?: number
  status?: TaskStatus
  startTime?: string | null
  endTime?: string | null
  dailyLimit?: number
  totalLimit?: number
  acceptValidHours?: number | null
  children?: TaskSubTask[]
  skipAudit?: boolean
}

export interface RewardTemplate {
  id: number
  name: string
  description?: string
  rewardConfig: RewardConfig
  createdAt?: string
  updatedAt?: string
}

export interface TaskTemplateRecord {
  id: number
  name: string
  description?: string
  templateData: Partial<CreateTaskPayload>
  categoryId?: number
  createdAt?: string
  updatedAt?: string
}

export interface TrendItem {
  date: string
  accept: number
  complete: number
}

export interface TaskDimensionStats {
  taskId: number
  taskTitle: string
  acceptCount: number
  completeCount: number
  completionRate: number
}

export interface UserDimensionStats {
  userId: number
  userName?: string
  acceptCount: number
  completeCount: number
  rewardPoints: number
}

export interface RewardDimensionStats {
  rewardType: string
  count: number
  totalPoints?: number
  itemName?: string
}

export interface ExportResult {
  filename: string
  contentType: string
  content: string
}

export interface RevokeAssignPayload {
  taskId: number
  userIds: number[]
}

export interface AuditPayload {
  action: 'APPROVE' | 'REJECT'
  reason?: string
}

export interface AssignPayload {
  taskId: number
  userIds: number[]
}

export interface ShipPayload {
  claimId: number
  logisticsCompany: string
  trackingNo: string
}

export interface RewardClaimRecord {
  id: number
  instanceId: number
  taskId: number
  taskTitle: string
  userId: number
  userName?: string
  itemName: string
  status: 'PENDING_ADDRESS' | 'PENDING_SHIP' | 'SHIPPED' | 'RECEIVED'
  address?: ShippingAddress | null
  logisticsCompany?: string | null
  trackingNo?: string | null
  createdAt: string
}
