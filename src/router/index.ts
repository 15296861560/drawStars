/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 21:55:05
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-31 10:28:48
 */
import { createRouter, createWebHistory } from 'vue-router'

const routeFiles = import.meta.glob('@/router/homePages/*.ts', { eager: true })

const homePages: Array<any> = []
Object.keys(routeFiles).forEach(path => {
  homePages.push(...(routeFiles[path] as any).default)
})

export const RouterList = [
  {
    path: '/login',
    alias: '/',
    name: '登录',
    component: () => import('@/views/login/login.vue'),
    meta: {
      title: ['登录']
    }
  },
  {
    path: '/forgetPassword',
    name: '忘记密码',
    component: () => import('@/views/login/forgetPassword.vue'),
    meta: {
      title: ['忘记密码']
    }
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/Index.vue'),
    children: [
      {
        path: '/home/homepage',
        name: '首页',
        component: () => import('@/views/homePages/HomePage.vue'),
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
        component: () => import('@/views/pages/NotFound.vue')
      },
      ...homePages
    ]
  },
  // 所有未定义路由，全部重定向到404页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: RouterList
})

export default router
