<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-08-14 00:39:34
 * @LastEditors: lgy
 * @LastEditTime: 2023-01-03 23:34:20
-->
<template>
  <div>
    <div class="g-home-module">
      <el-button
        type="success"
        plain
        v-for="(demo, index) in demos"
        :key="demo.name"
        @click="toPage(demo.path)"
      >
        {{ demo.name }}
      </el-button>
    </div>
    <div class="g-home-module">
      <router-view />
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      demos: [
        { name: "爱心", path: "love" },
        { name: "星空", path: "skystar" },
      ],
    };
  },
  methods: {
    toPage(path) {
      let realPath = "/home/caseHomePage/demo/" + path;
      this.$router.push(realPath).catch((error) => error);
    },
  },
};
</script>
<style></style>
