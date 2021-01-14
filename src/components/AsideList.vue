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
          style="width: 101%"
        >
          >
          <el-menu-item @click="goPage('/')">
            <i class="el-icon-s-home"></i>
            <span slot="title">后台中心</span>
          </el-menu-item>

          <el-submenu index="1">
            <template slot="title">
              <i class="el-icon-s-shop"></i>
              <span>模块</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="1-1" @click="toOutSide">外链</el-menu-item>
              <el-menu-item index="1-2" @click="toEcharts">图表</el-menu-item>
              <el-menu-item index="1-3" @click="toTest1">特效</el-menu-item>
              <el-menu-item index="1-4" @click="toTest2">组件</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-s-order"></i>
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
              <i class="el-icon-s-data"></i>
              <span>权限</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="3-1" @click="levelDown">降低权限</el-menu-item>
              <el-menu-item index="3-2" @click="levelUp">提高权限</el-menu-item>
              <el-menu-item index="3-3">当前权限等级{{ userData.level }}</el-menu-item>
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
  // beforeCreate() {
  //   $this = this;
  // },
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
      this.goPage("/home/echartHomePages");
    },
  },
};
</script>

<style scoped></style>
