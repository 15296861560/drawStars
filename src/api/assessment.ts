/**
 * 心智测评（问星）API 层
 *
 * Mock 开关：VITE_ASSESSMENT_MOCK（.env，'false' 走真实后端，其余走 mock）。
 * 真实后端接口前缀 /assessmentApi/*（Nginx/Vite 经 /api 代理转发至 NestJS）。
 * 后端未就绪时 C 端允许降级：guide/event fire-and-forget 静默失败（3.6.10）。
 */
import {
  $axios,
  $axiosGet,
  requests
} from '@/assets/js/axios-api/axios-config.js'
import type {
  AssessmentChannel,
  AssessmentEventPayload,
  AssessmentInfo,
  AssessmentOaConfig,
  AssessmentReport,
  ChannelBuildOption,
  GuideConfig,
  PageResult,
  PlazaListQuery,
  PointsScenario,
  AssessmentReplyRule,
  ClaimCheckResult,
  QuickRegisterParams,
  QuickRegisterResult,
  StatsOverview
} from '@/types/assessment'
import * as mock from '@/services/assessment-mock'
import {
  OA_GUIDE_DEFAULTS
} from '@/config/assessment-registry'

/** Mock 开关：'false' 时走真实接口 */
export const ASSESSMENT_USE_MOCK = import.meta.env.VITE_ASSESSMENT_MOCK !== 'false'

function unwrap<T = any>(res: any): T {
  if (res && typeof res === 'object' && 'data' in res) return res.data as T
  return res as T
}

function delay<T>(value: T, ms = 160): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

// ============================================================
// C 端公开接口
// ============================================================

/** 问星广场列表（含 shareCode，只返回已上架卡片） */
export async function plazaList(
  params: PlazaListQuery = {}
): Promise<PageResult<AssessmentInfo>> {
  if (ASSESSMENT_USE_MOCK) {
    return delay(mock.mockPlazaList(params))
  }
  const res = await $axiosGet(params as any, '/assessmentApi/plaza/list')
  return unwrap(res) || { list: [], total: 0 }
}

const GUIDE_CACHE_KEY = 'asmt_guide_config_cache_v1'
const GUIDE_CACHE_TTL = 5 * 60 * 1000 // 5 分钟（PRD 8.3）

/**
 * 引导位配置（5 分钟本地缓存；网络失败时回退缓存或内置兜底文案）
 * - 读取侧：try/catch 吞异常
 */
export async function getGuideConfig(): Promise<GuideConfig> {
  // 命中缓存直接返回
  try {
    const cached = localStorage.getItem(GUIDE_CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Date.now() - parsed.__at < GUIDE_CACHE_TTL) {
        delete parsed.__at
        return parsed as GuideConfig
      }
    }
  } catch (_e) {
    /* ignore */
  }
  let config: GuideConfig
  try {
    if (ASSESSMENT_USE_MOCK) {
      config = mock.mockGuideConfig()
    } else {
      const res = await $axiosGet({}, '/assessmentApi/guide/config', {
        hideErrorTip: true
      } as any)
      const remote = unwrap<Partial<GuideConfig>>(res) || {}
      // 服务端字段缺省时前端兜底（3.6.10）
      config = {
        officialName: remote.officialName || OA_GUIDE_DEFAULTS.officialName,
        accountType: remote.accountType ?? OA_GUIDE_DEFAULTS.accountType,
        qrCodeUrl: remote.qrCodeUrl || '',
        guideEnabled: !!remote.guideEnabled,
        result: remote.result?.title
          ? { title: remote.result.title, desc: remote.result.desc || '' }
          : { ...OA_GUIDE_DEFAULTS.result },
        complete: remote.complete?.title
          ? { title: remote.complete.title, desc: remote.complete.desc || '' }
          : { ...OA_GUIDE_DEFAULTS.complete },
        posterShareText: remote.posterShareText || OA_GUIDE_DEFAULTS.posterShareText,
        plazaPath: remote.plazaPath || OA_GUIDE_DEFAULTS.plazaPath
      }
    }
  } catch (_e) {
    // 静默降级：内置兜底文案（P4 指引优先级）
    config = {
      ...OA_GUIDE_DEFAULTS,
      qrCodeUrl: '',
      guideEnabled: true,
      result: { ...OA_GUIDE_DEFAULTS.result },
      complete: { ...OA_GUIDE_DEFAULTS.complete }
    }
  }
  try {
    localStorage.setItem(
      GUIDE_CACHE_KEY,
      JSON.stringify({ ...config, __at: Date.now() })
    )
  } catch (_e) {
    /* ignore */
  }
  return config
}

/** 统一埋点事件上报（fire-and-forget，静默失败） */
export async function reportEvent(
  payload: AssessmentEventPayload
): Promise<void> {
  try {
    if (ASSESSMENT_USE_MOCK) {
      mock.mockReportEvent(payload)
      return
    }
    await $axios(payload, '/assessmentApi/event/report')
  } catch (_e) {
    /* 静默失败，不影响业务流（PRD 8.3） */
  }
}

/** 报告聚合：getCurrentUserReport（M0/M1/M2 统一） */
export async function getAssessmentReport(
  responseId: string
): Promise<AssessmentReport | null> {
  if (ASSESSMENT_USE_MOCK) {
    return delay(mock.mockGetReport(responseId), 120)
  }
  const res = await $axiosGet({}, `/assessmentApi/report/${responseId}`)
  return unwrap<AssessmentReport>(res) || null
}

/** 积分补领前置校验/领取（场景 B：E04/E05 注册链路） */
export async function claimResponses(
  scenario: PointsScenario,
  responseId?: string
): Promise<ClaimCheckResult> {
  if (ASSESSMENT_USE_MOCK) {
    return delay(
      mock.mockClaimCheck(scenario, responseId || 'unknown')
    )
  }
  const res = await $axios(
    { scenario, responseId },
    '/assessmentApi/points/claim'
  )
  return unwrap<ClaimCheckResult>(res) || { claimed: false, grantedPoints: 0, pointsDetail: [] }
}

/** 统一发放接口（场景 A：答卷完成后；场景 C：海报生成后） */
export async function grantPoints(payload: {
  scenario: PointsScenario
  responseId?: string
  eventId?: number
}): Promise<{ granted: boolean; points: number; reason?: string; pointsDetail: number[] }> {
  if (ASSESSMENT_USE_MOCK) {
    return delay(mock.mockGrantPoints(payload))
  }
  const res = await $axios(payload, '/assessmentApi/points/grant')
  return unwrap(res)
}

/**
 * 游客快捷注册（5.6.2 前置条件二：界面注册触点）
 * mock 模式下模拟注册 + 场景 B 积分补领；真实模式走 /loginApi/quickRegister
 */
export async function quickRegisterAssessment(
  params: QuickRegisterParams
): Promise<QuickRegisterResult> {
  if (ASSESSMENT_USE_MOCK) {
    return delay(
      mock.mockQuickRegister({
        phone: params.phone,
        nickname: params.nickname,
        responseId: params.responseId,
        responseIds: params.responseIds
      }),
      260
    )
  }
  const res = await $axios(params, '/loginApi/quickRegister')
  return unwrap<QuickRegisterResult>(res)
}

// ============================================================
// C 端填写链路的 Mock 兜底（仅 Mock 模式生效，正常模式返回 null）
// ============================================================

/**
 * 后端缺席时的演示兜底：三份内置示例测评问卷（shareCode asmt-01/02/03）。
 * 真实后端在线时该函数永远返回 null，走原生 getFill。
 */
export async function fillFallback(
  shareCode: string
): Promise<any | null> {
  if (!ASSESSMENT_USE_MOCK) return null
  if (!mock.isMockShareCode(shareCode)) return null
  return delay(mock.buildMockFillPayload(shareCode), 220)
}

export function isAssessmentMockShare(shareCode: string): boolean {
  return ASSESSMENT_USE_MOCK && mock.isMockShareCode(shareCode)
}

/** Mock 提交（与 submitResponse 同构返回） */
export async function submitResponseFallback(
  shareCode: string,
  payload: { answers?: Array<{ questionId: string | number; answerData: any }>; source?: string }
): Promise<{ status: boolean; msg?: string; data?: { id: string } } | null> {
  if (!ASSESSMENT_USE_MOCK || !mock.isMockShareCode(shareCode)) return null
  try {
    const res = mock.mockSubmitResponse(shareCode, payload)
    return delay({ status: true, data: res }, 420)
  } catch (e: any) {
    return { status: false, msg: e?.message || '提交失败' }
  }
}

// ============================================================
// 管理端：OA 配置
// ============================================================

export async function getOaConfig(): Promise<AssessmentOaConfig> {
  if (ASSESSMENT_USE_MOCK) return delay(mock.mockGetOaConfig())
  const res = await $axiosGet({}, '/assessmentApi/oa/config')
  return unwrap<AssessmentOaConfig>(res)
}

export async function updateOaConfig(
  data: Partial<AssessmentOaConfig>
): Promise<AssessmentOaConfig> {
  if (ASSESSMENT_USE_MOCK) return delay(mock.mockUpdateOaConfig(data))
  const res = await requests({
    url: '/api/assessmentApi/oa/config',
    data,
    method: 'put'
  })
  return unwrap<AssessmentOaConfig>(res.data)
}

// ============================================================
// 管理端：上架管理
// ============================================================

export async function listInfos(
  query: { status?: number; keyword?: string; page?: number; pageSize?: number } = {}
): Promise<PageResult<AssessmentInfo>> {
  if (ASSESSMENT_USE_MOCK) return delay(mock.mockListInfos(query))
  const res = await $axiosGet(query, '/assessmentApi/info/list')
  return unwrap(res) || { list: [], total: 0 }
}

export async function createInfo(
  data: Partial<AssessmentInfo>
): Promise<AssessmentInfo> {
  if (ASSESSMENT_USE_MOCK) return delay(mock.mockCreateInfo(data))
  const res = await $axios(data, '/assessmentApi/info')
  return unwrap<AssessmentInfo>(res)
}

export async function updateInfo(
  id: number,
  data: Partial<AssessmentInfo>
): Promise<AssessmentInfo> {
  if (ASSESSMENT_USE_MOCK) return delay(mock.mockUpdateInfo(id, data))
  const res = await requests({
    url: `/api/assessmentApi/info/${id}`,
    data,
    method: 'put'
  })
  return unwrap<AssessmentInfo>(res.data)
}

export async function publishInfo(
  id: number,
  publish: boolean
): Promise<AssessmentInfo> {
  if (ASSESSMENT_USE_MOCK)
    return delay(mock.mockPublishInfo(id))
  const res = await $axios(
    {},
    `/assessmentApi/info/${id}/${publish ? 'publish' : 'unpublish'}`
  )
  return unwrap<AssessmentInfo>(res)
}

/** 删除测评上架记录（仅删除登记，不影响问卷本体） */
export async function deleteInfo(id: number): Promise<{ id: number }> {
  if (ASSESSMENT_USE_MOCK) return delay(mock.mockDeleteInfo(id))
  const res = await requests({
    url: `/api/assessmentApi/info/${id}`,
    method: 'delete'
  })
  return unwrap<{ id: number }>(res.data) || { id }
}

// ============================================================
// 管理端：渠道入口
// ============================================================

export async function listChannels(
  query: { keyword?: string; source?: string } = {}
): Promise<PageResult<AssessmentChannel>> {
  if (ASSESSMENT_USE_MOCK) return delay(mock.mockListChannels(query))
  const res = await $axiosGet(query, '/assessmentApi/channel/list')
  return unwrap(res) || { list: [], total: 0 }
}

export async function createChannel(
  data: Partial<AssessmentChannel>
): Promise<AssessmentChannel> {
  if (ASSESSMENT_USE_MOCK) return delay(mock.mockCreateChannel(data))
  const res = await $axios(data, '/assessmentApi/channel')
  return unwrap<AssessmentChannel>(res)
}

export async function updateChannel(
  id: number,
  data: Partial<AssessmentChannel>
): Promise<AssessmentChannel> {
  if (ASSESSMENT_USE_MOCK) return delay(mock.mockUpdateChannel(id, data))
  const res = await requests({
    url: `/api/assessmentApi/channel/${id}`,
    data,
    method: 'put'
  })
  return unwrap<AssessmentChannel>(res.data)
}

export async function deleteChannel(id: number): Promise<void> {
  if (ASSESSMENT_USE_MOCK) return delay<void>(mock.mockDeleteChannel(id))
  await requests({ url: `/api/assessmentApi/channel/${id}`, method: 'delete' })
}

/**
 * 渠道链接构建（4.4.2 规则）
 * fill  → {origin}/survey/fill/{shareCode}?source={source}&refId={refId}
 * plaza → {origin}{plazaPath}?source={source}&refId={refId}
 * 注意：问候语类渠道（无分享页权限）不发 fill 直链。
 */
export function buildChannelLink(
  option: ChannelBuildOption,
  plazaPath = '/assessment/list'
): string {
  const origin = location.origin
  const { source, refId } = option
  if (option.targetType === 'plaza' || !option.shareCode) {
    return `${origin}${plazaPath}?source=${encodeURIComponent(source)}&refId=${encodeURIComponent(refId)}`
  }
  return `${origin}/survey/fill/${option.shareCode}?source=${encodeURIComponent(source)}&refId=${encodeURIComponent(refId)}`
}

// ============================================================
// 管理端：回复规则
// ============================================================

export async function listReplyRules(
  query: { keyword?: string } = {}
): Promise<PageResult<AssessmentReplyRule>> {
  if (ASSESSMENT_USE_MOCK) return delay(mock.mockListReplyRules(query))
  const res = await $axiosGet(query, '/assessmentApi/reply/list')
  return unwrap(res) || { list: [], total: 0 }
}

export async function createReplyRule(
  data: Partial<AssessmentReplyRule>
): Promise<AssessmentReplyRule> {
  if (ASSESSMENT_USE_MOCK) return delay(mock.mockCreateReplyRule(data))
  const res = await $axios(data, '/assessmentApi/reply')
  return unwrap<AssessmentReplyRule>(res)
}

export async function updateReplyRule(
  id: number,
  data: Partial<AssessmentReplyRule>
): Promise<AssessmentReplyRule> {
  if (ASSESSMENT_USE_MOCK) return delay(mock.mockUpdateReplyRule(id, data))
  const res = await requests({
    url: `/api/assessmentApi/reply/${id}`,
    data,
    method: 'put'
  })
  return unwrap<AssessmentReplyRule>(res.data)
}

export async function deleteReplyRule(id: number): Promise<void> {
  if (ASSESSMENT_USE_MOCK) return delay<void>(mock.mockDeleteReplyRule(id))
  await requests({ url: `/api/assessmentApi/reply/${id}`, method: 'delete' })
}

// ============================================================
// 管理端：数据看板
// ============================================================

export async function getStatsOverview(days = 30): Promise<StatsOverview> {
  if (ASSESSMENT_USE_MOCK) return delay(mock.mockStatsOverview(days), 240)
  const res = await $axiosGet({ days }, '/assessmentApi/stats/overview')
  return unwrap<StatsOverview>(res)
}
