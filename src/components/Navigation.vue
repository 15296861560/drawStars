<template>
  <div class="navigation">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item
        v-show="isComputer"
        v-for="(item, index) in titleData"
        :key="index"
      >
        <a href="/" v-if="index == 0"><i class="el-icon-menu"></i>{{ item }}</a>
        <span v-if="index != 0" @click="goPage(index)" class="title">{{ item }}</span>
      </el-breadcrumb-item>

      <el-breadcrumb-item v-show="!isComputer">
        <a href="/"><i class="el-icon-menu"></i>{{ titleData[0] }}</a>
      </el-breadcrumb-item>

      <el-dropdown style="float: right">
        <span class="el-dropdown-link">
          {{ $store.getters.getUserName
          }}<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>个人中心</el-dropdown-item>
          <el-dropdown-item>修改密码</el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-breadcrumb>
  </div>
</template>

<script>
export default {
  name: "Navigation",
  props: {
    titleData: Array,
  },
  data() {
    return {
      activeIndex: "1",
      activeIndex2: "1",
      search: "",
      screenHeight: document.documentElement.clientHeight, //获取浏览器高度
      screenWidth: document.documentElement.clientWidth, //获取浏览器宽度
    };
  },
  computed: {
    isComputer() {
      return this.$store.getters.getIsComputer;
    },
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
      console.log(key);
      // if(key=='1-3')this.$router.push('https://cn.bing.com/');
      // if(key=='1-3')window.localtion.href = 'https://cn.bing.com/';
    },
    goPage(index) {
      let path = this.$route.path;
      let paths = path.split("/");
      let toPath = "";
      for (let i = 1; i <= index + 1; i++) {
        toPath += "/" + paths[i];
      }
      console.log(toPath);
      //当前路径不跳转
      if (toPath == path) return;
      this.$router.push({
        path: toPath,
      });
    },
    logout() {
      this.$store.dispatch("changeUserInfo", {
        attr: "userName",
        val: "未登录",
      });
    },
  },
  watch: {},
  mounted() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.navigation {
  padding: 20px;
}

.title:hover {
  color: #4395ff;
}
.title:active {
  color: aqua;
}
</style>
