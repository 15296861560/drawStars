<!-- 头部 -->
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
        // color: ["#02FCFB"],
        // 提示框
        tooltip: {
          trigger: "item",
          formatter: newVal.tooltip + "<br/>{a}：{c}%",
        },
        //标题
        title: {
          text: newVal.data + "%",
          subtext: newVal.tooltip,
          textStyle: {
            color: "aqua",
            fontSize: 32,
            fontWeight: "bold",
            fontFamily: this.fontFamily,
          },
          subtextStyle: {
            color: "aqua",
            fontSize: 24,
            fontWeight: "bold",
            fontFamily: this.fontFamily,
          },
          left: "center",
          top: "center",
        },
        angleAxis: {
          max: 100,
          show: false,
        },
        radiusAxis: {
          type: "category",

          axisLine: {
            show: false,
          },
        },
        polar: {
          radius: "100%",
          center: ["50%", "50%"],
        },
        series: [
          {
            type: "bar",
            data: newVal.data,
            showBackground: true,
            // 该系列使用的坐标系
            coordinateSystem: "polar",
            name: newVal.name,
            stack: "a",
            roundCap: true,
            barWidth: 12,
            itemStyle: {
              barBorderRadius: 10,
              color: "#02FCFB",
            },
          },
        ],
      };
    },
  },
};
</script>
