/*实验室*/
export default [{
    path: '/home/labHomePage',
    name: "实验室",
    component: resolve => require(['@/views/homePages/labHomePage.vue'], resolve),
    meta: {
      title: ['首页', '实验室'],
    },
  },
  {
    path: '/home/labHomePage/vueRseactivity',
    name: "vue响应式原理",
    component: resolve => require(['@/views/lab/vue-reactivity.vue'], resolve),
    meta: {
      title: ['首页', '实验室', 'vue响应式原理'],
    },
  },
  {
    path: '/home/labHomePage/promise',
    name: "Primise简单使用",
    component: resolve => require(['@/views/lab/promise.vue'], resolve),
    meta: {
      title: ['首页', '实验室', 'Primise简单使用'],
    },
  },
  {
    path: '/home/labHomePage/webpack',
    name: "Webpack打包",
    component: resolve => require(['@/views/lab/webpack'], resolve),
    meta: {
      title: ['首页', '实验室', 'Webpack打包'],
    },
  },
]
