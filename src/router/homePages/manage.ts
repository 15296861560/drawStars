/* 管理中心 */
export default [
  {
    path: "/home/manageHomePage",
    name: "管理中心",
    component: () => import("@/views/homePages/manageHomePage.vue"),
    meta: {
      title: ["首页", "管理中心"],
      keepAlive: true,
    },
  },
  {
    path: "/home/manageHomePage/notice",
    name: "通知管理",
    component: () => import("@/views/manage/noticeManage/index.vue"),
    meta: {
      title: ["首页", "管理中心", "通知管理"],
    },
  },
  // {
  //   path: "/home/manageHomePage/notice/detail",
  //   name: "通知详情",
  //   component: () => import("@/views/manage/noticeManage/detail.vue"),
  //   meta: {
  //     title: ["首页", "管理中心", "通知详情"],
  //   },
  // },
];
