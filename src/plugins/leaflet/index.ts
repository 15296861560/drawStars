/**
 * 加载 leaflet 地图
 * */

import type { App } from "vue";
import L from "leaflet";

export default (app: App<Element>) => {
  app.use(L, { name: "L" });
};
