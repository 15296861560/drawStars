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
  {
    path: '/survey/fill/:shareCode',
    name: '填写问卷',
    component: () => import('@/views/survey/fill/index.vue'),
    meta: {
      title: ['填写问卷'],
      public: true
    }
  },
  {
    path: '/survey/result/:responseId',
    name: '问卷结果',
    component: () => import('@/views/survey/result/index.vue'),
    meta: {
      title: ['问卷结果'],
      public: true
    }
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

// 开发环境空闲时预取全部懒加载路由组件：
// Vite 按需编译，首次进入某个路由需要现场转换+下载整棵模块树（几百个模块请求），
// 体感就是“点击菜单先卡一段时间才出页面”。路由 ready 后利用浏览器空闲时间分批预取，
// 让 Vite 提前把这些模块编译进缓存，之后点击菜单跳转基本秒开。
if (import.meta.env.DEV) {
  const lazyLoaders: Array<() => Promise<unknown>> = []
  const collect = (routes: Array<any>) => {
    routes.forEach(route => {
      if (typeof route.component === 'function') {
        lazyLoaders.push(route.component)
      }
      collect(route.children || [])
    })
  }
  collect(RouterList)

  const prefetchInBatches = (start = 0, step = 8) => {
    lazyLoaders.slice(start, start + step).forEach(load => {
      // 预取失败不影响功能（点击时仍会现场加载），静默即可
      Promise.resolve(load()).catch(() => {})
    })
    // 分批间隔半秒，给首屏渲染和用户首次交互让路
    if (start + step < lazyLoaders.length) {
      window.setTimeout(() => prefetchInBatches(start + step, step), 500)
    }
  }

  const schedulePrefetch = () => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => prefetchInBatches(), { timeout: 4000 })
    } else {
      // Safari 等不支持 requestIdleCallback 的浏览器走定时兜底
      window.setTimeout(prefetchInBatches, 2000)
    }
  }

  router.isReady().then(schedulePrefetch)
}

export default router
