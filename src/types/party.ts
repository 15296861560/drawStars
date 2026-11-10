/**
 * @Description: 拾星趣局（party）管理域类型定义
 * 对齐后端契约：drawStars-serve-node/src/nest/modules/party/party.admin.{controller,service}.ts
 * 实体字段来源：drawStars-serve-node/prisma/schema.prisma 中 Party* 系列 model
 */

// ==================== 通用响应与分页 ====================

/** 后端统一响应包裹：{ code, msg, data }，code === 0 表示成功 */
export interface PartyResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

/** 分页查询返回：{ items, total, page, pageSize } */
export interface PartyPageData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** 批量创建返回：{ created, skipped: [{ index, reason }] } */
export interface PartyBatchCreateResult {
  created: number
  skipped: Array<{ index: number; reason: string }>
}

// ==================== 枚举类定义 ====================

/** 五款游戏类型（后端 GAME key，小姐牌为 lady） */
export type PartyGameType = 'tod' | 'draw' | 'lady' | 'bluff' | 'dice'

/** 题目类型：后端 KIND_KEYS 仅支持真心话 / 大冒险（小姐牌与瞎掰王命题不经题目池接口） */
export type PartyQuestionKind = 'truth' | 'dare'

/** 内容难度 / 星级 */
export type PartyLevel = 'gentle' | 'standard' | 'starry'

/** 题目 / 词条内容状态 */
export type PartyContentStatus = 'online' | 'offline' | 'pending_review'

/** 主题标签适用场景 */
export type PartyThemeScene = 'question' | 'wish'

/** 主题标签状态 */
export type PartyThemeStatus = 'online' | 'offline'

/** 对局状态（PartySessionStatus 枚举值） */
export type PartySessionStatus = 'WAITING' | 'PLAYING' | 'SETTLING' | 'CLOSED'

/** 举报状态机：pending --review--> reviewing --close--> closed（pending 也可直接 close） */
export type PartyReportStatus = 'pending' | 'reviewing' | 'closed'

/** 举报对象类型 */
export type PartyReportTargetType = 'question' | 'wordbank' | 'prompt' | 'word'

/** 举报审核动作（PATCH /admin/reports/:id 的 action 取值） */
export type PartyReportAction = 'review' | 'close'

/** 结案时对被举报对象的处置动作 */
export type PartyReportTargetAction = 'offline' | 'delete'

// ==================== 权限码 ====================

/** 拾星趣局管理域权限码（路由 meta 与 v-permission 共用） */
export const PARTY_PERMISSION = {
  questionManage: 'party:question:manage',
  themeManage: 'party:theme:manage',
  gameConfig: 'party:game:config',
  sessionView: 'party:session:view',
  statsView: 'party:stats:view',
  contentAudit: 'party:content:audit'
} as const

// ==================== 常量映射 ====================

/** 游戏顺序与元信息（与后端 party/data/constants.js GAME 定义一致） */
export const PARTY_GAME_TYPES: PartyGameType[] = ['tod', 'draw', 'lady', 'bluff', 'dice']

export const PARTY_GAME_META: Record<PartyGameType, { name: string; emoji: string }> = {
  tod: { name: '真心话大冒险', emoji: '💫' },
  draw: { name: '你画我猜', emoji: '🎨' },
  lady: { name: '小姐牌', emoji: '🎴' },
  bluff: { name: '瞎掰王', emoji: '🃏' },
  dice: { name: '大话骰子', emoji: '🎲' }
}

/** 游戏 gameType 选项（下拉 / 标签共用） */
export const PARTY_GAME_OPTIONS: Array<{ label: string; value: PartyGameType }> = [
  { label: '真心话大冒险', value: 'tod' },
  { label: '你画我猜', value: 'draw' },
  { label: '小姐牌', value: 'lady' },
  { label: '瞎掰王', value: 'bluff' },
  { label: '大话骰子', value: 'dice' }
]

/** 难度 / 星级选项（题目、词库与游戏配置共用） */
export const PARTY_LEVEL_OPTIONS: Array<{ label: string; value: PartyLevel }> = [
  { label: '温柔', value: 'gentle' },
  { label: '微醺', value: 'standard' },
  { label: '星光', value: 'starry' }
]

/** 题目类型选项（后端 KIND_KEYS） */
export const PARTY_KIND_OPTIONS: Array<{ label: string; value: PartyQuestionKind }> = [
  { label: '真心话', value: 'truth' },
  { label: '大冒险', value: 'dare' }
]

/** 题目 / 词库内容状态表格标签映射 */
export const PARTY_CONTENT_STATUS_TAGS: Array<{
  label: string
  value: PartyContentStatus
  type: 'success' | 'info' | 'warning'
}> = [
  { label: '已上架', value: 'online', type: 'success' },
  { label: '已下架', value: 'offline', type: 'info' },
  { label: '待复核', value: 'pending_review', type: 'warning' }
]

/** 主题场景映射 */
export const PARTY_THEME_SCENE_TAGS: Array<{
  label: string
  value: PartyThemeScene
  type: 'primary' | 'warning'
}> = [
  { label: '题目主题', value: 'question', type: 'primary' },
  { label: '星愿主题', value: 'wish', type: 'warning' }
]

/** 主题标签状态映射 */
export const PARTY_THEME_STATUS_TAGS: Array<{
  label: string
  value: PartyThemeStatus
  type: 'success' | 'info'
}> = [
  { label: '已上架', value: 'online', type: 'success' },
  { label: '已下架', value: 'offline', type: 'info' }
]

/** 对局状态表格标签映射 */
export const PARTY_SESSION_STATUS_TAGS: Array<{
  label: string
  value: PartySessionStatus
  type: 'success' | 'primary' | 'warning' | 'info'
}> = [
  { label: '等待中', value: 'WAITING', type: 'warning' },
  { label: '进行中', value: 'PLAYING', type: 'success' },
  { label: '结算中', value: 'SETTLING', type: 'primary' },
  { label: '已结束', value: 'CLOSED', type: 'info' }
]

/** 举报状态表格标签映射 */
export const PARTY_REPORT_STATUS_TAGS: Array<{
  label: string
  value: PartyReportStatus
  type: 'success' | 'primary' | 'warning' | 'info'
}> = [
  { label: '待处理', value: 'pending', type: 'warning' },
  { label: '复核中', value: 'reviewing', type: 'primary' },
  { label: '已结案', value: 'closed', type: 'info' }
]

/** 举报对象类型映射 */
export const PARTY_REPORT_TARGET_TAGS: Array<{
  label: string
  value: PartyReportTargetType
  type: 'success' | 'primary' | 'warning' | 'danger'
}> = [
  { label: '题目', value: 'question', type: 'primary' },
  { label: '全局词库', value: 'wordbank', type: 'success' },
  { label: '会中命题', value: 'prompt', type: 'warning' },
  { label: '词条', value: 'word', type: 'danger' }
]

// ==================== 题目池 ====================

/** 题目行（PartyQuestion，id 为 BigInt 序列化后的字符串） */
export interface PartyQuestion {
  id: string
  gameType: PartyGameType
  kind: PartyQuestionKind
  level: PartyLevel
  themes: string[]
  text: string
  status: PartyContentStatus
  createdAt: string
}

/** 题目列表查询参数 */
export interface PartyQuestionQuery {
  gameType?: PartyGameType
  kind?: PartyQuestionKind
  level?: PartyLevel
  status?: PartyContentStatus
  keyword?: string
  page?: number
  pageSize?: number
}

/** 新建题目参数（后端也支持 { items: [...] } 批量入参，当前页面为单条录入） */
export interface PartyQuestionCreateParams {
  gameType?: PartyGameType
  kind: PartyQuestionKind
  level?: PartyLevel
  themes?: string[]
  text: string
  status?: PartyContentStatus
}

/** 更新题目参数（PATCH 可更新字段，themes 支持数组或逗号分隔字符串） */
export interface PartyQuestionUpdateParams {
  kind?: PartyQuestionKind
  level?: PartyLevel
  themes?: string[] | string
  text?: string
  status?: PartyContentStatus
}

/** 删除返回：{ deleted: true, id } */
export interface PartyDeleteResult {
  deleted: boolean
  id: string
}

// ==================== 你画我猜词库 ====================

/** 词库行（PartyDrawWord） */
export interface PartyWord {
  id: string
  level: PartyLevel
  theme: string
  word: string
  status: PartyContentStatus
  createdAt: string
}

/** 词库列表查询参数 */
export interface PartyWordQuery {
  level?: PartyLevel
  theme?: string
  status?: PartyContentStatus
  keyword?: string
  page?: number
  pageSize?: number
}

/** 新建词条参数 */
export interface PartyWordCreateParams {
  level?: PartyLevel
  theme: string
  word: string
  status?: PartyContentStatus
}

/** 更新词条参数 */
export interface PartyWordUpdateParams {
  level?: PartyLevel
  theme?: string
  word?: string
  status?: PartyContentStatus
}

// ==================== 主题标签 ====================

/** 主题标签行（PartyThemeTag） */
export interface PartyTheme {
  id: string
  tagKey: string
  name: string
  scene: PartyThemeScene | string
  color: string
  emoji: string
  sort: number
  status: PartyThemeStatus | string
  createdAt: string
  updatedAt: string
}

/** 主题标签列表查询参数（后端不分页，返回全量 items） */
export interface PartyThemeQuery {
  scene?: PartyThemeScene
  status?: PartyThemeStatus
}

/** 主题标签列表返回 { items, total } */
export interface PartyThemeListResult {
  items: PartyTheme[]
  total: number
}

/** 新建主题标签参数（tagKey 唯一，与 name 均必填） */
export interface PartyThemeCreateParams {
  tagKey: string
  name: string
  scene?: PartyThemeScene
  color?: string
  emoji?: string
  sort?: number
  status?: PartyThemeStatus
}

/** 更新主题标签参数（后端不接受修改 tagKey） */
export interface PartyThemeUpdateParams {
  name?: string
  scene?: PartyThemeScene
  color?: string
  emoji?: string
  sort?: number
  status?: PartyThemeStatus
}

// ==================== 游戏配置 ====================

/** 游戏配置行（PartyGameConfig + gameName / gameEmoji 冗余展示字段） */
export interface PartyGameConfig {
  id: string
  gameType: PartyGameType
  status: PartyThemeStatus | string
  playerLimit: number
  roundLimit: number
  level: PartyLevel | string
  penaltyText: string | null
  createdAt: string
  updatedAt: string
  gameName?: string
  gameEmoji?: string
}

/** PATCH 单个游戏配置参数（只传变更字段） */
export interface PartyGameConfigUpdateParams {
  status?: 'online' | 'offline'
  playerLimit?: number
  roundLimit?: number
  level?: PartyLevel
  penaltyText?: string
}

// ==================== 对局查询 ====================

/** 对局玩家映射行（PartySessionPlayer 子集，列表无 avatarUrl / ready） */
export interface PartySessionPlayer {
  id: string
  clientKey: string
  name: string
  avatarUrl?: string | null
  ready?: boolean | null
  isHost: boolean
  online: boolean | null
  absent: boolean | null
  joinedAt?: string
}

/** 对局列表映射行（PartySession + players 概要，携带 playersCount） */
export interface PartySessionRow {
  id: string
  code: string
  gameType: PartyGameType
  gameName?: string
  status: PartySessionStatus
  level: PartyLevel | string
  rounds: number
  currentRound: number
  playerLimit: number
  playersCount: number
  createdAt: string
  startedAt: string | null
  closedAt: string | null
  players: PartySessionPlayer[]
}

/** 对局列表查询参数 */
export interface PartySessionQuery {
  status?: PartySessionStatus
  gameType?: PartyGameType
  code?: string
  page?: number
  pageSize?: number
}

/** 回合记录（PartyRound 原始行，data 为游戏侧 JSON 快照） */
export interface PartyRoundRecord {
  id: string
  sessionId: string
  roundNo: number
  data: Record<string, unknown> | null
  createdAt: string
}

/** 对局详情（GET /admin/sessions/:id：局信息 + 玩家表 + 回合记录） */
export interface PartySessionDetail extends PartySessionRow {
  gameEmoji?: string
  penaltyText: string
  roundRecords: PartyRoundRecord[]
}

// ==================== 数据统计 ====================

/** 场次口径：{ total, waiting, finished, finishedRate }（未开局的 WAITING 局不计入 total） */
export interface PartyStatsSummary {
  total: number
  waiting: number
  finished: number
  finishedRate: number
}

/** 趋势点：{ date: 'YYYY-MM-DD', sessions: 当日开局场次 } */
export interface PartyStatsTrendPoint {
  date: string
  sessions: number
}

/** 段位分布点：{ key, label, users } */
export interface PartyStatsRankDist {
  key: string
  label: string
  users: number
}

/** GET /admin/stats 返回（byGame 为 gameType -> 场次 的 Record） */
export interface PartyStatsResult {
  range: { start: string; end: string }
  sessions: PartyStatsSummary
  byGame: Record<string, number>
  trend: PartyStatsTrendPoint[]
  activeUsers: number
  starValueGrant: number
  rankDist: PartyStatsRankDist[]
}

/** stats 查询参数：start / end 支持 YYYY-MM-DD（也支持 YYYYMMDD 与毫秒时间戳） */
export interface PartyStatsQuery {
  start?: string
  end?: string
}

// ==================== 举报审核 ====================

/** 举报行（PartyReport） */
export interface PartyReport {
  id: string
  targetType: PartyReportTargetType
  targetId: string
  sessionId: string | null
  reason: string
  description: string | null
  status: PartyReportStatus
  handleNote: string | null
  handledBy: string | null
  createdAt: string
  handledAt: string | null
}

/** 举报列表查询参数 */
export interface PartyReportQuery {
  status?: PartyReportStatus
  targetType?: PartyReportTargetType
  page?: number
  pageSize?: number
}

/** 审核动作参数（close 时可选 targetAction 处置被举报内容） */
export interface PartyReportHandleParams {
  action: PartyReportAction
  handledBy?: string
  handleNote?: string
  targetAction?: PartyReportTargetAction
}
