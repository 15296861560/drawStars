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
