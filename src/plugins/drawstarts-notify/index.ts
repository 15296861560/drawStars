import { notifyClient } from 'drawstarts-notify'
import * as _Vue from 'vue'

export default (app: _Vue.App<Element>) => {
  app.config.globalProperties.$notify = notifyClient
}
