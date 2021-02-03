<template>
  <div>
    <div id="echart-area" class="m-echart-standard"></div>
  </div>
</template>

<script>
var echarts = require("echarts");

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
          boundaryGap: false,
          data: [],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: [],
            type: "line",
            areaStyle: {
              color: {},
            },
          },
        ],
      },

      XData: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],

      statisticalData: [120, 200, 150, 80, 70, 110, 130],

      // color: "rgba(190,20,128,0.5)" },
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: "#56ad66" },
        { offset: 0.5, color: "rgba(98, 199, 98, 0.3)" },
        { offset: 1, color: "rgba(98, 199, 98, 0.1)" },
      ]),
    };
  },
  methods: {
    paint() {
      this.initData();

      // 基于准备好的dom，初始化echarts实例
      this.myChart = echarts.init(document.getElementById("echart-area"));
      // 绘制图表
      this.myChart.setOption(this.option);
    },
    initData() {
      this.option.xAxis.data = this.XData;
      this.option.series[0].data = this.statisticalData;
      this.option.series[0].areaStyle.color = this.color;
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
