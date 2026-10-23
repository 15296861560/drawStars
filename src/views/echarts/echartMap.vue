<!--
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:23
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-04 00:18:59
-->
<template>
  <div>
    <e-map
      echartId="echart-e-map"
      :chartData="mapData"
      height="80vh"
      width="80vw"
      class="m-echart-standard"
    ></e-map>
  </div>
</template>

<script>
import EMap from '@/components/echarts/EMap.vue'

// 各省份本月发货量（件）——固定示例数据，保证排名与色阶稳定
const PROVINCE_ORDERS = {
  广东: 208000,
  江苏: 196000,
  山东: 187000,
  浙江: 175000,
  河南: 168000,
  四川: 142000,
  湖北: 121000,
  福建: 118000,
  湖南: 113000,
  河北: 105000,
  上海: 98000,
  安徽: 92000,
  北京: 86000,
  辽宁: 72000,
  江西: 65000,
  陕西: 58000,
  广西: 55000,
  重庆: 52000,
  天津: 46000,
  云南: 44000,
  黑龙江: 41000,
  吉林: 36000,
  山西: 33000,
  贵州: 30000,
  内蒙古: 26000,
  新疆: 21000,
  甘肃: 17000,
  海南: 12000,
  宁夏: 8000,
  青海: 3500,
  西藏: 1800,
  台湾: 1500,
  香港: 900,
  澳门: 400
}

export default {
  components: {
    EMap
  },
  data() {
    return {
      mapData: {
        title: '全国发货分布',
        subtext: '示例数据 · 各省份本月发货量（件）',
        data: Object.entries(PROVINCE_ORDERS).map(([name, value]) => ({
          name,
          value
        }))
      }
    }
  }
}
</script>
