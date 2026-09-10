<template>
  <div class="workflow-overview">
    <div class="page-toolbar">
      <div class="page-title">
        <h3>流程概览</h3>
        <p>查看流程执行核心指标、趋势、排行与告警规则</p>
      </div>
      <div class="page-actions">
        <el-button
          v-permission="'system:workflow:list'"
          type="primary"
          @click="reload"
          >刷新</el-button
        >
      </div>
    </div>

    <el-row :gutter="16" class="kpi-row" v-loading="loading">
      <el-col :xs="12" :sm="6" v-for="item in kpiList" :key="item.key">
        <div class="kpi-card">
          <div class="kpi-label">{{ item.label }}</div>
          <div class="kpi-value">{{ item.value }}</div>
          <div class="kpi-footer">{{ item.footer }}</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :md="14">
        <el-card
          shadow="never"
          class="panel-card chart-card"
          v-loading="loading"
        >
          <div class="chart-title">执行趋势（近 {{ trendDays }} 天）</div>
          <div ref="trendChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="10">
        <el-card
          shadow="never"
          class="panel-card chart-card"
          v-loading="loading"
        >
          <div class="chart-title">触发方式分布</div>
          <div ref="triggerChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="panel-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="panel-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span class="card-title">流程排行 TOP {{ rankLimit }}</span>
            </div>
          </template>
          <el-table
            :data="rankList"
            v-loading="loading"
            size="small"
            class="panel-table"
            height="360"
            empty-text="暂无流程数据"
          >
            <el-table-column label="排名" width="60" align="center">
              <template #default="{ $index }">
                <span :class="['rank-no', $index < 3 ? 'top' : '']">{{
                  $index + 1
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="name"
              label="流程名称"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="executionCount"
              label="执行次数"
              width="90"
              align="center"
            />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="statusTag(row.status)">
                  {{ statusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="panel-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span class="card-title">告警规则</span>
            </div>
          </template>
          <el-table
            :data="alertRules"
            v-loading="loading"
            size="small"
            class="panel-table"
            height="360"
            empty-text="暂无启用中的告警规则"
          >
            <el-table-column label="流程" min-width="120" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.workflow?.name || '全局' }}
              </template>
            </el-table-column>
            <el-table-column label="规则类型" width="110" show-overflow-tooltip>
              <template #default="{ row }">
                {{ ruleTypeText(row.ruleType) }}
              </template>
            </el-table-column>
            <el-table-column label="阈值" width="80" align="center">
              <template #default="{ row }">
                {{ row.threshold }}
              </template>
            </el-table-column>
            <el-table-column label="统计窗口" width="90" align="center">
              <template #default="{ row }">
                {{ row.windowMinutes }} 分钟
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import {
  getWorkflowOverview,
  getWorkflowTrend,
  getWorkflows,
  getAlertRules
} from '@/api/workflow'
import type {
  WorkflowOverview,
  TrendItem,
  Workflow,
  WorkflowAlertRule
} from '@/types/workflow'

type TagType = 'primary' | 'success' | 'warning' | 'info' | 'danger'

const loading = ref(false)
const trendDays = 7
const rankLimit = 10

const overview = ref<WorkflowOverview | null>(null)
const trend = ref<TrendItem[]>([])
const rankList = ref<Workflow[]>([])
const alertRules = ref<WorkflowAlertRule[]>([])

const trendChartRef = ref<HTMLElement | null>(null)
const triggerChartRef = ref<HTMLElement | null>(null)
let trendChart: echarts.ECharts | null = null
let triggerChart: echarts.ECharts | null = null

const statusTextMap: Record<string, string> = {
  DRAFT: '草稿',
  PENDING: '待审核',
  PUBLISHED: '已发布',
  REJECTED: '已驳回',
  PAUSED: '已暂停',
  OFFLINE: '已下线'
}

const statusTagMap: Record<string, TagType> = {
  DRAFT: 'info',
  PENDING: 'warning',
  PUBLISHED: 'success',
  REJECTED: 'danger',
  PAUSED: 'warning',
  OFFLINE: 'info'
}

const triggerTextMap: Record<string, string> = {
  CRON: '定时触发',
  WEBHOOK: 'Webhook',
  MANUAL: '手动触发',
  EVENT: '事件触发'
}

const ruleTypeTextMap: Record<string, string> = {
  FAILURE_RATE: '失败率',
  FAILURE_COUNT: '失败次数'
}

function statusText(status: string) {
  return statusTextMap[status] || status
}

function statusTag(status: string): TagType {
  return statusTagMap[status] || 'info'
}

function triggerText(triggerType: string) {
  return triggerTextMap[triggerType] || triggerType
}

function ruleTypeText(ruleType: string) {
  return ruleTypeTextMap[ruleType] || ruleType
}

function formatDuration(ms: number) {
  if (ms == null) return '-'
  if (ms < 1000) return ms + 'ms'
  return (ms / 1000).toFixed(1) + 's'
}

const kpiList = computed(() => {
  const o = overview.value
  return [
    {
      key: 'todayTotal',
      label: '今日执行',
      value: o ? o.todayTotal : '-',
      footer:
        '成功 ' + (o?.todaySucceeded ?? 0) + ' / 失败 ' + (o?.todayFailed ?? 0)
    },
    {
      key: 'todaySucceeded',
      label: '今日成功',
      value: o ? o.todaySucceeded : '-',
      footer: '执行成功率 ' + (o?.successRate ?? 0) + '%'
    },
    {
      key: 'todayFailed',
      label: '今日失败',
      value: o ? o.todayFailed : '-',
      footer: '失败可在执行历史中排查'
    },
    {
      key: 'successRate',
      label: '执行成功率',
      value: o ? o.successRate + '%' : '-',
      footer: '按已完成执行统计'
    },
    {
      key: 'avgDuration',
      label: '平均耗时',
      value: o ? formatDuration(o.avgDurationMs) : '-',
      footer: '成功执行的平均耗时'
    },
    {
      key: 'activeWorkflowCount',
      label: '活跃流程',
      value: o ? o.activeWorkflowCount : '-',
      footer: '已发布且未删除'
    },
    {
      key: 'backlog',
      label: '待处理执行',
      value: o ? o.backlog : '-',
      footer: '待执行 / 运行中'
    }
  ]
})

function renderTrendChart() {
  if (!trendChartRef.value) return
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }
  const data = trend.value
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['执行', '成功', '失败'] },
    grid: { left: 48, right: 24, top: 40, bottom: 32 },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date)
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '执行',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        data: data.map(d => d.total),
        areaStyle: { opacity: 0.12 }
      },
      {
        name: '成功',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        data: data.map(d => d.succeeded),
        areaStyle: { opacity: 0.12 }
      },
      {
        name: '失败',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        data: data.map(d => d.failed),
        areaStyle: { opacity: 0.12 }
      }
    ]
  })
}

function renderTriggerChart() {
  if (!triggerChartRef.value) return
  if (!triggerChart) {
    triggerChart = echarts.init(triggerChartRef.value)
  }
  const data = overview.value?.triggerTypeDistribution || []
  triggerChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    series: [
      {
        name: '触发方式',
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        data: data.map(d => ({
          name: triggerText(d.triggerType),
          value: d.count
        }))
      }
    ]
  })
}

async function reload() {
  loading.value = true
  try {
    const [overviewData, trendData, workflowRes, alertRes] = await Promise.all([
      getWorkflowOverview(),
      getWorkflowTrend(trendDays),
      getWorkflows({ page: 1, pageSize: 100 }),
      getAlertRules({ page: 1, pageSize: 10, enabled: 'true' })
    ])
    overview.value = overviewData
    trend.value = trendData
    rankList.value = [...workflowRes.list]
      .sort((a, b) => b.executionCount - a.executionCount)
      .slice(0, rankLimit)
    alertRules.value = alertRes.list
    await nextTick()
    renderTrendChart()
    renderTriggerChart()
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function onResize() {
  trendChart?.resize()
  triggerChart?.resize()
}

onMounted(() => {
  reload()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  trendChart?.dispose()
  trendChart = null
  triggerChart?.dispose()
  triggerChart = null
})
</script>

<style scoped lang="less">
.workflow-overview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

.page-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.kpi-row {
  :deep(.el-col) {
    display: flex;
    margin-bottom: 12px;
  }
}

.kpi-card {
  width: 100%;
  min-height: 112px;
  box-sizing: border-box;
  padding: 16px 18px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.kpi-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.kpi-value {
  margin: 10px 0;
  font-size: 24px;
  font-weight: 600;
  word-break: break-all;
}

.kpi-footer {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.chart-row {
  :deep(.el-col) {
    display: flex;
    margin-bottom: 0;

    @media (max-width: 991px) {
      &:not(:last-child) {
        margin-bottom: 16px;
      }
    }
  }
}

.panel-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 8px;

  :deep(.el-card__header) {
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  :deep(.el-card__body) {
    flex: 1;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
  }
}

.chart-card {
  margin-bottom: 0;

  :deep(.el-card__body) {
    display: block;
  }
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}

.chart-box {
  height: 320px;
  width: 100%;
}

.panel-row {
  :deep(.el-col) {
    display: flex;
    margin-bottom: 0;

    @media (max-width: 991px) {
      &:not(:last-child) {
        margin-bottom: 16px;
      }
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.panel-table {
  flex: 1;
  width: 100%;

  :deep(.el-table__inner-wrapper::before) {
    display: none;
  }

  :deep(.el-table__empty-block) {
    min-height: 300px;
  }
}

.rank-no {
  display: inline-block;
  min-width: 20px;
  height: 20px;
  line-height: 20px;
  border-radius: 50%;
  font-size: 12px;
  text-align: center;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);

  &.top {
    color: #fff;
    background: var(--el-color-primary);
  }
}
</style>
