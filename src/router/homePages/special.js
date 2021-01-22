/*图表模块*/
export default [
  {
    path: '/home/specialHomePage',
    name: "特效模块",
    component: resolve => require(['@/views/homePages/specialHomePage.vue'], resolve),
    meta: {
      title: ['首页', '特效模块'],
    }
    // children:[]
  },
]
