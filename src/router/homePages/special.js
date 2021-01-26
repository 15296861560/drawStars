/*特效模块*/
export default [
  {
    path: '/home/specialHomePage',
    name: "特效模块",
    component: resolve => require(['@/views/homePages/specialHomePage.vue'], resolve),
    meta: {
      title: ['首页', '特效模块'],
    }
  },
  {
    path: '/home/specialHomePage/transition',
    name: "过渡",
    component: resolve => require(['@/views/specials/transition.vue'], resolve),
    meta: {
      title: ['首页', '特效模块','过渡'],
    }
  },
  {
    path: '/home/specialHomePage/animation',
    name: "动画",
    component: resolve => require(['@/views/specials/animation.vue'], resolve),
    meta: {
      title: ['首页', '特效模块','动画'],
    }
  },
]
