/*图表模块*/
export default [
  {
    path: "/home/echartHomePage",
    name: "图表模块",
    component: () => import("@/views/homePages/echartHomePage.vue"),
    meta: {
      title: ["首页", "图表模块"],
      keepAlive: true,
    },
    // children:[]
  },
  {
    path: "/home/echartHomePage/basicBar",
    name: "基础柱状图",
    component: () => import("@/views/echarts/basicBar.vue"),
    meta: {
      title: ["首页", "图表模块", "基础柱状图"],
    },
    // children:[]
  },
  {
    path: "/home/echartHomePage/basicLine",
    name: "基础折线图",
    component: () => import("@/views/echarts/basicLine.vue"),
    meta: {
      title: ["首页", "图表模块", "基础折线图"],
    },
    // children:[]
  },
  {
    path: "/home/echartHomePage/basicArea",
    name: "基础面积图",
    component: () => import("@/views/echarts/basicArea.vue"),
    meta: {
      title: ["首页", "图表模块", "基础面积图"],
    },
  },
  {
    path: "/home/echartHomePage/basicPie",
    name: "基础饼图",
    component: () => import("@/views/echarts/basicPie.vue"),
    meta: {
      title: ["首页", "图表模块", "基础饼图"],
    },
  },
  {
    path: "/home/echartHomePage/baiduMap",
    name: "百度地图",
    component: () => import("@/views/echarts/baiduMap.vue"),
    meta: {
      title: ["首页", "图表模块", "百度地图"],
    },
  },
  {
    path: "/home/echartHomePage/bar",
    name: "柱状图",
    component: () => import("@/views/echarts/bar.vue"),
    meta: {
      title: ["首页", "图表模块", "柱状图"],
    },
  },
  {
    path: "/home/echartHomePage/stackedBar",
    name: "堆叠柱状图",
    component: () => import("@/views/echarts/stackedBar.vue"),
    meta: {
      title: ["首页", "图表模块", "堆叠柱状图"],
    },
  },
  {
    path: "/home/echartHomePage/barLineDrill",
    name: "折柱混合图",
    component: () => import("@/views/echarts/barLineDrill.vue"),
    meta: {
      title: ["首页", "图表模块", "折柱混合图"],
    },
  },
  {
    path: "/home/echartHomePage/polar",
    name: "极坐标系",
    component: () => import("@/views/echarts/polar.vue"),
    meta: {
      title: ["首页", "图表模块", "极坐标系"],
    },
  },
  {
    path: "/home/echartHomePage/dynamicOrderBar",
    name: "动态排序柱状图",
    component: () => import("@/views/echarts/dynamicOrderBar.vue"),
    meta: {
      title: ["首页", "图表模块", "动态排序柱状图"],
    },
  },
  {
    path: "/home/echartHomePage/eMap",
    name: "中国地图",
    component: () => import("@/views/echarts/echartMap.vue"),
    meta: {
      title: ["首页", "图表模块", "中国地图"],
    },
  },
  {
    path: "/home/echartHomePage/gauge",
    name: "仪表盘",
    component: () => import("@/views/echarts/gauge.vue"),
    meta: {
      title: ["首页", "图表模块", "仪表盘"],
    },
  },
];
