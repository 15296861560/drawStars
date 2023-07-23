<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 21:55:05
 * @LastEditors: lgy
 * @LastEditTime: 2023-07-23 00:13:39
-->
<script setup lang="ts">
import {
  RouterLink,
  RouterView,
  useRouter,
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
} from "vue-router";

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

  if (hasLogin) {
    return true;
  } else {
    return { path: "/login" };
  }
  NoProgress.done();
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
