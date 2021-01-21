<template>
  <div>
    <div id="echart-pie" class="m-echart-standard"></div>
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
        title: {
          text: "某站点用户访问来源",
          subtext: "纯属虚构",
          left: "center",
          top:"20"
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)",
        },
        legend: {
          orient: "vertical",
          left: "20",
          top:"20"
        },
        series: [
          {
            name: "访问来源",
            type: "pie",
            radius: "50%",
            data: [
              { value: 1048, name: "搜索引擎" },
              { value: 735, name: "直接访问" },
              { value: 580, name: "邮件营销" },
              { value: 484, name: "联盟广告" },
              { value: 300, name: "视频广告" },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      },

      statisticalData: [120, 200, 150, 80, 70, 110, 130],
    };
  },
  methods: {
    paint() {
      this.initData();

      // 基于准备好的dom，初始化echarts实例
      this.myChart = echarts.init(document.getElementById("echart-pie"));
      // 绘制图表
      this.myChart.setOption(this.option);
    },
    initData() {
      // this.option.xAxis.data = this.XData;
      // this.option.series[0].data = this.statisticalData;
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
