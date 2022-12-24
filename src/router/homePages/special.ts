/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-07 17:24:28
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-27 00:13:41
 */
/*特效模块*/
export default [
  {
    path: "/home/specialHomePage",
    name: "特效模块",
    component: () => import("@/views/homePages/specialHomePage.vue"),
    meta: {
      title: ["首页", "特效模块"],
      keepAlive: true,
    },
  },
  {
    path: "/home/specialHomePage/transition",
    name: "过渡",
    component: () => import("@/views/specials/transition.vue"),
    meta: {
      title: ["首页", "特效模块", "过渡"],
    },
  },
  {
    path: "/home/specialHomePage/animation",
    name: "动画",
    component: () => import("@/views/specials/animation.vue"),
    meta: {
      title: ["首页", "特效模块", "动画"],
    },
  },
  {
    path: "/home/specialHomePage/words",
    name: "文字",
    component: () => import("@/views/specials/words.vue"),
    meta: {
      title: ["首页", "特效模块", "文字"],
    },
  },
  {
    path: "/home/specialHomePage/drag",
    name: "拖拽",
    component: () => import("@/views/specials/drag.vue"),
    meta: {
      title: ["首页", "特效模块", "拖拽"],
    },
  },
];
