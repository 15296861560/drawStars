/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-06-12 22:06:41
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-03 18:05:06
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
    ],
  },
];
