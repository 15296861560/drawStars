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
  {
    path: '/home/componentsHomePage/dragAndDropComponents',
    name: "可视化拖拽组件",
    component: resolve => require(['@/views/myComponents/dragAndDropComponents/dragAndDropComponents.vue'], resolve),
    meta: {
      title: ['首页', '组件模块','可视化拖拽组件'],
    }
    // children:[]
  },
  {
    path: '/home/componentsHomePage/commonComponents',
    name: "常用组件",
    component: resolve => require(['@/views/myComponents/commonComponents/commonComponents.vue'], resolve),
    meta: {
      title: ['首页', '组件模块','常用组件'],
    }
    // children:[]
  },

]
