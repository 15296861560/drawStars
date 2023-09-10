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
  {
    path: "/home/componentsHomePage/commonComponents",
    name: "常用组件",
    component: () =>
      import("@/views/myComponents/commonComponents/commonComponents.vue"),
    meta: {
      title: ["首页", "组件模块", "常用组件"],
      keepAlive: true,
    },
  },
];
