<template>
  <div>
    <div class="flex">
    <router-link to="/home/echarts/basicBar" class="m-router-link">
      <div class="m-home-button">
        <div class="m-img">
          <img class="m-home-img" src="@/assets/img/bar.svg" alt="柱状图" />
        </div>
        <div>
          <p class="m-p">柱状图</p>
        </div>
      </div>
      </router-link>
    </div>
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
    toBasicBar() {
      this.$router.push({
        path: "/home/echarts/basicBar",
      });
    },
    uploadData() {
      this.$emit("syn");
    },
  },
};
</script>
<style></style>
