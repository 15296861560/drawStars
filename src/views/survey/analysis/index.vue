<template>
  <div class="survey-analysis" v-loading="loading">
    <div class="toolbar">
      <div>
        <h3>{{ survey?.title || '数据分析' }}</h3>
        <p>问卷 ID：{{ surveyId }}</p>
      </div>
      <div class="export-btns">
        <el-button size="small" :icon="Download" @click="doExport('excel')"
          >导出 Excel</el-button
        >
        <el-button size="small" :icon="Download" @click="doExport('csv')"
          >导出 CSV</el-button
        >
        <el-button size="small" :icon="Download" @click="doExport('json')"
          >导出 JSON</el-button
        >
        <el-button
          size="small"
          type="primary"
          :icon="Clock"
          @click="doExportAsync"
          >异步导出</el-button
        >
        <el-button
          size="small"
          :icon="Back"
          @click="$router.push('/home/survey')"
          >返回</el-button
        >
      </div>
    </div>

    <el-tabs v-model="tab">
      <el-tab-pane label="概览" name="overview">
        <el-row :gutter="12" class="kpi-row">
          <el-col :span="6" v-for="k in kpis" :key="k.label">
            <div class="kpi">
              <div class="kpi-label">{{ k.label }}</div>
              <div class="kpi-value">{{ k.value }}</div>
            </div>
          </el-col>
        </el-row>
        <div ref="trendRef" class="chart" />
        <el-row :gutter="12" class="mt16">
          <el-col :span="12"><div ref="sourceRef" class="chart sm" /></el-col>
          <el-col :span="12"><div ref="deviceRef" class="chart sm" /></el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="单题分析" name="question">
        <el-select
          v-model="currentQid"
          placeholder="选择题目标"
          class="mb12"
          style="width: 320px"
          @change="loadQuestionStats"
        >
          <el-option
            v-for="q in questions"
            :key="String(q.id)"
            :label="q.title"
            :value="q.id"
          />
        </el-select>
        <div ref="questionChartRef" class="chart" />
        <el-table
          v-if="questionStats?.options"
          :data="questionStats.options"
          size="small"
          border
          class="mt12"
        >
          <el-table-column prop="label" label="选项" />
          <el-table-column prop="count" label="计数" width="100" />
          <el-table-column prop="percent" label="占比%" width="100" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="交叉分析" name="cross">
        <div class="cross-form">
          <el-select
            v-model="crossRow"
            placeholder="行维度"
            style="width: 220px"
          >
            <el-option
              v-for="q in questions"
              :key="'r' + q.id"
              :label="q.title"
              :value="q.id!"
            />
          </el-select>
          <el-select
            v-model="crossCol"
            placeholder="列维度"
            style="width: 220px"
          >
            <el-option
              v-for="q in questions"
              :key="'c' + q.id"
              :label="q.title"
              :value="q.id!"
            />
          </el-select>
          <el-button type="primary" @click="loadCross">生成</el-button>
        </div>
        <el-table
          v-if="crossResult"
          :data="crossTableRows"
          border
          size="small"
          class="mt12"
        >
          <el-table-column prop="row" label="行\\列" width="140" />
          <el-table-column
            v-for="(col, i) in crossResult.cols"
            :key="col"
            :label="col"
            :prop="'c' + i"
          />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="数据质量" name="quality">
        <el-row :gutter="12" class="mb12">
          <el-col :span="6"
            ><div class="kpi">
              <div class="kpi-label">无效卷</div>
              <div class="kpi-value">{{ quality?.invalidCount ?? 0 }}</div>
            </div></el-col
          >
          <el-col :span="6"
            ><div class="kpi">
              <div class="kpi-label">疑似重复</div>
              <div class="kpi-value">{{ quality?.duplicateCount ?? 0 }}</div>
            </div></el-col
          >
          <el-col :span="6"
            ><div class="kpi">
              <div class="kpi-label">用时过短</div>
              <div class="kpi-value">
                {{ quality?.shortDurationCount ?? 0 }}
              </div>
            </div></el-col
          >
        </el-row>
        <el-table
          :data="quality?.list || []"
          border
          size="small"
          @selection-change="(rows: any[]) => (selectedQuality = rows)"
        >
          <el-table-column type="selection" width="48" />
          <el-table-column prop="responseId" label="答卷ID" width="100" />
          <el-table-column prop="reason" label="原因" />
          <el-table-column prop="duration" label="用时(秒)" width="100" />
          <el-table-column prop="ip" label="IP" width="140" />
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.isValid ? 'success' : 'danger'" size="small">
                {{ row.isValid ? '有效' : '无效' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div class="mt12">
          <el-button type="danger" @click="markSelected(false)"
            >标记无效</el-button
          >
          <el-button type="success" @click="markSelected(true)"
            >标记有效</el-button
          >
        </div>
      </el-tab-pane>

      <el-tab-pane
        v-if="survey?.scoringEnabled"
        label="成绩分析"
        name="scoring"
      >
        <el-row :gutter="12" class="mb12">
          <el-col :span="6"
            ><div class="kpi">
              <div class="kpi-label">平均分</div>
              <div class="kpi-value">{{ distribution?.avgScore ?? '-' }}</div>
            </div></el-col
          >
          <el-col :span="6"
            ><div class="kpi">
              <div class="kpi-label">及格率</div>
              <div class="kpi-value">{{ pct(distribution?.passRate) }}</div>
            </div></el-col
          >
          <el-col :span="6"
            ><div class="kpi">
              <div class="kpi-label">最高分</div>
              <div class="kpi-value">{{ distribution?.maxScore ?? '-' }}</div>
            </div></el-col
          >
          <el-col :span="6"
            ><div class="kpi">
              <div class="kpi-label">最低分</div>
              <div class="kpi-value">{{ distribution?.minScore ?? '-' }}</div>
            </div></el-col
          >
        </el-row>
        <div ref="scoreChartRef" class="chart" />
        <h4 class="mt16">题目难度 / 区分度</h4>
        <el-table :data="itemAnalysis" border size="small">
          <el-table-column prop="title" label="题目" />
          <el-table-column prop="correctRate" label="正确率" width="100" />
          <el-table-column prop="difficulty" label="难度" width="100" />
          <el-table-column prop="discrimination" label="区分度" width="100" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane v-if="survey?.scoringEnabled" label="排行榜" name="ranking">
        <el-table :data="ranking" border size="small">
          <el-table-column prop="rank" label="排名" width="80" />
          <el-table-column prop="userName" label="填写者" />
          <el-table-column prop="totalScore" label="得分" width="100" />
          <el-table-column label="提交时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.submittedAt) || '-' }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="高级" name="advanced">
        <el-card shadow="never" class="mb12">
          <template #header>筛选统计</template>
          <el-form :inline="true" size="small">
            <el-form-item label="是否有效">
              <el-select
                v-model="filterForm.isValid"
                clearable
                style="width: 120px"
              >
                <el-option label="有效" :value="true" />
                <el-option label="无效" :value="false" />
              </el-select>
            </el-form-item>
            <el-form-item label="来源">
              <el-input
                v-model="filterForm.source"
                clearable
                placeholder="source"
                style="width: 140px"
              />
            </el-form-item>
            <el-form-item label="开始">
              <el-date-picker
                v-model="filterForm.startTime"
                type="datetime"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
            <el-form-item label="结束">
              <el-date-picker
                v-model="filterForm.endTime"
                type="datetime"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                :loading="filterLoading"
                @click="applyFilter"
                >应用筛选</el-button
              >
            </el-form-item>
          </el-form>
          <pre v-if="filterResult" class="json-box">{{
            formatJson(filterResult)
          }}</pre>
        </el-card>

        <el-card shadow="never" class="mb12">
          <template #header>对比分析</template>
          <el-row :gutter="12">
            <el-col :span="12">
              <h4>视图 A</h4>
              <el-form label-position="top" size="small">
                <el-form-item label="来源"
                  ><el-input v-model="compareA.source"
                /></el-form-item>
                <el-form-item label="是否有效">
                  <el-select
                    v-model="compareA.isValid"
                    clearable
                    class="w-full"
                  >
                    <el-option label="有效" :value="true" />
                    <el-option label="无效" :value="false" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-col>
            <el-col :span="12">
              <h4>视图 B</h4>
              <el-form label-position="top" size="small">
                <el-form-item label="来源"
                  ><el-input v-model="compareB.source"
                /></el-form-item>
                <el-form-item label="是否有效">
                  <el-select
                    v-model="compareB.isValid"
                    clearable
                    class="w-full"
                  >
                    <el-option label="有效" :value="true" />
                    <el-option label="无效" :value="false" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-col>
          </el-row>
          <el-button
            type="primary"
            size="small"
            :loading="compareLoading"
            @click="applyCompare"
            >开始对比</el-button
          >
          <pre v-if="compareResult" class="json-box mt12">{{
            formatJson(compareResult)
          }}</pre>
        </el-card>

        <el-card shadow="never">
          <template #header>自定义报表</template>
          <el-form :inline="true" size="small">
            <el-form-item label="报表名称">
              <el-input
                v-model="reportName"
                placeholder="报表名称"
                style="width: 220px"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                :loading="reportLoading"
                @click="saveReport"
                >生成并保存</el-button
              >
              <el-button :icon="Refresh" @click="loadReports">刷新列表</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="reports" border size="small" class="mt12">
            <el-table-column prop="name" label="名称" />
            <el-table-column label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) || '-' }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { Back, Clock, Download, Refresh } from '@element-plus/icons-vue'
import type {
  CrossAnalysisResult,
  ItemAnalysis,
  QualityItem,
  QualityStatistics,
  Question,
  QuestionStatistics,
  RankingItem,
  ScoreDistribution,
  StatisticsOverview,
  Survey
} from '@/types/survey'
import {
  getSurveyDetail,
  getStatisticsOverview,
  getQuestionStatistics,
  getCrossAnalysis,
  getQualityStatistics,
  markQuality,
  exportSurveyData,
  exportAsync,
  getExportTask,
  getScoreDistribution,
  getRanking,
  getItemAnalysis,
  filterStatistics,
  compareStatistics,
  generateReport,
  listReports
} from '@/api/survey'
import formatDate from '@/utils/commom/formatDate.js'

const route = useRoute()
const surveyId = computed(() => String(route.params.id))
const loading = ref(false)
const tab = ref('overview')
const survey = ref<Survey | null>(null)
const questions = ref<Question[]>([])
const overview = ref<StatisticsOverview | null>(null)
const questionStats = ref<QuestionStatistics | null>(null)
const currentQid = ref<number | string>('')
const crossRow = ref<number | string>('')
const crossCol = ref<number | string>('')
const crossResult = ref<CrossAnalysisResult | null>(null)
const quality = ref<QualityStatistics | null>(null)
const selectedQuality = ref<QualityItem[]>([])
const distribution = ref<ScoreDistribution | null>(null)
const ranking = ref<RankingItem[]>([])
const itemAnalysis = ref<ItemAnalysis[]>([])
const filterForm = reactive<{
  isValid?: boolean | string
  source?: string
  startTime?: string
  endTime?: string
}>({})
const filterResult = ref<any>(null)
const filterLoading = ref(false)
const compareA = reactive<{ source?: string; isValid?: boolean | string }>({})
const compareB = reactive<{ source?: string; isValid?: boolean | string }>({})
const compareResult = ref<any>(null)
const compareLoading = ref(false)
const reportName = ref('')
const reports = ref<any[]>([])
const reportLoading = ref(false)

const trendRef = ref<HTMLElement | null>(null)
const sourceRef = ref<HTMLElement | null>(null)
const deviceRef = ref<HTMLElement | null>(null)
const questionChartRef = ref<HTMLElement | null>(null)
const scoreChartRef = ref<HTMLElement | null>(null)

const kpis = computed(() => [
  { label: '回收份数', value: overview.value?.totalResponses ?? 0 },
  { label: '有效答卷', value: overview.value?.validResponses ?? 0 },
  { label: '完成率', value: pct(overview.value?.completionRate) },
  { label: '平均用时(秒)', value: overview.value?.avgDuration ?? '-' },
  { label: '今日新增', value: overview.value?.todayCount ?? 0 },
  { label: '回收率', value: pct(overview.value?.recoveryRate) }
])

function formatJson(v: any) {
  try {
    return JSON.stringify(v, null, 2)
  } catch (_e) {
    return String(v)
  }
}

function cleanFilter(f: Record<string, any>) {
  const out: Record<string, any> = {}
  Object.keys(f).forEach(k => {
    const v = f[k]
    if (v !== '' && v !== undefined && v !== null) out[k] = v
  })
  return out
}

async function applyFilter() {
  filterLoading.value = true
  try {
    filterResult.value = await filterStatistics(
      surveyId.value,
      cleanFilter(filterForm)
    )
    ElMessage.success('筛选完成')
  } catch (e: any) {
    ElMessage.error(e?.message || '筛选失败')
  } finally {
    filterLoading.value = false
  }
}

async function applyCompare() {
  compareLoading.value = true
  try {
    compareResult.value = await compareStatistics(surveyId.value, {
      viewA: cleanFilter(compareA),
      viewB: cleanFilter(compareB)
    })
  } catch (e: any) {
    ElMessage.error(e?.message || '对比失败')
  } finally {
    compareLoading.value = false
  }
}

async function saveReport() {
  if (!reportName.value.trim()) {
    ElMessage.warning('请填写报表名称')
    return
  }
  reportLoading.value = true
  try {
    await generateReport(surveyId.value, {
      name: reportName.value,
      filters: cleanFilter(filterForm)
    })
    ElMessage.success('报表已保存')
    await loadReports()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    reportLoading.value = false
  }
}

async function loadReports() {
  try {
    reports.value = await listReports(surveyId.value)
  } catch (_e) {
    reports.value = []
  }
}

function pct(v?: number) {
  if (v == null || Number.isNaN(v)) return '-'
  return (v <= 1 ? v * 100 : v).toFixed(1) + '%'
}

const crossTableRows = computed(() => {
  if (!crossResult.value) return []
  return crossResult.value.rows.map((row, ri) => {
    const obj: any = { row }
    crossResult.value!.matrix[ri]?.forEach((n, ci) => {
      obj['c' + ci] = n
    })
    return obj
  })
})

function renderPie(
  el: HTMLElement | null,
  title: string,
  data?: Array<{ name: string; value: number }>
) {
  if (!el) return
  const chart = echarts.init(el)
  chart.setOption({
    title: { text: title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['35%', '65%'],
        data: data || []
      }
    ]
  })
}

function renderTrend() {
  if (!trendRef.value) return
  const chart = echarts.init(trendRef.value)
  const trend = overview.value?.trend || []
  chart.setOption({
    title: { text: '回收趋势', left: 'left', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: trend.map(t => t.date) },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'line',
        smooth: true,
        data: trend.map(t => t.count),
        areaStyle: {}
      }
    ]
  })
}

async function loadOverview() {
  overview.value = await getStatisticsOverview(surveyId.value)
  await nextTick()
  renderTrend()
  renderPie(sourceRef.value, '来源分布', overview.value?.sourceDistribution)
  renderPie(deviceRef.value, '设备分布', overview.value?.deviceDistribution)
}

async function loadQuestionStats() {
  if (!currentQid.value) return
  const raw: any = await getQuestionStatistics(surveyId.value, currentQid.value)
  if (!raw.options && Array.isArray(raw.distribution)) {
    raw.options = raw.distribution.map((d: any) => ({
      label: d.content ?? d.value ?? d.label,
      count: d.count,
      percent:
        d.percent != null
          ? Math.round(Number(d.percent) * 1000) / 10
          : undefined
    }))
  } else if (!raw.options && Array.isArray(raw.ranking)) {
    raw.options = raw.ranking.map((d: any) => ({
      label: d.content,
      count: d.count,
      percent: d.averageRank
    }))
  } else if (!raw.options && Array.isArray(raw.topWords)) {
    raw.options = raw.topWords.map((d: any) => ({
      label: d.word,
      count: d.count
    }))
  }
  questionStats.value = raw
  await nextTick()
  if (!questionChartRef.value) return
  const chart = echarts.init(questionChartRef.value)
  const opts = questionStats.value?.options || []
  chart.setOption({
    tooltip: {},
    xAxis: { type: 'category', data: opts.map(o => o.label) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: opts.map(o => o.count) }]
  })
}

async function loadCross() {
  if (!crossRow.value || !crossCol.value) {
    ElMessage.warning('请选择行列维度')
    return
  }
  crossResult.value = await getCrossAnalysis(surveyId.value, {
    rowDimension: crossRow.value,
    colDimension: crossCol.value
  })
}

async function loadQuality() {
  quality.value = await getQualityStatistics(surveyId.value)
}

async function markSelected(isValid: boolean) {
  const ids = selectedQuality.value.map(i => i.responseId)
  if (!ids.length) {
    ElMessage.warning('请先选择答卷')
    return
  }
  await markQuality(surveyId.value, { responseIds: ids, isValid })
  ElMessage.success('已更新')
  loadQuality()
}

async function loadScoring() {
  distribution.value = await getScoreDistribution(surveyId.value)
  itemAnalysis.value = await getItemAnalysis(surveyId.value)
  await nextTick()
  if (!scoreChartRef.value) return
  const chart = echarts.init(scoreChartRef.value)
  const buckets = distribution.value?.buckets || []
  chart.setOption({
    title: { text: '成绩分布', textStyle: { fontSize: 14 } },
    tooltip: {},
    xAxis: { type: 'category', data: buckets.map(b => b.label) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: buckets.map(b => b.count) }]
  })
}

async function loadRanking() {
  const res = await getRanking(surveyId.value, { curPage: 1, pageSize: 50 })
  ranking.value = res.list || []
}

async function doExport(format: 'excel' | 'csv' | 'json') {
  try {
    const res = await exportSurveyData(surveyId.value, {
      format,
      onlyValid: true
    })
    const url = res?.data?.downloadUrl || res?.downloadUrl
    if (url) {
      window.open(url, '_blank')
    } else {
      ElMessage.success('导出请求已提交')
      console.log(res)
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '导出失败')
  }
}

async function doExportAsync() {
  try {
    const task = await exportAsync(surveyId.value, { format: 'excel' })
    ElMessage.info('异步导出任务已创建：' + task.taskId)
    const poll = async () => {
      const t = await getExportTask(surveyId.value, task.taskId)
      if (t.status === 'done' && t.downloadUrl) {
        window.open(t.downloadUrl, '_blank')
        ElMessage.success('导出完成')
      } else if (t.status === 'failed') {
        ElMessage.error(t.message || '导出失败')
      } else {
        setTimeout(poll, 2000)
      }
    }
    poll()
  } catch (e: any) {
    ElMessage.error(e?.message || '异步导出失败')
  }
}

watch(tab, async name => {
  try {
    if (name === 'overview') await loadOverview()
    if (name === 'question') {
      if (!currentQid.value && questions.value[0]?.id)
        currentQid.value = questions.value[0].id!
      await loadQuestionStats()
    }
    if (name === 'quality') await loadQuality()
    if (name === 'scoring') await loadScoring()
    if (name === 'ranking') await loadRanking()
    if (name === 'advanced') await loadReports()
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  }
})

onMounted(async () => {
  loading.value = true
  try {
    const detail = await getSurveyDetail(surveyId.value)
    survey.value = detail
    questions.value = detail.questions || []
    await loadOverview()
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.survey-analysis {
  padding: 8px;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.toolbar h3 {
  margin: 0 0 4px;
}
.toolbar p {
  margin: 0;
  color: #909399;
  font-size: 13px;
}
.export-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.kpi-row {
  margin-bottom: 12px;
}
.kpi {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;
}
.kpi-label {
  color: #909399;
  font-size: 13px;
}
.kpi-value {
  font-size: 24px;
  font-weight: 700;
  margin-top: 6px;
}
.chart {
  height: 320px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}
.chart.sm {
  height: 280px;
}
.mt12 {
  margin-top: 12px;
}
.mt16 {
  margin-top: 16px;
}
.mb12 {
  margin-bottom: 12px;
}
.cross-form {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.json-box {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  max-height: 320px;
  overflow: auto;
  font-size: 12px;
}
.w-full {
  width: 100%;
}
</style>
