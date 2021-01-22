/*图表模块*/
export default [
  {
    path: '/home/toolHomePage',
    name: "工具模块",
    component: resolve => require(['@/views/homePages/toolHomePage.vue'], resolve),
    meta: {
      title: ['首页', '工具模块'],
    }
    // children:[]
  },
]
