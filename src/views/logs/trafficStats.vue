<template>
  <div class="analytics-dashboard">
    <!-- Website Header -->
    <div class="website-header">
      <div class="title-row">
        <div class="site-title">
          <el-select
            v-model="websiteId"
            class="site-select"
            placeholder="选择网站"
            @change="onWebsiteChange"
          >
            <el-option
              v-for="item in websites"
              :key="item.websiteId"
              :label="item.name"
              :value="item.websiteId"
            />
          </el-select>
        </div>
        <div class="header-right">
          <div class="active-users" :class="{ muted: !activeUsers }">
            <span class="dot-wrap"><span class="dot" :class="{ off: !activeUsers }"></span></span>
            <template v-if="activeUsers > 0">
              <strong>{{ activeUsers }}</strong> 位在线访客
            </template>
            <template v-else>当前无在线访客</template>
          </div>
          <button class="analytics-btn icon" type="button" title="刷新" @click="refresh">
            ↻
          </button>
          <button class="analytics-btn link" type="button" @click="goConfig">网站配置</button>
        </div>
      </div>

      <!-- Metrics + Date filter (sticky metrics row) -->
      <div class="metrics" v-loading="loadingStats">
        <div class="metrics-bar">
          <MetricCard
            label="访客"
            :value="kpis.visitors"
            :change="kpis.visitorsChange"
            :previous="kpis.visitorsPrev"
          />
          <MetricCard
            label="访问"
            :value="kpis.visits"
            :change="kpis.visitsChange"
            :previous="kpis.visitsPrev"
          />
          <MetricCard
            label="浏览量"
            :value="kpis.views"
            :change="kpis.viewsChange"
            :previous="kpis.viewsPrev"
          />
          <MetricCard
            label="跳出率"
            :value="kpis.bounceRate"
            :change="kpis.bounceChange"
            format="percent"
            reverse-colors
          />
          <MetricCard
            label="访问时长"
            :value="kpis.avgTime"
            :change="kpis.avgTimeChange"
            :previous="kpis.avgTimePrev"
            format="time"
          />
        </div>
        <div class="filter">
          <el-select v-model="preset" class="date-select" @change="onPresetChange">
            <el-option
              v-for="p in presets"
              :key="p.value"
              :label="p.label"
              :value="p.value"
            />
          </el-select>
          <el-date-picker
            v-if="preset === 'custom'"
            v-model="customRange"
            type="daterange"
            value-format="x"
            start-placeholder="开始"
            end-placeholder="结束"
            @change="refresh"
          />
        </div>
      </div>
    </div>

    <!-- Pageviews Chart -->
    <div class="chart" v-loading="loadingStats">
      <div ref="chartRef" class="pageviews-chart"></div>
    </div>

    <!-- Drill-down or Overview -->
    <div v-if="view" class="view drill-layout" v-loading="loadingStats">
      <aside class="drill-menu">
        <div class="back" @click="view = ''">← 返回</div>
        <div
          v-for="item in viewMenus"
          :key="item.key"
          class="menu-item"
          :class="{ active: view === item.key }"
          @click="view = item.key"
        >
          {{ item.label }}
        </div>
      </aside>
      <div class="drill-content">
        <MetricsTable
          :title="currentViewLabel"
          :rows="detailRows"
          :metric-label="viewMetricLabel"
          :label-map="currentLabelMap"
          :limit="100"
        />
      </div>
    </div>

    <template v-else>
      <div class="grid-row" v-loading="loadingStats">
        <div class="grid-col">
          <MetricsTable
            title="页面"
            metric-label="浏览量"
            :rows="pages"
            :limit="10"
            show-more
            @more="openView('url')"
          />
        </div>
        <div class="grid-col">
          <MetricsTable
            title="来源"
            metric-label="浏览量"
            :rows="referrers"
            :limit="10"
            show-more
            @more="openView('referrer')"
          />
        </div>
      </div>

      <div class="grid-row three" v-loading="loadingStats">
        <div class="grid-col">
          <MetricsTable
            title="浏览器"
            metric-label="访客"
            :rows="browsers"
            :label-map="browserMap"
            :limit="10"
            show-more
            @more="openView('browser')"
          />
        </div>
        <div class="grid-col">
          <MetricsTable
            title="操作系统"
            metric-label="访客"
            :rows="osList"
            :label-map="osMap"
            :limit="10"
            show-more
            @more="openView('os')"
          />
        </div>
        <div class="grid-col">
          <MetricsTable
            title="设备"
            metric-label="访客"
            :rows="devices"
            :label-map="deviceMap"
            :limit="10"
            show-more
            @more="openView('device')"
          />
        </div>
      </div>

      <div class="grid-row" v-loading="loadingStats">
        <div class="grid-col map-col">
          <div class="section-title">地区分布</div>
          <div ref="countryChartRef" class="country-chart"></div>
        </div>
        <div class="grid-col">
          <MetricsTable
            title="国家/地区"
            metric-label="访客"
            :rows="countries"
            :label-map="countryMap"
            :limit="10"
            show-more
            @more="openView('country')"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as echarts from 'echarts'
import MetricCard from '@/components/analytics/MetricCard.vue'
import MetricsTable from '@/components/analytics/MetricsTable.vue'
import analyticsApi from '@/assets/js/api/analyticsController/analyticsApi.js'
import { showTips } from '@/utils/message/showTips.js'

const router = useRouter()
const route = useRoute()
const websites = ref([])
const websiteId = ref(null)
const preset = ref('7day')
const customRange = ref([])
const loadingStats = ref(false)
const activeUsers = ref(0)
const view = ref('')
const chartRef = ref(null)
const countryChartRef = ref(null)
let pvChart
let countryChart
let activeTimer

const statsRaw = ref(null)
const pages = ref([])
const referrers = ref([])
const browsers = ref([])
const osList = ref([])
const devices = ref([])
const countries = ref([])
const detailRows = ref([])

const browserMap = {
  chrome: 'Chrome',
  firefox: 'Firefox',
  safari: 'Safari',
  edge: 'Edge',
  ie: 'IE',
  unknown: '未知'
}
const osMap = {
  windows: 'Windows',
  macos: 'macOS',
  android: 'Android',
  ios: 'iOS',
  linux: 'Linux',
  unknown: '未知'
}
const deviceMap = {
  desktop: '桌面',
  mobile: '手机',
  tablet: '平板',
  unknown: '未知'
}
const countryMap = {
  CN: '中国',
  US: '美国',
  JP: '日本',
  KR: '韩国',
  GB: '英国',
  unknown: '未知'
}

const presets = [
  { label: '今天', value: '1day' },
  { label: '最近 24 小时', value: '24hour' },
  { label: '最近 7 天', value: '7day' },
  { label: '最近 30 天', value: '30day' },
  { label: '最近 90 天', value: '90day' },
  { label: '自定义', value: 'custom' }
]

const viewMenus = [
  { key: 'url', label: '页面' },
  { key: 'referrer', label: '来源' },
  { key: 'browser', label: '浏览器' },
  { key: 'os', label: '操作系统' },
  { key: 'device', label: '设备' },
  { key: 'country', label: '国家/地区' }
]

const currentViewLabel = computed(() => {
  return viewMenus.find(i => i.key === view.value)?.label || ''
})

const viewMetricLabel = computed(() =>
  ['url', 'referrer'].includes(view.value) ? '浏览量' : '访客'
)

const currentLabelMap = computed(() => {
  if (view.value === 'browser') return browserMap
  if (view.value === 'os') return osMap
  if (view.value === 'device') return deviceMap
  if (view.value === 'country') return countryMap
  return undefined
})

const kpis = computed(() => {
  const d = statsRaw.value || {}
  const pv = d.pageviews?.value || 0
  const uv = d.uniques?.value || 0
  const visits = d.visits?.value ?? uv
  const bounces = d.bounces?.value || 0
  const totaltime = d.totaltime?.value || 0

  const viewsPrev = pv - (d.pageviews?.change || 0)
  const visitorsPrev = uv - (d.uniques?.change || 0)
  const visitsPrev = visits - (d.visits?.change ?? d.uniques?.change ?? 0)
  const prevBounces = bounces - (d.bounces?.change || 0)
  const prevTime = totaltime - (d.totaltime?.change || 0)

  const bounceRate = uv ? (Math.min(bounces, uv) / uv) * 100 : 0
  const prevBounceRate =
    visitorsPrev > 0 ? (Math.min(prevBounces, visitorsPrev) / visitorsPrev) * 100 : 0
  const avgTime = pv - bounces > 0 ? totaltime / (pv - bounces) : 0
  const avgTimePrev =
    viewsPrev - prevBounces > 0 ? prevTime / (viewsPrev - prevBounces) : 0

  return {
    visitors: uv,
    visitorsChange: d.uniques?.change || 0,
    visitorsPrev,
    visits,
    visitsChange: d.visits?.change ?? d.uniques?.change ?? 0,
    visitsPrev,
    views: pv,
    viewsChange: d.pageviews?.change || 0,
    viewsPrev,
    bounceRate,
    bounceChange: bounceRate - prevBounceRate,
    avgTime,
    avgTimeChange: avgTime - avgTimePrev,
    avgTimePrev
  }
})

function rangeParams() {
  const end = Date.now()
  let start = end - 6 * 86400000
  let unit = 'day'
  if (preset.value === '1day') {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    start = d.getTime()
    unit = 'hour'
  } else if (preset.value === '24hour') {
    start = end - 86400000
    unit = 'hour'
  } else if (preset.value === '7day') start = end - 6 * 86400000
  else if (preset.value === '30day') start = end - 29 * 86400000
  else if (preset.value === '90day') start = end - 89 * 86400000
  else if (preset.value === 'custom' && customRange.value?.length === 2) {
    start = Number(customRange.value[0])
    return {
      start_at: String(start),
      end_at: String(Number(customRange.value[1])),
      unit: 'day',
      limit: 10
    }
  }
  return {
    start_at: String(start),
    end_at: String(end),
    unit,
    limit: 10
  }
}

async function loadWebsites() {
  const res = await analyticsApi.listWebsites()
  if (res.status) {
    websites.value = res.data || []
    if (!websiteId.value && websites.value.length) {
      websiteId.value = websites.value[0].websiteId
    }
  }
}

function formatChartLabel(t, unit) {
  if (unit === 'hour') {
    const m = String(t).match(/(\d{2}):00:00/)
    if (m) {
      const h = Number(m[1])
      const h12 = h % 12 || 12
      const ampm = h >= 12 ? 'PM' : 'AM'
      return `${h12}:00 ${ampm}`
    }
  }
  return String(t).slice(5, 10)
}

function renderChart(pageviews = [], sessions = [], unit = 'day') {
  if (!chartRef.value) return
  if (!pvChart) pvChart = echarts.init(chartRef.value)

  // chart series colors for visitors vs pageviews
  const visitorColor = 'rgba(38, 128, 235, 0.65)'
  const viewsColor = 'rgba(38, 128, 235, 0.35)'
  const viewsFull = pageviews.map(i => i.y || 0)
  const visitors = sessions.map(i => i.y || 0)

  pvChart.setOption(
    {
      color: [visitorColor, viewsColor],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: '#e1e1e1',
        borderWidth: 1,
        textStyle: { color: '#2c2c2c', fontSize: 13 },
        formatter(params) {
          const list = Array.isArray(params) ? params : [params]
          const idx = list[0]?.dataIndex ?? 0
          const title = formatChartLabel(pageviews[idx]?.t || '', unit)
          return [
            title,
            `访客: ${visitors[idx] || 0}`,
            `浏览量: ${viewsFull[idx] || 0}`
          ].join('<br/>')
        }
      },
      legend: {
        data: [
          { name: '访客', itemStyle: { color: visitorColor } },
          { name: '浏览量', itemStyle: { color: viewsColor } }
        ],
        bottom: 0,
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: '#6e6e6e', fontSize: 13 }
      },
      grid: { left: 48, right: 16, top: 16, bottom: 48 },
      xAxis: {
        type: 'category',
        data: pageviews.map(i => formatChartLabel(String(i.t), unit)),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e1e1e1' } },
        axisLabel: {
          color: '#8e8e8e',
          fontSize: 12,
          interval: unit === 'hour' ? 1 : 'auto',
          hideOverlap: true
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: { lineStyle: { color: '#f5f5f5' } },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#8e8e8e', fontSize: 12 }
      },
      series: [
        {
          name: '访客',
          type: 'bar',
          stack: 'total',
          barMaxWidth: 28,
          barCategoryGap: '28%',
          itemStyle: { color: visitorColor, borderRadius: 0 },
          data: visitors
        },
        {
          name: '浏览量',
          type: 'bar',
          stack: 'total',
          barMaxWidth: 28,
          itemStyle: { color: viewsColor, borderRadius: [2, 2, 0, 0] },
          // 堆叠：上方段 = 浏览量 - 访客，柱高合计 = 浏览量
          data: viewsFull.map((v, idx) => Math.max(0, v - (visitors[idx] || 0)))
        }
      ]
    },
    true
  )
}

function renderCountryChart(list = []) {
  if (!countryChartRef.value) return
  if (!countryChart) countryChart = echarts.init(countryChartRef.value)
  countryChart.setOption({
    color: ['#2680eb', '#5aa2f0', '#8bbff5', '#b3d4f8', '#d6e9fb'],
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '68%'],
        center: ['50%', '52%'],
        label: { color: '#6e6e6e' },
        data: (list.length ? list : [{ name: '暂无数据', value: 0 }]).map(
          i => ({
            name: countryMap[i.x] || i.x || i.name,
            value: i.y ?? i.value
          })
        )
      }
    ]
  })
}

async function loadActive() {
  if (!websiteId.value) return
  const res = await analyticsApi.getActive(websiteId.value)
  if (res.status) {
    activeUsers.value = res.data?.[0]?.x || 0
  }
}

async function refresh() {
  if (!websiteId.value) return
  loadingStats.value = true
  const params = rangeParams()
  try {
    const [
      statsRes,
      pvRes,
      urlRes,
      refRes,
      browserRes,
      osRes,
      deviceRes,
      countryRes
    ] = await Promise.all([
      analyticsApi.getStats(websiteId.value, params),
      analyticsApi.getPageviews(websiteId.value, params),
      analyticsApi.getMetrics(websiteId.value, { ...params, type: 'url' }),
      analyticsApi.getMetrics(websiteId.value, {
        ...params,
        type: 'referrer'
      }),
      analyticsApi.getMetrics(websiteId.value, {
        ...params,
        type: 'browser'
      }),
      analyticsApi.getMetrics(websiteId.value, { ...params, type: 'os' }),
      analyticsApi.getMetrics(websiteId.value, {
        ...params,
        type: 'device'
      }),
      analyticsApi.getMetrics(websiteId.value, {
        ...params,
        type: 'country'
      })
    ])

    if (!statsRes.status) {
      showTips('error', statsRes.msg)
      return
    }
    statsRaw.value = statsRes.data
    pages.value = urlRes.data || []
    referrers.value = refRes.data || []
    browsers.value = browserRes.data || []
    osList.value = osRes.data || []
    devices.value = deviceRes.data || []
    countries.value = countryRes.data || []

    await nextTick()
    renderChart(
      pvRes.data?.pageviews || [],
      pvRes.data?.sessions || [],
      params.unit || 'day'
    )
    renderCountryChart(countries.value)
    if (view.value) await loadDetail()
  } finally {
    loadingStats.value = false
  }
}

async function loadDetail() {
  if (!websiteId.value || !view.value) return
  const params = { ...rangeParams(), type: view.value, limit: 100 }
  const res = await analyticsApi.getMetrics(websiteId.value, params)
  detailRows.value = res.data || []
}

function openView(key) {
  view.value = key
}

function onPresetChange() {
  if (preset.value !== 'custom') refresh()
}

function onWebsiteChange() {
  view.value = ''
  refresh()
  loadActive()
}

function goConfig() {
  router.push('/home/logs/website')
}

function resize() {
  pvChart?.resize()
  countryChart?.resize()
}

watch(view, async v => {
  if (v) await loadDetail()
})

onMounted(async () => {
  await loadWebsites()
  const qid = Number(route.query.websiteId)
  if (qid && websites.value.some(w => w.websiteId === qid)) {
    websiteId.value = qid
  }
  await refresh()
  await loadActive()
  activeTimer = setInterval(loadActive, 60000)
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  clearInterval(activeTimer)
  window.removeEventListener('resize', resize)
  pvChart?.dispose()
  countryChart?.dispose()
})
</script>

<style scoped lang="less">
@import '@/assets/styles/analytics-dashboard.less';

.website-header {
  min-height: 90px;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 60px;
  flex-wrap: wrap;
}

.site-title {
  font-size: 24px;
  font-weight: 600;
  line-height: 60px;
}

.site-select {
  min-width: 220px;

  :deep(.el-input__wrapper) {
    box-shadow: none !important;
    padding-left: 0;
    background: transparent;
  }

  :deep(.el-select__selected-item),
  :deep(.el-select__placeholder) {
    font-size: 24px !important;
    font-weight: 600;
    color: var(--analytics-gray900) !important;
  }

  :deep(.el-select__caret) {
    color: var(--analytics-gray600);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.active-users {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: var(--analytics-gray900);

  &.muted {
    color: var(--analytics-gray600);
  }

  strong {
    font-weight: 600;
    margin-right: 4px;
  }
}

.dot-wrap {
  background: var(--analytics-gray50);
  margin-right: 10px;
  border-radius: 100%;
  display: inline-flex;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 100%;
  background: var(--analytics-green-light);

  &.off {
    background: var(--analytics-gray400);
  }
}

.analytics-btn {
  border: 0;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  background: transparent;

  &.icon {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    background: var(--analytics-gray100);
    color: var(--analytics-gray900);
    font-size: 16px;
    line-height: 1;

    &:hover {
      background: var(--analytics-gray200);
    }
  }

  &.link {
    color: var(--analytics-primary);
    font-size: 14px;
    font-weight: 600;
    padding: 0 4px;

    &:hover {
      color: var(--analytics-primary-dark);
    }
  }
}

.metrics {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 0 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.metrics-bar {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  flex: 1;
  min-width: 0;
  min-height: 0;

  :deep(.metric-card) {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 1100px) {
  .metrics-bar {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .metrics-bar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.filter {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}

.date-select {
  min-width: 160px;
}

.chart {
  margin-bottom: 30px;
}

.pageviews-chart {
  height: 400px;
}

.section-title {
  font-weight: 600;
  font-size: 16px;
  line-height: 40px;
}

.country-chart {
  height: 360px;
}

.grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid var(--analytics-gray300);
  min-height: 430px;

  &.three {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.grid-col {
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--analytics-gray300);
  padding: 20px;
  min-width: 0;

  &:first-child {
    border-left: 0;
    padding-left: 0;
  }

  &:last-child {
    padding-right: 0;
  }
}

.view {
  border-top: 1px solid var(--analytics-gray300);
}

.drill-layout {
  display: flex;
  min-height: 600px;
}

.drill-menu {
  width: 200px;
  padding: 30px 0;
  font-size: 14px;
  flex-shrink: 0;

  .back {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 8px;
    cursor: pointer;
    color: var(--analytics-primary);
    font-weight: 600;

    &:hover {
      color: var(--analytics-primary-dark);
    }
  }

  .menu-item {
    padding: 8px 12px;
    cursor: pointer;
    color: var(--analytics-gray900);
    border-radius: 4px;

    &:hover {
      background: var(--analytics-gray100);
    }

    &.active {
      color: var(--analytics-primary);
      font-weight: 600;
      background: var(--analytics-gray100);
    }
  }
}

.drill-content {
  flex: 1;
  position: relative;
  border-left: 1px solid var(--analytics-gray300);
  padding: 20px 0 20px 30px;
  margin-left: 30px;
  min-height: 600px;
}

@media (max-width: 992px) {
  .metrics {
    flex-direction: column;
    align-items: stretch;
  }

  .metrics-bar {
    justify-content: space-between;
    overflow: auto;
  }

  .filter {
    display: block;
  }

  .grid-row,
  .grid-row.three {
    grid-template-columns: 1fr;
    border: 0;
  }

  .grid-col {
    border-top: 1px solid var(--analytics-gray300);
    border-left: 0;
    padding: 20px 0;

    &:first-child,
    &:last-child {
      padding-left: 0;
      padding-right: 0;
    }
  }

  .drill-layout {
    flex-direction: column;
    height: auto;
  }

  .drill-menu {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 16px 0;
    border-bottom: 1px solid var(--analytics-gray300);
  }

  .drill-content {
    border-left: 0;
    border-top: 1px solid var(--analytics-gray300);
    padding-left: 0;
    margin-left: 0;
  }
}
</style>
