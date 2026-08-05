/**
 * 积分管理体系 - 类型定义
 * 设计原则：可扩展、类型安全、业务解耦
 */

// ==================== 基础类型 ====================

/** 积分类型枚举 */
export enum PointsType {
  /** 通用积分 */
  GENERAL = 'GENERAL',
  /** 消费积分 */
  CONSUMPTION = 'CONSUMPTION',
  /** 活动积分（限时） */
  EVENT = 'EVENT',
  /** 邀请积分 */
  INVITATION = 'INVITATION'
}

/** 积分交易类型 */
export enum PointsTransactionType {
  /** 获取 */
  EARN = 'EARN',
  /** 消费 */
  SPEND = 'SPEND',
  /** 过期 */
  EXPIRE = 'EXPIRE',
  /** 调整（管理员操作） */
  ADJUST = 'ADJUST',
  /** 退款 */
  REFUND = 'REFUND'
}

/** 积分获取渠道 */
export enum PointsSource {
  /** 签到 */
  CHECK_IN = 'CHECK_IN',
  /** 消费 */
  PURCHASE = 'PURCHASE',
  /** 邀请好友 */
  INVITE_FRIEND = 'INVITE_FRIEND',
  /** 完成任务 */
  COMPLETE_TASK = 'COMPLETE_TASK',
  /** 活动奖励 */
  EVENT_REWARD = 'EVENT_REWARD',
  /** 评价 */
  REVIEW = 'REVIEW',
  /** 分享 */
  SHARE = 'SHARE',
  /** 管理员调整 */
  ADMIN_ADJUST = 'ADMIN_ADJUST',
  /** 其他 */
  OTHER = 'OTHER'
}

// ==================== 数据模型 ====================

/** 积分账户 */
export interface PointsAccount {
  id: number
  userId: number
  /** 可用积分 */
  availablePoints: number
  /** 冻结积分（待确认交易） */
  frozenPoints: number
  /** 累计获得积分 */
  totalEarned: number
  /** 累计消费积分 */
  totalSpent: number
  /** 积分类型 */
  pointsType: PointsType
  /** 积分等级 */
  level: number
  /** 等级名称 */
  levelName: string
  /** 下次升级所需积分 */
  nextLevelPoints: number
  /** 账户状态 */
  status: 'ACTIVE' | 'FROZEN' | 'CLOSED'
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/** 积分交易记录 */
export interface PointsTransaction {
  id: number
  /** 交易流水号 */
  transactionNo: string
  userId: number
  /** 积分账户ID */
  accountId: number
  /** 交易类型 */
  type: PointsTransactionType
  /** 积分变动值（正数增加，负数减少） */
  points: number
  /** 交易前余额 */
  balanceBefore: number
  /** 交易后余额 */
  balanceAfter: number
  /** 积分来源/用途 */
  source: PointsSource
  /** 关联业务ID（如订单ID） */
  referenceId?: string
  /** 关联业务类型 */
  referenceType?: string
  /** 交易描述 / 调整原因 */
  description: string
  /** 过期时间（针对有有效期的积分） */
  expireAt?: string
  /** 交易状态 */
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  /** 操作人ID（管理员调整时） */
  operatorId?: number
  /** 操作人名称（管理员调整时） */
  operatorName?: string
  /** 创建时间 */
  createdAt: string
}

/** 积分规则 */
export interface PointsRule {
  id: number
  /** 规则名称 */
  name: string
  /** 规则编码（唯一标识） */
  code: string
  /** 积分来源 */
  source: PointsSource
  /** 积分类型 */
  pointsType: PointsType
  /** 积分值（固定值或比例） */
  pointsValue: number
  /** 计算方式：FIXED-固定值, RATIO-按比例, FORMULA-公式 */
  calcMethod: 'FIXED' | 'RATIO' | 'FORMULA'
  /** 每日上限（0表示无限制） */
  dailyLimit: number
  /** 每月上限 */
  monthlyLimit: number
  /** 单次上限 */
  singleLimit: number
  /** 积分有效期（天，0表示永久） */
  validDays: number
  /** 规则描述 */
  description: string
  /** 是否启用 */
  enabled: boolean
  /** 优先级（数值越大优先级越高） */
  priority: number
  /** 生效开始时间 */
  startTime?: string
  /** 生效结束时间 */
  endTime?: string
  /** 扩展配置（JSON） */
  extraConfig?: Record<string, any>
}

/** 积分等级配置 */
export interface PointsLevel {
  id?: number
  level: number
  /** 等级名称 */
  name: string
  /** 等级图标 */
  icon?: string
  /** 升级所需积分 */
  requiredPoints: number
  /** 等级权益（JSON配置） */
  benefits: Record<string, any>
  /** 等级描述 */
  description: string
  sortOrder?: number
}

// ==================== API 请求/响应类型 ====================

/** 查询积分账户请求 */
export interface GetPointsAccountRequest {
  userId?: number
  pointsType?: PointsType
}

/** 查询交易记录请求 */
export interface GetTransactionsRequest {
  userId?: number
  accountId?: number
  type?: PointsTransactionType
  source?: PointsSource
  startTime?: string
  endTime?: string
  page?: number
  pageSize?: number
}

/** 获取积分规则请求 */
export interface GetPointsRulesRequest {
  source?: PointsSource
  pointsType?: PointsType
  enabled?: boolean
}

/** 积分操作请求 */
export interface PointsOperationRequest {
  userId: number
  points: number
  source: PointsSource
  referenceId?: string
  referenceType?: string
  description: string
  /** 是否立即生效（false则进入待确认状态） */
  immediate?: boolean
  /** 扩展参数 */
  extra?: Record<string, any>
}

/** 管理员新增积分请求 */
export interface AdminGrantPointsRequest {
  /** 目标用户 ID */
  userId: number
  /** 新增积分数（必须为正） */
  points: number
  /** 新增原因（必填） */
  reason: string
}

/** 管理端流水查询 */
export interface AdminTransactionsRequest {
  userId?: number
  source?: PointsSource | string
  type?: PointsTransactionType | string
  page?: number
  pageSize?: number
}

/** 积分操作响应 */
export interface PointsOperationResponse {
  /** 交易流水号 */
  transactionNo: string
  /** 操作是否成功 */
  success: boolean
  /** 变动积分 */
  points: number
  /** 操作后余额 */
  balanceAfter: number
  /** 消息 */
  message: string
}

/** 签到响应 */
export interface CheckInResponse {
  /** 获得积分 */
  points: number
  /** 连续签到天数 */
  consecutiveDays: number
  /** 当前总积分 */
  totalPoints: number
  /** 是否首次签到 */
  isFirstCheckIn: boolean
}

/** 积分统计 */
export interface PointsStatistics {
  /** 今日获得 */
  todayEarned: number
  /** 本月获得 */
  monthEarned: number
  /** 本年获得 */
  yearEarned: number
  /** 今日消费 */
  todaySpent: number
  /** 待过期积分 */
  expiringPoints: number
  /** 即将过期天数 */
  expiringDays: number
}
