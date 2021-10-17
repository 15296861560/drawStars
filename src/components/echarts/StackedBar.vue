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
      newVal.series.forEach((item) => {
        //柱样式
        if (!item.itemStyle) {
          item.itemStyle = {
            barBorderRadius: 0,
          };
        }
        //柱宽度
        if (!item.barWidth) {
          item.barWidth = "15px";
        }
      });

      this.option = {
        color: newVal.color ? newVal.color : ["#03E4F6", "#2E86F2", "#E99936"],
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
            label: {
              show: true,
            },
          },
        },
        legend: newVal.legend,
        grid: {
          show: false,
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            data: newVal.xAxis,
            //坐标轴轴线相关设置
            axisLine: {
              show: false,
            },
            // 坐标轴刻度相关设置
            axisTick: {
              show: false,
            },
            // 坐标轴刻度标签的相关设置
            axisLabel: {
              show: true,
              textStyle: {
                color: "aqua", //X轴文字颜色
                fontSize: 11,
              },
            },
          },
        ],
        yAxis: [
          {
            type: "value",
            axisLine: {
              lineStyle: {
                color: "aqua",
                width: 0, //不显示y轴
              },
            },
            //坐标轴在 grid 区域中的分隔线。
            splitLine: {
              show: true,
            },
            // 坐标轴刻度相关设置
            axisTick: {
              show: false,
            },
          },
        ],
        series: newVal.series,
      };
    },
  },
};
</script>
