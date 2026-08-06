/**
 * 任务管理 API 层
 * 遵循项目现有 API 模式：支持 mock/真实 API 切换
 */
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
  TaskUserProgress,
  RewardTemplate,
  TaskTemplateRecord,
  TrendItem,
  TaskDimensionStats,
  UserDimensionStats,
  RewardDimensionStats,
  ExportResult
} from '@/types/task'
import {
  $axios,
  $axiosGet,
  requests
} from '@/assets/js/axios-api/axios-config.js'

// ==================== Mock 数据 ====================

const CURRENT_USER_ID = 1

const mockCategories: TaskCategory[] = [
  { id: 1, name: '日常任务', code: 'DAILY', sort: 1 },
  { id: 2, name: '活动任务', code: 'EVENT', sort: 2 },
  { id: 3, name: '成就任务', code: 'ACHIEVEMENT', sort: 3 },
  { id: 4, name: '新手任务', code: 'NOVICE', sort: 4 }
]

function categoryOf(id: number): TaskCategory {
  return mockCategories.find(c => c.id === id)!
}

let nextTaskId = 9
let nextInstanceId = 10
let nextClaimId = 3

const mockTasks: Task[] = [
  {
    id: 1,
    title: '每日签到',
    description: '每日登录签到，领取积分与经验奖励',
    icon: 'calendar',
    categoryId: 1,
    category: categoryOf(1),
    taskType: 'DAILY',
    conditionType: 'CHECK_IN',
    conditionConfig: { action: 'check_in' },
    difficulty: 1,
    tags: ['签到', '日常'],
    rewardConfig: {
      rewards: [
        {
          type: 'POINTS',
          config: { amount: 10 },
          description: '10 积分'
        },
        {
          type: 'EXP',
          config: { amount: 5 },
          description: '5 经验'
        }
      ]
    },
    targetCount: 1,
    status: 'APPROVED',
    assignMode: 'PUBLIC',
    dailyLimit: 1,
    priority: 100,
    createdBy: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    userProgress: {
      status: 'NONE',
      currentCount: 0,
      targetCount: 1,
      rewardClaimed: false
    }
  },
  {
    id: 2,
    title: '完善个人资料',
    description: '完善头像、昵称与个人简介，解锁新手奖励',
    icon: 'user',
    categoryId: 4,
    category: categoryOf(4),
    taskType: 'ONCE',
    conditionType: 'CONTENT',
    conditionConfig: { fields: ['avatar', 'nickname', 'bio'] },
    difficulty: 1,
    tags: ['新手', '资料'],
    rewardConfig: {
      rewards: [
        {
          type: 'POINTS',
          config: { amount: 50 },
          description: '50 积分'
        }
      ]
    },
    targetCount: 1,
    status: 'APPROVED',
    assignMode: 'PUBLIC',
    priority: 90,
    createdBy: 1,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: new Date().toISOString(),
    userProgress: {
      status: 'IN_PROGRESS',
      currentCount: 0,
      targetCount: 1,
      rewardClaimed: false,
      instanceId: 1
    }
  },
  {
    id: 3,
    title: '限时分享挑战',
    description: '活动期间分享任意内容至社交平台，赢取限定奖励',
    icon: 'share',
    categoryId: 2,
    category: categoryOf(2),
    taskType: 'LIMITED',
    conditionType: 'SHARE',
    conditionConfig: { platforms: ['wechat', 'weibo'], count: 1 },
    difficulty: 2,
    tags: ['限时', '分享'],
    rewardConfig: {
      rewards: [
        {
          type: 'POINTS',
          config: { amount: 100 },
          description: '100 积分'
        },
        {
          type: 'PHYSICAL',
          config: { itemName: '限定徽章周边', stock: 50 },
          description: '限定徽章周边'
        }
      ]
    },
    targetCount: 1,
    status: 'APPROVED',
    assignMode: 'PUBLIC',
    startTime: '2026-01-01T00:00:00Z',
    endTime: '2026-12-31T23:59:59Z',
    totalLimit: 500,
    priority: 80,
    createdBy: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    remainingTime: 12960000,
    userProgress: {
      status: 'NONE',
      currentCount: 0,
      targetCount: 1,
      rewardClaimed: false
    }
  },
  {
    id: 4,
    title: '连续签到7天成就',
    description: '累计连续签到 7 天，解锁成就徽章与称号',
    icon: 'trophy',
    categoryId: 3,
    category: categoryOf(3),
    taskType: 'ACHIEVEMENT',
    conditionType: 'CHECK_IN',
    conditionConfig: { consecutiveDays: 7 },
    difficulty: 2,
    tags: ['成就', '签到'],
    rewardConfig: {
      rewards: [
        {
          type: 'BADGE',
          config: { badge_code: 'checkin_7', name: '七日达人' },
          description: '七日达人徽章'
        },
        {
          type: 'TITLE',
          config: { title: '坚持不懈', style: 'gold' },
          description: '称号：坚持不懈'
        },
        {
          type: 'POINTS',
          config: { amount: 200 },
          description: '200 积分'
        }
      ]
    },
    targetCount: 7,
    status: 'APPROVED',
    assignMode: 'PUBLIC',
    priority: 70,
    createdBy: 1,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    userProgress: {
      status: 'IN_PROGRESS',
      currentCount: 3,
      targetCount: 7,
      rewardClaimed: false,
      instanceId: 2,
      progressPercent: 43
    }
  },
  {
    id: 5,
    title: '新手引导',
    description: '完成新手引导子任务，熟悉平台核心功能',
    icon: 'guide',
    categoryId: 4,
    category: categoryOf(4),
    taskType: 'ONCE',
    conditionType: 'COMPOSITE',
    conditionConfig: {},
    difficulty: 1,
    tags: ['新手', '引导'],
    rewardConfig: {
      rewards: [
        {
          type: 'POINTS',
          config: { amount: 80 },
          description: '80 积分'
        },
        {
          type: 'ITEM',
          config: { itemCode: 'novice_pack', name: '新手礼包' },
          description: '新手礼包'
        }
      ]
    },
    targetCount: 3,
    status: 'APPROVED',
    assignMode: 'PUBLIC',
    completionMode: 'ALL',
    unlockMode: 'SEQUENTIAL',
    children: [
      {
        id: 501,
        title: '浏览任务大厅',
        conditionType: 'CUSTOM',
        conditionConfig: { action: 'visit_hall' },
        reward: {
          rewards: [
            {
              type: 'POINTS',
              config: { amount: 10 },
              description: '10 积分'
            }
          ]
        }
      },
      {
        id: 502,
        title: '完成一次签到',
        conditionType: 'CHECK_IN',
        conditionConfig: { action: 'check_in' },
        reward: {
          rewards: [
            {
              type: 'EXP',
              config: { amount: 5 },
              description: '5 经验'
            }
          ]
        }
      },
      {
        id: 503,
        title: '查看我的成就',
        conditionType: 'CUSTOM',
        conditionConfig: { action: 'visit_achievements' }
      }
    ],
    subTaskCount: 3,
    priority: 95,
    createdBy: 1,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: new Date().toISOString(),
    userProgress: {
      status: 'NONE',
      currentCount: 0,
      targetCount: 3,
      rewardClaimed: false
    }
  },
  {
    id: 6,
    title: '春节问卷调研（待审核）',
    description: '完成春节主题问卷并提交凭证，等待运营审核上线',
    icon: 'survey',
    categoryId: 2,
    category: categoryOf(2),
    taskType: 'LIMITED',
    conditionType: 'SURVEY',
    conditionConfig: { surveyId: 101 },
    difficulty: 2,
    tags: ['问卷', '活动'],
    rewardConfig: {
      rewards: [
        {
          type: 'COUPON',
          config: { couponId: 'SPRING2026', amount: 20 },
          description: '20 元优惠券'
        }
      ]
    },
    targetCount: 1,
    status: 'PENDING',
    assignMode: 'PUBLIC',
    startTime: '2026-01-20T00:00:00Z',
    endTime: '2026-02-20T23:59:59Z',
    priority: 60,
    createdBy: 2,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: new Date().toISOString(),
    userProgress: null
  },
  {
    id: 7,
    title: '邀请好友草稿',
    description: '邀请好友注册并完成首登（草稿未发布）',
    icon: 'invite',
    categoryId: 2,
    category: categoryOf(2),
    taskType: 'ONCE',
    conditionType: 'INVITE',
    conditionConfig: { inviteCount: 1 },
    difficulty: 2,
    tags: ['邀请'],
    rewardConfig: {
      rewards: [
        {
          type: 'POINTS',
          config: { amount: 150 },
          description: '150 积分'
        }
      ]
    },
    targetCount: 1,
    status: 'DRAFT',
    assignMode: 'PUBLIC',
    priority: 50,
    createdBy: 1,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    userProgress: null
  },
  {
    id: 8,
    title: '周末学习打卡（已暂停）',
    description: '周末完成一次学习内容打卡，活动临时暂停',
    icon: 'book',
    categoryId: 1,
    category: categoryOf(1),
    taskType: 'DAILY',
    conditionType: 'LEARN',
    conditionConfig: { minutes: 15 },
    difficulty: 1,
    tags: ['学习', '日常'],
    rewardConfig: {
      rewards: [
        {
          type: 'EXP',
          config: { amount: 20 },
          description: '20 经验'
        }
      ]
    },
    targetCount: 1,
    status: 'PAUSED',
    assignMode: 'PUBLIC',
    dailyLimit: 1,
    priority: 40,
    createdBy: 1,
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    userProgress: null
  }
]

const mockInstances: TaskInstance[] = [
  {
    id: 1,
    taskId: 2,
    userId: CURRENT_USER_ID,
    status: 'IN_PROGRESS',
    currentCount: 0,
    targetCount: 1,
    rewardClaimed: false,
    acceptedAt: '2026-08-01T08:00:00Z',
    completedAt: null,
    task: mockTasks.find(t => t.id === 2)
  },
  {
    id: 2,
    taskId: 4,
    userId: CURRENT_USER_ID,
    status: 'IN_PROGRESS',
    currentCount: 3,
    targetCount: 7,
    rewardClaimed: false,
    acceptedAt: '2026-07-20T08:00:00Z',
    completedAt: null,
    task: mockTasks.find(t => t.id === 4)
  },
  {
    id: 3,
    taskId: 3,
    userId: CURRENT_USER_ID,
    status: 'REWARD_PENDING',
    currentCount: 1,
    targetCount: 1,
    rewardClaimed: false,
    acceptedAt: '2026-08-02T10:00:00Z',
    completedAt: '2026-08-02T12:00:00Z',
    task: mockTasks.find(t => t.id === 3),
    shippingAddress: null
  }
]

const mockClaims: RewardClaimRecord[] = [
  {
    id: 1,
    instanceId: 3,
    taskId: 3,
    taskTitle: '限时分享挑战',
    userId: CURRENT_USER_ID,
    userName: '测试用户',
    itemName: '限定徽章周边',
    status: 'PENDING_ADDRESS',
    address: null,
    logisticsCompany: null,
    trackingNo: null,
    createdAt: '2026-08-02T12:05:00Z'
  },
  {
    id: 2,
    instanceId: 99,
    taskId: 3,
    taskTitle: '限时分享挑战',
    userId: 2,
    userName: '另一用户',
    itemName: '限定徽章周边',
    status: 'PENDING_SHIP',
    address: {
      name: '张三',
      phone: '13800138000',
      address: '上海市浦东新区示例路 88 号'
    },
    logisticsCompany: null,
    trackingNo: null,
    createdAt: '2026-08-01T09:00:00Z'
  }
]

const mockNotifications: TaskNotification[] = [
  {
    id: 1,
    userId: CURRENT_USER_ID,
    taskId: 1,
    title: '新任务上线',
    content: '「每日签到」已上线，快来领取吧',
    type: 'TASK_ONLINE',
    read: false,
    createdAt: '2026-08-05T09:00:00Z'
  },
  {
    id: 2,
    userId: CURRENT_USER_ID,
    taskId: 3,
    title: '奖励待领取',
    content: '你已完成「限时分享挑战」，请领取奖励并填写收货地址',
    type: 'REWARD_PENDING',
    read: false,
    createdAt: '2026-08-02T12:10:00Z'
  },
  {
    id: 3,
    userId: CURRENT_USER_ID,
    taskId: 4,
    title: '进度提醒',
    content: '「连续签到7天成就」已完成 3/7，继续加油！',
    type: 'PROGRESS',
    read: true,
    createdAt: '2026-08-04T08:00:00Z'
  },
  {
    id: 4,
    userId: CURRENT_USER_ID,
    taskId: 5,
    title: '新手引导待接取',
    content: '完成新手引导可获得新手礼包',
    type: 'ASSIGN',
    read: false,
    createdAt: '2026-08-03T10:00:00Z'
  }
]

// ==================== Mock 服务 ====================

const USE_MOCK = import.meta.env.VITE_TASK_MOCK !== 'false'

async function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function attachProgress(task: Task): Task {
  const inst = mockInstances.find(
    i => i.taskId === task.id && i.userId === CURRENT_USER_ID
  )
  if (!inst) {
    return {
      ...task,
      category: categoryOf(task.categoryId),
      userProgress: task.userProgress ?? {
        status: 'NONE',
        currentCount: 0,
        targetCount: task.targetCount,
        rewardClaimed: false
      }
    }
  }
  const progress: TaskUserProgress = {
    status: inst.status,
    currentCount: inst.currentCount,
    targetCount: inst.targetCount,
    rewardClaimed: inst.rewardClaimed,
    instanceId: inst.id,
    completedAt: inst.completedAt,
    progressPercent: Math.round(
      (inst.currentCount / Math.max(inst.targetCount, 1)) * 100
    )
  }
  return {
    ...task,
    category: categoryOf(task.categoryId),
    userProgress: progress
  }
}

function filterTasks(
  list: Task[],
  params?: TaskListQuery | AdminTaskListQuery
) {
  let result = [...list]
  const keyword =
    (params as TaskListQuery)?.keyword ||
    (params as AdminTaskListQuery)?.title ||
    ''
  if (keyword) {
    const kw = String(keyword).toLowerCase()
    result = result.filter(t => t.title.toLowerCase().includes(kw))
  }
  if (params?.status) {
    result = result.filter(t => t.status === params.status)
  }
  if (params?.taskType) {
    result = result.filter(t => t.taskType === params.taskType)
  }
  if (
    params?.categoryId !== undefined &&
    params?.categoryId !== null &&
    params?.categoryId !== ''
  ) {
    result = result.filter(t => t.categoryId === Number(params.categoryId))
  }
  return result
}

function paginate<T>(
  list: T[],
  params?: { page?: number; curPage?: number; pageSize?: number }
) {
  const page = params?.curPage || params?.page || 1
  const pageSize = params?.pageSize || 20
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    page,
    pageSize,
    total: list.length
  }
}

function calcHallStatistics(all: Task[]): HallStatistics {
  const approved = all.filter(t => t.status === 'APPROVED')
  const withProgress = approved.map(attachProgress)
  const completedToday = withProgress.filter(
    t =>
      t.userProgress?.status === 'COMPLETED' ||
      t.userProgress?.status === 'REWARD_PENDING' ||
      t.userProgress?.status === 'REWARD_CLAIMED'
  ).length
  const availableTasks = withProgress.filter(
    t =>
      !t.userProgress ||
      t.userProgress.status === 'NONE' ||
      t.userProgress.status === 'ASSIGNED'
  ).length
  return {
    totalTasks: approved.length,
    completedToday,
    availableTasks,
    totalRewardToday: { points: 150, items: 2 }
  }
}

// ==================== 用户端 API ====================

/** 获取任务分类 */
export async function getCategories(): Promise<TaskCategory[]> {
  if (USE_MOCK) {
    await delay()
    return [...mockCategories]
  }
  const res = await $axiosGet({}, '/tasks/categories')
  return res.data
}

/** 任务大厅列表 */
export async function getHallTasks(params?: TaskListQuery): Promise<{
  list: Task[]
  statistics: HallStatistics
  pagination: { page: number; pageSize: number; total: number }
}> {
  if (USE_MOCK) {
    await delay()
    const hallPool = mockTasks.filter(
      t => t.status === 'APPROVED' || t.status === 'PAUSED'
    )
    const filtered = filterTasks(hallPool, params).filter(
      t => t.status === 'APPROVED'
    )
    const paged = paginate(filtered, params)
    return {
      list: paged.list.map(attachProgress),
      statistics: calcHallStatistics(mockTasks),
      pagination: {
        page: paged.page,
        pageSize: paged.pageSize,
        total: paged.total
      }
    }
  }
  const res = await $axiosGet(params || {}, '/tasks')
  return res.data
}

/** 任务详情 */
export async function getTaskDetail(id: number): Promise<Task> {
  if (USE_MOCK) {
    await delay()
    const task = mockTasks.find(t => t.id === id)
    if (!task) throw new Error('任务不存在')
    return attachProgress(task)
  }
  const res = await $axiosGet({}, `/tasks/${id}`)
  return res.data
}

/** 接取任务（幂等：已接取直接返回） */
export async function acceptTask(id: number): Promise<TaskInstance> {
  if (USE_MOCK) {
    await delay()
    const task = mockTasks.find(t => t.id === id)
    if (!task) throw new Error('任务不存在')
    if (task.status !== 'APPROVED') throw new Error('任务不可接取')
    const existed = mockInstances.find(
      i => i.taskId === id && i.userId === CURRENT_USER_ID
    )
    if (existed) {
      return { ...existed, task: attachProgress(task) }
    }
    const inst: TaskInstance = {
      id: nextInstanceId++,
      taskId: id,
      userId: CURRENT_USER_ID,
      status: 'IN_PROGRESS',
      currentCount: 0,
      targetCount: task.targetCount,
      rewardClaimed: false,
      acceptedAt: new Date().toISOString(),
      completedAt: null,
      task: attachProgress(task)
    }
    mockInstances.push(inst)
    task.userProgress = {
      status: 'IN_PROGRESS',
      currentCount: 0,
      targetCount: task.targetCount,
      rewardClaimed: false,
      instanceId: inst.id
    }
    return inst
  }
  const res = await $axios({}, `/tasks/${id}/accept`)
  if (!res?.status) throw new Error(res?.msg || '接取失败')
  return res.data
}

/** 提交任务完成 */
export async function submitTask(
  id: number,
  payload?: Record<string, any>
): Promise<TaskInstance> {
  if (USE_MOCK) {
    await delay()
    const task = mockTasks.find(t => t.id === id)
    if (!task) throw new Error('任务不存在')
    const inst = mockInstances.find(
      i => i.taskId === id && i.userId === CURRENT_USER_ID
    )
    if (!inst) throw new Error('请先接取任务')
    if (inst.status === 'COMPLETED' || inst.status === 'REWARD_PENDING') {
      return { ...inst, task: attachProgress(task) }
    }
    if (inst.status !== 'IN_PROGRESS' && inst.status !== 'SUBMITTED') {
      throw new Error('当前状态不可提交')
    }
    if (payload?.subTaskId && task.children?.length) {
      const subId = Number(payload.subTaskId)
      const progress = task.userProgress || {
        status: inst.status,
        currentCount: inst.currentCount,
        targetCount: inst.targetCount,
        rewardClaimed: inst.rewardClaimed,
        instanceId: inst.id,
        completedSubTaskIds: [] as number[]
      }
      const done = progress.completedSubTaskIds || []
      if (!done.includes(subId)) done.push(subId)
      progress.completedSubTaskIds = done
      inst.currentCount = done.length
      task.userProgress = progress
      if (done.length >= (task.children?.length || task.targetCount)) {
        inst.currentCount = inst.targetCount
        inst.status = 'REWARD_PENDING'
        inst.completedAt = new Date().toISOString()
        progress.status = 'REWARD_PENDING'
        progress.progressPercent = 100
      }
      return { ...inst, task: attachProgress(task) }
    }
    inst.currentCount = inst.targetCount
    inst.status = 'REWARD_PENDING'
    inst.completedAt = new Date().toISOString()
    task.userProgress = {
      status: 'REWARD_PENDING',
      currentCount: inst.currentCount,
      targetCount: inst.targetCount,
      rewardClaimed: false,
      instanceId: inst.id,
      completedAt: inst.completedAt,
      progressPercent: 100
    }
    const hasPhysical = task.rewardConfig.rewards.some(
      r => r.type === 'PHYSICAL'
    )
    if (hasPhysical) {
      const item = task.rewardConfig.rewards.find(r => r.type === 'PHYSICAL')
      mockClaims.push({
        id: nextClaimId++,
        instanceId: inst.id,
        taskId: id,
        taskTitle: task.title,
        userId: CURRENT_USER_ID,
        userName: '测试用户',
        itemName: item?.config?.itemName || '实物奖励',
        status: 'PENDING_ADDRESS',
        address: null,
        createdAt: new Date().toISOString()
      })
    }
    void payload
    return { ...inst, task: attachProgress(task) }
  }
  const res = await $axios(payload || {}, `/tasks/${id}/submit`)
  if (!res?.status) throw new Error(res?.msg || '提交失败')
  return res.data
}

/** 领取奖励（防重复领取） */
export async function claimReward(id: number): Promise<{
  success: boolean
  message: string
  instance: TaskInstance
}> {
  if (USE_MOCK) {
    await delay()
    const task = mockTasks.find(t => t.id === id)
    if (!task) throw new Error('任务不存在')
    const inst = mockInstances.find(
      i => i.taskId === id && i.userId === CURRENT_USER_ID
    )
    if (!inst) throw new Error('任务实例不存在')
    if (inst.rewardClaimed || inst.status === 'REWARD_CLAIMED') {
      return {
        success: true,
        message: '奖励已领取',
        instance: { ...inst, task: attachProgress(task) }
      }
    }
    if (inst.status !== 'REWARD_PENDING' && inst.status !== 'COMPLETED') {
      throw new Error('当前不可领取奖励')
    }
    inst.rewardClaimed = true
    inst.status = 'REWARD_CLAIMED'
    task.userProgress = {
      status: 'REWARD_CLAIMED',
      currentCount: inst.currentCount,
      targetCount: inst.targetCount,
      rewardClaimed: true,
      instanceId: inst.id,
      completedAt: inst.completedAt,
      progressPercent: 100
    }
    return {
      success: true,
      message: '领取成功',
      instance: { ...inst, task: attachProgress(task) }
    }
  }
  const res = await $axios({}, `/tasks/${id}/claim`)
  if (!res?.status) throw new Error(res?.msg || '领取失败')
  return res.data
}

/** 填写实物收货地址 */
export async function saveShippingAddress(
  id: number,
  address: ShippingAddress
): Promise<RewardClaimRecord> {
  if (USE_MOCK) {
    await delay()
    const claim = mockClaims.find(
      c =>
        c.taskId === id &&
        c.userId === CURRENT_USER_ID &&
        (c.status === 'PENDING_ADDRESS' || c.status === 'PENDING_SHIP')
    )
    if (!claim) throw new Error('待填写地址的奖励记录不存在')
    claim.address = { ...address }
    claim.status = 'PENDING_SHIP'
    const inst = mockInstances.find(i => i.id === claim.instanceId)
    if (inst) inst.shippingAddress = { ...address }
    return { ...claim }
  }
  const res = await $axios(address, `/tasks/${id}/claim/shipping`)
  if (!res?.status) throw new Error(res?.msg || '保存地址失败')
  return res.data
}

/** 我的任务（按 tab 分组或筛选） */
export async function getMyTasks(tab?: string): Promise<{
  list: TaskInstance[]
  groups?: Record<string, TaskInstance[]>
}> {
  if (USE_MOCK) {
    await delay()
    const mine = mockInstances
      .filter(i => i.userId === CURRENT_USER_ID)
      .map(i => {
        const task = mockTasks.find(t => t.id === i.taskId)
        return {
          ...i,
          task: task ? attachProgress(task) : i.task
        }
      })
    const groups: Record<string, TaskInstance[]> = {
      inProgress: mine.filter(
        i => i.status === 'IN_PROGRESS' || i.status === 'SUBMITTED'
      ),
      rewardPending: mine.filter(i => i.status === 'REWARD_PENDING'),
      completed: mine.filter(
        i => i.status === 'COMPLETED' || i.status === 'REWARD_CLAIMED'
      ),
      assigned: mine.filter(i => i.status === 'ASSIGNED'),
      expired: mine.filter(i => i.status === 'EXPIRED')
    }
    if (!tab || tab === 'all') {
      return { list: mine, groups }
    }
    const map: Record<string, keyof typeof groups> = {
      in_progress: 'inProgress',
      inProgress: 'inProgress',
      reward_pending: 'rewardPending',
      rewardPending: 'rewardPending',
      completed: 'completed',
      assigned: 'assigned',
      expired: 'expired'
    }
    const key = map[tab] || 'inProgress'
    return { list: groups[key] || [], groups }
  }
  const res = await $axiosGet({ tab }, '/tasks/my')
  return res.data
}

/** 我的任务统计 */
export async function getMyStats(): Promise<{
  inProgress: number
  completed: number
  rewardPending: number
  totalAccepted: number
  totalPoints: number
}> {
  if (USE_MOCK) {
    await delay()
    const mine = mockInstances.filter(i => i.userId === CURRENT_USER_ID)
    return {
      inProgress: mine.filter(i => i.status === 'IN_PROGRESS').length,
      completed: mine.filter(
        i => i.status === 'COMPLETED' || i.status === 'REWARD_CLAIMED'
      ).length,
      rewardPending: mine.filter(i => i.status === 'REWARD_PENDING').length,
      totalAccepted: mine.length,
      totalPoints: 360
    }
  }
  const res = await $axiosGet({}, '/tasks/my/stats')
  return res.data
}

/** 成就墙 */
export async function getAchievements(): Promise<Task[]> {
  if (USE_MOCK) {
    await delay()
    return mockTasks
      .filter(t => t.taskType === 'ACHIEVEMENT' && t.status !== 'DELETED')
      .map(attachProgress)
  }
  const res = await $axiosGet({}, '/tasks/achievements')
  return res.data
}

/** 任务通知列表 */
export async function getNotifications(): Promise<TaskNotification[]> {
  if (USE_MOCK) {
    await delay()
    return mockNotifications
      .filter(n => n.userId === CURRENT_USER_ID)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }
  const res = await $axiosGet({}, '/tasks/notifications')
  return res.data
}

/** 确认实物收货 */
export async function confirmReceipt(
  taskId: number
): Promise<RewardClaimRecord> {
  if (USE_MOCK) {
    await delay()
    const claim = mockClaims.find(
      c =>
        c.taskId === taskId &&
        c.userId === CURRENT_USER_ID &&
        c.status === 'SHIPPED'
    )
    if (!claim) throw new Error('待确认收货的记录不存在')
    claim.status = 'RECEIVED'
    return { ...claim }
  }
  const res = await $axios({}, `/tasks/${taskId}/claim/confirm`)
  if (!res?.status) throw new Error(res?.msg || '确认收货失败')
  return res.data
}

/** 标记通知已读 */
export async function readNotification(id: number): Promise<boolean> {
  if (USE_MOCK) {
    await delay()
    const n = mockNotifications.find(item => item.id === id)
    if (n) n.read = true
    return true
  }
  const res = await $axios({}, `/tasks/notifications/${id}/read`)
  if (!res?.status) throw new Error(res?.msg || '标记失败')
  return true
}

// ==================== 管理端 API ====================

/** 管理端任务列表 */
export async function adminListTasks(params?: AdminTaskListQuery): Promise<{
  list: Task[]
  total: number
}> {
  if (USE_MOCK) {
    await delay()
    const filtered = filterTasks(
      mockTasks.filter(t => t.status !== 'DELETED'),
      params
    )
    const paged = paginate(filtered, params)
    return {
      list: paged.list.map(t => ({
        ...t,
        category: categoryOf(t.categoryId)
      })),
      total: paged.total
    }
  }
  const res = await $axiosGet(params || {}, '/admin/tasks/list')
  return res.data
}

/** 管理端任务详情 */
export async function adminGetTask(id: number): Promise<Task> {
  if (USE_MOCK) {
    await delay()
    const task = mockTasks.find(t => t.id === id)
    if (!task) throw new Error('任务不存在')
    return {
      ...task,
      category: categoryOf(task.categoryId)
    }
  }
  const res = await $axiosGet({}, `/admin/tasks/${id}`)
  return res.data
}

/** 创建任务 */
export async function createTask(
  data: CreateTaskPayload
): Promise<{ status: boolean; msg: string; data: Task }> {
  if (USE_MOCK) {
    await delay()
    const task: Task = {
      id: nextTaskId++,
      title: data.title,
      description: data.description,
      icon: data.icon,
      categoryId: data.categoryId,
      category: categoryOf(data.categoryId),
      taskType: data.taskType,
      conditionType: data.conditionType,
      conditionConfig: data.conditionConfig,
      difficulty: data.difficulty,
      tags: data.tags,
      rewardConfig: data.rewardConfig,
      targetCount: data.targetCount,
      status: data.skipAudit ? 'APPROVED' : 'PENDING',
      assignMode: data.assignMode,
      startTime: data.startTime,
      endTime: data.endTime,
      dailyLimit: data.dailyLimit,
      totalLimit: data.totalLimit,
      acceptValidHours: data.acceptValidHours,
      children: data.children,
      subTaskCount: data.children?.length || 0,
      createdBy: CURRENT_USER_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userProgress: null
    }
    mockTasks.unshift(task)
    return { status: true, msg: '创建成功', data: task }
  }
  const res = await $axios(data, '/admin/tasks')
  return res
}

/** 更新任务 */
export async function updateTask(
  id: number,
  data: Partial<CreateTaskPayload>
): Promise<{ status: boolean; msg: string; data: Task }> {
  if (USE_MOCK) {
    await delay()
    const idx = mockTasks.findIndex(t => t.id === id)
    if (idx < 0) throw new Error('任务不存在')
    const prev = mockTasks[idx]
    const next: Task = {
      ...prev,
      ...data,
      id,
      category: categoryOf(data.categoryId ?? prev.categoryId),
      updatedAt: new Date().toISOString()
    }
    mockTasks[idx] = next
    return { status: true, msg: '更新成功', data: next }
  }
  return requests({
    url: `/api/admin/tasks/${id}`,
    data,
    method: 'put'
  })
}

/** 软删除任务 */
export async function deleteTask(
  id: number
): Promise<{ status: boolean; msg: string; data: boolean }> {
  if (USE_MOCK) {
    await delay()
    const task = mockTasks.find(t => t.id === id)
    if (!task) throw new Error('任务不存在')
    task.status = 'DELETED'
    task.updatedAt = new Date().toISOString()
    return { status: true, msg: '删除成功', data: true }
  }
  return requests({
    url: `/api/admin/tasks/${id}`,
    method: 'delete'
  })
}

/** 审核任务 */
export async function auditTask(
  id: number,
  payload: AuditPayload
): Promise<{ status: boolean; msg: string; data: Task }> {
  if (USE_MOCK) {
    await delay()
    const task = mockTasks.find(t => t.id === id)
    if (!task) throw new Error('任务不存在')
    if (payload.action === 'APPROVE') {
      task.status = 'APPROVED'
      task.rejectReason = null
    } else {
      task.status = 'REJECTED'
      task.rejectReason = payload.reason || '审核未通过'
    }
    task.updatedAt = new Date().toISOString()
    return { status: true, msg: '审核完成', data: { ...task } }
  }
  const res = await $axios(payload, `/admin/tasks/${id}/audit`)
  return res
}

/** 暂停任务 */
export async function pauseTask(
  id: number
): Promise<{ status: boolean; msg: string; data: Task }> {
  if (USE_MOCK) {
    await delay()
    const task = mockTasks.find(t => t.id === id)
    if (!task) throw new Error('任务不存在')
    task.status = 'PAUSED'
    task.updatedAt = new Date().toISOString()
    return { status: true, msg: '已暂停', data: { ...task } }
  }
  const res = await $axios({}, `/admin/tasks/${id}/pause`)
  return res
}

/** 恢复任务 */
export async function resumeTask(
  id: number
): Promise<{ status: boolean; msg: string; data: Task }> {
  if (USE_MOCK) {
    await delay()
    const task = mockTasks.find(t => t.id === id)
    if (!task) throw new Error('任务不存在')
    task.status = 'APPROVED'
    task.updatedAt = new Date().toISOString()
    return { status: true, msg: '已恢复', data: { ...task } }
  }
  const res = await $axios({}, `/admin/tasks/${id}/resume`)
  return res
}

/** 下线任务 */
export async function offlineTask(
  id: number
): Promise<{ status: boolean; msg: string; data: Task }> {
  if (USE_MOCK) {
    await delay()
    const task = mockTasks.find(t => t.id === id)
    if (!task) throw new Error('任务不存在')
    task.status = 'OFFLINE'
    task.updatedAt = new Date().toISOString()
    return { status: true, msg: '已下线', data: { ...task } }
  }
  const res = await $axios({}, `/admin/tasks/${id}/offline`)
  return res
}

/** 定向指派 */
export async function assignTask(
  payload: AssignPayload
): Promise<{ status: boolean; msg: string; data: boolean }> {
  if (USE_MOCK) {
    await delay()
    const task = mockTasks.find(t => t.id === payload.taskId)
    if (!task) throw new Error('任务不存在')
    for (const userId of payload.userIds) {
      const exists = mockInstances.find(
        i => i.taskId === payload.taskId && i.userId === userId
      )
      if (exists) continue
      mockInstances.push({
        id: nextInstanceId++,
        taskId: payload.taskId,
        userId,
        status: 'ASSIGNED',
        currentCount: 0,
        targetCount: task.targetCount,
        rewardClaimed: false,
        acceptedAt: new Date().toISOString(),
        completedAt: null,
        task
      })
    }
    return { status: true, msg: '指派成功', data: true }
  }
  const res = await $axios(payload, '/admin/tasks/assign')
  return res
}

/** 统计概览 */
export async function getStatisticsOverview(): Promise<TaskStatisticsOverview> {
  if (USE_MOCK) {
    await delay()
    const active = mockTasks.filter(t => t.status !== 'DELETED')
    return {
      totalTasks: active.length,
      onlineTasks: active.filter(t => t.status === 'APPROVED').length,
      pendingAudit: active.filter(t => t.status === 'PENDING').length,
      todayAccept: 12,
      todayComplete: 8,
      todayRewardPoints: 1260,
      participationRate: 0.68,
      completionRate: 0.54
    }
  }
  const res = await $axiosGet({}, '/admin/statistics/overview')
  return res.data
}

/** 实物奖励发货列表 */
export async function listRewardClaims(): Promise<RewardClaimRecord[]> {
  if (USE_MOCK) {
    await delay()
    return [...mockClaims]
  }
  const res = await $axiosGet({}, '/admin/rewards/claims')
  return res.data
}

/** 复制任务 */
export async function copyTask(
  id: number
): Promise<{ status: boolean; msg: string; data: Task }> {
  if (USE_MOCK) {
    await delay()
    const src = mockTasks.find(t => t.id === id)
    if (!src) throw new Error('任务不存在')
    const task: Task = {
      ...src,
      id: nextTaskId++,
      title: src.title + '（副本）',
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userProgress: null
    }
    mockTasks.unshift(task)
    return { status: true, msg: '复制成功', data: task }
  }
  const res = await $axios({}, `/admin/tasks/${id}/copy`)
  return res
}

/** 批量指派 */
export async function batchAssign(
  payload: AssignPayload
): Promise<{ status: boolean; msg: string; data: boolean }> {
  if (USE_MOCK) {
    return assignTask(payload)
  }
  const res = await $axios(payload, '/admin/tasks/assign/batch')
  return res
}

/** 撤销指派 */
export async function revokeAssign(
  payload: RevokeAssignPayload
): Promise<{ status: boolean; msg: string; data: boolean }> {
  if (USE_MOCK) {
    await delay()
    for (const userId of payload.userIds) {
      const idx = mockInstances.findIndex(
        i =>
          i.taskId === payload.taskId &&
          i.userId === userId &&
          i.status === 'ASSIGNED'
      )
      if (idx >= 0) mockInstances.splice(idx, 1)
    }
    return { status: true, msg: '撤销成功', data: true }
  }
  const res = await $axios(payload, '/admin/tasks/assign/revoke')
  return res
}

/** 统计趋势 */
export async function getStatisticsTrend(days = 7): Promise<TrendItem[]> {
  if (USE_MOCK) {
    await delay()
    const items: TrendItem[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      items.push({
        date: d.toISOString().slice(0, 10),
        accept: 8 + Math.floor(Math.random() * 10),
        complete: 5 + Math.floor(Math.random() * 8)
      })
    }
    return items
  }
  const res = await $axiosGet({ days }, '/admin/statistics/trend')
  return res.data
}

/** 单任务维度统计 */
export async function getTaskStatistics(
  id: number
): Promise<TaskDimensionStats> {
  if (USE_MOCK) {
    await delay()
    const task = mockTasks.find(t => t.id === id)
    return {
      taskId: id,
      taskTitle: task?.title || '任务 #' + id,
      acceptCount: 42,
      completeCount: 28,
      completionRate: 0.67
    }
  }
  const res = await $axiosGet({}, `/admin/statistics/task/${id}`)
  return res.data
}

/** 用户维度 TOP 统计 */
export async function getUserStatistics(
  limit = 10
): Promise<UserDimensionStats[]> {
  if (USE_MOCK) {
    await delay()
    return [
      {
        userId: 1,
        userName: '测试用户',
        acceptCount: 15,
        completeCount: 12,
        rewardPoints: 860
      },
      {
        userId: 2,
        userName: '用户B',
        acceptCount: 10,
        completeCount: 8,
        rewardPoints: 520
      }
    ]
  }
  const res = await $axiosGet({ limit }, '/admin/statistics/user')
  const list = Array.isArray(res.data) ? res.data : []
  return list.map((row: Record<string, any>) => ({
    userId: Number(row.userId),
    userName: row.userName,
    acceptCount: Number(row.acceptCount ?? row.completedCount ?? 0),
    completeCount: Number(row.completeCount ?? row.completedCount ?? 0),
    rewardPoints: Number(row.rewardPoints ?? row.points ?? 0)
  }))
}

const PHYSICAL_STATUS_LABEL: Record<string, string> = {
  PENDING_ADDRESS: '实物·待填地址',
  PENDING_SHIP: '实物·待发货',
  SHIPPED: '实物·已发货',
  RECEIVED: '实物·已收货'
}

/** 奖励维度统计 */
export async function getRewardStatistics(): Promise<RewardDimensionStats[]> {
  if (USE_MOCK) {
    await delay()
    return [
      { rewardType: '积分', count: 120, totalPoints: 5600 },
      { rewardType: '实物·待发货', count: 3, itemName: '待处理' },
      { rewardType: '实物·已发货', count: 2, itemName: '运输中' }
    ]
  }
  const res = await $axiosGet({}, '/admin/statistics/reward')
  const data = res.data
  if (Array.isArray(data)) return data

  const rows: RewardDimensionStats[] = []
  if (data && typeof data === 'object') {
    rows.push({
      rewardType: '积分发放',
      count: Number(data.completedInstances || 0),
      totalPoints: Number(data.pointsTotal || 0)
    })
    const byStatus = data.physicalByStatus || {}
    for (const [status, count] of Object.entries(byStatus)) {
      rows.push({
        rewardType: PHYSICAL_STATUS_LABEL[status] || status,
        count: Number(count),
        itemName: status
      })
    }
    if (data.claimRate != null) {
      rows.push({
        rewardType: '实物领取率',
        count: 0,
        itemName: Math.round(Number(data.claimRate) * 100) + '%'
      })
    }
  }
  return rows
}

/** 导出统计数据 */
export async function exportStatistics(
  type: 'overview' | 'claims' | 'tasks'
): Promise<ExportResult> {
  if (USE_MOCK) {
    await delay()
    return {
      filename: `task-${type}-${Date.now()}.csv`,
      contentType: 'text/csv;charset=utf-8',
      content: 'id,name,value\n1,示例,100\n'
    }
  }
  const res = await $axios({ type }, '/admin/statistics/export')
  if (!res?.status) throw new Error(res?.msg || '导出失败')
  return res.data
}

/** 下载导出结果 */
export function downloadExportResult(result: ExportResult) {
  const blob = new Blob([result.content], {
    type: result.contentType || 'text/csv;charset=utf-8'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = result.filename
  a.click()
  URL.revokeObjectURL(url)
}

// ==================== 分类管理 ====================

/** 管理端分类列表 */
export async function adminListCategories(): Promise<TaskCategory[]> {
  if (USE_MOCK) {
    await delay()
    return [...mockCategories]
  }
  const res = await $axiosGet({}, '/admin/categories')
  return res.data
}

/** 创建分类 */
export async function createCategory(
  data: Omit<TaskCategory, 'id'>
): Promise<{ status: boolean; msg: string; data: TaskCategory }> {
  if (USE_MOCK) {
    await delay()
    const cat: TaskCategory = {
      id: mockCategories.length + 1,
      ...data
    }
    mockCategories.push(cat)
    return { status: true, msg: '创建成功', data: cat }
  }
  const res = await $axios(data, '/admin/categories')
  return res
}

/** 更新分类 */
export async function updateCategory(
  id: number,
  data: Partial<TaskCategory>
): Promise<{ status: boolean; msg: string; data: TaskCategory }> {
  if (USE_MOCK) {
    await delay()
    const idx = mockCategories.findIndex(c => c.id === id)
    if (idx < 0) throw new Error('分类不存在')
    mockCategories[idx] = { ...mockCategories[idx], ...data, id }
    return { status: true, msg: '更新成功', data: mockCategories[idx] }
  }
  return requests({
    url: `/api/admin/categories/${id}`,
    data,
    method: 'put'
  })
}

/** 删除分类 */
export async function deleteCategory(
  id: number
): Promise<{ status: boolean; msg: string; data: boolean }> {
  if (USE_MOCK) {
    await delay()
    const idx = mockCategories.findIndex(c => c.id === id)
    if (idx >= 0) mockCategories.splice(idx, 1)
    return { status: true, msg: '删除成功', data: true }
  }
  return requests({
    url: `/api/admin/categories/${id}`,
    method: 'delete'
  })
}

// ==================== 奖励模板 ====================

let nextRewardTemplateId = 10
const mockRewardTemplates: RewardTemplate[] = [
  {
    id: 1,
    name: '基础积分包',
    description: '10 积分 + 5 经验',
    rewardConfig: {
      rewards: [
        { type: 'POINTS', config: { amount: 10 }, description: '10 积分' },
        { type: 'EXP', config: { amount: 5 }, description: '5 经验' }
      ]
    }
  },
  {
    id: 2,
    name: '实物奖励包',
    description: '积分 + 实物周边',
    rewardConfig: {
      rewards: [
        { type: 'POINTS', config: { amount: 50 }, description: '50 积分' },
        {
          type: 'PHYSICAL',
          config: { itemName: '限定徽章', stock: 100 },
          description: '限定徽章'
        }
      ]
    }
  }
]

/** 奖励模板列表 */
export async function listRewardTemplates(): Promise<RewardTemplate[]> {
  if (USE_MOCK) {
    await delay()
    return [...mockRewardTemplates]
  }
  const res = await $axiosGet({}, '/admin/rewards/templates')
  return res.data
}

/** 创建奖励模板 */
export async function createRewardTemplate(
  data: Omit<RewardTemplate, 'id'>
): Promise<{ status: boolean; msg: string; data: RewardTemplate }> {
  if (USE_MOCK) {
    await delay()
    const tpl: RewardTemplate = {
      id: nextRewardTemplateId++,
      ...data
    }
    mockRewardTemplates.push(tpl)
    return { status: true, msg: '创建成功', data: tpl }
  }
  const res = await $axios(data, '/admin/rewards/templates')
  return res
}

/** 更新奖励模板 */
export async function updateRewardTemplate(
  id: number,
  data: Partial<RewardTemplate>
): Promise<{ status: boolean; msg: string; data: RewardTemplate }> {
  if (USE_MOCK) {
    await delay()
    const idx = mockRewardTemplates.findIndex(t => t.id === id)
    if (idx < 0) throw new Error('模板不存在')
    mockRewardTemplates[idx] = { ...mockRewardTemplates[idx], ...data, id }
    return { status: true, msg: '更新成功', data: mockRewardTemplates[idx] }
  }
  return requests({
    url: `/api/admin/rewards/templates/${id}`,
    data,
    method: 'put'
  })
}

/** 删除奖励模板 */
export async function deleteRewardTemplate(
  id: number
): Promise<{ status: boolean; msg: string; data: boolean }> {
  if (USE_MOCK) {
    await delay()
    const idx = mockRewardTemplates.findIndex(t => t.id === id)
    if (idx >= 0) mockRewardTemplates.splice(idx, 1)
    return { status: true, msg: '删除成功', data: true }
  }
  return requests({
    url: `/api/admin/rewards/templates/${id}`,
    method: 'delete'
  })
}

// ==================== 任务模板 ====================

let nextTaskTemplateId = 10
const mockTaskTemplates: TaskTemplateRecord[] = [
  {
    id: 1,
    name: '日常签到模板',
    description: '每日签到任务预设',
    categoryId: 1,
    templateData: {
      taskType: 'DAILY',
      conditionType: 'CHECK_IN',
      difficulty: 1,
      targetCount: 1,
      assignMode: 'PUBLIC',
      rewardConfig: {
        rewards: [
          { type: 'POINTS', config: { amount: 10 }, description: '10 积分' }
        ]
      }
    }
  }
]

/** 任务模板列表 */
export async function listTaskTemplates(): Promise<TaskTemplateRecord[]> {
  if (USE_MOCK) {
    await delay()
    return [...mockTaskTemplates]
  }
  const res = await $axiosGet({}, '/admin/task-templates')
  return res.data
}

/** 创建任务模板 */
export async function createTaskTemplate(
  data: Omit<TaskTemplateRecord, 'id'>
): Promise<{ status: boolean; msg: string; data: TaskTemplateRecord }> {
  if (USE_MOCK) {
    await delay()
    const tpl: TaskTemplateRecord = {
      id: nextTaskTemplateId++,
      ...data
    }
    mockTaskTemplates.push(tpl)
    return { status: true, msg: '创建成功', data: tpl }
  }
  const res = await $axios(data, '/admin/task-templates')
  return res
}

/** 更新任务模板 */
export async function updateTaskTemplate(
  id: number,
  data: Partial<TaskTemplateRecord>
): Promise<{ status: boolean; msg: string; data: TaskTemplateRecord }> {
  if (USE_MOCK) {
    await delay()
    const idx = mockTaskTemplates.findIndex(t => t.id === id)
    if (idx < 0) throw new Error('模板不存在')
    mockTaskTemplates[idx] = { ...mockTaskTemplates[idx], ...data, id }
    return { status: true, msg: '更新成功', data: mockTaskTemplates[idx] }
  }
  return requests({
    url: `/api/admin/task-templates/${id}`,
    data,
    method: 'put'
  })
}

/** 删除任务模板 */
export async function deleteTaskTemplate(
  id: number
): Promise<{ status: boolean; msg: string; data: boolean }> {
  if (USE_MOCK) {
    await delay()
    const idx = mockTaskTemplates.findIndex(t => t.id === id)
    if (idx >= 0) mockTaskTemplates.splice(idx, 1)
    return { status: true, msg: '删除成功', data: true }
  }
  return requests({
    url: `/api/admin/task-templates/${id}`,
    method: 'delete'
  })
}

/** 实物发货 */
export async function shipReward(
  payload: ShipPayload
): Promise<{ status: boolean; msg: string; data: RewardClaimRecord }> {
  if (USE_MOCK) {
    await delay()
    const claim = mockClaims.find(c => c.id === payload.claimId)
    if (!claim) throw new Error('发货记录不存在')
    claim.logisticsCompany = payload.logisticsCompany
    claim.trackingNo = payload.trackingNo
    claim.status = 'SHIPPED'
    const inst = mockInstances.find(i => i.id === claim.instanceId)
    if (inst) {
      inst.logisticsCompany = payload.logisticsCompany
      inst.trackingNo = payload.trackingNo
    }
    return { status: true, msg: '发货成功', data: { ...claim } }
  }
  const res = await $axios(payload, '/admin/rewards/ship')
  return res
}
