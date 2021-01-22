/*图表模块*/
export default [
  {
    path: '/home/echartHomePage',
    name: "图表模块",
    component: resolve => require(['@/views/homePages/echartHomePage.vue'], resolve),
    meta: {
      title: ['首页', '图表模块'],
    }
    // children:[]
  },
  {
    path: '/home/echartHomePage/basicBar',
    name: "基础柱状图",
    component: resolve => require(['@/views/echarts/basicBar.vue'], resolve),
    meta: {
      title: ['首页', '图表模块','基础柱状图'],
    }
    // children:[]
  },
  {
    path: '/home/echartHomePage/basicLine',
    name: "基础折线图",
    component: resolve => require(['@/views/echarts/basicLine.vue'], resolve),
    meta: {
      title: ['首页', '图表模块','基础折线图'],
    }
    // children:[]
  },
  {
    path: '/home/echartHomePage/basicPie',
    name: "基础饼图",
    component: resolve => require(['@/views/echarts/basicPie.vue'], resolve),
    meta: {
      title: ['首页', '图表模块','基础饼图'],
    }
    // children:[]
  },
]
