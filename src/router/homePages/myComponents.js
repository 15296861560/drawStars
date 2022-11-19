/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-07 17:24:28
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-19 22:55:46
 */
/*组件模块*/
export default [{
    path: '/home/componentsHomePage',
    name: "组件模块",
    component: resolve => require(['@/views/homePages/componentsHomePage.vue'], resolve),
    meta: {
      title: ['首页', '组件模块'],
      keepAlive: true
    }
  },
  {
    path: '/home/componentsHomePage/dragAndDropComponents',
    name: "可视化拖拽组件",
    component: resolve => require(['@/views/myComponents/dragAndDropComponents/dragAndDropComponents.vue'], resolve),
    meta: {
      title: ['首页', '组件模块', '可视化拖拽组件'],
    }
  },
  {
    path: '/home/componentsHomePage/commonComponents',
    name: "常用组件",
    component: resolve => require(['@/views/myComponents/commonComponents/commonComponents.vue'], resolve),
    meta: {
      title: ['首页', '组件模块', '常用组件'],
      keepAlive: true
    },
    children: [{
        path: '/home/componentsHomePage/commonComponents/progressBar',
        name: "进度条",
        component: resolve => require(['@/views/myComponents/commonComponents/progressBar.vue'], resolve),
        meta: {
          title: ['首页', '组件模块', '常用组件', '进度条'],
        }
      },
      {
        path: '/home/componentsHomePage/commonComponents/promptBox',
        name: "提示框",
        component: resolve => require(['@/views/myComponents/commonComponents/promptBox.vue'], resolve),
        meta: {
          title: ['首页', '组件模块', '常用组件', '提示框'],
        }
      },
      {
        path: '/home/componentsHomePage/commonComponents/flop',
        name: "翻牌器",
        component: resolve => require(['@/views/myComponents/commonComponents/flop.vue'], resolve),
        meta: {
          title: ['首页', '组件模块', '常用组件', '翻牌器'],
        }
      },
    ]
  },

]
