<!--
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 21:55:05
 * @LastEditors: lgy
 * @LastEditTime: 2023-07-30 23:43:15
-->
<script setup>
// 错误拦截
import { getCurrentInstance, nextTick } from 'vue'
import { errorLogStore } from '@/stores/error-log'
const errorLog = errorLogStore()
const instance = getCurrentInstance()
const app = instance?.appContext.app
app.config.errorHandler = (err, vm, info) => {
  const message =
    (err && typeof err === 'object' && err.message) ||
    (typeof err === 'string' ? err : String(err || 'Unknown error'))
  // 避免递归更新类错误再次写入日志，放大异常捕获弹窗的更新风暴
  if (String(message).includes('Maximum recursive updates')) {
    console.error(err)
    return
  }
  const url = window.location.href
  const stack =
    (err && typeof err === 'object' && err.stack) ||
    (typeof err === 'string' ? err : '')
  nextTick(() => {
    errorLog.addErrorLog({
      err: { message: String(message), stack: String(stack || '') },
      vm,
      info,
      url
    })
  })
}

import { RouterView, useRouter } from 'vue-router'
import AiAssistantHost from '@/components/ai-assistant/AiAssistantHost.vue'

import { userInfoStore } from '@/stores/user-info'
import { permissionStore } from '@/stores/permission'
import { isSkipLoginMode } from '@/config/skip-login'

const userInfo = userInfoStore()
const permission = permissionStore()

// @ts-ignore
import NoProgress from 'nprogress'
import 'nprogress/nprogress.css'
NoProgress.configure({
  easing: 'ease',
  speed: 500,
  trickleSpeed: 200,
  showSpinner: false
})

const router = useRouter()

router.beforeEach(async (to, from) => {
  // 首次进入站点时 from 为 START_LOCATION，path 常与「/」别名目标相同，
  // 若仅判断 to.path === from.path 会误跳过守卫，导致跳过登录时无法从 / 跳到主页
  if (to.path === from.path && from.matched.length > 0) {
    return
  }
  NoProgress.start()

  if (isSkipLoginMode()) {
    NoProgress.done()
    const isLoginEntry =
      to.path === '/login' || to.path === '/' || to.name === '登录'
    if (isLoginEntry) {
      return { path: '/home/homepage', replace: true }
    }
    return true
  }

  let hasLogin = true

  const isPublicAuthPage =
    to.path === '/login' ||
    to.path === '/' ||
    to.path === '/forgetPassword' ||
    to.name === '登录' ||
    to.name === '忘记密码' ||
    to.path.startsWith('/survey/fill') ||
    to.path.startsWith('/survey/result') ||
    to.name === '填写问卷' ||
    to.name === '问卷结果'

  if (!isPublicAuthPage && !userInfo.getUserId && !userInfo.getToken.value) {
    hasLogin = false
  }

  if (!hasLogin) {
    NoProgress.done()
    return { path: '/login' }
  }

  // 已登录：加载权限并校验 meta.permission
  if (!isPublicAuthPage && (userInfo.getUserId || userInfo.getToken.value)) {
    if (!permission.loaded) {
      try {
        await permission.loadPermission()
      } catch (_e) {
        // ignore — fallback menus
      }
    }
    const need = to.meta?.permission
    if (need && !permission.hasPermission(need)) {
      NoProgress.done()
      return { path: '/home/homepage', replace: true }
    }
  }

  NoProgress.done()
  return true
})

router.afterEach(() => {
  NoProgress.done()
})
</script>

<template>
  <AiAssistantHost />
  <router-view v-slot="{ Component }">
    <transition name="all" mode="out-in">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</template>
<style lang="less">
@import './assets/styles/global.less';

html,
body,
#app {
  height: 100%;
}

.all-enter-active,
.all-leave-active {
  transition: all 0.5s ease;
}

.all-enter {
  opacity: 1;
}
.all-leave-to {
  opacity: 0;
}
</style>
