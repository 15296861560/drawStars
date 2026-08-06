/**
 * Survey / questionnaire API wrappers
 */
import type {
  Survey,
  SurveyListQuery,
  PageResult,
  Question,
  LogicRule,
  PublishConfig,
  FillSurveyPayload,
  SubmitResponsePayload,
  SurveyResponse,
  ScoringConfig,
  ScoringRule,
  ScoringResult,
  StatisticsOverview,
  QuestionStatistics,
  CrossAnalysisRequest,
  CrossAnalysisResult,
  QualityStatistics,
  ExportFormat,
  ExportTask,
  GradingListItem,
  SurveyTemplate,
  QuestionBankItem,
  ScoreDistribution,
  RankingItem,
  ItemAnalysis
} from '@/types/survey'
import {
  $axios,
  $axiosGet,
  requests
} from '@/assets/js/axios-api/axios-config.js'

function unwrap<T = any>(res: any): T {
  if (res && typeof res === 'object' && 'data' in res) {
    return res.data as T
  }
  return res as T
}

/** list surveys */
export async function listSurveys(
  params: SurveyListQuery = {}
): Promise<PageResult<Survey>> {
  const res = await $axiosGet(params, '/survey/list')
  return unwrap(res) || { list: [], total: 0 }
}

/** create survey */
export async function createSurvey(data: Partial<Survey>) {
  return $axios(data, '/survey/create')
}

/** survey detail */
export async function getSurveyDetail(id: number | string): Promise<Survey> {
  const res = await $axiosGet({}, `/survey/${id}`)
  return unwrap(res)
}

/** update survey */
export async function updateSurvey(id: number | string, data: Partial<Survey>) {
  return requests({ url: `/api/survey/${id}`, data, method: 'put' })
}

/** delete survey */
export async function removeSurvey(id: number | string) {
  return requests({ url: `/api/survey/${id}`, method: 'delete' })
}

/** copy survey */
export async function copySurvey(id: number | string) {
  return $axios({}, `/survey/${id}/copy`)
}

/** batch save questions */
export async function saveQuestions(
  id: number | string,
  questions: Question[]
) {
  return $axios({ questions }, `/survey/${id}/questions`)
}

/** sort questions */
export async function sortQuestions(
  id: number | string,
  orders: Array<{ id: number | string; sortOrder: number; pageIndex?: number }>
) {
  return requests({
    url: `/api/survey/${id}/questions/sort`,
    data: { orders },
    method: 'put'
  })
}

/** get logic rules */
export async function getLogic(id: number | string): Promise<LogicRule[]> {
  const res = await $axiosGet({}, `/survey/${id}/logic`)
  return unwrap(res) || []
}

/** save logic rules */
export async function saveLogic(id: number | string, rules: LogicRule[]) {
  return requests({
    url: `/api/survey/${id}/logic`,
    data: { rules },
    method: 'put'
  })
}

/** publish */
export async function publishSurvey(
  id: number | string,
  config?: Partial<PublishConfig>
) {
  return $axios(config || {}, `/survey/${id}/publish`)
}

/** pause */
export async function pauseSurvey(id: number | string) {
  return $axios({}, `/survey/${id}/pause`)
}

/** close */
export async function closeSurvey(id: number | string) {
  return $axios({}, `/survey/${id}/close`)
}

/** fill payload by share code */
export async function getFill(
  shareCode: string,
  params: { password?: string; source?: string } = {}
): Promise<FillSurveyPayload> {
  const res = await $axiosGet(params, `/survey/fill/${shareCode}`)
  const raw: any = unwrap(res) || {}

  const normalizeQuestions = (list: any[] = []): Question[] =>
    list.map(q => {
      const options = q.options || q.config?.options || []
      return {
        ...q,
        config: {
          ...(q.config || {}),
          options
        }
      }
    })

  // 后端返回扁平结构：{ id, title, questions, unlocked, needPassword, ... }
  // 兼容已有 { survey, questions, passwordPassed } 形态
  if (raw.survey) {
    return {
      survey: raw.survey,
      questions: normalizeQuestions(
        raw.questions || raw.survey.questions || []
      ),
      logicRules: raw.logicRules || raw.survey.logicRules || [],
      publishConfig: raw.publishConfig,
      needPassword: !!raw.needPassword,
      passwordPassed:
        raw.passwordPassed != null
          ? !!raw.passwordPassed
          : raw.unlocked != null
            ? !!raw.unlocked
            : !raw.needPassword
    }
  }

  const {
    questions = [],
    logicRules = [],
    needPassword,
    unlocked,
    passwordPassed,
    publishConfig,
    msg: _msg,
    ...surveyFields
  } = raw

  return {
    survey: surveyFields as Survey,
    questions: normalizeQuestions(questions),
    logicRules,
    publishConfig,
    needPassword: !!needPassword,
    passwordPassed:
      passwordPassed != null
        ? !!passwordPassed
        : unlocked != null
          ? !!unlocked
          : !needPassword
  }
}

/** submit response */
export async function submitResponse(
  id: number | string,
  payload: SubmitResponsePayload
) {
  return $axios(payload, `/survey/${id}/response`)
}

/** save draft */
export async function saveDraft(
  id: number | string,
  payload: Partial<SubmitResponsePayload> & { responseId?: number }
) {
  return $axios(payload, `/survey/${id}/response/draft`)
}

/** get draft by survey id (logged-in user) */
export async function getDraft(surveyId: number | string): Promise<{
  answers?:
    | Record<string, any>
    | Array<{ questionId: number | string; answerData: any }>
  pageIndex?: number
  responseId?: number
} | null> {
  const res = await $axiosGet({}, `/survey/${surveyId}/response/draft`)
  return unwrap(res) || null
}

/** get draft by share code (fill page) */
export async function getFillDraft(shareCode: string): Promise<{
  answers?:
    | Record<string, any>
    | Array<{ questionId: number | string; answerData: any }>
  pageIndex?: number
  responseId?: number
} | null> {
  const res = await $axiosGet({}, `/survey/fill/${shareCode}/draft`)
  return unwrap(res) || null
}

/** share info (fillUrl / sourceLinks) */
export async function getShareInfo(id: number | string): Promise<{
  fillUrl?: string
  shareCode?: string
  sourceLinks?: Array<{ source: string; label?: string; url: string }>
}> {
  const res = await $axiosGet({}, `/survey/${id}/share`)
  return unwrap(res) || {}
}

/** list saved custom reports */
export async function listReports(id: number | string): Promise<any[]> {
  const res = await $axiosGet({}, `/survey/${id}/statistics/report`)
  const data = unwrap(res)
  if (Array.isArray(data)) return data
  return data?.list || []
}

/** get fill result / scoring result */
export async function getResult(
  responseId: number | string,
  params: { shareCode?: string } = {}
): Promise<{
  response: SurveyResponse
  scoring?: ScoringResult
  survey?: Survey
}> {
  if (params.shareCode) {
    const res = await $axiosGet(
      { responseId },
      `/survey/fill/${params.shareCode}/result`
    )
    return unwrap(res)
  }
  const res = await $axiosGet({}, `/survey/response/${responseId}/result`)
  return unwrap(res)
}

/** statistics overview */
export async function getStatisticsOverview(
  id: number | string,
  params: Record<string, any> = {}
): Promise<StatisticsOverview> {
  const res = await $axiosGet(params, `/survey/${id}/statistics/overview`)
  return unwrap(res)
}

/** question statistics */
export async function getQuestionStatistics(
  id: number | string,
  qid: number | string,
  params: Record<string, any> = {}
): Promise<QuestionStatistics> {
  const res = await $axiosGet(
    params,
    `/survey/${id}/statistics/question/${qid}`
  )
  return unwrap(res)
}

/** cross analysis */
export async function getCrossAnalysis(
  id: number | string,
  body: CrossAnalysisRequest
): Promise<CrossAnalysisResult> {
  const res = await $axios(
    {
      rowQuestionId: Number(body.rowDimension),
      colQuestionId: Number(body.colDimension),
      metric: body.valueType || 'count',
      filters: body.filters
    },
    `/survey/${id}/statistics/cross`
  )
  const data: any = unwrap(res)
  return {
    rows: data.rows || [],
    cols: data.cols || [],
    matrix: data.matrix || data.cells || []
  }
}

/** quality */
export async function getQualityStatistics(
  id: number | string
): Promise<QualityStatistics> {
  const res = await $axiosGet({}, `/survey/${id}/statistics/quality`)
  return unwrap(res)
}

/** mark quality */
export async function markQuality(
  id: number | string,
  body: { responseIds: number[]; isValid: boolean; reason?: string }
) {
  return $axios(body, `/survey/${id}/statistics/quality/mark`)
}

/** filtered statistics */
export async function filterStatistics(
  id: number | string,
  filters: Record<string, any>
) {
  return $axios(filters, `/survey/${id}/statistics/filter`)
}

/** compare views */
export async function compareStatistics(
  id: number | string,
  body: { viewA: Record<string, any>; viewB: Record<string, any> }
) {
  return $axios(body, `/survey/${id}/statistics/compare`)
}

/** custom report */
export async function generateReport(
  id: number | string,
  body: Record<string, any>
) {
  return $axios(body, `/survey/${id}/statistics/report`)
}

/** sync export — returns blob or download url depending on backend */
export async function exportSurveyData(
  id: number | string,
  params: {
    format?: ExportFormat
    onlyValid?: boolean
    includeMeta?: boolean
    encoding?: string
  } = {}
) {
  return $axiosGet(params, `/survey/${id}/export`)
}

/** async export */
export async function exportAsync(
  id: number | string,
  body: {
    format?: ExportFormat
    onlyValid?: boolean
    includeMeta?: boolean
  } = {}
): Promise<ExportTask> {
  const res = await $axios(body, `/survey/${id}/export/async`)
  return unwrap(res)
}

/** export task status */
export async function getExportTask(
  id: number | string,
  taskId: string
): Promise<ExportTask> {
  const res = await $axiosGet({}, `/survey/${id}/export/task/${taskId}`)
  return unwrap(res)
}

/** scoring config get */
export async function getScoringConfig(
  id: number | string
): Promise<ScoringConfig> {
  const res = await $axiosGet({}, `/survey/${id}/scoring/config`)
  return unwrap(res)
}

/** scoring config save */
export async function saveScoringConfig(
  id: number | string,
  config: ScoringConfig
) {
  return requests({
    url: `/api/survey/${id}/scoring/config`,
    data: config,
    method: 'put'
  })
}

/** scoring rules get */
export async function getScoringRules(
  id: number | string
): Promise<ScoringRule[]> {
  const res = await $axiosGet({}, `/survey/${id}/scoring/rules`)
  return unwrap(res) || []
}

/** scoring rules save */
export async function saveScoringRules(
  id: number | string,
  rules: ScoringRule[]
) {
  return requests({
    url: `/api/survey/${id}/scoring/rules`,
    data: { rules },
    method: 'put'
  })
}

/** scoring result list */
export async function getScoringResultList(
  id: number | string,
  params: Record<string, any> = {}
): Promise<PageResult<ScoringResult>> {
  const res = await $axiosGet(params, `/survey/${id}/scoring/result`)
  return unwrap(res) || { list: [], total: 0 }
}

/** single scoring result */
export async function getScoringResultDetail(
  id: number | string,
  responseId: number | string
): Promise<ScoringResult> {
  const res = await $axiosGet({}, `/survey/${id}/scoring/result/${responseId}`)
  return unwrap(res)
}

/** score distribution */
export async function getScoreDistribution(
  id: number | string
): Promise<ScoreDistribution> {
  const res = await $axiosGet({}, `/survey/${id}/scoring/distribution`)
  return unwrap(res)
}

/** ranking */
export async function getRanking(
  id: number | string,
  params: Record<string, any> = {}
): Promise<PageResult<RankingItem>> {
  const res = await $axiosGet(params, `/survey/${id}/scoring/ranking`)
  return unwrap(res) || { list: [], total: 0 }
}

/** item analysis */
export async function getItemAnalysis(
  id: number | string
): Promise<ItemAnalysis[]> {
  const res = await $axiosGet({}, `/survey/${id}/scoring/item-analysis`)
  return unwrap(res) || []
}

/** grading pending list */
export async function getGradingList(
  id: number | string
): Promise<GradingListItem[]> {
  const res = await $axiosGet({}, `/survey/${id}/grading/list`)
  return unwrap(res) || []
}

/** submit grading */
export async function submitGrading(
  id: number | string,
  responseId: number | string,
  body: {
    scores: Array<{
      questionId: number | string
      score: number
      comment?: string
    }>
  }
) {
  return $axios(body, `/survey/${id}/grading/${responseId}`)
}

/** batch grading */
export async function batchGrading(
  id: number | string,
  body: {
    questionId: number | string
    items: Array<{ responseId: number; score: number; comment?: string }>
  }
) {
  return $axios(body, `/survey/${id}/grading/batch`)
}

/** review grading */
export async function reviewGrading(
  id: number | string,
  body: {
    responseId: number
    scores: Array<{
      questionId: number | string
      score: number
      comment?: string
    }>
  }
) {
  return $axios(body, `/survey/${id}/grading/review`)
}

/** templates */
export async function listTemplates(
  params: Record<string, any> = {}
): Promise<PageResult<SurveyTemplate>> {
  const res = await $axiosGet(params, '/survey/template/list')
  return unwrap(res) || { list: [], total: 0 }
}

export async function createTemplate(data: Partial<SurveyTemplate>) {
  return $axios(data, '/survey/template/create')
}

export async function updateTemplate(
  id: number | string,
  data: Partial<SurveyTemplate>
) {
  return requests({ url: `/api/survey/template/${id}`, data, method: 'put' })
}

export async function removeTemplate(id: number | string) {
  return requests({ url: `/api/survey/template/${id}`, method: 'delete' })
}

export async function useTemplate(id: number | string) {
  return $axios({}, `/survey/template/${id}/use`)
}

/** question bank */
export async function listQuestionBank(
  params: Record<string, any> = {}
): Promise<PageResult<QuestionBankItem>> {
  const res = await $axiosGet(params, '/survey/question-bank/list')
  return unwrap(res) || { list: [], total: 0 }
}

export async function createQuestionBankItem(data: Partial<QuestionBankItem>) {
  return $axios(data, '/survey/question-bank/create')
}

export async function updateQuestionBankItem(
  id: number | string,
  data: Partial<QuestionBankItem>
) {
  return requests({
    url: `/api/survey/question-bank/${id}`,
    data,
    method: 'put'
  })
}

export async function removeQuestionBankItem(id: number | string) {
  return requests({
    url: `/api/survey/question-bank/${id}`,
    method: 'delete'
  })
}

/** notify share */
export async function notifyShare(
  id: number | string,
  body: { userIds?: number[]; message?: string }
) {
  return $axios(body, `/survey/${id}/notify-share`)
}

/** client-side embed helper */
export function getEmbedCode(
  shareUrl: string,
  options?: { width?: string; height?: string }
) {
  const w = options?.width || '100%'
  const h = options?.height || '600'
  return `<iframe src="${shareUrl}" width="${w}" height="${h}" frameborder="0" allowfullscreen></iframe>`
}

/** build public fill url */
export function buildFillUrl(shareCode: string, source?: string) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const base = `${origin}/survey/fill/${shareCode}`
  return source ? `${base}?source=${encodeURIComponent(source)}` : base
}
