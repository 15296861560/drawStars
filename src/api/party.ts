/**
 * @Description: 拾星趣局（party）管理域接口封装
 * 后端契约：drawStars-serve-node/src/nest/modules/party/party.admin.controller.ts
 * 鉴权：所有 party/admin 端点要求请求头携带 x-admin-key 单 key（RBAC 码仅管控前端菜单显隐）
 */
import { $axiosGet, requests } from '@/assets/js/axios-api/axios-config.js'
import type {
  PartyBatchCreateResult,
  PartyDeleteResult,
  PartyGameConfig,
  PartyGameConfigUpdateParams,
  PartyGameType,
  PartyPageData,
  PartyQuestion,
  PartyQuestionCreateParams,
  PartyQuestionQuery,
  PartyQuestionUpdateParams,
  PartyReport,
  PartyReportHandleParams,
  PartyReportQuery,
  PartyResponse,
  PartySessionDetail,
  PartySessionQuery,
  PartySessionRow,
  PartyStatsQuery,
  PartyStatsResult,
  PartyTheme,
  PartyThemeCreateParams,
  PartyThemeListResult,
  PartyThemeQuery,
  PartyThemeUpdateParams,
  PartyWord,
  PartyWordCreateParams,
  PartyWordQuery,
  PartyWordUpdateParams
} from '@/types/party'

/** GET 走 $axiosGet（apiInfo 主站前缀自动拼接 /api） */
const ADMIN_METHOD_URL = '/party/admin'
/** requests 直连需带全量 /api 前缀 */
const ADMIN_URL = '/api/party/admin'

/** party 管理域单 key：默认对齐后端开发态 publish-config.admin_key，可用 VITE_PARTY_ADMIN_KEY 覆盖 */
const PARTY_ADMIN_KEY = String(import.meta.env.VITE_PARTY_ADMIN_KEY || 'party-admin-dev')

/** 请求头附加 x-admin-key */
function adminHeaders() {
  return { 'x-admin-key': PARTY_ADMIN_KEY }
}

/**
 * 拆 party 后端 { code, msg, data } 响应包裹
 * 后端业务失败返回 HTTP 200 + code !== 0，此处统一抛 Error(msg)
 */
function unwrap<T>(body: unknown): T {
  const res = body as PartyResponse<T> | null
  if (!res || typeof res !== 'object' || typeof res.code !== 'number') {
    throw new Error('响应格式异常')
  }
  if (res.code !== 0) {
    throw new Error(res.msg || '请求失败')
  }
  return res.data
}

// ==================== 题目池（真心话 truth / 大冒险 dare） ====================

/** 题目分页列表（kind 必传，truth / dare） */
export function getQuestions(query: PartyQuestionQuery) {
  return $axiosGet(query, `${ADMIN_METHOD_URL}/questions`, {
    extOption: { headers: adminHeaders() }
  }).then(res => unwrap<PartyPageData<PartyQuestion>>(res))
}

/** 新建题目（body 亦支持 { items: [...] } 批量，本页面按单条录入） */
export function createQuestions(data: PartyQuestionCreateParams) {
  return requests({
    url: `${ADMIN_URL}/questions`,
    method: 'post',
    data,
    headers: adminHeaders()
  }).then(res => unwrap<PartyBatchCreateResult>(res.data))
}

/** 更新题目（themes 支持数组或逗号分隔字符串） */
export function updateQuestion(id: string, data: PartyQuestionUpdateParams) {
  return requests({
    url: `${ADMIN_URL}/questions/${id}`,
    method: 'put',
    data,
    headers: adminHeaders()
  }).then(res => unwrap<PartyQuestion>(res.data))
}

/** 删除题目 */
export function deleteQuestion(id: string) {
  return requests({
    url: `${ADMIN_URL}/questions/${id}`,
    method: 'delete',
    headers: adminHeaders()
  }).then(res => unwrap<PartyDeleteResult>(res.data))
}

// ==================== 你画我猜词库 ====================

/** 词库分页列表 */
export function getWordbank(query: PartyWordQuery) {
  return $axiosGet(query, `${ADMIN_METHOD_URL}/wordbank`, {
    extOption: { headers: adminHeaders() }
  }).then(res => unwrap<PartyPageData<PartyWord>>(res))
}

/** 新建词条 */
export function createWordbank(data: PartyWordCreateParams) {
  return requests({
    url: `${ADMIN_URL}/wordbank`,
    method: 'post',
    data,
    headers: adminHeaders()
  }).then(res => unwrap<PartyBatchCreateResult>(res.data))
}

/** 更新词条 */
export function updateWordbank(id: string, data: PartyWordUpdateParams) {
  return requests({
    url: `${ADMIN_URL}/wordbank/${id}`,
    method: 'put',
    data,
    headers: adminHeaders()
  }).then(res => unwrap<PartyWord>(res.data))
}

/** 删除词条 */
export function deleteWordbank(id: string) {
  return requests({
    url: `${ADMIN_URL}/wordbank/${id}`,
    method: 'delete',
    headers: adminHeaders()
  }).then(res => unwrap<PartyDeleteResult>(res.data))
}

// ==================== 主题标签 ====================

/** 主题标签列表（后端不分页，返回全量 { items, total }） */
export function getThemes(query: PartyThemeQuery) {
  return $axiosGet(query, `${ADMIN_METHOD_URL}/themes`, {
    extOption: { headers: adminHeaders() }
  }).then(res => unwrap<PartyThemeListResult>(res))
}

/** 新建主题标签（tagKey 唯一，与 name 均必填） */
export function createTheme(data: PartyThemeCreateParams) {
  return requests({
    url: `${ADMIN_URL}/themes`,
    method: 'post',
    data,
    headers: adminHeaders()
  }).then(res => unwrap<PartyTheme>(res.data))
}

/** 更新主题标签（后端不接受修改 tagKey） */
export function updateTheme(id: string, data: PartyThemeUpdateParams) {
  return requests({
    url: `${ADMIN_URL}/themes/${id}`,
    method: 'put',
    data,
    headers: adminHeaders()
  }).then(res => unwrap<PartyTheme>(res.data))
}

/** 删除主题标签 */
export function deleteTheme(id: string) {
  return requests({
    url: `${ADMIN_URL}/themes/${id}`,
    method: 'delete',
    headers: adminHeaders()
  }).then(res => unwrap<PartyDeleteResult>(res.data))
}

// ==================== 游戏配置 ====================

/** 五款游戏配置列表（首次访问惰性 seed，返回含 gameName / gameEmoji 展示字段） */
export function getGameConfigs() {
  return $axiosGet({}, `${ADMIN_METHOD_URL}/game-config`, {
    extOption: { headers: adminHeaders() }
  }).then(res => unwrap<PartyGameConfig[]>(res))
}

/** PATCH 更新单个游戏配置（一次只改一个 gameType） */
export function updateGameConfig(gameType: PartyGameType, data: PartyGameConfigUpdateParams) {
  return requests({
    url: `${ADMIN_URL}/game-config/${gameType}`,
    method: 'patch',
    data,
    headers: adminHeaders()
  }).then(res => unwrap<PartyGameConfig>(res.data))
}

// ==================== 对局查询 ====================

/** 对局分页列表（含 players 概要与权限校验 userPermission） */
export function getSessions(query: PartySessionQuery) {
  return $axiosGet(query, `${ADMIN_METHOD_URL}/sessions`, {
    extOption: { headers: adminHeaders() }
  }).then(res => unwrap<PartyPageData<PartySessionRow>>(res))
}

/** 对局详情（局信息 + 玩家表） */
export function getSessionDetail(id: string) {
  return $axiosGet({}, `${ADMIN_METHOD_URL}/sessions/${id}`, {
    extOption: { headers: adminHeaders() }
  }).then(res => unwrap<PartySessionDetail>(res))
}

// ==================== 数据统计 ====================

/** 数据看板：start / end 支持 YYYY-MM-DD */
export function getPartyStats(query: PartyStatsQuery) {
  return $axiosGet(query, `${ADMIN_METHOD_URL}/stats`, {
    extOption: { headers: adminHeaders() }
  }).then(res => unwrap<PartyStatsResult>(res))
}

// ==================== 举报审核 ====================

/** 举报分页列表 */
export function getReports(query: PartyReportQuery) {
  return $axiosGet(query, `${ADMIN_METHOD_URL}/reports`, {
    extOption: { headers: adminHeaders() }
  }).then(res => unwrap<PartyPageData<PartyReport>>(res))
}

/**
 * 审核举报：
 * - review：pending -> reviewing（开始复核）
 * - close：pending / reviewing -> closed（结案；targetAction 可选 offline / delete 处置被举报内容）
 */
export function handleReport(id: string, data: PartyReportHandleParams) {
  return requests({
    url: `${ADMIN_URL}/reports/${id}`,
    method: 'patch',
    data,
    headers: adminHeaders()
  }).then(res => unwrap<{ report: PartyReport; target?: unknown }>(res.data))
}
