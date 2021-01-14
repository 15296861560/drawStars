<template>
  <div>
    <p @click="toTest">图表模块</p>
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
