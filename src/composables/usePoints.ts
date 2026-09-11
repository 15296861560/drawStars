/**
 * 积分管理 Composables
 * 提供可复用的积分相关逻辑
 */
import { ref, computed } from 'vue'
import { pointsStore } from '@/stores/points'
import type { PointsSource } from '@/types/points'

/**
 * 积分账户相关逻辑
 */
export function usePointsAccount() {
  const store = pointsStore()

  const availablePoints = computed(() => store.getAvailablePoints)
  const level = computed(() => store.getLevel)
  const levelName = computed(() => store.getLevelName)
  const loading = computed(() => store.loading)

  async function refresh(userId?: number) {
    await store.loadAccount(userId)
  }

  return {
    availablePoints,
    level,
    levelName,
    loading,
    refresh,
    account: computed(() => store.getAccount)
  }
}

/**
 * 签到相关逻辑
 */
export function useCheckIn() {
  const store = pointsStore()

  const hasCheckedInToday = computed(
    () => store.checkInStatus.hasCheckedInToday
  )
  const consecutiveDays = computed(() => store.checkInStatus.consecutiveDays)
  const weekStatus = computed(() => store.checkInStatus.weekStatus)

  async function checkIn(userId: number) {
    if (hasCheckedInToday.value) {
      throw new Error('今日已签到')
    }
    return await store.doCheckIn(userId)
  }

  async function loadStatus(userId: number) {
    await store.loadCheckInStatus(userId)
  }

  return {
    hasCheckedInToday,
    consecutiveDays,
    weekStatus,
    checkIn,
    loadStatus
  }
}

/**
 * 积分等级相关逻辑
 */
export function usePointsLevel() {
  const store = pointsStore()

  const currentLevel = computed(() => store.currentLevelInfo)
  const nextLevel = computed(() => store.nextLevelInfo)
  const progress = computed(() => store.levelProgress)
  const allLevels = computed(() => store.getLevels)

  /** 获取等级权益 */
  function getBenefit(key: string): any {
    return currentLevel.value?.benefits?.[key]
  }

  /** 是否享有某权益 */
  function hasBenefit(key: string): boolean {
    return !!getBenefit(key)
  }

  /** 计算距离下一等级还需多少积分 */
  function pointsToNextLevel(): number {
    if (!store.account || !nextLevel.value) return 0
    return nextLevel.value.requiredPoints - store.account.totalEarned
  }

  async function loadLevels() {
    await store.loadLevels()
  }

  return {
    currentLevel,
    nextLevel,
    progress,
    allLevels,
    getBenefit,
    hasBenefit,
    pointsToNextLevel,
    loadLevels
  }
}

/**
 * 积分交易记录相关逻辑
 */
export function usePointsTransactions() {
  const store = pointsStore()

  const transactions = computed(() => store.getTransactions)
  const loading = computed(() => store.loading)

  async function load(params?: {
    userId?: number
    page?: number
    pageSize?: number
    type?: string
    source?: PointsSource
  }) {
    return await store.loadTransactions(params)
  }

  /** 按来源筛选 */
  function filterBySource(source: PointsSource) {
    return transactions.value.filter(t => t.source === source)
  }

  /** 按类型筛选 */
  function filterByType(type: 'EARN' | 'SPEND') {
    return transactions.value.filter(t => t.type === type)
  }

  return {
    transactions,
    loading,
    load,
    filterBySource,
    filterByType
  }
}

/**
 * 积分统计相关逻辑
 */
export function usePointsStatistics() {
  const store = pointsStore()

  const statistics = computed(() => store.getStatistics)

  async function refresh(userId?: number) {
    await store.loadStatistics(userId)
  }

  /** 格式化积分数 */
  function formatPoints(points: number): string {
    if (points >= 10000) {
      return `${(points / 10000).toFixed(1)}万`
    }
    return points.toString()
  }

  return {
    statistics,
    refresh,
    formatPoints
  }
}

/**
 * 积分规则相关逻辑
 */
export function usePointsRules() {
  const store = pointsStore()

  const rules = computed(() => store.getRules)

  /** 根据来源获取规则 */
  function getRuleBySource(source: PointsSource) {
    return store.getRuleBySource(source)
  }

  /** 计算可获得积分 */
  function calculateEarnPoints(source: PointsSource, amount?: number): number {
    const rule = getRuleBySource(source)
    if (!rule || !rule.enabled) return 0

    switch (rule.calcMethod) {
      case 'FIXED':
        return rule.pointsValue
      case 'RATIO':
        return Math.floor((amount || 0) * rule.pointsValue)
      case 'FORMULA':
        // 可扩展自定义公式
        return rule.pointsValue
      default:
        return 0
    }
  }

  /** 计算积分可抵扣金额 */
  function calculateDeduction(points: number, rate: number = 0.01): number {
    return points * rate
  }

  async function loadRules() {
    await store.loadRules()
  }

  return {
    rules,
    getRuleBySource,
    calculateEarnPoints,
    calculateDeduction,
    loadRules
  }
}

/**
 * 积分消费相关逻辑
 */
export function usePointsSpend() {
  const store = pointsStore()

  const availablePoints = computed(() => store.getAvailablePoints)

  /** 积分是否足够 */
  function isEnough(points: number): boolean {
    return availablePoints.value >= points
  }

  /** 执行积分消费 */
  async function spend(
    userId: number,
    points: number,
    options?: {
      referenceId?: string
      referenceType?: string
      description?: string
    }
  ) {
    if (!isEnough(points)) {
      throw new Error('积分不足')
    }
    return await store.spendPoints(
      userId,
      points,
      options?.referenceId,
      options?.referenceType,
      options?.description
    )
  }

  /** 计算最大可用积分（考虑订单金额限制） */
  function getMaxUsablePoints(
    orderAmount: number,
    maxDeductionRate: number = 0.5
  ): number {
    const maxDeduction = orderAmount * maxDeductionRate
    const maxPoints = Math.floor(maxDeduction / 0.01) // 假设 100积分 = 1元
    return Math.min(availablePoints.value, maxPoints)
  }

  return {
    availablePoints,
    isEnough,
    spend,
    getMaxUsablePoints
  }
}

/**
 * 积分初始化（组合式）
 */
export function usePointsInit(userId?: number) {
  const store = pointsStore()
  const initialized = ref(false)

  async function init() {
    if (initialized.value) return
    await store.init(userId)
    initialized.value = true
  }

  return {
    initialized,
    init
  }
}
