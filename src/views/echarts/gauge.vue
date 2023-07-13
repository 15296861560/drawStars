<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2023-06-25 23:30:28
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-26 22:44:28
-->
<template>
  <div>
    <div id="echart-gauge" class="m-echart-standard"></div>
  </div>
</template>

<script>
import { echartViewsMixin } from "../mixin/echartViewsMixin";
export default {
  mixins: [echartViewsMixin],
  data() {
    return {
      myChart: null,
      option: {
        series: [
          {
            type: "gauge",
            axisLine: {
              lineStyle: {
                width: 30,
                color: [
                  [0.3, "#67e0e3"],
                  [0.7, "#37a2da"],
                  [1, "#fd666d"],
                ],
              },
            },
            pointer: {
              itemStyle: {
                color: "inherit",
              },
            },
            axisTick: {
              distance: -30,
              length: 8,
              lineStyle: {
                color: "#fff",
                width: 2,
              },
            },
            splitLine: {
              distance: -30,
              length: 30,
              lineStyle: {
                color: "#fff",
                width: 4,
              },
            },
            axisLabel: {
              color: "inherit",
              distance: 40,
              fontSize: 20,
            },
            detail: {
              valueAnimation: true,
              formatter: "{value} km/h",
              color: "inherit",
            },
            data: [
              {
                value: 70,
              },
            ],
          },
        ],
      },
      timer: null,
    };
  },
  methods: {
    paint() {
      this.initData();

      // 基于准备好的dom，初始化echarts实例
      this.myChart = this.$echarts.init(document.getElementById("echart-gauge"));
      // 绘制图表
      this.myChart.setOption(this.option);

      this.timer = setInterval(() => {
        this.myChart.setOption({
          series: [
            {
              data: [
                {
                  value: +(Math.random() * 100).toFixed(2),
                },
              ],
            },
          ],
        });
      }, 2000);
    },
    initData() {
      this.option.series[0].data[0].value = 70;
    },
    beforeDestroy() {
      this.timer && clearInterval(this.timer);
    },
  },
};
</script>
