/*组件模块*/
export default [
  {
    path: '/home/componentsHomePage',
    name: "组件模块",
    component: resolve => require(['@/views/homePages/componentsHomePage.vue'], resolve),
    meta: {
      title: ['首页', '组件模块'],
    }
    // children:[]
  },

]
