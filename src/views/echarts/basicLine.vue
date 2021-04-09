<template>
  <div>
    <div id="echart-line" class="m-echart-standard"></div>
  </div>
</template>

<script>

export default {
  props: {
    chartData: Array,
  },
  data() {
    return {
      myChart: null,
      option: {
        xAxis: {
          type: "category",
          data: [],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: [],
            type: "line",
          },
        ],
      },

      XData: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],

      statisticalData: [120, 200, 150, 80, 70, 110, 130],
    };
  },
  methods: {
    paint() {
      this.initData();

      // 基于准备好的dom，初始化echarts实例
      this.myChart = this.$echarts.init(document.getElementById("echart-line"));
      // 绘制图表
      this.myChart.setOption(this.option);
    },
    initData() {
      this.option.xAxis.data = this.XData;
      this.option.series[0].data = this.statisticalData;
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
};
</script>
