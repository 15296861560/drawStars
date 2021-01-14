/*图表模块*/
export default [
  {
    path: '/home/echartHomePages',
    name: "图表模块",
    component: resolve => require(['@/views/homePages/echartHomePages.vue'], resolve),
    meta: {
      title: ['首页', '图表模块'],
    }
    // children:[]
  },
  {
    path: '/home/echarts/basicBar',
    name: "图表模块",
    component: resolve => require(['@/views/echarts/basicBar.vue'], resolve),
    meta: {
      title: ['首页', '图表模块','基础柱状图'],
    }
    // children:[]
  },
]
