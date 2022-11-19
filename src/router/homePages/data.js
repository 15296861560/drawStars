/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-07 17:24:28
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-19 22:55:14
 */
/*数据模块*/
export default [{
    path: '/home/dataHomePage',
    name: "数据传输模块",
    component: resolve => require(['@/views/homePages/dataHomePage.vue'], resolve),
    meta: {
      title: ['首页', '数据传输模块'],
      keepAlive: true
    }
    // children:[]
  },
  {
    path: '/home/dataHomePage/Mock',
    name: "Mock",
    component: resolve => require(['@/views/data/Mock/mock.vue'], resolve),
    meta: {
      title: ['首页', '数据传输模块', 'Mock'],
      keepAlive: true
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
  {
    path: '/home/dataHomePage/Sqlite',
    name: "Sqlite",
    component: resolve => require(['@/views/data/Sqlite/sqlite.vue'], resolve),
    meta: {
      title: ['首页', '数据传输模块', 'Sqlite'],
    },
  },
  {
    path: '/home/dataHomePage/MySQL',
    name: "MySQL",
    component: resolve => require(['@/views/data/MySQL/mysql.vue'], resolve),
    meta: {
      title: ['首页', '数据传输模块', 'MySQL'],
    },
  },
  {
    path: '/home/dataHomePage/WebSocket',
    name: "WebSocket",
    component: resolve => require(['@/views/data/WebSocket/webSocket.vue'], resolve),
    meta: {
      title: ['首页', '数据传输模块', 'WebSocket'],
    },
  },
]
