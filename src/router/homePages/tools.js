/*工具模块*/
export default [
  {
    path: '/home/toolHomePage/Lodash',
    name: "Lodash",
    component: resolve => require(['@/views/tools/Lodash/Lodash.vue'], resolve),
    meta: {
      title: ['首页', '工具模块', 'Lodash'],
      keepAlive: true
    }
  },
  {
    path: '/home/toolHomePage',
    name: "工具模块",
    component: resolve => require(['@/views/homePages/toolHomePage.vue'], resolve),
    meta: {
      title: ['首页', '工具模块'],
    },
  },
  {
    path: '/home/toolHomePage/utilities',
    name: "工具列表",
    component: resolve => require(['@/views/tools/utilities/ToolList.vue'], resolve),
    meta: {
      title: ['首页', '工具模块','工具列表'],
    },
    children: [{
      path: '/home/toolHomePage/utilities/time',
      name: "获取时间",
      component: resolve => require(['@/views/tools/utilities/time.vue'], resolve),
      meta: {
        title: ['首页', '工具模块', '工具列表', '获取时间'],
      }
    }]
  },
]
