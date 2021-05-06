/*实验室*/
export default [
  {
    path: '/home/labHomePage',
    name: "实验室",
    component: resolve => require(['@/views/homePages/labHomePage.vue'], resolve),
    meta: {
      title: ['首页', '实验室'],
    },
  },
  {
    path: '/home/labHomePage/vue-reactivity',
    name: "实验室",
    component: resolve => require(['@/views/lab/vue-reactivity.vue'], resolve),
    meta: {
      title: ['首页', '实验室','vue响应式原理'],
    },
  },
]
