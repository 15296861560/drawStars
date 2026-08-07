/**
 * 积分管理 API 层
 * 遵循项目现有 API 模式：支持 mock/真实 API 切换
 */
import type {
  PointsAccount,
  PointsTransaction,
  PointsRule,
  PointsLevel,
  GetPointsAccountRequest,
  GetTransactionsRequest,
  GetPointsRulesRequest,
  PointsOperationRequest,
  PointsOperationResponse,
  AdminGrantPointsRequest,
  AdminTransactionsRequest,
  CheckInResponse,
  PointsStatistics,
  PointsSource,
  PointsType,
  PointsTransactionType
} from '@/types/points'
import {
  $axios,
  $axiosGet,
  requests
} from '@/assets/js/axios-api/axios-config.js'

// ==================== Mock 数据 ====================

const mockAccounts: PointsAccount[] = [
  {
    id: 1,
    userId: 1,
    availablePoints: 2580,
    frozenPoints: 0,
    totalEarned: 5000,
    totalSpent: 2420,
    pointsType: 'GENERAL' as PointsType,
    level: 3,
    levelName: '黄金会员',
    nextLevelPoints: 10000,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString()
  }
]

const mockTransactions: PointsTransaction[] = [
  {
    id: 1,
    transactionNo: 'PT202401150001',
    userId: 1,
    accountId: 1,
    type: 'EARN' as PointsTransactionType,
    points: 100,
    balanceBefore: 2480,
    balanceAfter: 2580,
    source: 'CHECK_IN' as PointsSource,
    description: '每日签到奖励',
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    transactionNo: 'PT202401140002',
    userId: 1,
    accountId: 1,
    type: 'SPEND' as PointsTransactionType,
    points: -200,
    balanceBefore: 2680,
    balanceAfter: 2480,
    source: 'PURCHASE' as PointsSource,
    referenceId: 'ORDER_001',
    referenceType: 'ORDER',
    description: '订单抵扣',
    status: 'COMPLETED',
    createdAt: '2024-01-14T10:30:00Z'
  }
]

const mockRules: PointsRule[] = [
  {
    id: 1,
    name: '每日签到',
    code: 'DAILY_CHECK_IN',
    source: 'CHECK_IN' as PointsSource,
    pointsType: 'GENERAL' as PointsType,
    pointsValue: 10,
    calcMethod: 'FIXED',
    dailyLimit: 1,
    monthlyLimit: 0,
    singleLimit: 10,
    validDays: 365,
    description: '每日签到获得10积分',
    enabled: true,
    priority: 100
  },
  {
    id: 2,
    name: '消费积分',
    code: 'CONSUMPTION_REWARD',
    source: 'PURCHASE' as PointsSource,
    pointsType: 'GENERAL' as PointsType,
    pointsValue: 0.01,
    calcMethod: 'RATIO',
    dailyLimit: 0,
    monthlyLimit: 0,
    singleLimit: 1000,
    validDays: 365,
    description: '消费1元获得1积分（1%比例）',
    enabled: true,
    priority: 90
  },
  {
    id: 3,
    name: '邀请好友',
    code: 'INVITE_FRIEND',
    source: 'INVITE_FRIEND' as PointsSource,
    pointsType: 'GENERAL' as PointsType,
    pointsValue: 100,
    calcMethod: 'FIXED',
    dailyLimit: 5,
    monthlyLimit: 30,
    singleLimit: 100,
    validDays: 0,
    description: '成功邀请一位好友注册获得100积分',
    enabled: true,
    priority: 80
  }
]

const mockLevels: PointsLevel[] = [
  {
    level: 1,
    name: '普通会员',
    icon: 'bronze',
    requiredPoints: 0,
    benefits: {},
    description: '注册即为普通会员'
  },
  {
    level: 2,
    name: '白银会员',
    icon: 'silver',
    requiredPoints: 1000,
    benefits: { discount: 0.98 },
    description: '享98折优惠'
  },
  {
    level: 3,
    name: '黄金会员',
    icon: 'gold',
    requiredPoints: 5000,
    benefits: { discount: 0.95, freeShipping: true },
    description: '享95折+免邮'
  },
  {
    level: 4,
    name: '铂金会员',
    icon: 'platinum',
    requiredPoints: 10000,
    benefits: { discount: 0.92, freeShipping: true, priorityService: true },
    description: '享92折+免邮+优先客服'
  },
  {
    level: 5,
    name: '钻石会员',
    icon: 'diamond',
    requiredPoints: 50000,
    benefits: {
      discount: 0.88,
      freeShipping: true,
      priorityService: true,
      exclusiveEvents: true
    },
    description: '享88折+全部权益'
  }
]

// ==================== Mock 服务 ====================

const USE_MOCK = import.meta.env.VITE_POINTS_MOCK !== 'false'

async function delay(ms: number = 300) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ==================== API 接口 ====================

/**
 * 获取用户积分账户
 */
export async function getPointsAccount(
  params?: GetPointsAccountRequest
): Promise<PointsAccount> {
  if (USE_MOCK) {
    await delay()
    return mockAccounts[0]
  }
  const res = await $axiosGet(params || {}, '/points/account')
  return res.data
}

/**
 * 获取积分交易记录
 */
export async function getTransactions(
  params?: GetTransactionsRequest
): Promise<{ list: PointsTransaction[]; total: number }> {
  if (USE_MOCK) {
    await delay()
    return { list: mockTransactions, total: mockTransactions.length }
  }
  const res = await $axiosGet(params || {}, '/points/transactions')
  return res.data
}

/**
 * 获取积分规则列表
 */
export async function getPointsRules(
  params?: GetPointsRulesRequest
): Promise<PointsRule[]> {
  if (USE_MOCK) {
    await delay()
    return mockRules
  }
  const res = await $axiosGet(params || {}, '/points/rules')
  return res.data
}

/**
 * 获取积分等级配置
 */
export async function getPointsLevels(): Promise<PointsLevel[]> {
  if (USE_MOCK) {
    await delay()
    return mockLevels
  }
  const res = await $axiosGet({}, '/points/levels')
  return res.data
}

/**
 * 获取积分统计
 */
export async function getPointsStatistics(
  userId?: number
): Promise<PointsStatistics> {
  if (USE_MOCK) {
    await delay()
    return {
      todayEarned: 100,
      monthEarned: 1580,
      yearEarned: 8500,
      todaySpent: 0,
      expiringPoints: 200,
      expiringDays: 30
    }
  }
  const res = await $axiosGet({ userId }, '/points/statistics')
  return res.data
}

/**
 * 每日签到
 */
export async function checkIn(userId: number): Promise<CheckInResponse> {
  if (USE_MOCK) {
    await delay()
    return {
      points: 10,
      consecutiveDays: 7,
      totalPoints: 2590,
      isFirstCheckIn: false
    }
  }
  const res = await $axios({ userId }, '/points/check-in')
  return res.data
}

/**
 * 积分操作（通用）
 * 用于各种积分获取/消费场景
 */
export async function operatePoints(
  request: PointsOperationRequest
): Promise<PointsOperationResponse> {
  if (USE_MOCK) {
    await delay()
    const account = mockAccounts[0]
    return {
      transactionNo: `PT${Date.now()}`,
      success: true,
      points: request.points,
      balanceAfter: account.availablePoints + request.points,
      message: '操作成功'
    }
  }
  const res = await $axios(request, '/points/operate')
  return res.data
}

/**
 * 消费积分
 */
export async function spendPoints(
  userId: number,
  points: number,
  referenceId?: string,
  referenceType?: string,
  description?: string
): Promise<PointsOperationResponse> {
  return operatePoints({
    userId,
    points: -Math.abs(points),
    source: 'PURCHASE' as PointsSource,
    referenceId,
    referenceType,
    description: description || '积分消费',
    immediate: true
  })
}

/**
 * 查询签到状态
 */
export async function getCheckInStatus(userId: number): Promise<{
  hasCheckedInToday: boolean
  consecutiveDays: number
  weekStatus: boolean[]
}> {
  if (USE_MOCK) {
    await delay()
    return {
      hasCheckedInToday: true,
      consecutiveDays: 7,
      weekStatus: [true, true, true, true, true, true, true]
    }
  }
  const res = await $axiosGet({ userId }, '/points/check-in/status')
  return res.data
}

/**
 * 计算积分可抵扣金额
 */
export async function calculateDeduction(
  points: number
): Promise<{ deductionAmount: number; rate: number }> {
  if (USE_MOCK) {
    await delay()
    return { deductionAmount: points / 100, rate: 0.01 }
  }
  const res = await $axiosGet({ points }, '/points/calculate-deduction')
  return res.data
}

/** 创建积分规则 */
export async function createPointsRule(data: Partial<PointsRule>) {
  if (USE_MOCK) {
    await delay()
    return {
      status: true,
      msg: '创建成功',
      data: { ...data, id: Date.now(), enabled: data.enabled ?? true }
    }
  }
  return $axios(data, '/points/rules')
}

/** 更新积分规则 */
export async function updatePointsRule(
  data: Partial<PointsRule> & { id: number }
) {
  if (USE_MOCK) {
    await delay()
    return { status: true, msg: '更新成功', data }
  }
  return requests({ url: '/api/points/rules', data, method: 'put' })
}

/** 删除积分规则 */
export async function deletePointsRule(id: number) {
  if (USE_MOCK) {
    await delay()
    return { status: true, msg: '删除成功', data: true }
  }
  return requests({ url: `/api/points/rules/${id}`, method: 'delete' })
}

/** 创建积分等级 */
export async function createPointsLevel(data: Partial<PointsLevel>) {
  if (USE_MOCK) {
    await delay()
    return { status: true, msg: '创建成功', data: { ...data, id: Date.now() } }
  }
  return $axios(data, '/points/levels')
}

/** 更新积分等级 */
export async function updatePointsLevel(
  data: Partial<PointsLevel> & { id: number }
) {
  if (USE_MOCK) {
    await delay()
    return { status: true, msg: '更新成功', data }
  }
  return requests({ url: '/api/points/levels', data, method: 'put' })
}

/** 删除积分等级 */
export async function deletePointsLevel(id: number) {
  if (USE_MOCK) {
    await delay()
    return { status: true, msg: '删除成功', data: true }
  }
  return requests({ url: `/api/points/levels/${id}`, method: 'delete' })
}

/**
 * 管理员给用户新增积分（必填原因，服务端记录操作人）
 */
export async function adminGrantPoints(
  request: AdminGrantPointsRequest
): Promise<PointsOperationResponse> {
  if (USE_MOCK) {
    await delay()
    const account = mockAccounts[0]
    account.availablePoints += request.points
    account.totalEarned += request.points
    return {
      transactionNo: `PT${Date.now()}`,
      success: true,
      points: request.points,
      balanceAfter: account.availablePoints,
      message: '新增积分成功'
    }
  }
  const res = await $axios(request, '/points/admin/grant')
  if (!res?.status) {
    throw new Error(res?.msg || '新增积分失败')
  }
  return res.data
}

/**
 * 管理端查询积分流水（含操作人）
 */
export async function getAdminTransactions(
  params: AdminTransactionsRequest = {}
): Promise<{ list: PointsTransaction[]; total: number }> {
  if (USE_MOCK) {
    await delay()
    return {
      list: mockTransactions.map(t => ({
        ...t,
        operatorId: 1,
        operatorName: 'admin'
      })),
      total: mockTransactions.length
    }
  }
  const res = await $axiosGet(params, '/points/admin/transactions')
  if (!res?.status) {
    throw new Error(res?.msg || '查询失败')
  }
  return res.data
}
