/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-07 17:24:28
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-26 19:04:21
 */
/*资料库*/
export default [{
    path: '/home/resourceHomePage',
    name: "资料库",
    component: () => import("@/views/homePages/resourceHomePage.vue"),
    meta: {
      title: ['首页', '资料库'],
      keepAlive: true
    },
  },
  {
    path: '/home/resourceHomePage/webFrame',
    name: "前端框架",
    component: () => import("@/views/resource/webFrame.vue"),
    meta: {
      title: ['首页', '资料库', '前端框架'],
    },
  },
  {
    path: '/home/resourceHomePage/configure',
    name: "管理资料",
    component: () => import("@/views/resource/configure.vue"),
    meta: {
      title: ['首页', '资料库', '管理资料'],
    },
  },
]