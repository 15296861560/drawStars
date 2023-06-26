<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2023-06-25 23:30:28
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-26 23:38:46
-->
<template>
  <div :id="echartId" :style="{ width: width, height: height }"></div>
</template>

<script>
import { echartMixin } from "../mixin/echartMixin";
export default {
  mixins: [echartMixin],
  methods: {
    initData(newVal) {
      this.option = {
        series: [
          {
            type: "gauge",
            // 仪表盘轴线相关配置
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
            // 仪表盘指针
            pointer: {
              itemStyle: {
                color: "inherit",
              },
            },
            // 刻度样式
            axisTick: {
              distance: -30,
              length: 8,
              lineStyle: {
                color: "#fff",
                width: 2,
              },
            },
            // 分隔线样式
            splitLine: {
              distance: -30,
              length: 30,
              lineStyle: {
                color: "#fff",
                width: 4,
              },
            },
            // 刻度标签
            axisLabel: {
              color: "inherit",
              distance: 40,
              fontSize: 20,
            },
            // 仪表盘详情，用于显示数据
            detail: {
              valueAnimation: true,
              formatter: "{value} " + newVal.unit,
              color: "inherit",
            },
            data: newVal.data,
            // data: [
            //   {
            //     value: newVal.data || 0,
            //   },
            // ],
          },
        ],
      };
    },
  },
};
</script>
