<template>
  <div>
    <stackedBar
      echartId="stacked-bar"
      :chartData="stackedBarData"
      class="m-echart-standard"
    ></stackedBar>
  </div>
</template>

<script>
import StackedBar from '@/components/echarts/StackedBar.vue'

export default {
  components: {
    StackedBar
  },
  data() {
    return {
      stackedBarData: {
        title: '商品品类销售结构',
        subtext: '示例数据 · 最近六个月',
        yName: '销售额（万元）',
        xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
        series: [
          { name: '数码家电', data: [320, 302, 341, 374, 390, 450] },
          { name: '服饰鞋包', data: [230, 212, 251, 264, 280, 310] },
          { name: '美妆个护', data: [158, 172, 143, 185, 196, 214] },
          { name: '食品生鲜', data: [125, 118, 132, 141, 139, 152] },
          { name: '家居日用', data: [90, 98, 88, 102, 107, 118] }
        ]
      }
    }
  }
}
</script>
