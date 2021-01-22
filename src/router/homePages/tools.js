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
  {
    path: '/home/echarts/basicBar',
    name: "基础柱状图",
    component: resolve => require(['@/views/echarts/basicBar.vue'], resolve),
    meta: {
      title: ['首页', '图表模块','基础柱状图'],
    }
    // children:[]
  },
  {
    path: '/home/echarts/basicLine',
    name: "基础折线图",
    component: resolve => require(['@/views/echarts/basicLine.vue'], resolve),
    meta: {
      title: ['首页', '图表模块','基础折线图'],
    }
    // children:[]
  },
  {
    path: '/home/echarts/basicPie',
    name: "基础饼图",
    component: resolve => require(['@/views/echarts/basicPie.vue'], resolve),
    meta: {
      title: ['首页', '图表模块','基础饼图'],
    }
    // children:[]
  },
]
