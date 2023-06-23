/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-07 17:24:28
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-24 00:54:50
 */
/*例子*/
export default [
  {
    path: "/home/caseHomePage",
    name: "例子",
    component: () => import("@/views/homePages/caseHomePage.vue"),
    meta: {
      title: ["首页", "例子"],
      keepAlive: true,
    },
  },
  {
    path: "/home/caseHomePage/boards",
    name: "看板",
    component: () => import("@/views/case/boards.vue"),
    meta: {
      title: ["首页", "例子", "看板"],
      keepAlive: true,
    },
  },
  {
    path: "/home/caseHomePage/demos",
    name: "演示",
    component: () => import("@/views/case/demos/index.vue"),
    meta: {
      title: ["首页", "例子", "演示"],
      keepAlive: true,
    },
    children: [
      {
        path: "/home/caseHomePage/demos/love",
        name: "爱心",
        component: () => import("@/views/case/demos/love/love.vue"),
        meta: {
          title: ["首页", "例子", "演示", "爱心"],
        },
      },
      {
        path: "/home/caseHomePage/demos/fireworks",
        name: "烟花",
        component: () => import("@/views/case/demos/fireworks/fireworks.vue"),
        meta: {
          title: ["首页", "例子", "演示", "烟花"],
        },
      },
      {
        path: "/home/caseHomePage/demos/skystar",
        name: "星空",
        component: () => import("@/views/case/demos/skystar/skystar.vue"),
        meta: {
          title: ["首页", "例子", "演示", "星空"],
        },
      },
    ],
  },
  {
    path: "/home/caseHomePage/games",
    name: "游戏",
    component: () => import("@/views/case/games/index.vue"),
    meta: {
      title: ["首页", "例子", "游戏"],
      keepAlive: true,
    },
    children: [
      {
        path: "/home/caseHomePage/games/2048",
        name: "2048",
        component: () => import("@/views/case/games/2048/2048.vue"),
        meta: {
          title: ["首页", "例子", "游戏", "2048"],
        },
      },
      {
        path: "/home/caseHomePage/games/gobang",
        name: "五子棋",
        component: () => import("@/views/case/games/gobang/gobang.vue"),
        meta: {
          title: ["首页", "例子", "游戏", "五子棋"],
        },
      },
    ],
  },
];
