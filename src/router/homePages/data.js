/*数据模块*/
export default [
  {
    path: '/home/dataHomePage',
    name: "数据模块",
    component: resolve => require(['@/views/homePages/dataHomePage.vue'], resolve),
    meta: {
      title: ['首页', '数据模块'],
    }
    // children:[]
  },
]
