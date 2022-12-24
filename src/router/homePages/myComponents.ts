/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-07 17:24:28
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-06 00:00:10
 */
/*组件模块*/
export default [
  {
    path: "/home/componentsHomePage",
    name: "组件模块",
    component: () => import("@/views/homePages/componentsHomePage.vue"),
    meta: {
      title: ["首页", "组件模块"],
      keepAlive: true,
    },
  },
  // {
  //   path: "/home/componentsHomePage/dragAndDropComponents",
  //   name: "可视化拖拽组件",
  //   component: () =>
  //     import(
  //       "@/views/myComponents/dragAndDropComponents/dragAndDropComponents.vue"
  //     ),
  //   meta: {
  //     title: ["首页", "组件模块", "可视化拖拽组件"],
  //   },
  // },
  {
    path: "/home/componentsHomePage/commonComponents",
    name: "常用组件",
    component: () =>
      import("@/views/myComponents/commonComponents/commonComponents.vue"),
    meta: {
      title: ["首页", "组件模块", "常用组件"],
      keepAlive: true,
    },
    children: [
      {
        path: "/home/componentsHomePage/commonComponents/progressBar",
        name: "进度条",
        component: () =>
          import("@/views/myComponents/commonComponents/progressBar.vue"),
        meta: {
          title: ["首页", "组件模块", "常用组件", "进度条"],
        },
      },
      {
        path: "/home/componentsHomePage/commonComponents/promptBox",
        name: "提示框",
        component: () =>
          import("@/views/myComponents/commonComponents/promptBox.vue"),
        meta: {
          title: ["首页", "组件模块", "常用组件", "提示框"],
        },
      },
      {
        path: "/home/componentsHomePage/commonComponents/flop",
        name: "翻牌器",
        component: () =>
          import("@/views/myComponents/commonComponents/flop.vue"),
        meta: {
          title: ["首页", "组件模块", "常用组件", "翻牌器"],
        },
      },
    ],
  },
];
