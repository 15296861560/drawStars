<template>
  <div>
    <el-row>
      <el-col>
        <el-menu
          class="el-menu-vertical-demo"
          @open="handleOpen"
          @close="handleClose"
          background-color="#282c34"
          text-color="#fff"
          active-text-color="#ffd04b"
          :collapse="websiteInfo.isCollapse"
          :unique-opened="true"
          :router="true"
          default-active="/"
        >
          <el-menu-item @click="collapse" class="m-text-center">
            <i v-show="websiteInfo.isCollapse" class="el-icon-d-arrow-right"></i>
            <span slot="title">Draw Starts</span>
          </el-menu-item>
          <el-menu-item index="/">
            <i class="el-icon-s-home"></i>
            <span slot="title">首页</span>
          </el-menu-item>

          <el-submenu index="1">
            <template slot="title">
              <i class="el-icon-s-shop"></i>
              <span>{{ $t("aside.module") }}</span>
            </template>
            <el-menu-item-group>
              <el-menu-item
                :index="item.path"
                v-for="(item, index) in pathList"
                :key="index"
                >{{ $t(item.name) }}</el-menu-item
              >
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-user-solid"></i>
              <span>{{ $t("aside.test") }}</span>
            </template>
            <el-menu-item-group>
              <el-menu-item v-if="userData.level > 1">{{
                $t("aside.moreThanOne")
              }}</el-menu-item>
              <el-menu-item v-if="userData.level > 2">{{
                $t("aside.moreThanTwo")
              }}</el-menu-item>
              <el-menu-item @click="toOutSide"
                ><i class="el-icon-sunny"></i
                >{{ $t("aside.externalLinks") }}</el-menu-item
              >
              <el-menu-item index="/home/test1"
                ><i class="el-icon-water-cup"></i
                >{{ $t("aside.testPageOne") }}</el-menu-item
              >
              <el-menu-item index="/home/test2"
                ><i class="el-icon-coffee-cup"></i
                >{{ $t("aside.testPageTwo") }}</el-menu-item
              >
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="3">
            <template slot="title">
              <i class="el-icon-user"></i>
              <span>{{ $t("aside.power") }}</span>
            </template>
            <el-menu-item-group>
              <el-menu-item @click="levelDown"
                ><i class="el-icon-caret-bottom"></i
                >{{ $t("aside.levelDown") }}</el-menu-item
              >
              <el-menu-item @click="levelUp"
                ><i class="el-icon-caret-top"></i>{{ $t("aside.levelUp") }}</el-menu-item
              >
              <el-menu-item
                ><i class="el-icon-d-caret"></i
                >{{ $t("aside.curLevel") + userData.level }}</el-menu-item
              >
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { RouterList } from "@/router";
export default {
  name: "Aside",
  inject: ["websiteInfo"],
  data() {
    return {
      userData: {
        level: 3,
      },
      pathList: [],
    };
  },
  methods: {
    levelDown() {
      this.userData.level--;
    },
    levelUp() {
      this.userData.level++;
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
      let homeRouter = RouterList.filter((item) => item.name == "index")[0];
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
