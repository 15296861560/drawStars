/**
 * 加载 element-plus / icon
 * */
import type { App } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";

export default (app: App<Element>) => {
  app.use(ElementPlus, {
    locale: zhCn,
  });
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
}
