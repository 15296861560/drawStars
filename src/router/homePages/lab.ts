/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-07 17:24:28
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-22 23:42:58
 */
/*实验室*/
export default [
  {
    path: "/home/labHomePage",
    name: "实验室",
    component: () => import("@/views/homePages/labHomePage.vue"),
    meta: {
      title: ["首页", "实验室"],
      keepAlive: true,
    },
  },
  {
    path: "/home/labHomePage/vueReactivity",
    name: "vue响应式原理",
    component: () => import("@/views/lab/vue-reactivity.vue"),
    meta: {
      title: ["首页", "实验室", "vue响应式原理"],
    },
  },
  {
    path: "/home/labHomePage/promise",
    name: "Primise简单使用",
    component: () => import("@/views/lab/promise.vue"),
    meta: {
      title: ["首页", "实验室", "Primise简单使用"],
    },
  },
  {
    path: "/home/labHomePage/webpack",
    name: "Webpack打包",
    component: () => import("@/views/lab/webpack/index.vue"),
    meta: {
      title: ["首页", "实验室", "Webpack打包"],
    },
  },
  {
    path: "/home/labHomePage/frame",
    name: "嵌入页",
    component: () => import("@/views/lab/frame/index.vue"),
    meta: {
      title: ["首页", "实验室", "嵌入页"],
    },
  },
  {
    path: "/home/labHomePage/directive",
    name: "指令",
    component: () => import("@/views/lab/directive.vue"),
    meta: {
      title: ["首页", "实验室", "指令"],
    },
  },
];
