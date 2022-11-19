/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-05-23 23:24:08
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-19 22:07:38
 */
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
import Resource from '@/router/homePages/resource.js'
import Profile from '@/router/homePages/profile.js'
import Login from '@/router/homePages/login.js'


Vue.use(Router)

export const RouterList = [{
    path: '/home',
    name: "index",
    component: Index,
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
        path: '/404',
        name: 'NotFound',
        meta: {
          title: ['404'],
          keepAlive: true
        },
        component: () => import('@/views/pages/NotFound')
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
      ...Lab,
      ...Resource,
      ...Profile,
    ]
  },
  ...Login,
  // 所有未定义路由，全部重定向到404页
  {
    path: '*',
    redirect: '/404'
  },
]


const router = new Router({
  routes: RouterList
})

export default router
