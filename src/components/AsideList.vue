<template>
  <div>
    <el-row>
      <el-col>
        <el-menu
          class="el-menu-vertical-demo"
          @open="handleOpen"
          @close="handleClose"
          @select="handleSelect"
          background-color="#282c34"
          text-color="#fff"
          active-text-color="#ffd04b"
          :collapse="websiteInfo.isCollapse"
          :unique-opened="true"
          :router="false"
          :default-active="defaultActive"
          ref="asideMenu"
        >
          <el-menu-item index="collapse" class="m-text-center">
            <el-icon v-show="websiteInfo.isCollapse"><ArrowRight /></el-icon>
            <template #title>
              <span>Draw Starts</span>
            </template>
          </el-menu-item>
          <el-menu-item index="/home/homepage">
            <el-icon><HomeFilled /></el-icon>
            <template #title>
              <span>{{ $t("aside.homePage") }}</span>
            </template>
          </el-menu-item>

          <el-sub-menu index="1">
            <template #title>
              <el-icon><Shop /></el-icon>
              <span>{{ $t("aside.module") }}</span>
            </template>
            <el-menu-item
              :index="item.path"
              v-for="(item, index) in pathList"
              :key="item.path"
              >{{ $t(item.name) }}</el-menu-item
            >
          </el-sub-menu>
          <el-sub-menu index="2">
            <template #title>
              <el-icon><Avatar /></el-icon>
              <span>{{ $t("aside.test") }}</span>
            </template>
            <el-menu-item-group title="权限示例">
              <el-menu-item v-if="userData.level > 1" disabled>{{
                $t("aside.moreThanOne")
              }}</el-menu-item>
              <el-menu-item v-if="userData.level > 2" disabled>{{
                $t("aside.moreThanTwo")
              }}</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="测试页面">
              <el-menu-item index="outSide"
                ><el-icon><Link /></el-icon>{{ $t("aside.externalLinks") }}</el-menu-item
              >
              <el-menu-item index="/home/test1">{{
                $t("aside.testPageOne")
              }}</el-menu-item>
              <el-menu-item index="/home/test2">{{
                $t("aside.testPageTwo")
              }}</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="3">
            <template #title>
              <el-icon><User /></el-icon>
              <span>{{ $t("aside.power") }}</span>
            </template>
            <el-menu-item index="levelDown"
              ><el-icon><CaretBottom /></el-icon>{{ $t("aside.levelDown") }}</el-menu-item
            >
            <el-menu-item index="levelUp" route="{}"
              ><el-icon><CaretTop /></el-icon>{{ $t("aside.levelUp") }}</el-menu-item
            >
            <el-menu-item disabled
              ><el-icon><DCaret /></el-icon
              >{{ $t("aside.curLevel") + userData.level }}</el-menu-item
            >
          </el-sub-menu>
        </el-menu>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { RouterList } from "@/router/index.ts";
export default {
  name: "Aside",
  inject: ["websiteInfo"],
  data() {
    return {
      userData: {
        level: 3,
      },
      defaultActive: "/home/homepage",
      pathList: [],
    };
  },
  methods: {
    levelDown() {
      this.userData.level > 1 && this.userData.level--;
    },
    levelUp() {
      this.userData.level < 9 && this.userData.level++;
    },
    handleSelect(path) {
      if (!path) {
        return;
      }
      switch (path) {
        case "levelDown":
          this.levelDown();
          break;
        case "levelUp":
          this.levelUp();
          break;
        case "outSide":
          this.toOutSide();
          break;
        case "collapse":
          this.collapse();
          break;

        default:
          this.$router.push({
            path,
          });
          break;
      }
    },
    handleOpen(key, keyPath) {
      // 展开
    },
    handleClose(key, keyPath) {
      // 收起
    },

    toOutSide() {
      window.open("https://cn.bing.com/");
    },
    // 收缩侧边栏
    collapse() {
      if (!this.websiteInfo.isPC) {
        this.websiteInfo.isCollapse = true;
      } else {
        this.websiteInfo.isCollapse = !this.websiteInfo.isCollapse;
      }
    },
    // 获取主页列表数据
    getHomePages() {
      //获取HomePage列表
      let paths = [];
      let homeRouter = RouterList.filter((item) => item.name == "home")[0];
      homeRouter.children.forEach((route) => {
        let i = route.path.indexOf("HomePage");
        let path = route.path.slice(0, i + 8);
        if (i != -1 && !paths.includes(path)) paths.push(path);
      });
      this.pathList = paths.map((item) => {
        let i = item.indexOf("HomePage");
        return {
          path: item,
          name: "homePage." + item.slice(6, i),
        };
      });

      this.defaultActive = this.$route.fullPath;
    },
  },
  mounted() {
    this.getHomePages();
  },
};
</script>

<style scoped>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
  height: 100vh;
  overflow: hidden auto;
}
</style>
