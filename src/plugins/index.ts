/**
 * 加载 插件 主入口
 * */
import router from '@/router'
import installStore from '@/plugins/pinia'
import installElementPlus from '@/plugins/element-plus'
import installDrawStartsUI from '@/plugins/draw-stars-ui'
import installNotify from '@/plugins/drawstarts-notify'
import installEcharts from '@/plugins/echarts'
import installLeaflet from '@/plugins/leaflet'
// @ts-ignore
import i18n from '@/lang/index.js'
import Particles from 'particles.vue3'
// 自定义指令
import installDirectives from '@/utils/directives'
import { applySkipLoginSession, isSkipLoginMode } from '@/config/skip-login'

// 配置埋点
import '@/plugins/umami/umami.js'
import { installTracker } from '@/plugins/tracker'
// 加载高德地图
import '@/plugins/amap/index.js'

// 消除新特性的告警信息
import 'default-passive-events'
import * as _Vue from 'vue'

export default (app: _Vue.App<Element>) => {
  app.use(router)
  app.use(i18n)
  app.use(Particles)

  installStore(app)
  installTracker()
  if (isSkipLoginMode()) {
    applySkipLoginSession()
  }
  installElementPlus(app)
  installDrawStartsUI(app)
  installNotify(app)
  installEcharts(app)
  installLeaflet(app)
  installDirectives(app)
}
