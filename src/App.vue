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
import { getCurrentInstance, nextTick } from "vue";
import { errorLogStore } from "@/stores/error-log";
const errorLog = errorLogStore();
const instance = getCurrentInstance();
const app = instance?.appContext.app;
app.config.errorHandler = (err, vm, info) => {
  const url = window.location.href;
  nextTick(() => {
    errorLog.addErrorLog({
      err,
      vm,
      info,
      url,
    });
  });
};

import { RouterView, useRouter } from "vue-router";

import { userInfoStore } from "@/stores/user-info";
const userInfo = userInfoStore();

// @ts-ignore
import NoProgress from "nprogress";
import "nprogress/nprogress.css";
NoProgress.configure({
  easing: "ease",
  speed: 500,
  trickleSpeed: 200,
  showSpinner: false,
});

const router = useRouter();

router.beforeEach((to, from) => {
  if (to.path === from.path) return;
  NoProgress.start();
  let hasLogin = true;

  if (to.path != "/login" && !userInfo.getUserId && !userInfo.getToken.value) {
    hasLogin = false;
  }

  NoProgress.done();
  return hasLogin ? true : { path: "/login" };
});

router.afterEach(() => {
  NoProgress.done();
});
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="all" mode="out-in">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</template>
<style lang="less">
@import "./assets/styles/global.less";

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
