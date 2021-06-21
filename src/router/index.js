import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/views/Index'
import Test1 from '@/views/pages/test1.vue'
import Test2 from '@/views/pages/test2.vue'
import HomePage from '@/views/homePages/HomePage.vue'
import MyEcharts from '@/router/homePages/myEcharts.js'
import MyComponents from '@/router/homePages/myComponents.js'
import Tools from '@/router/homePages/tools.js'
import Special from '@/router/homePages/special.js'
import Data from '@/router/homePages/data.js'
import Multimedia from '@/router/homePages/multimedia.js'
import Case from '@/router/homePages/case.js'
import Lab from '@/router/homePages/lab.js'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'firstPage',
      component: Index,
      redirect: '/home/homepage',
      meta: {
        title: ['首页']
      }
    },
    {
      path: '/home',
      name: "index",
      component: Index,
      // redirect: '/home/homepage',
      children: [{
          path: '/home/homepage',
          name: "首页",
          component: HomePage,
          meta: {
            title: ['首页'],
            keepAlive: true
          }
        },
        {
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
        ...MyComponents,
        ...Tools,
        ...Special,
        ...Data,
        ...Multimedia,
        ...Case,
        ...Lab
      ]
    },
  ]
})
