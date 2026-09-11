<template>
  <div class="im-mg-analytics">
    <el-row :gutter="16">
      <el-col :span="6" v-for="card in cards" :key="card.title">
        <el-card shadow="hover" v-loading="loading">
          <div class="im-mg-stat-title">{{ card.title }}</div>
          <div class="im-mg-stat-value">{{ card.value }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-card shadow="hover" style="margin-top:16px">
      <div class="im-mg-chart-title">消息量趋势（近 {{ days }} 天）</div>
      <div ref="trendChart" class="im-mg-chart-box"></div>
    </el-card>
    <el-card shadow="hover" style="margin-top:16px">
      <div class="im-mg-chart-title">活跃房间榜</div>
      <el-table :data="roomRank" size="small" border>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="title" label="房间" />
        <el-table-column prop="msgCount" label="消息数" width="120" />
        <el-table-column prop="onlineCount" label="在线" width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { adminApi } from '@/api/im'

const loading = ref(false)
const days = ref(7)
const cards = ref([
  { title: '消息总量', value: 0 },
  { title: '今日新建房间', value: 0 },
  { title: '活跃房间', value: 0 },
  { title: '待处理举报', value: 0 }
])
const trendChart = ref<HTMLElement | null>(null)
const roomRank = ref<any[]>([])
let chart: echarts.ECharts | null = null

async function load() {
  loading.value = true
  try {
    const [ov, tr, rr] = await Promise.all([
      adminApi.analyticsOverview(),
      adminApi.analyticsTrends(days.value),
      adminApi.analyticsRooms()
    ])
    if (ov.status && ov.data) {
      const d = ov.data
      cards.value = [
        { title: '消息总量', value: d.msgCount ?? 0 },
        { title: '今日新建房间', value: d.roomCreateToday ?? 0 },
        { title: '活跃房间', value: d.activeRooms ?? 0 },
        { title: '待处理举报', value: d.pendingReports ?? 0 }
      ]
    }
    if (rr.status && rr.data?.list) roomRank.value = rr.data.list
    await nextTick()
    renderTrend(tr.status ? tr.data?.list || [] : [])
  } finally {
    loading.value = false
  }
}

function renderTrend(list: Array<{ date: string; count: number }>) {
  if (!trendChart.value) return
  if (!chart) chart = echarts.init(trendChart.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: list.map(i => i.date) },
    yAxis: { type: 'value' },
    series: [{ name: '消息量', type: 'bar', data: list.map(i => i.count), itemStyle: { color: '#4C5EDB' } }]
  })
}

onMounted(load)
onBeforeUnmount(() => {
  chart?.dispose()
  chart = null
})
</script>

<style scoped lang="less">
.im-mg-analytics { padding: 16px; }
.im-mg-stat-title { font-size: 13px; color: @color-text-placeholder; }
.im-mg-stat-value { font-size: 26px; font-weight: 600; margin-top: 6px; color: @color-primary; }
.im-mg-chart-title { font-size: 14px; font-weight: 500; margin-bottom: 10px; color: @color-text-normal; }
.im-mg-chart-box { height: 280px; }
</style>
