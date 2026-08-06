<template>
  <div class="task-overview">
    <div class="page-toolbar">
      <div class="page-title">
        <h3>任务概览</h3>
        <p>查看核心指标、趋势与用户/奖励维度统计</p>
      </div>
      <div class="page-actions">
        <el-dropdown @command="onExport">
          <el-button>
            导出数据
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="overview">概览数据</el-dropdown-item>
              <el-dropdown-item command="tasks">任务数据</el-dropdown-item>
              <el-dropdown-item command="claims">领取数据</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button
          v-permission="'system:task:operate'"
          type="primary"
          @click="go('list')"
          >任务列表</el-button
        >
        <el-button @click="reload">刷新</el-button>
      </div>
    </div>

    <el-row :gutter="16" class="kpi-row" v-loading="loading">
      <el-col :xs="12" :sm="6" v-for="item in kpiList" :key="item.key">
        <div
          class="kpi-card"
          :class="{ clickable: !!item.to }"
          @click="item.to && go(item.to)"
        >
          <div class="kpi-label">{{ item.label }}</div>
          <div class="kpi-value">{{ item.value }}</div>
          <div class="kpi-footer">{{ item.footer }}</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="24">
        <el-card
          shadow="never"
          class="panel-card chart-card"
          v-loading="loading"
        >
          <div class="chart-title">
            接取 / 完成趋势（近 {{ trendDays }} 天）
          </div>
          <div ref="trendChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="panel-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="panel-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span class="card-title">用户 TOP {{ userLimit }}</span>
            </div>
          </template>
          <el-table
            :data="store.userStats"
            v-loading="loading"
            size="small"
            class="panel-table"
            height="360"
            empty-text="暂无用户数据"
          >
            <el-table-column
              prop="userName"
              label="用户"
              min-width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ row.userName || '用户#' + row.userId }}
              </template>
            </el-table-column>
            <el-table-column
              prop="acceptCount"
              label="接取"
              width="70"
              align="center"
            />
            <el-table-column
              prop="completeCount"
              label="完成"
              width="70"
              align="center"
            />
            <el-table-column
              prop="rewardPoints"
              label="积分"
              width="90"
              align="right"
            />
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="panel-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span class="card-title">奖励维度统计</span>
            </div>
          </template>
          <el-table
            :data="store.rewardStats"
            v-loading="loading"
            size="small"
            class="panel-table"
            height="360"
            empty-text="暂无奖励数据"
          >
            <el-table-column
              prop="rewardType"
              label="类型"
              min-width="100"
              show-overflow-tooltip
            />
            <el-table-column
              prop="count"
              label="次数"
              width="80"
              align="center"
            >
              <template #default="{ row }">
                {{ row.count > 0 ? row.count : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="详情" min-width="120" show-overflow-tooltip>
              <template #default="{ row }">
                {{
                  row.totalPoints != null
                    ? row.totalPoints + ' 积分'
                    : row.itemName || '-'
                }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { taskStore } from '@/stores/task'

const router = useRouter()
const store = taskStore()
const loading = ref(false)
const trendChartRef = ref<HTMLElement | null>(null)
const trendDays = 7
const userLimit = 10
let chart: echarts.ECharts | null = null

const kpiList = computed(() => [
  {
    key: 'total',
    label: '任务总数',
    value: store.overview.totalTasks,
    footer: '含草稿/已上线',
    to: 'list'
  },
  {
    key: 'online',
    label: '已上线',
    value: store.overview.onlineTasks,
    footer: '可接取任务',
    to: 'list'
  },
  {
    key: 'pending',
    label: '待审核',
    value: store.overview.pendingAudit,
    footer: '前往任务审核 →',
    to: 'audit'
  },
  {
    key: 'accept',
    label: '今日接取',
    value: store.overview.todayAccept,
    footer: '今日完成 ' + store.overview.todayComplete,
    to: ''
  },
  {
    key: 'points',
    label: '今日发放积分',
    value: store.overview.todayRewardPoints,
    footer: '奖励汇总',
    to: 'shipping'
  },
  {
    key: 'rate',
    label: '参与率',
    value: Math.round(store.overview.participationRate * 100) + '%',
    footer: '完成率 ' + Math.round(store.overview.completionRate * 100) + '%',
    to: ''
  }
])

function go(name: string) {
  router.push(`/home/manageHomePage/task/${name}`)
}

function renderTrendChart() {
  if (!trendChartRef.value) return
  if (!chart) {
    chart = echarts.init(trendChartRef.value)
  }
  const data = store.trend
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['接取', '完成'] },
    grid: { left: 48, right: 24, top: 40, bottom: 32 },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date)
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '接取',
        type: 'line',
        smooth: true,
        data: data.map(d => d.accept)
      },
      {
        name: '完成',
        type: 'line',
        smooth: true,
        data: data.map(d => d.complete)
      }
    ]
  })
}

async function reload() {
  loading.value = true
  try {
    await Promise.all([
      store.loadOverview(),
      store.loadTrend(trendDays),
      store.loadUserStats(userLimit),
      store.loadRewardStats()
    ])
    await nextTick()
    renderTrendChart()
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function onExport(type: 'overview' | 'claims' | 'tasks') {
  try {
    await store.exportStatistics(type)
    ElMessage.success('导出成功')
  } catch (e: any) {
    ElMessage.error(e?.message || '导出失败')
  }
}

function onResize() {
  chart?.resize()
}

watch(
  () => store.trend,
  () => {
    nextTick(renderTrendChart)
  }
)

onMounted(() => {
  reload()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
  chart = null
})
</script>

<style scoped lang="less">
.task-overview {
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

  &.clickable {
    cursor: pointer;

    &:hover {
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
  }
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

.kpi-card.clickable .kpi-footer {
  color: var(--el-color-primary);
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
</style>
