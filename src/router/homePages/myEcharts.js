/*图表模块*/
export default [{
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
      title: ['首页', '图表模块', '基础柱状图'],
    }
    // children:[]
  },
  {
    path: '/home/echartHomePage/basicLine',
    name: "基础折线图",
    component: resolve => require(['@/views/echarts/basicLine.vue'], resolve),
    meta: {
      title: ['首页', '图表模块', '基础折线图'],
    }
    // children:[]
  },
  {
    path: '/home/echartHomePage/basicArea',
    name: "基础面积图",
    component: resolve => require(['@/views/echarts/basicArea.vue'], resolve),
    meta: {
      title: ['首页', '图表模块', '基础面积图'],
    }
  },
  {
    path: '/home/echartHomePage/basicPie',
    name: "基础饼图",
    component: resolve => require(['@/views/echarts/basicPie.vue'], resolve),
    meta: {
      title: ['首页', '图表模块', '基础饼图'],
    }
  },
  {
    path: '/home/echartHomePage/baiduMap',
    name: "百度地图",
    component: resolve => require(['@/views/echarts/baiduMap.vue'], resolve),
    meta: {
      title: ['首页', '图表模块', '百度地图'],
    }
  },
  {
    path: '/home/echartHomePage/bar',
    name: "柱状图",
    component: resolve => require(['@/views/echarts/bar.vue'], resolve),
    meta: {
      title: ['首页', '图表模块', '柱状图'],
    }
  },
  {
    path: '/home/echartHomePage/stackedBar',
    name: "堆叠柱状图",
    component: resolve => require(['@/views/echarts/stackedBar.vue'], resolve),
    meta: {
      title: ['首页', '图表模块', '堆叠柱状图'],
    }
  },
  {
    path: '/home/echartHomePage/barLineDrill',
    name: "折柱混合图",
    component: resolve => require(['@/views/echarts/barLineDrill.vue'], resolve),
    meta: {
      title: ['首页', '图表模块', '折柱混合图'],
    }
  },
  {
    path: '/home/echartHomePage/polar',
    name: "极坐标系",
    component: resolve => require(['@/views/echarts/polar.vue'], resolve),
    meta: {
      title: ['首页', '图表模块', '极坐标系'],
    }
  },
  {
    path: '/home/echartHomePage/dynamicOrderBar',
    name: "动态排序柱状图",
    component: resolve => require(['@/views/echarts/dynamicOrderBar.vue'], resolve),
    meta: {
      title: ['首页', '图表模块', '动态排序柱状图'],
    }
  },
]
