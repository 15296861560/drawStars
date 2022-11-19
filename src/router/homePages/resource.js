/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-07 17:24:28
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-19 22:50:14
 */
/*资料库*/
export default [{
    path: '/home/resourceHomePage',
    name: "资料库",
    component: resolve => require(['@/views/homePages/resourceHomePage.vue'], resolve),
    meta: {
      title: ['首页', '资料库'],
      keepAlive: true
    },
  },
  {
    path: '/home/resourceHomePage/webFrame',
    name: "前端框架",
    component: resolve => require(['@/views/resource/webFrame.vue'], resolve),
    meta: {
      title: ['首页', '资料库', '前端框架'],
    },
  },
  {
    path: '/home/resourceHomePage/configure',
    name: "管理资料",
    component: resolve => require(['@/views/resource/configure.vue'], resolve),
    meta: {
      title: ['首页', '资料库', '管理资料'],
    },
  },
]
