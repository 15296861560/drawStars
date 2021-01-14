<template>
  <div class="navigation">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item v-for="(item, index) in titleData" :key="index">
        <a href="/" v-if="index == 0"><i class="el-icon-menu"></i>{{ item }}</a>
        <span v-if="index != 0">{{ item }}</span>
      </el-breadcrumb-item>

      <el-dropdown style="float: right">
        <span class="el-dropdown-link">
          lgy<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>个人中心</el-dropdown-item>
          <el-dropdown-item>修改密码</el-dropdown-item>
          <el-dropdown-item divided>退出登录</el-dropdown-item>
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
    };
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
      console.log(key);
      // if(key=='1-3')this.$router.push('https://cn.bing.com/');
      // if(key=='1-3')window.localtion.href = 'https://cn.bing.com/';
    },
  },
  mounted() {
    console.log(this.titleData);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.navigation {
  padding: 20px;
}
</style>
