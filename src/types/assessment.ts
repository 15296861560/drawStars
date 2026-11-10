/**
 * 心智测评系统（问星）—— 领域类型定义
 * 依据《心智测评系统_PRD_v1.0》5.2 数据模型 / 4.x 功能设计
 */

// ===== 基础枚举 =====

/** 渠道来源（公众号王国） */
export type ChannelSource = 'article' | 'keyword' | 'welcome' | 'menu' | 'share'

/** 渠道入口目标页 */
export type TargetType = 'fill' | 'plaza'

/** 回复规则类型 */
export type ReplyRuleType = 'keyword' | 'welcome'

/** 回复规则同步状态 */
export type SyncStatus = 'pending' | 'synced'

/** 判定模型：M0 等级映射 / M1 类型映射 / M2 维度得分 */
export type JudgeModel = 'M0' | 'M1' | 'M2'

/** 上架状态：0 草稿 / 1 已上架 / 2 已下架 */
export type AssessInfoStatus = 0 | 1 | 2

/** 埋点事件类型（4.6.2 E01–E10） */
export type AssessmentEventType =
  | 'channel_visit'      // E01 渠道曝光
  | 'plaza_click'        // E02 广场卡片点击
  | 'response_complete'  // E03 问卷提交
  | 'register_show'      // E04 注册弹层曝光
  | 'register_success'   // E05 注册成功
  | 'guide_show'         // E06 引导位曝光
  | 'guide_click'        // E07 引导位点击
  | 'share_click'        // E08 分享按钮点击
  | 'poster_create'      // E09 海报生成
  | 'follow_scan'        // E10（预留）

/** 积分联动场景码（4.8.2） */
export type PointsScenario = 'ASSESSMENT_COMPLETE' | 'ASSESSMENT_POSTER' | 'REGISTER_WELCOME'

/** 卡片角标（以 tags 前置词约定表达：HOT / NEW / 限免） */
export type AssessBadge = 'HOT' | 'NEW' | '限免' | ''

// ===== 测评上架（assessment_info） =====

/** C 端广场卡片 */
export interface PlazaCard {
  /** assessment_info.id */
  id: number
  title: string
  /** 类型库 type_key（见 src/config/assessment-registry.ts） */
  typeKey: string
  /** 关联已发布问卷 id（服务端已校验） */
  surveyId: number | string
  /** 关联问卷的公开填写码（服务端解析，C 端拼 /survey/fill/{shareCode}） */
  shareCode: string
  /** 类型库兜底封面主题（info.cover_url 为空时前端按 typeKey 取默认封面） */
  coverUrl?: string
  subtitle?: string
  /** 英文逗号分隔；首位若为 HOT/NEW/限免 则渲染为角标 */
  tags: string
  questionNum: number
  durationDesc?: string
  sort: number
  status: AssessInfoStatus
  publishedAt?: string
}

/** 上架管理完整记录 */
export type AssessmentInfo = PlazaCard

/** 广场列表查询 */
export interface PlazaListQuery {
  typeKey?: string
  page?: number
  pageSize?: number
}

// ===== 公众号运营配置（assessment_oa_config，单行） =====

export interface AssessmentOaConfig {
  id: number
  /** 公众号名称 */
  officialName: string
  /** 原始 ID / gh_id / AppID */
  wechatId?: string
  /** 账号类型 0 未认证订阅号 1 认证订阅号 2 服务号（决定交互能力） */
  accountType: 0 | 1 | 2
  /** 公众号二维码图 URL（为空时前端渲染占位二维码） */
  qrCodeUrl?: string
  /** 引导位开关 */
  guideEnabled: boolean
  /** 通用话术：通用兜底（存量兼容） */
  guideTitle: string
  guideDesc: string
  /** 位置差异化话术（可选，为空时回退通用话术） */
  resultGuideTitle?: string
  resultGuideDesc?: string
  completeGuideTitle?: string
  completeGuideDesc?: string
  /** 海报转发文案 */
  posterShareText?: string
  /** 广场页路径，建议 /assessment/list */
  plazaPath?: string
  updatedAt?: string
}

/** C 端引导位配置（含前端兜底，5 分钟本地缓存） */
export interface GuideConfig {
  officialName: string
  accountType: 0 | 1 | 2
  qrCodeUrl?: string
  guideEnabled: boolean
  result: { title: string; desc: string }
  complete: { title: string; desc: string }
  posterShareText: string
  plazaPath: string
}

// ===== 渠道入口工厂（assessment_channel_link） =====

export interface AssessmentChannel {
  id: number
  /** 渠道名（内部识别用） */
  name: string
  /** 渠道来源 */
  source: ChannelSource
  /** 外部 ref_id：文章 ID / 关键词触发串 / 欢迎语场景 / 菜单 key / 分享用户 ID */
  refId?: string
  /** 目标页类型 */
  targetType: TargetType
  /** targetType=fill 时必填 */
  surveyId?: number | string
  /** targetType=fill 时必填（公开填写码） */
  shareCode?: string
  /** carrying infoId（可选，用于数据下钻） */
  infoId?: number
  /** 成效 1 开启 / 0 关闭 */
  status: 0 | 1
  startAt?: string
  endAt?: string
  remark?: string
  createdAt?: string
}

/** 渠道链接构建参数（4.4.2，由管理端前端拼装） */
export interface ChannelBuildOption {
  source: ChannelSource
  refId: string
  targetType: TargetType
  surveyId?: number | string
  shareCode?: string
  plazaPath?: string
}

// ===== 回复规则（assessment_reply_rule） =====

export interface AssessmentReplyRule {
  id: number
  ruleType: ReplyRuleType
  /** keyword 时必填，多个英文逗号分隔 */
  keywords?: string
  /** 文本内容，支持 {link} 占位符，保存时原样存储、展示时实时替换 */
  replyContent: string
  /** 绑定渠道来源（可选） */
  source?: ChannelSource
  refId?: string
  /** 规则 1 生效 / 0 停用（硬约束） */
  status: 0 | 1
  /** 上线初期人工维护 0 待同步 / 1 已同步 */
  syncStatus: SyncStatus
  sort?: number
  remark?: string
  createdAt?: string
  updatedAt?: string
}

// ===== 埋点事件 =====

export interface AssessmentEventPayload {
  eventType: AssessmentEventType
  sessionId: string
  userId?: number | null
  source?: string | null
  refId?: string | null
  /** fill / plaza / result / poster / complete */
  target?: string | null
  /** guide: result/complete/plaza/poster；share: 渠道 */
  position?: string | null
  surveyId?: number | string | null
  surveyResponseId?: string | null
  isNewUser?: boolean | null
  userAgent?: string | null
  createdAt?: string
}

export interface AssessmentEventRecord extends AssessmentEventPayload {
  id: number
  createdDay?: string
}

/** 单事件上报响应（用于注册->积分->上报后检查已领取） */
export interface EventReportResult {
  eventId?: number
  /** 该事件已计入过积分时返回（事件表唯一索引兜底） */
  pointsGranted?: number
  /** true 表示该事件已领取过积分，前端按钮转「已领取」并展示获积明细 */
  alreadyGranted?: boolean
}

// ===== 报告聚合（C 端 /assessmentApi/report/{responseId}） =====

export interface ReportDimension {
  key: string
  /** 维度名（M2 高/低维度点评用） */
  name: string
  /** 卦符/缩写（M1 用，如 ☰） */
  symbol?: string
  score: number
  max: number
  percent: number
  /** 维度一句话点评（M2）/类型解读（M1） */
  description?: string
  color?: string
}

/** 报告聚合（4.2 报告域 组合结构） */
export interface AssessmentReport {
  responseId: string
  surveyId: number | string
  shareCode?: string
  typeKey: string
  judgeModel: JudgeModel
  /** 测评名（assessment_info.title） */
  infoTitle: string
  /** 主结果标题：M1=类型名 / M0=等级名 / M2=画像标题 */
  resultTitle: string
  gradeLabel?: string
  gradeColor?: string
  totalScore?: number
  maxScore?: number
  /** M0 传 boolean；M1/M2 恒为 null（无及格线） */
  isPassed?: boolean | null
  /** 维度得分（后台按分数 desc 排序后返回） */
  dimensions?: ReportDimension[]
  /** M1/M2 最高维度 */
  topDimension?: ReportDimension
  /** M1/M2 最低维度（M2 低分区点评用） */
  lowDimension?: ReportDimension
  /** 专属解读段落（M0 等级文案 / M1 类型完整文案 / M2 画像汇总） */
  summaryText?: string
  /** M1 明亮面 · 星光点（报告解读区双卡） */
  brightSide?: string[]
  /** M1 盲区 · 暗礁点 */
  blindSide?: string[]
  /** M1 校准建议（玉色尾注） */
  adviceText?: string
  /** 报告编号（YYMMDD-XXXXX，下载证书用） */
  responseNo?: string
  completedAt?: string
  /** 测评入口链接（海报/分享用） */
  fillUrl?: string
}

// ===== 游客快捷注册 / 积分 =====

export interface QuickRegisterParams {
  phone: string
  captcha: string
  nickname?: string
  /** 注册积分发放标记：ASSESSMENT_COMPLETE / ASSESSMENT_POSTER */
  pointsScenario?: PointsScenario
  /** 关联 responseId（补发答题积分） */
  responseId?: string
  /** 游客答卷池（注册后逐份迁移补领，场景 B） */
  responseIds?: string[]
  /** 注册事件继承的渠道 */
  source?: string | null
  refId?: string | null
}

export interface QuickRegisterResult {
  token: string
  isNewUser: boolean
  grantedPoints?: number
  /** [5, 5, 20] 格式（如 [5,20]） */
  pointsDetail?: number[]
  user: { id: number; name: string; phone: string }
}

/** 积分补领（E04/E05 前置校验 is_granted） */
export interface ClaimCheckResult {
  claimed: boolean
  grantedPoints: number
  pointsDetail: number[]
}

// ===== 管理端统计 =====

export interface FunnelStep {
  /** channel_visit / plaza_click / response_complete / register_show / register_success / guide_show / follow_scan */
  key: string
  label: string
  value: number
  /** 相对上一级转化率 0-1 */
  rate?: number
}

export interface ChannelPivotItem {
  source: ChannelSource
  refId?: string
  visits: number
  completes: number
  registers: number
  posters: number
  completeRate: number
}

export interface StatsTrendPoint {
  date: string
  e01: number
  e03: number
  e05: number
}

export interface RegisterMetrics {
  showCount: number
  successCount: number
  newCount: number
  /** 曝光→注册转化率 */
  rate: number
  /** 观测窗口内新注册数（5 分钟去重口径） */
  newRate?: number
}

export interface PointsMetrics {
  completeCount: number
  posterCount: number
  welcomeCount: number
  totalPoints: number
  /** 发放成本覆盖率 */
  grantRate: number
  claimable: number
  claimCount: number
}

export interface TopSurveyItem {
  infoId: number
  title: string
  typeKey: string
  visits: number
  completes: number
  completeRate: number
}

export interface StatsOverview {
  /** 近 N 天 */
  days: number
  funnel: FunnelStep[]
  channelPivot: ChannelPivotItem[]
  trend: StatsTrendPoint[]
  register: RegisterMetrics
  points: PointsMetrics
  topSurveys: TopSurveyItem[]
}

// ===== 通用 =====

export interface PageResult<T> {
  list: T[]
  total: number
}
