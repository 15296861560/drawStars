<template>
  <div>
    <el-container>
      <el-aside class="g-aside" :style="width" v-if="websiteInfo.isPC"
        ><asideList ref="asideList"></asideList
      ></el-aside>
      <el-container>
        <el-header>
          <!-- 导航栏 -->
          <navigation :titleData="$route.meta.title" ref="navigation"></navigation>
        </el-header>
        <el-main class="g-main">
          <div style="min-height: calc(100vh - 180px)">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <keep-alive v-if="$route.meta.keepAlive">
                  <component :is="Component" />
                </keep-alive>
                <component v-else :is="Component" />
              </transition>
            </router-view>
          </div>

          <el-footer class="g-footer">
            <myfooter></myfooter>
          </el-footer>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import AsideList from "@/components/AsideList.vue";
import Navigation from "@/components/Navigation.vue";
import Myfooter from "@/components/Myfooter.vue";
import { useRouter, useRoute } from "vue-router";
import { NOTIFY_URL, WEBSITE_CHANNEL } from "@/assets/js/notify/notify-config.js";
import { userInfoStore } from "@/stores/user-info";
const userInfo = userInfoStore();

export default {
  components: {
    AsideList,
    Navigation,
    Myfooter,
  },
  provide() {
    return {
      websiteInfo: this.websiteInfo,
    };
  },
  data() {
    return {
      width: "width:200px;",
      screenHeight: document.documentElement.clientHeight, //获取浏览器高度
      screenWidth: document.documentElement.clientWidth, //获取浏览器宽度
      websiteInfo: {
        isPC: true, //判断是否是电脑
        isCollapse: false, // 侧边栏是否收缩
      },
    };
  },
  computed: {
    $route() {
      let route = useRoute();

      return route;
    },
  },
  methods: {
    isComputer() {
      let userAgent = navigator.userAgent;
      let phoneList = ["Android", "iPhone", "SymbianOS"];
      this.websiteInfo.isPC = phoneList.every((item) => userAgent.indexOf(item) == -1); //不包含手机型号则视为PC
    },
    async initNotify() {
      await this.$notify.createInstance(NOTIFY_URL);
      await this.$notify.login(userInfo.getToken.value);
      this.$notify.joinChannel(WEBSITE_CHANNEL);
    },
  },
  watch: {
    "websiteInfo.isCollapse"(val) {
      if (val) {
        this.width = "width:50px;";
      } else {
        this.width = "width:200px;";
      }
    },
  },
  mounted() {
    let that = this;
    this.isComputer();
    window.addEventListener("resize", this.isComputer);
    if (this.websiteInfo.isCollapse) this.width = "width:50px;";

    this.initNotify();
  },
};
</script>

<style>
.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
}

/* 组件过渡 */
.fade-enter-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.fade-leave-active {
  transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
  position: absolute;
}
.fade-enter /* .fade-leave-active below version 2.1.8 */ {
  /* transform: translateX(80vw); */
  /* 沿y轴旋转 */
  transform: rotateY(90deg);
  /* opacity不透明级别 */
  opacity: 0.5;
}
.fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  /* transform: translateX(-80vw); */
  transform: translateX(-80vw);
  opacity: 0.5;
}
/* 设置滚动条的样式 */
::-webkit-scrollbar {
  width: 12px;
}
/* 滚动槽 */
::-webkit-scrollbar-track {
  /* -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.3); */
  border-radius: 10px;
  /*滚动条里面轨道*/
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #ededed;
}
/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  /* background: rgba(0, 0, 0, 0.1);
    -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5); */
  background-color: skyblue;
  background-image: -webkit-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.2) 75%,
    transparent 75%,
    transparent
  );
}
::-webkit-scrollbar-thumb:window-inactive {
  background: rgba(255, 0, 0, 0.4);
}
</style>
