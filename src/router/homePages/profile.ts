/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-06-12 22:06:41
 * @LastEditors: lgy
 * @LastEditTime: 2023-02-06 23:50:42
 */
/*资料*/
export default [
  {
    path: "/home/personalCenter",
    name: "个人中心",
    component: () => import("@/views/profile/personalCenter.vue"),
    meta: {
      title: ["首页", "个人中心"],
      keepAlive: true,
    },
    children: [
      {
        path: "/home/personalCenter/personalProfile",
        name: "个人资料 ",
        component: () => import("@/views/profile/personalProfile.vue"),
        meta: {
          title: ["首页", "个人中心", "个人资料 "],
          keepAlive: true,
        },
      },
      {
        path: "/home/personalCenter/changePassword",
        name: "修改密码 ",
        component: () => import("@/views/profile/changePassword.vue"),
        meta: {
          title: ["首页", "个人中心", "修改密码 "],
          keepAlive: true,
        },
      },
      {
        path: "/home/personalCenter/bindPhone",
        name: "手机设置 ",
        component: () => import("@/views/profile/bindPhone.vue"),
        meta: {
          title: ["首页", "个人中心", "手机设置 "],
          keepAlive: true,
        },
      },
    ],
  },
];
