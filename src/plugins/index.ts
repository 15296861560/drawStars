/**
 * 加载 插件 主入口
 * */
import type { App } from "vue";
import router from "@/router";
import installStore from "@/plugins/pinia";
import installElementPlus from "@/plugins/element-plus";
import installDrawStartsUI from "@/plugins/draw-stars-ui";
import installNotify from "@/plugins/drawstarts-notify";
import installEcharts from "@/plugins/echarts";
import installLeaflet from '@/plugins/leaflet'
// @ts-ignore
import i18n from "@/lang/index.js";
import Particles from "particles.vue3";
// 自定义指令
import installDirectives from "@/utils/directives/index.js";

// 配置埋点
import "@/plugins/umami/umami.js";
// 加载高德地图
import "@/plugins/amap/index.js";

// 消除新特性的告警信息
import "default-passive-events";

export default (app: App<Element>) => {
  app.use(router);
  app.use(i18n);
  app.use(Particles);

  installStore(app);
  installElementPlus(app);
  installDrawStartsUI(app);
  installNotify(app);
  installEcharts(app);
  installLeaflet(app);
  installDirectives(app);
};
