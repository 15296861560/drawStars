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
              <span>模块</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="1-1" @click="toEcharts"
                ><i class="el-icon-s-data"></i>图表</el-menu-item
              >
              <el-menu-item index="1-2" @click="goPage('/home/toolHomePage')"
                ><i class="el-icon-s-cooperation"></i>工具</el-menu-item
              >
              <el-menu-item index="1-3" @click="goPage('/home/componentsHomePage')"
                ><i class="el-icon-s-grid"></i>组件</el-menu-item
              >
              <el-menu-item index="1-4" @click="goPage('/home/specialHomePage')"
                ><i class="el-icon-magic-stick"></i>特效</el-menu-item
              >
              <el-menu-item index="1-5" @click="goPage('/home/dataHomePage')"
                ><i class="el-icon-sort"></i>数据传输</el-menu-item
              >
              <el-menu-item index="1-6" @click="goPage('/home/multimediaHomePage')"
                ><i class="el-icon-video-camera"></i>多媒体</el-menu-item
              >
              <el-menu-item index="1-out" @click="toOutSide"
                ><i class="el-icon-sunny"></i>外链</el-menu-item
              >
              <el-menu-item index="1-end1" @click="toTest1"
                ><i class="el-icon-water-cup"></i>测试页一</el-menu-item
              >
              <el-menu-item index="1-end2" @click="toTest2"
                ><i class="el-icon-coffee-cup"></i>测试页二</el-menu-item
              >
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-user-solid"></i>
              <span>权限测试</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="2-1" v-if="userData.level > 1"
                >一级以上权限</el-menu-item
              >
              <el-menu-item index="2-2" v-if="userData.level > 2"
                >二级以上权限</el-menu-item
              >
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="3">
            <template slot="title">
              <i class="el-icon-user"></i>
              <span>权限</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="3-1" @click="levelDown"
                ><i class="el-icon-caret-bottom"></i>降低权限</el-menu-item
              >
              <el-menu-item index="3-2" @click="levelUp"
                ><i class="el-icon-caret-top"></i>提高权限</el-menu-item
              >
              <el-menu-item index="3-3"
                ><i class="el-icon-d-caret"></i>当前权限等级{{
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
      isCollapse: false,
    };
  },
  computed: {
    isComputer() {
      return this.$store.getters.getIsComputer;
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
      if (!this.isComputer) return;
      this.isCollapse = !this.isCollapse;
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
