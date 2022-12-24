<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:22
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-26 16:43:31
-->
<template>
  <div>
    <p @click="toTest">aaa</p>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  methods: {
    toTest() {
      this.$router.push({
        path: "/home/homepage",
      });
    },
    uploadData() {
      this.$emit("syn");
    },
  },
};
</script>
<style></style>
