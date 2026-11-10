<template>
  <div class="manage-page">
    <page-hero
      title="数据看板"
      desc="派对活动规模 / 完场 / 星光入账与段位分布（默认最近 7 天，可自定义时间窗）"
    >
      <template #side>
        <span v-if="stats" class="page-hero__pill">
          {{ stats.range.start }} ~ {{ stats.range.end }}
        </span>
      </template>
    </page-hero>

    <filter-bar :searching="loading" @search="query" @reset="reset">
      <el-date-picker
        v-model="searchInfo.range"
        type="daterange"
        value-format="YYYY-MM-DD"
        range-separator="~"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        unlink-panels
        clearable
        style="width: 260px"
        @change="query"
        @clear="query"
      />
    </filter-bar>

    <!-- 指标卡 -->
    <el-row :gutter="12" class="stats-cards">
      <el-col v-for="card in metricCards" :key="card.label" :span="4">
        <div class="stats-card">
          <div class="stats-card__label">{{ card.label }}</div>
          <div class="stats-card__value">{{ card.value }}</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="12">
      <el-col :span="14">
        <div class="stats-chart-card">
          <div class="stats-chart-card__head">
            <span>开局趋势</span>
            <el-radio-group v-model="trendZoom" size="small">
              <el-radio-button value="day">按日</el-radio-button>
              <el-radio-button value="week">按周</el-radio-button>
            </el-radio-group>
          </div>
          <BasicEchart echart-id="party-stats-trend" :chart-data="trendOption" class="stats-echart" />
        </div>
      </el-col>
      <el-col :span="10">
        <div class="stats-chart-card">
          <div class="stats-chart-card__head">
            <span>各游戏开局数</span>
          </div>
          <BasicEchart echart-id="party-stats-bygame" :chart-data="byGameOption" class="stats-echart" />
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="12" class="stats-chart-row">
      <el-col :span="10">
        <div class="stats-chart-card">
          <div class="stats-chart-card__head">
            <span>结账玩家段位分布</span>
          </div>
          <BasicEchart echart-id="party-stats-rank" :chart-data="rankOption" class="stats-echart" />
        </div>
      </el-col>
      <el-col :span="14">
        <div class="stats-chart-card">
          <div class="stats-chart-card__head">
            <span>段位分布明细</span>
          </div>
          <el-table :data="rankRows" size="small" border max-height="284">
            <el-table-column prop="label" label="段位" min-width="110" />
            <el-table-column prop="users" label="玩家数" width="100" align="center" />
            <el-table-column prop="ratio" label="占比" align="center" />
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { showTips } from '@/utils/message/showTips.js'
import { getPartyStats } from '@/api/party'
import { PARTY_GAME_META, PARTY_GAME_TYPES } from '@/types/party'
import type { PartyStatsQuery, PartyStatsResult } from '@/types/party'
import BasicEchart from '@/components/echarts/BasicEchart.vue'

const FilterBar = defineAsyncComponent(() => import('@/components/base/FilterBar/index.vue'))
const PageHero = defineAsyncComponent(() => import('@/components/base/PageHero/index.vue'))

const loading = ref(false)
const searchInfo = reactive({ range: [] as string[] })
const stats = ref<PartyStatsResult | null>(null)
const trendZoom = ref<'day' | 'week'>('day')

async function load() {
  loading.value = true
  try {
    const params: PartyStatsQuery = {}
    if (
      Array.isArray(searchInfo.range) &&
      searchInfo.range.length === 2 &&
      searchInfo.range[0] &&
      searchInfo.range[1]
    ) {
      params.start = searchInfo.range[0]
      params.end = searchInfo.range[1]
    }
    stats.value = await getPartyStats(params)
  } catch (err) {
    showTips('error', (err as Error).message || '数据请求失败')
  } finally {
    loading.value = false
  }
}

function query() {
  load()
}

function reset() {
  searchInfo.range = []
  load()
}

const metricCards = computed(() => {
  const s = stats.value
  if (!s) return []
  return [
    { label: '总开局数', value: String(s.sessions.total) },
    { label: '完场次', value: String(s.sessions.finished) },
    { label: '完场率', value: `${(s.sessions.finishedRate * 100).toFixed(1)}%` },
    { label: '等待中', value: String(s.sessions.waiting) },
    { label: '活跃玩家', value: String(s.activeUsers) },
    { label: '星光入账', value: s.starValueGrant.toLocaleString() }
  ]
})

/** 按周聚合：从窗口首日起每 7 天一个桶 */
const trendOption = computed(() => {
  const trend = stats.value?.trend || []
  const labels: string[] = []
  const values: number[] = []
  if (trendZoom.value === 'day') {
    trend.forEach(pt => {
      labels.push(pt.date.slice(5).replace('-', '/'))
      values.push(pt.sessions)
    })
  } else {
    for (let i = 0; i < trend.length; i += 7) {
      const chunk = trend.slice(i, i + 7)
      const from = chunk[0].date.slice(5).replace('-', '/')
      const to = chunk[chunk.length - 1].date.slice(5).replace('-', '/')
      labels.push(chunk.length > 1 ? `${from}~${to}` : from)
      values.push(chunk.reduce((sum, pt) => sum + pt.sessions, 0))
    }
  }
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 24, bottom: 28 },
    xAxis: { type: 'category', data: labels, boundaryGap: false },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: '开局场次',
        type: 'line',
        smooth: true,
        data: values,
        areaStyle: { opacity: 0.15 },
        symbolSize: 6
      }
    ]
  }
})

const byGameOption = computed(() => {
  const byGame = stats.value?.byGame || {}
  const labels = PARTY_GAME_TYPES.map(gt => `${PARTY_GAME_META[gt].emoji} ${PARTY_GAME_META[gt].name}`)
  const values = PARTY_GAME_TYPES.map(gt => byGame[gt] || 0)
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 24, bottom: 28 },
    xAxis: { type: 'category', data: labels, axisLabel: { interval: 0, fontSize: 11 } },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{ name: '开局场次', type: 'bar', data: values, barMaxWidth: 42 }]
  }
})

const rankRows = computed(() => {
  const dist = stats.value?.rankDist || []
  const total = dist.reduce((sum, it) => sum + it.users, 0)
  return dist.map(it => ({
    label: it.label,
    users: it.users,
    ratio: total ? `${((it.users / total) * 100).toFixed(1)}%` : '—'
  }))
})

const rankOption = computed(() => {
  const data = rankRows.value.filter(it => it.users > 0).map(it => ({ name: it.label, value: it.users }))
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} 人（{d}%）' },
    legend: { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8 },
    series: [
      {
        name: '段位玩家数',
        type: 'pie',
        radius: ['36%', '62%'],
        center: ['50%', '44%'],
        data,
        label: { formatter: '{b} {d}%' }
      }
    ]
  }
})

onMounted(load)
</script>

<style scoped lang="less">
.stats-cards {
  margin-bottom: 12px;
}

.stats-card {
  padding: 14px 16px;
  text-align: left;
  background: var(--fill-color-2);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  margin-bottom: 12px;

  &__label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__value {
    margin-top: 6px;
    font-size: 22px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.stats-chart-row {
  margin-top: 12px;
}

.stats-chart-card {
  padding: 12px;
  background: var(--fill-color-2);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.stats-echart {
  height: 320px;
}
</style>
