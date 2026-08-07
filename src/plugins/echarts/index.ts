import * as echarts from 'echarts'
import * as _Vue from 'vue'

export default (app: _Vue.App<Element>) => {
  app.config.globalProperties.$echarts = echarts
}
