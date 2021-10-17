export const echartViewsMixin = {
  data() {
    return {
      myChart: null,
    }
  },
  methods: {
    resizeChart() {
      if (this.myChart) {
        this.myChart.resize();
      }
    },
  },
  mounted() {
    this.paint();
    // 监听窗口发生变化，resize组件
    window.addEventListener("resize", this.resizeChart);
  },
  beforeDestroy() {
    //释放myChart实例
    this.myChart.clear();
    // 并取消监听事件
    window.removeEventListener("resize", this.resizeChart);
  },
}
