/*例子*/
export default [
  {
    path: '/home/caseHomePage',
    name: "例子",
    component: resolve => require(['@/views/homePages/caseHomePage.vue'], resolve),
    meta: {
      title: ['首页', '例子'],
    },
  },
  {
    path: '/home/caseHomePage/boards',
    name: "看板",
    component: resolve => require(['@/views/case/boards.vue'], resolve),
    meta: {
      title: ['首页', '例子','看板'],
    },
  },
]
