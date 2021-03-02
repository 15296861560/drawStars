<template>
  <div>
    <div :id="echartId" class="m-echart-components"></div>
  </div>
</template>

<script>
var echarts = require("echarts");

export default {
  props: {
    chartData: Object,
    echartId: String,
  },
  data() {
    return {
      myChart: null,
      option: {},
    };
  },
  methods: {
    paint() {
      this.initData();

      // 基于准备好的dom，初始化echarts实例
      this.myChart = echarts.init(document.getElementById(this.echartId));
      // 绘制图表
      this.myChart.setOption(this.option, true); //第二个参数，可选，是否不跟之前设置的 option 进行合并，默认为 false，即合并。
    },
    // 重绘(更新数据)
    repaint() {
      let option = this.chartData;
      this.myChart.setOption(option, true);
    },
    initData() {
      this.option = this.chartData;
    },
  },
  watch: {
    chartData: {
      handler(newVal) {
        this.repaint();
      },
      deep: true, //打开深度监听
    },
  },
  mounted() {
    this.paint();
    //根据窗口的大小变动图表
    var that = this;
    window.onresize = function () {
      that.myChart.resize();
    };
  },
  beforeDestroy() {
    this.myChart.clear();
  },
};
</script>
