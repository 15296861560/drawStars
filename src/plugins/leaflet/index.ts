/**
 * 加载 leaflet 地图
 * */

import L from 'leaflet'
import * as _Vue from 'vue'

export default (app: _Vue.App<Element>) => {
  app.use(L, { name: 'L' })
}
