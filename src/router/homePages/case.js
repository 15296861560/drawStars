/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-07 17:24:28
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-21 22:52:49
 */
/*例子*/
export default [{
    path: '/home/caseHomePage',
    name: "例子",
    component: resolve => require(['@/views/homePages/caseHomePage.vue'], resolve),
    meta: {
      title: ['首页', '例子'],
      keepAlive: true
    },
  },
  {
    path: '/home/caseHomePage/board',
    name: "看板",
    component: resolve => require(['@/views/case/boards.vue'], resolve),
    meta: {
      title: ['首页', '例子', '看板'],
      keepAlive: true
    },
  },
  {
    path: '/home/caseHomePage/demo',
    name: "演示",
    component: resolve => require(['@/views/case/demos/index.vue'], resolve),
    meta: {
      title: ['首页', '例子', '演示'],
      keepAlive: true
    },
    children: [{
      path: '/home/caseHomePage/demo/love',
      name: "爱心 ",
      component: resolve => require(['@/views/case/demos/love/love.vue'], resolve),
      meta: {
        title: ['首页', '例子', '演示', '爱心'],
      }
    }]
  },
  {
    path: '/home/caseHomePage/game',
    name: "游戏",
    component: resolve => require(['@/views/case/games/index.vue'], resolve),
    meta: {
      title: ['首页', '例子', '游戏'],
      keepAlive: true
    },
    children: [{
      path: '/home/caseHomePage/game/2048',
      name: "2048",
      component: resolve => require(['@/views/case/games/2048/2048.vue'], resolve),
      meta: {
        title: ['首页', '例子', '游戏', '2048'],
      }
    }]
  },
]
