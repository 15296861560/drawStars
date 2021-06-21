<template>
  <div>
    <el-row>
      <el-col>
        <el-menu
          default-active="1"
          class="el-menu-vertical-demo"
          @open="handleOpen"
          @close="handleClose"
          background-color="#282c34"
          text-color="#fff"
          active-text-color="#ffd04b"
          :collapse="isCollapse"
        >
          >
          <el-menu-item @click="collapse" class="m-text-center">
            <i class="el-icon-s-home"></i>
            <!-- <span slot="title">后台中心</span> -->
          </el-menu-item>

          <el-submenu index="1">
            <template slot="title">
              <i class="el-icon-s-shop"></i>
              <span>{{$t("aside.module")}}</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="1-1" @click="toEcharts"
                ><i class="el-icon-s-data"></i>{{$t("homePage.echart")}}</el-menu-item
              >
              <el-menu-item index="1-2" @click="goPage('/home/toolHomePage')"
                ><i class="el-icon-s-cooperation"></i>{{$t("homePage.tool")}}</el-menu-item
              >
              <el-menu-item index="1-3" @click="goPage('/home/componentsHomePage')"
                ><i class="el-icon-s-grid"></i>{{$t("homePage.components")}}</el-menu-item
              >
              <el-menu-item index="1-4" @click="goPage('/home/specialHomePage')"
                ><i class="el-icon-magic-stick"></i>{{$t("homePage.special")}}</el-menu-item
              >
              <el-menu-item index="1-5" @click="goPage('/home/dataHomePage')"
                ><i class="el-icon-sort"></i>{{$t("homePage.data")}}</el-menu-item
              >
              <el-menu-item index="1-6" @click="goPage('/home/multimediaHomePage')"
                ><i class="el-icon-video-camera"></i>{{$t("homePage.multimedia")}}</el-menu-item
              >
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-user-solid"></i>
              <span>{{$t("aside.test")}}</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="2-1" v-if="userData.level > 1"
                >{{$t("aside.moreThanOne")}}</el-menu-item
              >
              <el-menu-item index="2-2" v-if="userData.level > 2"
                >{{$t("aside.moreThanTwo")}}</el-menu-item
              >
              <el-menu-item index="2-out" @click="toOutSide"
                ><i class="el-icon-sunny"></i>{{$t("aside.externalLinks")}}</el-menu-item
              >
              <el-menu-item index="2-test1" @click="toTest1"
                ><i class="el-icon-water-cup"></i>{{$t("aside.testPageOne")}}</el-menu-item
              >
              <el-menu-item index="2-test2" @click="toTest2"
                ><i class="el-icon-coffee-cup"></i>{{$t("aside.testPageTwo")}}</el-menu-item
              >
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="3">
            <template slot="title">
              <i class="el-icon-user"></i>
              <span>{{$t("aside.power")}}</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="3-1" @click="levelDown"
                ><i class="el-icon-caret-bottom"></i>{{$t("aside.levelDown")}}</el-menu-item
              >
              <el-menu-item index="3-2" @click="levelUp"
                ><i class="el-icon-caret-top"></i>{{$t("aside.levelUp")}}</el-menu-item
              >
              <el-menu-item index="3-3"
                ><i class="el-icon-d-caret"></i>{{$t("aside.curLevel")+
                  userData.level
                }}</el-menu-item
              >
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "Aside",
  data() {
    return {
      userData: {
        level: 3,
      },
    };
  },
  computed: {
    isComputer() {
      return this.$store.getters.getIsComputer;
    },
    isCollapse() {
      return this.$store.getters.getIsCollapse;
    },
  },
  methods: {
    levelDown() {
      this.userData.level--;
    },
    levelUp() {
      this.userData.level++;
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
      if (key == "1-1") window.open("https://cn.bing.com/");
      if (key == "2-1") {
        this.$router.push({
          path: "/home/homepage",
        });
      }
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },

    goPage(link) {
      this.$router.push(link).catch((error) => error);
    },
    toOutSide() {
      window.open("https://cn.bing.com/");
    },
    toTest1() {
      this.goPage("/home/test1");
    },
    toTest2() {
      this.goPage("/home/test2");
    },
    toEcharts() {
      this.goPage("/home/echartHomePage");
    },
    collapse() {
      if (!this.isComputer) {
        this.$store.dispatch("changeSettingInfo", {
          attr: "isCollapse",
          val: true,
        });
      } else {
        this.$store.dispatch("changeSettingInfo", {
          attr: "isCollapse",
          val: !this.isCollapse,
        });
      }
      this.$emit("collapse", this.isCollapse);
    },
  },
};
</script>

<style scoped>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>
