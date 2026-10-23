<!--
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:23
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-04 00:18:34
-->
<template>
  <div>
    <bar
      echartId="echart-bar"
      :chartData="barData"
      class="m-echart-standard"
    ></bar>
  </div>
</template>

<script>
import Bar from '@/components/echarts/Bar.vue'

export default {
  components: {
    Bar
  },
  data() {
    return {
      barData: {
        title: '销售渠道销量对比',
        subtext: '示例数据 · 最近一周',
        xAxis: {
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        series: [
          { name: '线上销量', data: [232, 243, 290, 310, 350, 480, 462] },
          { name: '线下销量', data: [186, 205, 232, 263, 264, 312, 298] }
        ]
      }
    }
  }
}
</script>
