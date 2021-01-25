<template>
  <div>
    <div class="g-home-module">
      <router-link to="/home/componentsHomePage/dragAndDropComponents" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/myComponents/drag.svg" />
          </div>
          <div>
            <p class="m-p">可视化拖拽组件</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/componentsHomePage/commonComponents" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/myComponents/common.svg" />
          </div>
          <div>
            <p class="m-p">常用组件</p>
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
  methods: {},
};
</script>
<style></style>
