/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-07 17:24:28
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-19 22:49:52
 */
/*实验室*/
export default [{
    path: '/home/labHomePage',
    name: "实验室",
    component: resolve => require(['@/views/homePages/labHomePage.vue'], resolve),
    meta: {
      title: ['首页', '实验室'],
      keepAlive: true
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
  {
    path: '/home/labHomePage/frame',
    name: "嵌入页",
    component: resolve => require(['@/views/lab/frame'], resolve),
    meta: {
      title: ['首页', '实验室', '嵌入页'],
    },
  },
  {
    path: '/home/labHomePage/directive',
    name: "指令",
    component: resolve => require(['@/views/lab/directive'], resolve),
    meta: {
      title: ['首页', '实验室', '指令'],
    },
  },
]
