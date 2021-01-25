<template>
  <div>
    <el-container>
      <el-aside class="g-aside" :style="width"
        ><asideList @collapse="collapse"></asideList
      ></el-aside>
      <el-container>
        <el-header>
          <!-- 导航栏 -->
          <navigation :titleData="$route.meta.title"></navigation>
          <!-- 历史浏览模块 -->
          <!-- <history></history> -->
        </el-header>
        <el-main class="g-main">
          <keep-alive>
            <transition name="fade" mode="out-in">
              <router-view v-if="$route.meta.keepAlive"></router-view>
            </transition>
          </keep-alive>
          <transition name="fade" mode="out-in">
            <router-view v-if="!$route.meta.keepAlive"></router-view>
          </transition>
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
import History from "@/components/History.vue";
export default {
  components: {
    AsideList,
    History,
  },
  data() {
    return {
      width: "width:200px;",
    };
  },
  methods: {
    collapse(collapse) {
      if (collapse) {
        this.width = "width:50px;";
      } else {
        this.width = "width:200px;";
      }
    },
    textClick() {
      this.width = "width:50px;";
    },
  },
  mounted() {},
};
</script>

<style>
.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
}

/* 组件过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: all 1s cubic-bezier(1, 0.5, 0.8, 1);
}
.fade-enter /* .fade-leave-active below version 2.1.8 */ {
  transform: translateX(80vw);
  /* opacity不透明级别 */
  opacity: 0.5;
}
.fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
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
