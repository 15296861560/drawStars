/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-07 17:24:28
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-27 22:58:46
 */
/*数据模块*/
export default [
  {
    path: "/home/dataHomePage",
    name: "数据传输模块",
    component: () => import("@/views/homePages/dataHomePage.vue"),
    meta: {
      title: ["首页", "数据传输模块"],
      keepAlive: true,
    },
    // children:[]
  },
  {
    path: "/home/dataHomePage/Mock",
    name: "Mock",
    component: () => import("@/views/data/Mock/mock.vue"),
    meta: {
      title: ["首页", "数据传输模块", "Mock"],
      keepAlive: true,
    },
    children: [
      {
        path: "/home/dataHomePage/Mock/dataTemplate",
        name: "数据模板定义",
        component: () => import("@/views/data/Mock/dataTemplate.vue"),
        meta: {
          title: ["首页", "数据传输模块", "Mock", "数据模板定义"],
        },
      },
    ],
  },
  {
    path: "/home/dataHomePage/axios",
    name: "axios",
    component: () => import("@/views/data/axios/axios.vue"),
    meta: {
      title: ["首页", "数据传输模块", "axios"],
    },
  },
  {
    path: "/home/dataHomePage/Sqlite",
    name: "Sqlite",
    component: () => import("@/views/data/Sqlite/sqlite.vue"),
    meta: {
      title: ["首页", "数据传输模块", "Sqlite"],
    },
  },
  {
    path: "/home/dataHomePage/MySQL",
    name: "MySQL",
    component: () => import("@/views/data/MySQL/mysql.vue"),
    meta: {
      title: ["首页", "数据传输模块", "MySQL"],
    },
  },
  {
    path: "/home/dataHomePage/WebSocket",
    name: "WebSocket",
    component: () => import("@/views/data/WebSocket/webSocket.vue"),
    meta: {
      title: ["首页", "数据传输模块", "WebSocket"],
    },
  },
];
