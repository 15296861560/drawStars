<template>
  <div id="app">
    <!-- <img src="./assets/logo.png"> -->
    <router-view />
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
      NoProgress.start();
      let hasLogin = true;
      if (to.name != "首页" && this.$store.getters.getUserName == "未登录") {
        hasLogin = false;
      }
      if (hasLogin) next();
      else {
        next({ name: "首页" });
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
  /* margin: 60px; */
}
</style>
