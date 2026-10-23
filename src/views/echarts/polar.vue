<!--
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:23
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-04 00:18:49
-->
<template>
  <div>
    <polar
      echartId="polar"
      :chartData="polarData"
      class="m-echart-standard"
    ></polar>
  </div>
</template>

<script>
import Polar from '@/components/echarts/Polar.vue'

export default {
  components: {
    Polar
  },
  data() {
    return {
      polarData: {
        title: '季度销售目标达成率',
        subtext: '示例数据 · 2026 年 Q4',
        tooltip: '达成率',
        data: 86.4,
        name: '已达成'
      }
    }
  }
}
</script>
