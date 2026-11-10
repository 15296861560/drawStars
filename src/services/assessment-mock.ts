/**
 * 心智测评 Mock 服务（演示用）
 *
 * 结构说明：
 * - 后端 drawStars-serve-node 未接入前，通过 VITE_ASSESSMENT_MOCK != 'false'
 *   开启本模块（src/api/assessment.ts 统一引流），保证 C 端/管理端全链路可演示。
 * - 面向真实后端联调时 .env 设 VITE_ASSESSMENT_MOCK=false，本模块不再被引用。
 * - Mock 域的三份示例问卷（shareCode: asmt-01/02/03）仅存在于 Mock 模式，
 *   真实后端返回的广场列表不会包含这些码，故不会污染真实填写链路。
 * - 随机报告分数按 responseId 确定性生成（同一单号报告恒定，刷新不漂移）。
 */
import type {
  AssessmentChannel,
  AssessmentEventRecord,
  AssessmentEventType,
  AssessmentInfo,
  AssessmentOaConfig,
  AssessmentReplyRule,
  AssessmentReport,
  ChannelPivotItem,
  ChannelSource,
  FunnelStep,
  GuideConfig,
  PageResult,
  PlazaListQuery,
  PointsScenario,
  QuickRegisterResult,
  ReplyRuleType,
  ReportDimension,
  StatsOverview,
  StatsTrendPoint,
  TargetType,
  TopSurveyItem
} from '@/types/assessment'
import {
  ASSESSMENT_TYPE_REGISTRY,
  OA_GUIDE_DEFAULTS,
  M0_GRADE_MAP,
  M1_DIMENSIONS,
  M2_DIMENSIONS,
  M2_PROFILE_TITLES,
  ASSESSMENT_POINTS
} from '@/config/assessment-registry'

// ========== 工具 ==========

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** 确定性伪随机（0-1） */
function seededRandom(seed: string, salt = 0): number {
  let v = (hash(seed) ^ (salt * 2654435761)) >>> 0
  v ^= v << 13; v >>>= 0
  v ^= v >> 17
  v ^= v << 5; v >>>= 0
  return (v >>> 0) / 4294967295
}

function pad(n: number, len = 5): string {
  return String(n).padStart(len, '0')
}

function now(): string {
  return new Date().toISOString()
}

function dayKey(iso = now()): string {
  return iso.slice(0, 10)
}

// ========== Mock 问卷（三份） ==========

interface MockOptionDef {
  content: string
  /** 选项分值映射：dim -> pts */
  dim?: string
  pts?: number
  /** M0 直接分值 */
  score?: number
}

interface MockQuestionDef {
  title: string
  options: MockOptionDef[]
}

interface MockSurveyDef {
  shareCode: string
  surveyId: number
  typeKey: string
  questions: MockQuestionDef[]
}

let optSeq = 1000

function toOptions(defs: MockOptionDef[]) {
  return defs.map((d, i) => ({
    id: ++optSeq,
    content: d.content,
    sortOrder: i,
    config: { dim: d.dim, pts: d.pts, score: d.score }
  }))
}

/** 问题 id 约定：mockSurvey surveyId*100+序号，避免与真实题目冲突 */
function toMockQuestions(def: MockSurveyDef) {
  return def.questions.map((q, i) => ({
    id: def.surveyId * 100 + i + 1,
    surveyId: def.surveyId,
    type: 'radio',
    title: q.title,
    description: '',
    sortOrder: i + 1,
    required: true,
    config: { options: toOptions(q.options) }
  }))
}

const MOCK_SURVEYS: Record<string, MockSurveyDef> = {
  'asmt-01': {
    shareCode: 'asmt-01',
    surveyId: 9001,
    typeKey: 'archetype',
    questions: [
      {
        title: '面对一件从未做过的重要任务，你的第一反应更像？',
        options: [
          { content: '兴奋，立刻开始拆解行动步骤', dim: 'qian', pts: 3 },
          { content: '先找有经验的人聊聊，边听边琢磨', dim: 'xun', pts: 3 },
          { content: '心里打鼓，但会默默把细节都想清楚', dim: 'kan', pts: 3 },
          { content: '担心搞砸，希望有人一起扛', dim: 'gen', pts: 3 }
        ]
      },
      {
        title: '团队讨论陷入僵局时，你通常会？',
        options: [
          { content: '站出来拍板，给出明确方向', dim: 'zhen', pts: 3 },
          { content: '讲段话缓和气氛，把大家重新接上', dim: 'dui', pts: 3 },
          { content: '用一张图把分歧点理清楚', dim: 'li', pts: 3 },
          { content: '提议先休会，让子弹飞一会儿', dim: 'gen', pts: 3 }
        ]
      },
      {
        title: '哪种称赞最让你舒服？',
        options: [
          { content: '「这事只有你能成」，被信任托底', dim: 'kun', pts: 3 },
          { content: '「你冲得真快」，被看见锐气', dim: 'qian', pts: 3 },
          { content: '「和你聊天很治愈」，被喜欢', dim: 'dui', pts: 3 },
          { content: '「你看得真深」，被认可洞察', dim: 'kan', pts: 3 }
        ]
      },
      {
        title: '深夜emo的时刻，你更倾向？',
        options: [
          { content: '写点什么，把混乱梳理成文字', dim: 'li', pts: 3 },
          { content: '列张清单，焦虑就散了', dim: 'qian', pts: 2 },
          { content: '找个朋友语音到天亮', dim: 'dui', pts: 3 },
          { content: '关机睡觉，明天再说', dim: 'gen', pts: 3 }
        ]
      },
      {
        title: '一个新趋势出现，你是？',
        options: [
          { content: '第一批入场试水的人', dim: 'zhen', pts: 3 },
          { content: '观察两周，顺风再上', dim: 'xun', pts: 3 },
          { content: '想想它背后的逻辑再说', dim: 'kan', pts: 3 },
          { content: '把现有的事做稳更重要', dim: 'kun', pts: 2 }
        ]
      },
      {
        title: '你最受不了的队友类型是？',
        options: [
          { content: '光说不做，出事就消失', dim: 'qian', pts: 3 },
          { content: '情绪上头，会议变战场', dim: 'dui', pts: 2 },
          { content: '没有热情，永远在敷衍', dim: 'li', pts: 3 },
          { content: '反复横跳，计划天天改', dim: 'gen', pts: 3 }
        ]
      },
      {
        title: '如果给人生选一个叙事主题，你会选？',
        options: [
          { content: '长风破浪，去开拓边界', dim: 'qian', pts: 2 },
          { content: '润物无声，把身边的人照亮', dim: 'li', pts: 2 },
          { content: '深水静流，探索心智深处', dim: 'kan', pts: 2 },
          { content: '把日子过成值得托付的秩序', dim: 'gen', pts: 2 }
        ]
      },
      {
        title: '心里有大事悬而未决时，你会？',
        options: [
          { content: '做点什么转移注意力', dim: 'zhen', pts: 2 },
          { content: '按部就班做手头的事，稳住', dim: 'kun', pts: 3 },
          { content: '反复推演各种可能', dim: 'kan', pts: 2 },
          { content: '找一个智者聊聊再定', dim: 'xun', pts: 2 }
        ]
      }
    ]
  },
  'asmt-02': {
    shareCode: 'asmt-02',
    surveyId: 9002,
    typeKey: 'emotion',
    questions: [
      {
        title: '此刻，你的心跳和呼吸给你的感觉是？',
        options: [
          { content: '舒缓平稳，像无风的湖面', dim: 'calm', pts: 4 },
          { content: '轻快有劲，像踩着节拍器', dim: 'joy', pts: 4 },
          { content: '有些发紧，像绷着的弦', dim: 'anxiety', pts: 4 },
          { content: '沉而缓，像灌了铅', dim: 'fatigue', pts: 4 }
        ]
      },
      {
        title: '最近一件小确幸（奶茶/夕阳/一条消息）出现时，你？',
        options: [
          { content: '嘴角压不住，心里开了花', dim: 'joy', pts: 4 },
          { content: '有点开心，但很快归于平静', dim: 'calm', pts: 3 },
          { content: '愣了一下才反应过来自己笑了', dim: 'fatigue', pts: 2 },
          { content: '反而感叹快乐总是转瞬即逝', dim: 'anxiety', pts: 2 }
        ]
      },
      {
        title: '「明天截止」四个字出现在日程里，你的身体反应？',
        options: [
          { content: '微微一紧，随即进入备战状态', dim: 'anxiety', pts: 2 },
          { content: '没什么波澜，按节奏走', dim: 'calm', pts: 3 },
          { content: '心跳加速，脑子开始过热', dim: 'anxiety', pts: 4 },
          { content: '叹口气，感觉电量又掉一格', dim: 'fatigue', pts: 3 }
        ]
      },
      {
        title: '今天被人无心忽略时，你？',
        options: [
          { content: '体谅对方忙，情绪没什么波动', dim: 'calm', pts: 2 },
          { content: '有点小失落，但很快自我消化', dim: 'joy', pts: 2 },
          { content: '心里翻涌，反复回想细节', dim: 'anxiety', pts: 3 },
          { content: '提不起精神去在意', dim: 'fatigue', pts: 3 }
        ]
      },
      {
        title: '今晚有一整块自由时间，你更想？',
        options: [
          { content: '早就列好了想做的事，兴致勃勃', dim: 'joy', pts: 3 },
          { content: '泡脚焚香，享受安静', dim: 'calm', pts: 3 },
          { content: '刷手机放空，尽管知道会更累', dim: 'fatigue', pts: 3 },
          { content: '纠结该休息还是补进度，结果都没做好', dim: 'anxiety', pts: 3 }
        ]
      }
    ]
  },
  'asmt-03': {
    shareCode: 'asmt-03',
    surveyId: 9003,
    typeKey: 'quick_daily',
    questions: [
      {
        title: '此刻抬头问星：今天你的心绪贴近哪一种天象？',
        options: [
          { content: '晴空朗照，诸事皆宜 · 感觉自己能照亮全场', score: 100 },
          { content: '云隙透光，渐入佳境 · 小有阻滞但心是定的', score: 75 },
          { content: '薄云蔽日，静水流深 · 平平常常，稳字当头', score: 50 },
          { content: '雾锁远山，心绪微澜 · 有点飘，想躲一躲', score: 25 },
          { content: '星子隐没，诸事缓行 · 能量见底，只想待机', score: 10 }
        ]
      }
    ]
  }
}

export function isMockShareCode(shareCode: string): boolean {
  return !!MOCK_SURVEYS[shareCode]
}

/** 生成与真实 fill 接口同构的 FillSurveyPayload */
export function buildMockFillPayload(shareCode: string) {
  const def = MOCK_SURVEYS[shareCode]
  if (!def) return null
  const typeDef = ASSESSMENT_TYPE_REGISTRY[def.typeKey]
  const info = MOCK_DB.infos.find(i => i.shareCode === shareCode)
  const survey = {
    id: def.surveyId,
    title: info?.title || typeDef.fullName,
    description: info?.subtitle || typeDef.defaultSubtitle,
    type: 'normal',
    status: 'published',
    scoringEnabled: true,
    themeConfig: {
      submitText: '提交 · 星光指引即刻生成',
      showProgress: true
    },
    settings: { displayMode: 'single' },
    publishConfig: { shareCode, requireLogin: 'none' },
    questions: toMockQuestions(def)
  }
  return {
    survey,
    questions: toMockQuestions(def),
    logicRules: [],
    publishConfig: survey.publishConfig,
    needPassword: false,
    passwordPassed: true
  }
}

// ========== Mock DB（localStorage 持久化） ==========

export interface MockResponseRecord {
  responseId: string
  surveyId: number
  shareCode: string
  typeKey: string
  userId: number | null
  answers: Array<{ questionId: string | number; answerData: any }>
  totalScore?: number
  createdAt: string
}

export interface MockPointsRecord {
  scenario: PointsScenario
  referenceId: string
  userId?: number | null
  points: number
  createdAt: string
}

interface MockDBShape {
  seq: number
  infos: AssessmentInfo[]
  oa: AssessmentOaConfig
  channels: AssessmentChannel[]
  replyRules: AssessmentReplyRule[]
  events: AssessmentEventRecord[]
  responses: Record<string, MockResponseRecord>
  points: MockPointsRecord[]
  registeredPhones: Record<string, number>
}

const DB_KEY = 'asmt-mock-db-v1'

/** 种子：PRD 4.5.3 公众号运营蓝图示例 */
function seedDB(): MockDBShape {
  const infos: AssessmentInfo[] = [
    {
      id: 1,
      title: '周易心智原型测评',
      typeKey: 'archetype',
      surveyId: 9001,
      shareCode: 'asmt-01',
      subtitle: '八分钟，测出你的本命卦象原型',
      tags: 'HOT,心智,周易',
      questionNum: 8,
      durationDesc: '3 分钟',
      sort: 1,
      status: 1,
      publishedAt: '2026-10-28 10:00:00'
    },
    {
      id: 2,
      title: '情绪能量测评',
      typeKey: 'emotion',
      surveyId: 9002,
      shareCode: 'asmt-02',
      subtitle: '读懂此刻的四维能量潮汐',
      tags: 'NEW,情绪,能量',
      questionNum: 5,
      durationDesc: '2 分钟',
      sort: 2,
      status: 1,
      publishedAt: '2026-10-30 15:30:00'
    },
    {
      id: 3,
      title: '每日心智打卡',
      typeKey: 'quick_daily',
      surveyId: 9003,
      shareCode: 'asmt-03',
      subtitle: '一题一签，问星今日指引',
      tags: '限免,打卡,每日',
      questionNum: 1,
      durationDesc: '1 分钟',
      sort: 3,
      status: 1,
      publishedAt: '2026-11-01 09:00:00'
    }
  ]

  const oa: AssessmentOaConfig = {
    id: 1,
    officialName: OA_GUIDE_DEFAULTS.officialName,
    wechatId: 'gh_yidao_xinzhi',
    accountType: 0,
    qrCodeUrl: '',
    guideEnabled: true,
    guideTitle: OA_GUIDE_DEFAULTS.result.title,
    guideDesc: OA_GUIDE_DEFAULTS.result.desc,
    resultGuideTitle: '',
    resultGuideDesc: '',
    completeGuideTitle: OA_GUIDE_DEFAULTS.complete.title,
    completeGuideDesc: OA_GUIDE_DEFAULTS.complete.desc,
    posterShareText: OA_GUIDE_DEFAULTS.posterShareText,
    plazaPath: OA_GUIDE_DEFAULTS.plazaPath,
    updatedAt: '2026-11-05 14:20:00'
  }

  const channels: AssessmentChannel[] = [
    {
      id: 301,
      name: '《个人成长》专栏推文',
      source: 'article',
      refId: 'art_20261101_08',
      targetType: 'fill',
      surveyId: 9001,
      shareCode: 'asmt-01',
      infoId: 1,
      status: 1,
      remark: '文末「阅读原文」挂原型测评',
      createdAt: '2026-11-01 20:00:00'
    },
    {
      id: 302,
      name: '关键词「测评」自动回复',
      source: 'keyword',
      refId: '测评',
      targetType: 'plaza',
      infoId: undefined,
      status: 1,
      remark: '主推入口，全量卡片',
      createdAt: '2026-11-02 10:00:00'
    },
    {
      id: 303,
      name: '关键词「原型」自动回复',
      source: 'keyword',
      refId: '原型',
      targetType: 'fill',
      surveyId: 9001,
      shareCode: 'asmt-01',
      infoId: 1,
      status: 1,
      createdAt: '2026-11-02 10:05:00'
    },
    {
      id: 304,
      name: '关键词「打卡」自动回复',
      source: 'keyword',
      refId: '打卡',
      targetType: 'fill',
      surveyId: 9003,
      shareCode: 'asmt-03',
      infoId: 3,
      status: 1,
      createdAt: '2026-11-02 10:10:00'
    },
    {
      id: 305,
      name: '关注后欢迎语',
      source: 'welcome',
      refId: 'welcome',
      targetType: 'plaza',
      status: 1,
      createdAt: '2026-11-02 10:15:00'
    },
    {
      id: 306,
      name: '自定义菜单「心智测评」',
      source: 'menu',
      refId: 'menu_assessment',
      targetType: 'plaza',
      status: 1,
      createdAt: '2026-11-03 09:00:00'
    }
  ].filter(
    c =>
      (MOCK_SURVEYS[c.shareCode as string] && c.targetType === 'fill') ||
      c.targetType === 'plaza'
  )

  const replyRules: AssessmentReplyRule[] = [
    {
      id: 401,
      ruleType: 'keyword',
      keywords: '测评,测试',
      replyContent:
        '问星测评广场上新啦✨ 往下滑有你的本命卦象原型与今日指引，点击直达：{link}',
      source: 'keyword',
      refId: '测评',
      status: 1,
      syncStatus: 'synced',
      sort: 1,
      remark: '回复文本末自动拼接广场链接'
    },
    {
      id: 402,
      ruleType: 'keyword',
      keywords: '原型',
      replyContent:
        '八分钟测出你的「周易心智原型」，乾坤离坎四型四象，看看你是那一卦 → {link}',
      source: 'keyword',
      refId: '原型',
      status: 1,
      syncStatus: 'synced',
      sort: 2
    },
    {
      id: 403,
      ruleType: 'keyword',
      keywords: '打卡',
      replyContent: '今日一签已备好，点开即抽：{link}',
      source: 'keyword',
      refId: '打卡',
      status: 1,
      syncStatus: 'synced',
      sort: 3
    },
    {
      id: 404,
      ruleType: 'keyword',
      keywords: '情绪,能量',
      replyContent: '测一测当下的情绪潮汐，五行四维图即刻生成：{link}',
      source: 'keyword',
      refId: '情绪',
      status: 1,
      syncStatus: 'pending',
      sort: 4
    },
    {
      id: 405,
      ruleType: 'welcome',
      keywords: '',
      replyContent:
        '欢迎登上易道心智✨ 回复「测评」解锁全部测评入口，回复「打卡」抽今日星签。',
      source: 'welcome',
      refId: 'welcome',
      status: 1,
      syncStatus: 'synced',
      sort: 0
    }
  ]

  return {
    seq: 1000,
    infos,
    oa,
    channels,
    replyRules,
    events: [],
    responses: {},
    points: [],
    registeredPhones: {}
  }
}

let db: MockDBShape | null = null

function loadDB(): MockDBShape {
  if (db) return db
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      db = JSON.parse(raw) as MockDBShape
      return db!
    }
  } catch (_e) {
    /* fallthrough */
  }
  db = seedDB()
  saveDB()
  return db
}

export function saveDB() {
  if (!db) return
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch (_e) {
    /* 存储满时忽略 */
  }
}

export function resetMockDB() {
  db = seedDB()
  saveDB()
}

function nextId(): number {
  const d = loadDB()
  d.seq += 1
  saveDB()
  return d.seq
}

function delay<T>(value: T, ms = 180): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

// ========== C 端：广场 / 引导配置 ==========

export function mockPlazaList(
  params: PlazaListQuery = {}
): PageResult<AssessmentInfo> {
  const d = loadDB()
  let list = d.infos.filter(i => i.status === 1)
  if (params.typeKey && params.typeKey !== 'all') {
    const tab = params.typeKey
    if (tab === 'hot') {
      // 热门：按事件 E02 降序，示例种子顺序即热度
    } else if (tab === 'new') {
      list = [...list].sort((a, b) =>
        String(b.publishedAt || '').localeCompare(String(a.publishedAt || ''))
      )
    } else {
      list = list.filter(i => i.typeKey === tab)
    }
  }
  list = [...list].sort((a, b) => a.sort - b.sort)
  return { list, total: list.length }
}

export function mockGuideConfig(): GuideConfig {
  const oa = loadDB().oa
  const { officialName, accountType, qrCodeUrl, guideEnabled } = oa
  return {
    officialName: officialName || OA_GUIDE_DEFAULTS.officialName,
    accountType: accountType || 0,
    qrCodeUrl: qrCodeUrl || '',
    guideEnabled: !!guideEnabled,
    result: {
      title: oa.resultGuideTitle || oa.guideTitle || OA_GUIDE_DEFAULTS.result.title,
      desc: oa.resultGuideDesc || oa.guideDesc || OA_GUIDE_DEFAULTS.result.desc
    },
    complete: {
      title: oa.completeGuideTitle || oa.guideTitle || OA_GUIDE_DEFAULTS.complete.title,
      desc: oa.completeGuideDesc || oa.guideDesc || OA_GUIDE_DEFAULTS.complete.desc
    },
    posterShareText: oa.posterShareText || OA_GUIDE_DEFAULTS.posterShareText,
    plazaPath: oa.plazaPath || OA_GUIDE_DEFAULTS.plazaPath
  }
}

// ========== C 端：事件 ==========

export function mockReportEvent(payload: {
  eventType: AssessmentEventType
  sessionId?: string
  userId?: number | null
  source?: string | null
  refId?: string | null
  target?: string | null
  position?: string | null
  surveyId?: number | string | null
  surveyResponseId?: string | null
  isNewUser?: boolean | null
  userAgent?: string | null
}) {
  const d = loadDB()
  const record: AssessmentEventRecord = {
    id: nextId(),
    eventType: payload.eventType,
    sessionId: payload.sessionId || 'anon-' + hash(String(Date.now())).toString(36),
    userId: payload.userId ?? null,
    source: payload.source ?? null,
    refId: payload.refId ?? null,
    target: payload.target ?? null,
    position: payload.position ?? null,
    surveyId: payload.surveyId ?? null,
    surveyResponseId: payload.surveyResponseId ?? null,
    isNewUser: payload.isNewUser ?? null,
    userAgent: payload.userAgent ?? null,
    createdAt: now(),
    createdDay: dayKey()
  }
  d.events.push(record)
  saveDB()
  return { eventId: record.id }
}

// ========== C 端：提交 / 报告 ==========

export function mockSubmitResponse(
  shareCode: string,
  payload: {
    answers?: Array<{ questionId: string | number; answerData: any }>
    source?: string
  }
): { id: string; surveyId: number } {
  const def = MOCK_SURVEYS[shareCode]
  if (!def) throw new Error('mock survey not found: ' + shareCode)
  const d = loadDB()
  const responseId = 'mr' + Date.now().toString(36) + (d.seq % 97).toString(36)

  // 逐题记分
  const dimScores: Record<string, number> = {}
  let m0Score = 0
  const questions = toMockQuestions(def)
  const findByKey = (qid: string | number) =>
    questions.find(q => String(q.id) === String(qid))

  for (const ans of payload.answers || []) {
    const q = findByKey(ans.questionId)
    if (!q) continue
    const opts = q.config?.options || []
    for (const opt of opts) {
      if (String(opt.id) === String(ans.answerData)) {
        const cfg = opt.config || {}
        if (cfg.dim) dimScores[cfg.dim] = (dimScores[cfg.dim] || 0) + (cfg.pts || 0)
        if (typeof cfg.score === 'number') m0Score = cfg.score
      }
    }
  }

  d.responses[responseId] = {
    responseId,
    surveyId: def.surveyId,
    shareCode,
    typeKey: def.typeKey,
    userId: null,
    answers: payload.answers || [],
    totalScore: m0Score,
    createdAt: now()
  }
  // dimScores 附着在记录上（不进类型定义，报告生成时使用）
  ;(d.responses[responseId] as any).dimScores = dimScores
  saveDB()
  return { id: responseId, surveyId: def.surveyId }
}

function buildDimensions(typeKey: string, record: MockResponseRecord): ReportDimension[] {
  if (typeKey === 'archetype') {
    const dimScores = (record as any).dimScores || {}
    return M1_DIMENSIONS.map(def => {
      const score = dimScores[def.key] || 0
      const max = 9
      return {
        key: def.key,
        name: def.name,
        symbol: def.symbol,
        score,
        max,
        percent: Math.min(100, Math.round((score / max) * 100)),
        description: def.description
      }
    }).sort((a, b) => b.score - a.score)
  }
  if (typeKey === 'emotion') {
    const dimScores = (record as any).dimScores || {}
    return M2_DIMENSIONS.map(def => {
      const score = dimScores[def.key] || 0
      const max = 8
      return {
        key: def.key,
        name: def.name,
        score,
        max,
        percent: Math.min(100, Math.round((score / max) * 100))
      }
    }).sort((a, b) => b.score - a.score)
  }
  return []
}

export function mockGetReport(responseId: string): AssessmentReport | null {
  const record = loadDB().responses[responseId]
  if (!record) return null
  const typeKey = record.typeKey
  const typeDef = ASSESSMENT_TYPE_REGISTRY[typeKey]
  const d = loadDB()
  const info = d.infos.find(i => i.surveyId === record.surveyId)
  const base = {
    responseId,
    surveyId: record.surveyId,
    shareCode: record.shareCode,
    typeKey,
    judgeModel: typeDef.judgeModel,
    infoTitle: info?.title || typeDef.fullName,
    completedAt: record.createdAt,
    fillUrl: `${location.origin}/survey/fill/${record.shareCode}`
  }

  // 报告编号：YYMMDD-XXXXX
  const created = new Date(record.createdAt)
  const yy = String(created.getFullYear()).slice(2)
  const mm = String(created.getMonth() + 1).padStart(2, '0')
  const dd = String(created.getDate()).padStart(2, '0')
  const responseNo = `${yy}${mm}${dd}-${pad(hash(responseId) % 100000)}`

  if (typeKey === 'archetype') {
    const dims = buildDimensions(typeKey, record)
    const top = dims[0]
    const arch = M1_DIMENSIONS.find(m => m.key === top?.key) || M1_DIMENSIONS[0]
    return {
      ...base,
      resultTitle: arch.archetypeTitle,
      gradeLabel: arch.name,
      dimensions: dims,
      topDimension: top,
      summaryText: arch.archetypeSummary,
      brightSide: arch.bright,
      blindSide: arch.blind,
      adviceText: arch.advice,
      responseNo,
      isPassed: null
    }
  }

  if (typeKey === 'emotion') {
    const dims = buildDimensions(typeKey, record)
    const top = dims[0]
    const low = dims[dims.length - 1]
    const topDef = M2_DIMENSIONS.find(m => m.key === top?.key) || M2_DIMENSIONS[0]
    const lowDef = M2_DIMENSIONS.find(m => m.key === low?.key) || M2_DIMENSIONS[3]
    const profile = M2_PROFILE_TITLES[hash(responseId) % M2_PROFILE_TITLES.length]
    const total = dims.reduce((s, x) => s + x.score, 0)
    return {
      ...base,
      resultTitle: profile,
      totalScore: total,
      maxScore: 32,
      dimensions: dims,
      topDimension: top,
      lowDimension: low,
      summaryText: `${topDef.highText}\n${lowDef.lowText}`,
      responseNo,
      isPassed: null
    }
  }

  // M0 每日一签
  const score = Number(record.totalScore ?? 0)
  const grade =
    M0_GRADE_MAP.find(g => score >= g.min) || M0_GRADE_MAP[M0_GRADE_MAP.length - 1]
  return {
    ...base,
    resultTitle: grade.title,
    gradeLabel: grade.label,
    gradeColor: grade.color,
    totalScore: score,
    maxScore: 100,
    isPassed: null,
    summaryText: grade.summary,
    responseNo
  }
}

// ========== C 端：积分 / 注册补领 ==========

function findGrant(scenario: PointsScenario, referenceId: string) {
  return loadDB().points.find(
    p => p.scenario === scenario && p.referenceId === referenceId
  )
}

function recordGrant(scenario: PointsScenario, referenceId: string, points: number, userId?: number | null) {
  const d = loadDB()
  d.points.push({ scenario, referenceId, userId: userId ?? null, points, createdAt: now() })
  saveDB()
}

/** E04/E05 前置校验 is_granted（看板对账口径同 4.8.2） */
export function mockClaimCheck(scenario: PointsScenario, referenceId: string) {
  const existing = findGrant(scenario, referenceId)
  if (existing) {
    return { claimed: true, grantedPoints: existing.points, pointsDetail: [existing.points] }
  }
  const pts = ASSESSMENT_POINTS[scenario]
  recordGrant(scenario, referenceId, pts)
  return { claimed: false, grantedPoints: pts, pointsDetail: [pts] }
}

/** 场景 A/C：统一发放接口 POST /assessmentApi/points/grant */
export function mockGrantPoints(payload: {
  scenario: PointsScenario
  responseId?: string
  eventId?: number
  userId?: number | null
}) {
  const refId =
    payload.scenario === 'ASSESSMENT_POSTER'
      ? String(payload.eventId ?? 'no-event')
      : String(payload.responseId ?? 'unknown')
  const existing = findGrant(payload.scenario, refId)
  if (existing) {
    return { granted: false, points: 0, reason: '已领取过', pointsDetail: [] }
  }
  const pts = ASSESSMENT_POINTS[payload.scenario]
  recordGrant(payload.scenario, refId, pts, payload.userId ?? null)
  return { granted: true, points: pts, pointsDetail: [pts] }
}

/** 游客快捷注册（模拟 /loginApi/quickRegister 的业务行为） */
export function mockQuickRegister(params: {
  phone: string
  nickname?: string
  pointsScenario?: PointsScenario
  responseId?: string
  responseIds?: string[]
}): QuickRegisterResult {
  const d = loadDB()
  const existed = d.registeredPhones[params.phone]
  const isNewUser = !existed
  let userId = existed
  if (isNewUser) {
    userId = nextId()
    d.registeredPhones[params.phone] = userId
  }
  const pointsDetail: number[] = []
  let points = 0
  if (isNewUser) {
    const refId = String(userId)
    if (!findGrant('REGISTER_WELCOME', refId)) {
      recordGrant('REGISTER_WELCOME', refId, ASSESSMENT_POINTS.REGISTER_WELCOME, userId)
      pointsDetail.push(ASSESSMENT_POINTS.REGISTER_WELCOME)
      points += ASSESSMENT_POINTS.REGISTER_WELCOME
    }
  }
  // 场景 B：游客答卷池逐份迁移 + 补发 ASSESSMENT_COMPLETE（仅新用户迁移）
  const pendingIds = params.responseIds?.length
    ? params.responseIds
    : params.responseId
      ? [params.responseId]
      : []
  pendingIds.forEach(rid => {
    const record = d.responses[rid]
    if (!record) return
    if (isNewUser && record.userId == null) record.userId = userId
    if (!findGrant('ASSESSMENT_COMPLETE', rid)) {
      recordGrant('ASSESSMENT_COMPLETE', rid, ASSESSMENT_POINTS.ASSESSMENT_COMPLETE, userId)
      pointsDetail.push(ASSESSMENT_POINTS.ASSESSMENT_COMPLETE)
      points += ASSESSMENT_POINTS.ASSESSMENT_COMPLETE
    }
  })
  saveDB()
  return {
    token: 'mock-token-' + userId,
    isNewUser,
    grantedPoints: points,
    pointsDetail,
    user: {
      id: userId,
      name: params.nickname || '星友' + params.phone.slice(-4),
      phone: params.phone
    }
  }
}

// ========== 管理端 CRUD ==========

export function mockListInfos(query: { status?: number; keyword?: string } = {}) {
  const d = loadDB()
  let list = [...d.infos].sort((a, b) => a.sort - b.sort)
  if (query.status != null) list = list.filter(i => i.status === query.status)
  if (query.keyword)
    list = list.filter(
      i => i.title.includes(query.keyword!) || i.shareCode.includes(query.keyword!)
    )
  return { list, total: list.length }
}

export function mockCreateInfo(data: Partial<AssessmentInfo>): AssessmentInfo {
  const d = loadDB()
  const typeDef = ASSESSMENT_TYPE_REGISTRY[data.typeKey || 'archetype']
  const item: AssessmentInfo = {
    id: nextId(),
    title: String(data.title || ''),
    typeKey: String(data.typeKey || typeDef.typeKey),
    surveyId: data.surveyId || 0,
    shareCode: String(data.shareCode || ''),
    subtitle: data.subtitle || '',
    tags: data.tags || '',
    questionNum: Number(data.questionNum || typeDef.questionNum),
    durationDesc: data.durationDesc || typeDef.durationDesc,
    sort: Number(data.sort || 99),
    status: 0,
    publishedAt: ''
  }
  d.infos.push(item)
  saveDB()
  return item
}

export function mockUpdateInfo(id: number, data: Partial<AssessmentInfo>) {
  const d = loadDB()
  const idx = d.infos.findIndex(i => i.id === id)
  if (idx === -1) throw new Error('记录不存在')
  d.infos[idx] = { ...d.infos[idx], ...data, id }
  // 编辑已上架记录 → 强制下架（4.1.4 状态机）
  if (d.infos[idx].status === 1 && !('status' in data)) d.infos[idx].status = 2
  saveDB()
  return d.infos[idx]
}

export function mockPublishInfo(id: number) {
  const item = mockUpdateInfo(id, {
    status: 1,
    publishedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
  })
  return item
}

/** 删除上架登记（mock：仅移除 infos，不影响问卷） */
export function mockDeleteInfo(id: number) {
  const d = loadDB()
  d.infos = d.infos.filter(i => i.id !== id)
  saveDB()
  return { id }
}

export function mockListChannels(query: { keyword?: string; source?: string } = {}) {
  const d = loadDB()
  let list = [...d.channels]
  if (query.source) list = list.filter(c => c.source === query.source)
  if (query.keyword)
    list = list.filter(
      c => c.name.includes(query.keyword!) || String(c.refId || '').includes(query.keyword!)
    )
  return { list, total: list.length }
}

export function mockCreateChannel(data: Partial<AssessmentChannel>) {
  const d = loadDB()
  const item: AssessmentChannel = {
    id: nextId(),
    name: String(data.name || ''),
    source: (data.source || 'article') as ChannelSource,
    refId: data.refId || '',
    targetType: (data.targetType || 'fill') as TargetType,
    surveyId: data.surveyId,
    shareCode: data.shareCode,
    infoId: data.infoId,
    status: 1,
    startAt: data.startAt,
    endAt: data.endAt,
    remark: data.remark || '',
    createdAt: now().slice(0, 19).replace('T', ' ')
  }
  d.channels.push(item)
  saveDB()
  return item
}

export function mockUpdateChannel(id: number, data: Partial<AssessmentChannel>) {
  const d = loadDB()
  const idx = d.channels.findIndex(c => c.id === id)
  if (idx === -1) throw new Error('记录不存在')
  d.channels[idx] = { ...d.channels[idx], ...data, id }
  saveDB()
  return d.channels[idx]
}

export function mockDeleteChannel(id: number) {
  const d = loadDB()
  d.channels = d.channels.filter(c => c.id !== id)
  saveDB()
}

export function mockListReplyRules(query: { keyword?: string } = {}) {
  const d = loadDB()
  let list = [...d.replyRules].sort((a, b) => (a.sort || 0) - (b.sort || 0))
  if (query.keyword)
    list = list.filter(
      r =>
        String(r.keywords || '').includes(query.keyword!) ||
        r.replyContent.includes(query.keyword!)
    )
  return { list, total: list.length }
}

export function mockCreateReplyRule(
  data: Partial<AssessmentReplyRule>
): AssessmentReplyRule {
  const d = loadDB()
  const item: AssessmentReplyRule = {
    id: nextId(),
    ruleType: (data.ruleType || 'keyword') as ReplyRuleType,
    keywords: data.keywords || '',
    replyContent: String(data.replyContent || ''),
    source: data.source,
    refId: data.refId,
    status: 1,
    syncStatus: 'pending',
    sort: Number(data.sort || 10),
    remark: data.remark || '',
    createdAt: now().slice(0, 19).replace('T', ' '),
    updatedAt: now().slice(0, 19).replace('T', ' ')
  }
  d.replyRules.push(item)
  saveDB()
  return item
}

export function mockUpdateReplyRule(id: number, data: Partial<AssessmentReplyRule>) {
  const d = loadDB()
  const idx = d.replyRules.findIndex(r => r.id === id)
  if (idx === -1) throw new Error('记录不存在')
  const prev = d.replyRules[idx]
  const contentChanged = data.replyContent != null && data.replyContent !== prev.replyContent
  d.replyRules[idx] = {
    ...prev,
    ...data,
    id,
    updatedAt: now().slice(0, 19).replace('T', ' ')
  }
  // 内容变更回退待同步（人工标记制）
  if (contentChanged && !('syncStatus' in data)) d.replyRules[idx].syncStatus = 'pending'
  saveDB()
  return d.replyRules[idx]
}

export function mockDeleteReplyRule(id: number) {
  const d = loadDB()
  d.replyRules = d.replyRules.filter(r => r.id !== id)
  saveDB()
}

export function mockGetOaConfig(): AssessmentOaConfig {
  return { ...loadDB().oa }
}

export function mockUpdateOaConfig(data: Partial<AssessmentOaConfig>) {
  const d = loadDB()
  d.oa = {
    ...d.oa,
    ...data,
    id: d.oa.id,
    updatedAt: now().slice(0, 19).replace('T', ' ')
  }
  saveDB()
  return { ...d.oa }
}

// ========== 管理端：数据看板 ==========

export function mockStatsOverview(days = 30): StatsOverview {
  const d = loadDB()
  const since = dayKey(
    new Date(Date.now() - (days - 1) * 86400000).toISOString()
  )
  const events = d.events.filter(e => {
    const day = e.createdDay || dayKey(e.createdAt || now())
    return day >= since
  })

  const count = (t: AssessmentEventType) =>
    events.filter(e => e.eventType === t).length

  // L1 去重：session+source+refId 三元组
  const seen = new Set<string>()
  let l1 = 0
  for (const e of events) {
    if (e.eventType !== 'channel_visit') continue
    const key = `${e.sessionId}|${e.source}|${e.refId}`
    if (seen.has(key)) continue
    seen.add(key)
    l1 += 1
  }
  const e02 = count('plaza_click')
  const e03 = count('response_complete')
  const e04 = count('register_show')
  const e05new = events.filter(
    e => e.eventType === 'register_success' && e.isNewUser
  ).length
  const completeGrants = d.points.filter(p => p.scenario === 'ASSESSMENT_COMPLETE').length
  const shareTotal = count('share_click') + count('poster_create')

  const rate = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) / 100 : 0)

  const funnel: FunnelStep[] = [
    { key: 'channel_visit', label: '渠道进入', value: l1 },
    { key: 'plaza_click', label: '广场点击', value: e02, rate: rate(e02, l1) },
    { key: 'response_complete', label: '测评完成', value: e03, rate: rate(e03, e02) },
    { key: 'register_show', label: '注册曝光', value: e04, rate: rate(e04, e03) },
    { key: 'register_success', label: '注册成功', value: e05new, rate: rate(e05new, e04) },
    { key: 'points_grant', label: '积分发放', value: completeGrants, rate: rate(completeGrants, e05new) },
    { key: 'share', label: '分享行为', value: shareTotal, rate: rate(shareTotal, completeGrants) }
  ]

  // 渠道透视
  const sourceList: ChannelSource[] = ['article', 'keyword', 'welcome', 'menu', 'share']
  const pivot: ChannelPivotItem[] = []
  for (const s of sourceList) {
    const srcEvents = events.filter(e => e.source === s)
    const visits2 = srcEvents.filter(e => e.eventType === 'channel_visit').length
    const srcCompletes = srcEvents.filter(
      e => e.eventType === 'response_complete'
    ).length
    const srcRegisters = srcEvents.filter(
      e => e.eventType === 'register_success'
    ).length
    const srcPosters = srcEvents.filter(e => e.eventType === 'poster_create').length
    pivot.push({
      source: s,
      visits: visits2,
      completes: srcCompletes,
      registers: srcRegisters,
      posters: srcPosters,
      completeRate: rate(srcCompletes, visits2)
    })
  }

  // 趋势（近 days 天）
  const trend: StatsTrendPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const day = dayKey(new Date(Date.now() - i * 86400000).toISOString())
    const dayEvents = events.filter(e => (e.createdDay || dayKey(e.createdAt || now())) === day)
    trend.push({
      date: day,
      e01: dayEvents.filter(e => e.eventType === 'channel_visit').length,
      e03: dayEvents.filter(e => e.eventType === 'response_complete').length,
      e05: dayEvents.filter(e => e.eventType === 'register_success').length
    })
  }

  // 单测评 Top
  const compBySurvey = new Map<string, number>()
  for (const e of events) {
    if (e.eventType === 'response_complete' && e.surveyId != null) {
      const k = String(e.surveyId)
      compBySurvey.set(k, (compBySurvey.get(k) || 0) + 1)
    }
  }
  const clicksBySurvey = new Map<string, number>()
  for (const e of events) {
    if (e.eventType === 'plaza_click') {
      const k = String(e.refId || '')
      clicksBySurvey.set(k, (clicksBySurvey.get(k) || 0) + 1)
    }
  }
  const topSurveys: TopSurveyItem[] = d.infos
    .map(info => {
      const completes = compBySurvey.get(String(info.surveyId)) || 0
      const visits = Number(clicksBySurvey.get(String(info.id)) || 0) + completes
      return {
        infoId: info.id,
        title: info.title,
        typeKey: info.typeKey,
        visits,
        completes,
        completeRate: rate(completes, visits)
      }
    })
    .sort((a, b) => b.completes - a.completes)
    .slice(0, 10)

  const welcomeGrants = d.points.filter(p => p.scenario === 'REGISTER_WELCOME')
  const posterGrants = d.points.filter(p => p.scenario === 'ASSESSMENT_POSTER')
  const totalPoints = d.points.reduce((s, p) => s + p.points, 0)
  const guestCompletes = events.filter(
    e => e.eventType === 'response_complete' && !e.userId
  ).length
  // 游客答卷沉淀：注册补领后视为迁移成功笔数
  const claimMigrated = loadDB().points.filter(
    p => p.scenario === 'ASSESSMENT_COMPLETE' && p.referenceId in loadDB().responses
  ).length

  return {
    days,
    funnel,
    channelPivot: pivot,
    trend,
    register: {
      showCount: e04,
      successCount: count('register_success'),
      newCount: e05new,
      rate: rate(e05new, e04)
    },
    points: {
      completeCount: completeGrants,
      posterCount: posterGrants.length,
      welcomeCount: welcomeGrants.length,
      totalPoints,
      grantRate: rate(completeGrants, e03),
      claimable: guestCompletes,
      claimCount: claimMigrated
    },
    topSurveys
  }
}

export const __mockInternals = { loadDB, saveDB, delay }
