import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/views/Index'
import Test1 from '@/views/pages/test1.vue'
import Test2 from '@/views/pages/test2.vue'
import MyEcharts from '@/router/homePages/echarts.js'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: '首页',
      component: Index,
      meta: {
        title: ['首页']
      }
    },
    {
      path: '/home',
      name: "首页",
      component: Index,
      // redirect: '/home/homepage',
      children: [{
          path: '/home/test1',
          name: "测试页1",
          component: Test1,
          meta: {
            title: ['首页', '测试页1'],
            keepAlive: true
          }
        },
        {
          path: '/home/test2',
          name: "测试页2",
          component: Test2,
          meta: {
            title: ['首页', '测试页2'],
            keepAlive: true
          }
        },
        ...MyEcharts,
      ]
    },
  ]
})
