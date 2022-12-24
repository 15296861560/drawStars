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
import DynamicOrderBar from "@/components/echarts/DynamicOrderBar.vue";
import Mock from "mockjs";

export default {
  components: {
    DynamicOrderBar,
  },
  data() {
    return {
      barData: {
        title: "标题",
        symbol: ["none", "arrow"],
        yAxis: {
          data: ["游戏A", "游戏B", "游戏C", "游戏D", "游戏E"],
        },
        series: [{ data: [120, 200, 150, 110, 130] }],
      },
      dataTimer: null, //更新数据定时器
      updateTimes: 10, //更新频率
    };
  },
  methods: {
    initData() {
      if (this.dataTimer) {
        clearInterval(this.dataTimer);
      }
      this.dataTimer = setInterval(() => {
        this.updateData();
      }, this.updateTimes * 1000);
    },
    //模拟更新数据
    updateData() {
      let data = this.barData.series[0].data;
      data.forEach((element, index, arr) => {
        arr[index] = Mock.mock({
          "number|0-250": 1,
        }).number;
      });
      this.barData.series[0].data = [];
      this.barData.series[0].data = data;
    },
  },
  mounted() {
    this.initData();
  },
  beforeDestroy() {
    clearInterval(this.dataTimer);
  },
};
</script>
