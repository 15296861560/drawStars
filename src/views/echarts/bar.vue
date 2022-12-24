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
    <bar echartId="echart-bar" :chartData="barData" class="m-echart-standard"></bar>
  </div>
</template>

<script>
import Bar from "@/components/echarts/Bar.vue";

export default {
  components: {
    Bar,
  },
  data() {
    return {
      barData: {
        title: "标题",
        symbol: ["none", "arrow"],
        xAxis: {
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        series: [
          [120, 200, 150, 80, 70, 110, 130],
          [20, 20, 50, 80, 70, 10, 30],
        ],
      },
    };
  },
};
</script>
