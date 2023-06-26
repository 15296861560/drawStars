/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 14:38:02
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-26 22:43:25
 */
import {
  markRaw
} from 'vue'

export const echartMixin = {
  props: {
    echartId: {
      type: String,
    },
    chartData: {
      type: Object,
      default: null,
    },
    width: {
      type: String,
      default: "",
    },
    height: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      myChart: null,
      option: {},
    }
  },
  methods: {
    //初始化图表
    paint() {
      if (this.chartData) this.initData(this.chartData);
      // 基于准备好的dom，初始化echarts实例
      this.myChart = markRaw(this.$echarts.init(document.getElementById(this.echartId)))
      //setOption使用方式:
      // chart.setOption(option, notMerge, lazyUpdate); ||
      // chart.setOption(option, {
      //   notMerge: ...,
      //   lazyUpdate: ...,
      //   silent: ...
      // }); ||
      //     chart.setOption(option, {
      //       replaceMerge: ['xAxis', 'yAxis', 'series']
      //   });
      // 参数说明:
      // notMerge: boolean
      // 可选。是否不跟之前设置的 option 进行合并。默认为 false。即表示合并。合并的规则，详见 组件合并模式。如果为 true，表示所有组件都会被删除，然后根据新 option 创建所有新组件。
      // replaceMerge: string | string[]
      // 可选。用户可以在这里指定一个或多个组件，如：xAxis, series，这些指定的组件会进行 "replaceMerge"。如果用户想删除部分组件，也可使用 "replaceMerge"。详见 组件合并模式。
      // lazyUpdate: boolean
      // 可选。在设置完 option 后是否不立即更新图表，默认为 false，即同步立即更新。如果为 true，则会在下一个 animation frame 中，才更新图表。
      // silent: boolean
      // 可选。阻止调用 setOption 时抛出事件，默认为 false，即抛出事件。
      // 绘制图表
      this.myChart.setOption(this.option, true);
    },
    // 重绘(更新数据)
    repaint(newVal) {
      this.initData(newVal);
      this.myChart.setOption(this.option, true);
    },
    initData(newVal) {
      this.option = newVal;
    },
    resizeChart() {
      if (this.myChart) {
        this.myChart.resize();
      }
    },
  },
  watch: {
    chartData: {
      handler(newVal) {
        if (newVal) this.repaint(newVal);
      },
      deep: true, //打开深度监听
    },
  },
  mounted() {
    this.paint();
    // 监听窗口发生变化，resize组件
    window.addEventListener("resize", this.resizeChart);
  },
  beforeDestroy() {
    //释放myChart实例
    if (this.myChart) this.myChart.clear();
    // 并取消监听事件
    window.removeEventListener("resize", this.resizeChart);
  },
}