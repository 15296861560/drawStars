/*数据模块*/
export default [{
    path: '/home/dataHomePage',
    name: "数据传输模块",
    component: resolve => require(['@/views/homePages/dataHomePage.vue'], resolve),
    meta: {
      title: ['首页', '数据传输模块'],
    }
    // children:[]
  },
  {
    path: '/home/dataHomePage/Mock',
    name: "Mock",
    component: resolve => require(['@/views/data/Mock/Mock.vue'], resolve),
    meta: {
      title: ['首页', '数据传输模块', 'Mock'],
    },
    children: [{
      path: '/home/dataHomePage/Mock/dataTemplate',
      name: "数据模板定义",
      component: resolve => require(['@/views/data/Mock/dataTemplate.vue'], resolve),
      meta: {
        title: ['首页', '数据传输模块', 'Mock', '数据模板定义'],
      }
    }]
  },
  {
    path: '/home/dataHomePage/axios',
    name: "axios",
    component: resolve => require(['@/views/data/axios/axios.vue'], resolve),
    meta: {
      title: ['首页', '数据传输模块', 'axios'],
    },
  },
]
