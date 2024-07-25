/**消息通知能力 */
import type { App } from "vue";
import { notifyClient } from "drawstarts-notify";

export default (app: App<Element>) => {
  app.config.globalProperties.$notify = notifyClient;
};
