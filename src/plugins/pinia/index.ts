/**
 * 加载 pinia、persist  （persist: 数据持久化插件）
 * */
import { createPinia } from 'pinia'
// 使 Pinia 持久化的插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import * as _Vue from 'vue'

export default (app: _Vue.App<Element>) => {
  app.use(createPinia().use(piniaPluginPersistedstate))
}
