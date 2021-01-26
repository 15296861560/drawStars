/*组件模块*/
export default [
  {
    path: '/home/componentsHomePage',
    name: "组件模块",
    component: resolve => require(['@/views/homePages/componentsHomePage.vue'], resolve),
    meta: {
      title: ['首页', '组件模块'],
    }
  },
  {
    path: '/home/componentsHomePage/dragAndDropComponents',
    name: "可视化拖拽组件",
    component: resolve => require(['@/views/myComponents/dragAndDropComponents/dragAndDropComponents.vue'], resolve),
    meta: {
      title: ['首页', '组件模块','可视化拖拽组件'],
    }
  },
  {
    path: '/home/componentsHomePage/commonComponents',
    name: "常用组件",
    component: resolve => require(['@/views/myComponents/commonComponents/commonComponents.vue'], resolve),
    meta: {
      title: ['首页', '组件模块','常用组件'],
    },
    children:[
      {
        path: '/home/componentsHomePage/commonComponents/progressBar',
        name: "进度条",
        component: resolve => require(['@/views/myComponents/commonComponents/progressBar.vue'], resolve),
        meta: {
          title: ['首页', '组件模块','常用组件','进度条'],
        }
      },
      {
        path: '/home/componentsHomePage/commonComponents/promptBox',
        name: "提示框",
        component: resolve => require(['@/views/myComponents/commonComponents/promptBox.vue'], resolve),
        meta: {
          title: ['首页', '组件模块','常用组件','提示框'],
        }
      },
    ]
  },

]
