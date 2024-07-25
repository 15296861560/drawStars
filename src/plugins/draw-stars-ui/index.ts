import type { App } from "vue";

const DrawStartsUI = require("draw-stars-ui");
export default (app: App<Element>) => {
  app.use(DrawStartsUI);
};
