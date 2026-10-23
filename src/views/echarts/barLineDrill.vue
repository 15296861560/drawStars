<!--
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:23
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-04 00:19:19
-->
<template>
  <div>
    <div v-if="drillLevel === 'day'" class="drill-toolbar">
      <el-button size="small" @click="resetToMonth">返回月度视图</el-button>
    </div>
    <barLineDrill
      echartId="barLineDrill"
      :chartData="barLineData"
      class="m-echart-standard"
      @rp="handleDrill"
    ></barLineDrill>
  </div>
</template>

<script>
import BarLineDrill from '@/components/echarts/BarLineDrill.vue'

// 月度示例数据
const MONTH_NAMES = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月'
]
const MONTH_DOWNLOADS = [
  1260, 1180, 1420, 1560, 1640, 1520, 1830, 1790, 1950, 2080, 2330, 2620
]
const MONTH_RATES = [
  18.2, 17.5, 19.4, 20.1, 21.0, 20.4, 22.3, 21.8, 22.9, 23.6, 25.1, 26.4
]

// 每日权重曲线：用于把月度总量确定性地摊到 30 天（不随机漂移）
const DAY_WEIGHTS = [
  3.2, 2.9, 3.3, 2.8, 3.1, 3.6, 4.4, 3.5, 3.0, 3.4, 2.6, 3.5, 3.8, 4.1, 3.2,
  3.0, 3.3, 3.9, 4.6, 3.6, 3.1, 2.9, 3.4, 3.7, 4.2, 3.5, 3.0, 3.3, 3.1, 2.9
]

export default {
  components: {
    BarLineDrill
  },
  data() {
    return {
      // 当前下钻层级：month（月度）/ day（某月每日）
      drillLevel: 'month',
      currentMonth: '',
      monthNames: MONTH_NAMES,
      monthDownloads: MONTH_DOWNLOADS,
      monthRates: MONTH_RATES,
      barLineData: this.buildChartData(
        MONTH_NAMES,
        MONTH_DOWNLOADS,
        MONTH_RATES,
        {
          title: 'APP 下载人数与转化率',
          subtext: '示例数据 · 点击柱子可下钻查看每日明细'
        }
      )
    }
  },
  methods: {
    // 组装柱线混合图数据
    buildChartData(xAxis, downloads, rates, meta) {
      return {
        openLegend: true,
        barWidth: '35%',
        yNames: ['下载人数（人）', '转化率（%）'],
        xAxis,
        series: [
          { name: '下载人数', type: 'bar', data: downloads },
          { name: '转化率', type: 'line', data: rates }
        ],
        ...meta
      }
    },
    // 点击图元：月度层下钻到该月每日明细
    handleDrill(object) {
      if (this.drillLevel !== 'month') {
        return
      }
      const monthIndex = this.monthNames.indexOf(object.name)
      if (monthIndex === -1) {
        return
      }
      this.drillLevel = 'day'
      this.currentMonth = object.name
      this.barLineData = this.buildDailyData(monthIndex)
    },
    // 按固定权重曲线把月度总量摊到 30 天，转化率随权重围绕月度值波动
    buildDailyData(monthIndex) {
      const total = this.monthDownloads[monthIndex]
      const baseRate = this.monthRates[monthIndex]
      const weightSum = DAY_WEIGHTS.reduce((sum, weight) => sum + weight, 0)
      const avgWeight = weightSum / DAY_WEIGHTS.length

      const downloads = DAY_WEIGHTS.map(weight =>
        Math.round((total * weight) / weightSum)
      )
      const rates = DAY_WEIGHTS.map(
        weight => +(baseRate + (weight - avgWeight) * 1.8).toFixed(1)
      )

      return this.buildChartData(
        DAY_WEIGHTS.map((weight, index) => index + 1 + '日'),
        downloads,
        rates,
        {
          title: 'APP 下载人数与转化率 · ' + this.monthNames[monthIndex],
          subtext:
            '示例数据 · ' +
            this.monthNames[monthIndex] +
            '每日明细（单击返回可回到月度）'
        }
      )
    },
    // 返回月度视图
    resetToMonth() {
      this.drillLevel = 'month'
      this.currentMonth = ''
      this.barLineData = this.buildChartData(
        this.monthNames,
        this.monthDownloads,
        this.monthRates,
        {
          title: 'APP 下载人数与转化率',
          subtext: '示例数据 · 点击柱子可下钻查看每日明细'
        }
      )
    }
  }
}
</script>

<style scoped lang="less">
.drill-toolbar {
  margin-bottom: 12px;
}
</style>
