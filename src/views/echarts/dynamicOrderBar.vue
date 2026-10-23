<!--
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:23
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-04 00:19:08
-->
<template>
  <div>
    <dynamicOrderBar
      echartId="dynamicOrderBar"
      :chartData="barData"
      class="m-echart-standard"
    ></dynamicOrderBar>
  </div>
</template>

<script>
import DynamicOrderBar from '@/components/echarts/DynamicOrderBar.vue'
import Mock from 'mockjs'

export default {
  components: {
    DynamicOrderBar
  },
  data() {
    return {
      barData: {
        title: '城市活跃用户榜',
        subtext: '示例数据 · 每 3 秒刷新一次排名',
        showCount: 5,
        seriesName: '活跃人数',
        yAxis: ['上海', '北京', '深圳', '广州', '杭州', '成都', '武汉', '南京'],
        series: [
          { data: [82400, 78200, 75600, 68900, 64100, 59300, 55200, 51800] }
        ]
      },
      dataTimer: null, // 更新数据定时器
      updateTimes: 3 // 更新间隔（秒）
    }
  },
  methods: {
    initData() {
      if (this.dataTimer) {
        clearInterval(this.dataTimer)
      }
      this.dataTimer = setInterval(() => {
        this.updateData()
      }, this.updateTimes * 1000)
    },
    // 模拟更新各城市活跃人数后由图表自动重排
    updateData() {
      const data = this.barData.yAxis.map(
        () => Mock.mock({ 'number|50000-90000': 1 }).number
      )
      // 直接改 chartData.series：mixin 深度 watch 感知后 repaint，
      // 组件内 realtimeSort 会带自动重排动画刷新排名
      this.barData.series[0].data = data
    }
  },
  mounted() {
    this.initData()
  },
  beforeUnmount() {
    clearInterval(this.dataTimer)
  }
}
</script>
