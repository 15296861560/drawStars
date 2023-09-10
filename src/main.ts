/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 21:55:05
 * @LastEditors: lgy
 * @LastEditTime: 2023-09-03 21:09:33
 */
import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import DrawStartsUI from "draw-stars-ui";

// echarts图表
import * as echarts from "echarts";

//lodash工具库
import * as _ from 'lodash';

//多语言
// @ts-ignore
import i18n from "./lang/index.js";

import Particles from 'particles.vue3'

// 消除新特性的告警信息
import 'default-passive-events'

// 自定义指令
// @ts-ignore
import directives from "@/utils/directives/index.js";

// 使 Pinia 持久化的插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

//配置埋点
import '@/assets/js/umami/umami.js'

//消息通知能力
// @ts-ignore
import { notifyClient } from 'drawstarts-notify';



const app = createApp(App);


app.use(createPinia().use(piniaPluginPersistedstate));


app.use(router);

app.use(ElementPlus);
app.use(DrawStartsUI);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(i18n);

app.use(Particles);

directives(app)

app.config.globalProperties.$echarts = echarts;
app.config.globalProperties.$notify = notifyClient;


app.mount("#app");
