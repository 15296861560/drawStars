/**
 * 任务管理 Store
 * 基于 Pinia，遵循项目现有 store 模式
 */
import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  Task,
  TaskCategory,
  TaskInstance,
  TaskListQuery,
  AdminTaskListQuery,
  CreateTaskPayload,
  AuditPayload,
  AssignPayload,
  RevokeAssignPayload,
  ShipPayload,
  RewardClaimRecord,
  TaskNotification,
  TaskStatisticsOverview,
  HallStatistics,
  ShippingAddress,
  RewardTemplate,
  TaskTemplateRecord,
  TrendItem,
  UserDimensionStats,
  RewardDimensionStats
} from '@/types/task'
import * as taskApi from '@/api/task'

export const taskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const categories = ref<TaskCategory[]>([])
  const filters = reactive<{
    categoryId: number | null
    status: string
    taskType: string
    keyword: string
    sort: string
  }>({
    categoryId: null,
    status: '',
    taskType: '',
    keyword: '',
    sort: ''
  })
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0
  })
  const myTasks = ref<TaskInstance[]>([])
  const myTaskGroups = reactive<Record<string, TaskInstance[]>>({
    inProgress: [],
    rewardPending: [],
    completed: [],
    assigned: [],
    expired: []
  })
  const achievements = ref<Task[]>([])
  const overview = reactive<TaskStatisticsOverview>({
    totalTasks: 0,
    onlineTasks: 0,
    pendingAudit: 0,
    todayAccept: 0,
    todayComplete: 0,
    todayRewardPoints: 0,
    participationRate: 0,
    completionRate: 0
  })
  const hallStatistics = reactive<HallStatistics>({
    totalTasks: 0,
    completedToday: 0,
    availableTasks: 0,
    totalRewardToday: { points: 0, items: 0 }
  })
  const notifications = ref<TaskNotification[]>([])
  const loading = ref(false)
  const adminList = ref<Task[]>([])
  const adminTotal = ref(0)
  const claims = ref<RewardClaimRecord[]>([])
  const currentDetail = ref<Task | null>(null)
  const trend = ref<TrendItem[]>([])
  const userStats = ref<UserDimensionStats[]>([])
  const rewardStats = ref<RewardDimensionStats[]>([])
  const rewardTemplates = ref<RewardTemplate[]>([])
  const taskTemplates = ref<TaskTemplateRecord[]>([])
  const adminCategories = ref<TaskCategory[]>([])
  const myStats = reactive({
    inProgress: 0,
    completed: 0,
    rewardPending: 0,
    totalAccepted: 0,
    totalPoints: 0
  })

  const inFlightAccept = new Set<number>()
  const inFlightClaim = new Set<number>()

  const availableTasks = computed(() =>
    tasks.value.filter(
      t =>
        t.status === 'APPROVED' &&
        (!t.userProgress ||
          t.userProgress.status === 'NONE' ||
          t.userProgress.status === 'ASSIGNED')
    )
  )

  const unreadCount = computed(
    () => notifications.value.filter(n => !n.read).length
  )

  async function loadCategories() {
    try {
      categories.value = await taskApi.getCategories()
    } catch (error) {
      console.error('加载任务分类失败:', error)
      throw error
    }
  }

  async function loadHallTasks(params?: TaskListQuery) {
    loading.value = true
    try {
      const query: TaskListQuery = {
        categoryId: filters.categoryId,
        status: filters.status || undefined,
        taskType: filters.taskType || undefined,
        keyword: filters.keyword || undefined,
        sort: filters.sort || undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...params
      }
      const data = await taskApi.getHallTasks(query)
      tasks.value = data.list
      Object.assign(hallStatistics, data.statistics)
      pagination.page = data.pagination.page
      pagination.pageSize = data.pagination.pageSize
      pagination.total = data.pagination.total
      return data
    } catch (error) {
      console.error('加载任务大厅失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function loadTaskDetail(id: number) {
    loading.value = true
    try {
      currentDetail.value = await taskApi.getTaskDetail(id)
      const idx = tasks.value.findIndex(t => t.id === id)
      if (idx >= 0 && currentDetail.value) {
        tasks.value[idx] = currentDetail.value
      }
      return currentDetail.value
    } catch (error) {
      console.error('加载任务详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function acceptTask(id: number) {
    if (inFlightAccept.has(id)) {
      throw new Error('正在接取中，请勿重复操作')
    }
    inFlightAccept.add(id)
    try {
      const inst = await taskApi.acceptTask(id)
      const progress = {
        status: inst.status,
        currentCount: inst.currentCount,
        targetCount: inst.targetCount,
        rewardClaimed: inst.rewardClaimed,
        instanceId: inst.id
      }
      const patch = (t: Task) => {
        t.userProgress = { ...progress }
      }
      const idx = tasks.value.findIndex(t => t.id === id)
      if (idx >= 0) patch(tasks.value[idx])
      if (currentDetail.value?.id === id) patch(currentDetail.value)
      const exist = myTasks.value.find(i => i.taskId === id)
      if (exist) {
        Object.assign(exist, inst)
      } else {
        myTasks.value.unshift(inst)
      }
      return inst
    } catch (error) {
      console.error('接取任务失败:', error)
      throw error
    } finally {
      inFlightAccept.delete(id)
    }
  }

  async function submitTask(id: number, payload?: Record<string, any>) {
    try {
      const inst = await taskApi.submitTask(id, payload)
      const progress = {
        status: inst.status,
        currentCount: inst.currentCount,
        targetCount: inst.targetCount,
        rewardClaimed: inst.rewardClaimed,
        instanceId: inst.id,
        completedAt: inst.completedAt,
        progressPercent: 100
      }
      const idx = tasks.value.findIndex(t => t.id === id)
      if (idx >= 0) tasks.value[idx].userProgress = { ...progress }
      if (currentDetail.value?.id === id) {
        currentDetail.value.userProgress = { ...progress }
      }
      const mine = myTasks.value.find(i => i.taskId === id)
      if (mine) Object.assign(mine, inst)
      return inst
    } catch (error) {
      console.error('提交任务失败:', error)
      throw error
    }
  }

  async function claimReward(id: number) {
    if (inFlightClaim.has(id)) {
      throw new Error('正在领取中，请勿重复操作')
    }
    inFlightClaim.add(id)
    try {
      const result = await taskApi.claimReward(id)
      const inst = result.instance
      const progress = {
        status: inst.status,
        currentCount: inst.currentCount,
        targetCount: inst.targetCount,
        rewardClaimed: true,
        instanceId: inst.id,
        completedAt: inst.completedAt,
        progressPercent: 100
      }
      const idx = tasks.value.findIndex(t => t.id === id)
      if (idx >= 0) tasks.value[idx].userProgress = { ...progress }
      if (currentDetail.value?.id === id) {
        currentDetail.value.userProgress = { ...progress }
      }
      const mine = myTasks.value.find(i => i.taskId === id)
      if (mine) Object.assign(mine, inst)
      return result
    } catch (error) {
      console.error('领取奖励失败:', error)
      throw error
    } finally {
      inFlightClaim.delete(id)
    }
  }

  async function saveShippingAddress(id: number, address: ShippingAddress) {
    try {
      return await taskApi.saveShippingAddress(id, address)
    } catch (error) {
      console.error('保存收货地址失败:', error)
      throw error
    }
  }

  async function loadMyTasks(tab?: string) {
    loading.value = true
    try {
      const data = await taskApi.getMyTasks(tab)
      myTasks.value = data.list
      if (data.groups) {
        Object.assign(myTaskGroups, data.groups)
      }
      return data
    } catch (error) {
      console.error('加载我的任务失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function loadMyStats() {
    try {
      Object.assign(myStats, await taskApi.getMyStats())
    } catch (error) {
      console.error('加载我的统计失败:', error)
      throw error
    }
  }

  async function loadAchievements() {
    try {
      achievements.value = await taskApi.getAchievements()
      return achievements.value
    } catch (error) {
      console.error('加载成就失败:', error)
      throw error
    }
  }

  async function loadNotifications() {
    try {
      notifications.value = await taskApi.getNotifications()
      return notifications.value
    } catch (error) {
      console.error('加载通知失败:', error)
      throw error
    }
  }

  async function readNotification(id: number) {
    try {
      await taskApi.readNotification(id)
      const n = notifications.value.find(item => item.id === id)
      if (n) n.read = true
      return true
    } catch (error) {
      console.error('标记已读失败:', error)
      throw error
    }
  }

  async function loadAdminList(params?: AdminTaskListQuery) {
    loading.value = true
    try {
      const data = await taskApi.adminListTasks(params)
      adminList.value = data.list
      adminTotal.value = data.total
      return data
    } catch (error) {
      console.error('加载管理端列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createTask(data: CreateTaskPayload) {
    try {
      const res = await taskApi.createTask(data)
      if (res?.data) adminList.value.unshift(res.data)
      adminTotal.value += 1
      return res
    } catch (error) {
      console.error('创建任务失败:', error)
      throw error
    }
  }

  async function updateTask(id: number, data: Partial<CreateTaskPayload>) {
    try {
      const res = await taskApi.updateTask(id, data)
      if (res?.data) {
        const idx = adminList.value.findIndex(t => t.id === id)
        if (idx >= 0) adminList.value[idx] = res.data
      }
      return res
    } catch (error) {
      console.error('更新任务失败:', error)
      throw error
    }
  }

  async function deleteTask(id: number) {
    try {
      const res = await taskApi.deleteTask(id)
      adminList.value = adminList.value.filter(t => t.id !== id)
      adminTotal.value = Math.max(0, adminTotal.value - 1)
      return res
    } catch (error) {
      console.error('删除任务失败:', error)
      throw error
    }
  }

  async function auditTask(id: number, payload: AuditPayload) {
    try {
      const res = await taskApi.auditTask(id, payload)
      if (res?.data) {
        const idx = adminList.value.findIndex(t => t.id === id)
        if (idx >= 0) adminList.value[idx] = res.data
      }
      return res
    } catch (error) {
      console.error('审核任务失败:', error)
      throw error
    }
  }

  async function pauseTask(id: number) {
    try {
      const res = await taskApi.pauseTask(id)
      if (res?.data) {
        const idx = adminList.value.findIndex(t => t.id === id)
        if (idx >= 0) adminList.value[idx] = res.data
      }
      return res
    } catch (error) {
      console.error('暂停任务失败:', error)
      throw error
    }
  }

  async function resumeTask(id: number) {
    try {
      const res = await taskApi.resumeTask(id)
      if (res?.data) {
        const idx = adminList.value.findIndex(t => t.id === id)
        if (idx >= 0) adminList.value[idx] = res.data
      }
      return res
    } catch (error) {
      console.error('恢复任务失败:', error)
      throw error
    }
  }

  async function offlineTask(id: number) {
    try {
      const res = await taskApi.offlineTask(id)
      if (res?.data) {
        const idx = adminList.value.findIndex(t => t.id === id)
        if (idx >= 0) adminList.value[idx] = res.data
      }
      return res
    } catch (error) {
      console.error('下线任务失败:', error)
      throw error
    }
  }

  async function assignTask(payload: AssignPayload) {
    try {
      return await taskApi.assignTask(payload)
    } catch (error) {
      console.error('指派任务失败:', error)
      throw error
    }
  }

  async function confirmReceipt(taskId: number) {
    try {
      const claim = await taskApi.confirmReceipt(taskId)
      const idx = claims.value.findIndex(c => c.taskId === taskId)
      if (idx >= 0) claims.value[idx] = claim
      if (
        currentDetail.value?.id === taskId &&
        currentDetail.value.userProgress
      ) {
        currentDetail.value.userProgress.claimStatus = 'RECEIVED'
      }
      return claim
    } catch (error) {
      console.error('确认收货失败:', error)
      throw error
    }
  }

  async function copyTask(id: number) {
    try {
      const res = await taskApi.copyTask(id)
      if (res?.data) {
        adminList.value.unshift(res.data)
        adminTotal.value += 1
      }
      return res
    } catch (error) {
      console.error('复制任务失败:', error)
      throw error
    }
  }

  async function batchAssign(payload: AssignPayload) {
    try {
      return await taskApi.batchAssign(payload)
    } catch (error) {
      console.error('批量指派失败:', error)
      throw error
    }
  }

  async function revokeAssign(payload: RevokeAssignPayload) {
    try {
      return await taskApi.revokeAssign(payload)
    } catch (error) {
      console.error('撤销指派失败:', error)
      throw error
    }
  }

  async function loadTrend(days = 7) {
    try {
      trend.value = await taskApi.getStatisticsTrend(days)
      return trend.value
    } catch (error) {
      console.error('加载趋势失败:', error)
      throw error
    }
  }

  async function loadUserStats(limit = 10) {
    try {
      userStats.value = await taskApi.getUserStatistics(limit)
      return userStats.value
    } catch (error) {
      console.error('加载用户统计失败:', error)
      throw error
    }
  }

  async function loadRewardStats() {
    try {
      rewardStats.value = await taskApi.getRewardStatistics()
      return rewardStats.value
    } catch (error) {
      console.error('加载奖励统计失败:', error)
      throw error
    }
  }

  async function exportStatistics(type: 'overview' | 'claims' | 'tasks') {
    try {
      const result = await taskApi.exportStatistics(type)
      taskApi.downloadExportResult(result)
      return result
    } catch (error) {
      console.error('导出统计失败:', error)
      throw error
    }
  }

  async function loadAdminCategories() {
    try {
      adminCategories.value = await taskApi.adminListCategories()
      return adminCategories.value
    } catch (error) {
      console.error('加载管理端分类失败:', error)
      throw error
    }
  }

  async function createCategory(data: Omit<TaskCategory, 'id'>) {
    try {
      const res = await taskApi.createCategory(data)
      if (res?.data) adminCategories.value.push(res.data)
      return res
    } catch (error) {
      console.error('创建分类失败:', error)
      throw error
    }
  }

  async function updateCategory(id: number, data: Partial<TaskCategory>) {
    try {
      const res = await taskApi.updateCategory(id, data)
      if (res?.data) {
        const idx = adminCategories.value.findIndex(c => c.id === id)
        if (idx >= 0) adminCategories.value[idx] = res.data
      }
      return res
    } catch (error) {
      console.error('更新分类失败:', error)
      throw error
    }
  }

  async function deleteCategory(id: number) {
    try {
      const res = await taskApi.deleteCategory(id)
      adminCategories.value = adminCategories.value.filter(c => c.id !== id)
      return res
    } catch (error) {
      console.error('删除分类失败:', error)
      throw error
    }
  }

  async function loadRewardTemplates() {
    try {
      rewardTemplates.value = await taskApi.listRewardTemplates()
      return rewardTemplates.value
    } catch (error) {
      console.error('加载奖励模板失败:', error)
      throw error
    }
  }

  async function createRewardTemplate(data: Omit<RewardTemplate, 'id'>) {
    try {
      const res = await taskApi.createRewardTemplate(data)
      if (res?.data) rewardTemplates.value.push(res.data)
      return res
    } catch (error) {
      console.error('创建奖励模板失败:', error)
      throw error
    }
  }

  async function updateRewardTemplate(
    id: number,
    data: Partial<RewardTemplate>
  ) {
    try {
      const res = await taskApi.updateRewardTemplate(id, data)
      if (res?.data) {
        const idx = rewardTemplates.value.findIndex(t => t.id === id)
        if (idx >= 0) rewardTemplates.value[idx] = res.data
      }
      return res
    } catch (error) {
      console.error('更新奖励模板失败:', error)
      throw error
    }
  }

  async function deleteRewardTemplate(id: number) {
    try {
      const res = await taskApi.deleteRewardTemplate(id)
      rewardTemplates.value = rewardTemplates.value.filter(t => t.id !== id)
      return res
    } catch (error) {
      console.error('删除奖励模板失败:', error)
      throw error
    }
  }

  async function loadTaskTemplates() {
    try {
      taskTemplates.value = await taskApi.listTaskTemplates()
      return taskTemplates.value
    } catch (error) {
      console.error('加载任务模板失败:', error)
      throw error
    }
  }

  async function createTaskTemplate(data: Omit<TaskTemplateRecord, 'id'>) {
    try {
      const res = await taskApi.createTaskTemplate(data)
      if (res?.data) taskTemplates.value.push(res.data)
      return res
    } catch (error) {
      console.error('创建任务模板失败:', error)
      throw error
    }
  }

  async function updateTaskTemplate(
    id: number,
    data: Partial<TaskTemplateRecord>
  ) {
    try {
      const res = await taskApi.updateTaskTemplate(id, data)
      if (res?.data) {
        const idx = taskTemplates.value.findIndex(t => t.id === id)
        if (idx >= 0) taskTemplates.value[idx] = res.data
      }
      return res
    } catch (error) {
      console.error('更新任务模板失败:', error)
      throw error
    }
  }

  async function deleteTaskTemplate(id: number) {
    try {
      const res = await taskApi.deleteTaskTemplate(id)
      taskTemplates.value = taskTemplates.value.filter(t => t.id !== id)
      return res
    } catch (error) {
      console.error('删除任务模板失败:', error)
      throw error
    }
  }

  async function loadOverview() {
    try {
      Object.assign(overview, await taskApi.getStatisticsOverview())
      return overview
    } catch (error) {
      console.error('加载统计概览失败:', error)
      throw error
    }
  }

  async function loadClaims() {
    try {
      claims.value = await taskApi.listRewardClaims()
      return claims.value
    } catch (error) {
      console.error('加载发货列表失败:', error)
      throw error
    }
  }

  async function shipReward(payload: ShipPayload) {
    try {
      const res = await taskApi.shipReward(payload)
      if (res?.data) {
        const idx = claims.value.findIndex(c => c.id === payload.claimId)
        if (idx >= 0) claims.value[idx] = res.data
      }
      return res
    } catch (error) {
      console.error('发货失败:', error)
      throw error
    }
  }

  function clear() {
    tasks.value = []
    categories.value = []
    myTasks.value = []
    achievements.value = []
    notifications.value = []
    adminList.value = []
    adminTotal.value = 0
    claims.value = []
    currentDetail.value = null
    trend.value = []
    userStats.value = []
    rewardStats.value = []
    rewardTemplates.value = []
    taskTemplates.value = []
    adminCategories.value = []
    Object.assign(filters, {
      categoryId: null,
      status: '',
      taskType: '',
      keyword: '',
      sort: ''
    })
    Object.assign(pagination, { page: 1, pageSize: 20, total: 0 })
    Object.assign(myTaskGroups, {
      inProgress: [],
      rewardPending: [],
      completed: [],
      assigned: [],
      expired: []
    })
    Object.assign(overview, {
      totalTasks: 0,
      onlineTasks: 0,
      pendingAudit: 0,
      todayAccept: 0,
      todayComplete: 0,
      todayRewardPoints: 0,
      participationRate: 0,
      completionRate: 0
    })
    Object.assign(hallStatistics, {
      totalTasks: 0,
      completedToday: 0,
      availableTasks: 0,
      totalRewardToday: { points: 0, items: 0 }
    })
  }

  return {
    tasks,
    categories,
    filters,
    pagination,
    myTasks,
    myTaskGroups,
    achievements,
    overview,
    hallStatistics,
    notifications,
    unreadCount,
    loading,
    adminList,
    adminTotal,
    claims,
    currentDetail,
    myStats,
    trend,
    userStats,
    rewardStats,
    rewardTemplates,
    taskTemplates,
    adminCategories,
    availableTasks,
    loadCategories,
    loadHallTasks,
    loadTaskDetail,
    acceptTask,
    submitTask,
    claimReward,
    saveShippingAddress,
    confirmReceipt,
    loadMyTasks,
    loadMyStats,
    loadAchievements,
    loadNotifications,
    readNotification,
    loadAdminList,
    createTask,
    updateTask,
    deleteTask,
    auditTask,
    pauseTask,
    resumeTask,
    offlineTask,
    assignTask,
    batchAssign,
    revokeAssign,
    copyTask,
    loadOverview,
    loadTrend,
    loadUserStats,
    loadRewardStats,
    exportStatistics,
    loadAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    loadRewardTemplates,
    createRewardTemplate,
    updateRewardTemplate,
    deleteRewardTemplate,
    loadTaskTemplates,
    createTaskTemplate,
    updateTaskTemplate,
    deleteTaskTemplate,
    loadClaims,
    shipReward,
    clear
  }
})
