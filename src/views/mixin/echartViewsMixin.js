export const echartViewsMixin = {
  data() {
    return {
      myChart: null
    }
  },
  methods: {
    resizeChart() {
      // rAF 合帧：resize 事件高频连发时避免多图表每事件同步重排
      // （与 echartMixin 同策略，见该文件内说明）
      if (this.myChart && !this._resizeFrame) {
        this._resizeFrame = requestAnimationFrame(() => {
          this._resizeFrame = null
          if (this.myChart) {
            this.myChart.resize()
          }
        })
      }
    }
  },
  mounted() {
    this.paint()
    // 监听窗口发生变化，resize组件
    window.addEventListener('resize', this.resizeChart)
  },
  activated() {
    // keep-alive 缓存页恢复显示时容器尺寸可能已变化
    this.resizeChart()
  },
  beforeUnmount() {
    if (this._resizeFrame) {
      cancelAnimationFrame(this._resizeFrame)
      this._resizeFrame = null
    }
    // dispose 才真正释放实例（clear 仅清画布，事件/内部结构会泄漏）
    if (this.myChart) {
      this.myChart.dispose()
      this.myChart = null
    }
    // 并取消监听事件
    window.removeEventListener('resize', this.resizeChart)
  }
}
