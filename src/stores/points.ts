/**
 * 积分管理 Store
 * 基于 Pinia，遵循项目现有 store 模式
 */
import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  PointsAccount,
  PointsTransaction,
  PointsRule,
  PointsLevel,
  PointsStatistics,
  PointsSource
} from '@/types/points'
import * as pointsApi from '@/api/points'

export const pointsStore = defineStore(
  'points',
  () => {
    const account = ref<PointsAccount | null>(null)
    const transactions = ref<PointsTransaction[]>([])
    const rules = ref<PointsRule[]>([])
    const levels = ref<PointsLevel[]>([])
    const statistics = reactive<PointsStatistics>({
      todayEarned: 0,
      monthEarned: 0,
      yearEarned: 0,
      todaySpent: 0,
      expiringPoints: 0,
      expiringDays: 0
    })
    const loading = ref(false)
    const checkInStatus = reactive({
      hasCheckedInToday: false,
      consecutiveDays: 0,
      weekStatus: [false, false, false, false, false, false, false] as boolean[]
    })

    const getAccount = computed(() => account.value)
    const getAvailablePoints = computed(
      () => account.value?.availablePoints ?? 0
    )
    const getLevel = computed(() => account.value?.level ?? 1)
    const getLevelName = computed(
      () => account.value?.levelName ?? '普通会员'
    )
    const getTransactions = computed(() => transactions.value)
    const getRules = computed(() => rules.value)
    const getLevels = computed(() => levels.value)
    const getStatistics = computed(() => statistics)
    const getCheckInStatus = computed(() => checkInStatus)

    const currentLevelInfo = computed(() => {
      if (!account.value || !levels.value.length) return null
      return levels.value.find((l) => l.level === account.value!.level) || null
    })

    const nextLevelInfo = computed(() => {
      if (!account.value || !levels.value.length) return null
      return (
        levels.value.find((l) => l.level === account.value!.level + 1) || null
      )
    })

    const levelProgress = computed(() => {
      if (!account.value || !currentLevelInfo.value || !nextLevelInfo.value) {
        return 0
      }
      const current = currentLevelInfo.value.requiredPoints
      const next = nextLevelInfo.value.requiredPoints
      if (next <= current) return 100
      const progress =
        ((account.value.totalEarned - current) / (next - current)) * 100
      return Math.min(100, Math.max(0, progress))
    })

    const getRuleBySource = (source: PointsSource) => {
      return rules.value.find((r) => r.source === source && r.enabled)
    }

    async function loadAccount(userId?: number) {
      loading.value = true
      try {
        account.value = await pointsApi.getPointsAccount({ userId })
      } catch (error) {
        console.error('加载积分账户失败:', error)
        throw error
      } finally {
        loading.value = false
      }
    }

    async function loadTransactions(params?: {
      userId?: number
      page?: number
      pageSize?: number
      type?: string
      source?: PointsSource
    }) {
      loading.value = true
      try {
        const data = await pointsApi.getTransactions(params)
        transactions.value = data.list
        return data
      } catch (error) {
        console.error('加载交易记录失败:', error)
        throw error
      } finally {
        loading.value = false
      }
    }

    async function loadRules() {
      try {
        rules.value = await pointsApi.getPointsRules()
      } catch (error) {
        console.error('加载积分规则失败:', error)
        throw error
      }
    }

    async function loadLevels() {
      try {
        levels.value = await pointsApi.getPointsLevels()
      } catch (error) {
        console.error('加载等级配置失败:', error)
        throw error
      }
    }

    async function loadStatistics(userId?: number) {
      try {
        Object.assign(statistics, await pointsApi.getPointsStatistics(userId))
      } catch (error) {
        console.error('加载统计数据失败:', error)
        throw error
      }
    }

    async function doCheckIn(userId: number) {
      try {
        const result = await pointsApi.checkIn(userId)
        if (account.value) {
          account.value.availablePoints = result.totalPoints
          account.value.totalEarned += result.points
        }
        checkInStatus.hasCheckedInToday = true
        checkInStatus.consecutiveDays = result.consecutiveDays
        return result
      } catch (error) {
        console.error('签到失败:', error)
        throw error
      }
    }

    async function loadCheckInStatus(userId: number) {
      try {
        Object.assign(
          checkInStatus,
          await pointsApi.getCheckInStatus(userId)
        )
      } catch (error) {
        console.error('加载签到状态失败:', error)
        throw error
      }
    }

    async function spendPoints(
      userId: number,
      points: number,
      referenceId?: string,
      referenceType?: string,
      description?: string
    ) {
      if (!account.value || account.value.availablePoints < points) {
        throw new Error('积分不足')
      }
      try {
        const result = await pointsApi.spendPoints(
          userId,
          points,
          referenceId,
          referenceType,
          description
        )
        if (result.success && account.value) {
          account.value.availablePoints = result.balanceAfter
          account.value.totalSpent += Math.abs(points)
        }
        return result
      } catch (error) {
        console.error('积分消费失败:', error)
        throw error
      }
    }

    async function operatePoints(request: {
      userId: number
      points: number
      source: PointsSource
      referenceId?: string
      referenceType?: string
      description: string
    }) {
      try {
        const result = await pointsApi.operatePoints(request)
        if (result.success && account.value) {
          account.value.availablePoints = result.balanceAfter
          if (request.points > 0) {
            account.value.totalEarned += request.points
          } else {
            account.value.totalSpent += Math.abs(request.points)
          }
        }
        return result
      } catch (error) {
        console.error('积分操作失败:', error)
        throw error
      }
    }

    async function init(userId?: number) {
      await Promise.all([
        loadAccount(userId),
        loadRules(),
        loadLevels(),
        loadStatistics(userId),
        loadCheckInStatus(userId || 0)
      ])
    }

    function clear() {
      account.value = null
      transactions.value = []
      rules.value = []
      levels.value = []
      Object.assign(statistics, {
        todayEarned: 0,
        monthEarned: 0,
        yearEarned: 0,
        todaySpent: 0,
        expiringPoints: 0,
        expiringDays: 0
      })
      Object.assign(checkInStatus, {
        hasCheckedInToday: false,
        consecutiveDays: 0,
        weekStatus: [false, false, false, false, false, false, false]
      })
    }

    return {
      account,
      transactions,
      rules,
      levels,
      statistics,
      loading,
      checkInStatus,
      getAccount,
      getAvailablePoints,
      getLevel,
      getLevelName,
      getTransactions,
      getRules,
      getLevels,
      getStatistics,
      getCheckInStatus,
      currentLevelInfo,
      nextLevelInfo,
      levelProgress,
      getRuleBySource,
      loadAccount,
      loadTransactions,
      loadRules,
      loadLevels,
      loadStatistics,
      loadCheckInStatus,
      doCheckIn,
      spendPoints,
      operatePoints,
      init,
      clear
    }
  },
  {
    persist: {
      storage: sessionStorage,
      paths: ['account', 'checkInStatus']
    }
  }
)
