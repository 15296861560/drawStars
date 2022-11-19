<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-05-23 23:24:07
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-19 23:02:47
-->
<template>
  <div id="app">
    <transition name="all" mode="out-in">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </transition>
  </div>
</template>

<script>
import NoProgress from "nprogress";
import "nprogress/nprogress.css";

NoProgress.configure({
  easing: "ease",
  speed: 500,
  trickleSpeed: 200,
  showSpinner: false,
});
export default {
  name: "App",
  created() {
    //刷新页面时保存状态管理方案
    //在页面加载时读取sessionStorage里的状态信息
    if (sessionStorage.getItem("store")) {
      this.$store.replaceState(
        Object.assign({}, this.$store.state, JSON.parse(sessionStorage.getItem("store")))
      );
    }

    //在页面刷新时将vuex里的信息保存到sessionStorage里
    window.addEventListener("beforeunload", () => {
      sessionStorage.setItem("store", JSON.stringify(this.$store.state));
    });

    this.$router.beforeEach((to, from, next) => {
      if (to.path === from.path) return;
      NoProgress.start();
      let hasLogin = true;

      if (to.path != "/login" && !this.$store.getters.getUserId) {
        hasLogin = false;
      }

      if (hasLogin) next();
      else {
        next({ path: "/login" });
      }
      NoProgress.done();
    });

    this.$router.afterEach(() => {
      NoProgress.done();
    });
  },
};
</script>

<style lang="less">
@import "./assets/styles/global.less";

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
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
