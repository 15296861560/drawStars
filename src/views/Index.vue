<template>
  <div class="index-root" :class="{ 'layout-fixed-header': layout.fixedHeader }">
    <el-container>
      <el-aside class="g-aside" :style="width" v-if="showAside"
        ><asideList ref="asideList"></asideList
      ></el-aside>
      <el-container>
        <el-header class="site-header" height="auto">
          <navigation
            :titleData="$route.meta.title"
            ref="navigation"
          ></navigation>
          <layout-tags-view v-if="layout.tagsView" />
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

          <el-footer v-show="layout.footerVisible" class="g-footer">
            <myfooter></myfooter>
          </el-footer>
        </el-main>
      </el-container>
    </el-container>
    <layout-settings-drawer />
  </div>
</template>

<script>
import AsideList from "@/components/AsideList.vue";
import Navigation from "@/components/Navigation.vue";
import Myfooter from "@/components/Myfooter.vue";
import LayoutTagsView from "@/components/layout/LayoutTagsView.vue";
import LayoutSettingsDrawer from "@/components/layout/LayoutSettingsDrawer.vue";
import { layoutSettingsStore } from "@/stores/layout-settings";
import { useRoute } from "vue-router";
import {
  NOTIFY_URL,
  WEBSITE_CHANNEL,
} from "@/assets/js/notify/notify-config.js";
import { userInfoStore } from "@/stores/user-info";
import { isSkipLoginMode } from "@/config/skip-login";

const userInfo = userInfoStore();

export default {
  components: {
    AsideList,
    Navigation,
    Myfooter,
    LayoutTagsView,
    LayoutSettingsDrawer,
  },
  provide() {
    return {
      websiteInfo: this.websiteInfo,
    };
  },
  data() {
    return {
      width: "width:200px;",
      screenHeight: document.documentElement.clientHeight, // 获取浏览器高度
      screenWidth: document.documentElement.clientWidth, // 获取浏览器宽度
      websiteInfo: {
        isPC: true, // 判断是否是电脑
        isCollapse: false, // 侧边栏是否收缩
      },
    };
  },
  computed: {
    $route() {
      let route = useRoute();

      return route;
    },
    layout() {
      return layoutSettingsStore();
    },
    showAside() {
      return this.websiteInfo.isPC && this.layout.navType !== 3;
    },
  },
  methods: {
    isComputer() {
      let userAgent = navigator.userAgent;
      let phoneList = ["Android", "iPhone", "SymbianOS"];
      this.websiteInfo.isPC = phoneList.every(
        (item) => userAgent.indexOf(item) == -1,
      ); // 不包含手机型号则视为PC
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
    "layout.navType"(n) {
      if (n === 2) {
        this.websiteInfo.isCollapse = true;
      } else if (n === 1) {
        this.websiteInfo.isCollapse = false;
      }
    },
    "layout.tagsView"(on) {
      if (!on) {
        this.layout.clearVisitedViews();
      }
    },
    "layout.dynamicTitle"() {
      this.layout.applyDocumentTitle(this.$route);
    },
  },
  mounted() {
    this.isComputer();
    window.addEventListener("resize", this.isComputer);
    if (this.websiteInfo.isCollapse) {
      this.width = "width:50px;";
    }

    this.layout.applyThemeFromState();
    this._layoutAfterEach = this.$router.afterEach((to) => {
      this.layout.addVisitedView(to);
      this.layout.applyDocumentTitle(to);
    });

    if (!isSkipLoginMode()) {
      this.initNotify();
    }
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.isComputer);
    if (this._layoutAfterEach) {
      this._layoutAfterEach();
    }
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

.index-root.layout-fixed-header .site-header {
  position: sticky;
  top: 0;
  z-index: 99;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.06);
}

.site-header {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
</style>
