/**echarts图表 */
import * as echarts from "echarts";
import type { App } from "vue";

export default (app: App<Element>) => {
  app.config.globalProperties.$echarts = echarts;
};
