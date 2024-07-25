/**
 * 加载 pinia、persist  （persist: 数据持久化插件）
 * */
import type { App } from "vue";
import { createPinia } from "pinia";
// 使 Pinia 持久化的插件
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

export default (app: App<Element>) => {
  app.use(createPinia().use(piniaPluginPersistedstate));
};
