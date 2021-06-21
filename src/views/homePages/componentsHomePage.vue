<template>
  <div>
    <div class="g-home-module">
      <router-link to="/home/componentsHomePage/dragAndDropComponents" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/myComponents/drag.svg" />
          </div>
          <div>
            <p class="m-p">{{$t("homePage.componentsHomePage.dragAndDropComponents")}}</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/componentsHomePage/commonComponents" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/myComponents/common.svg" />
          </div>
          <div>
            <p class="m-p">{{$t("homePage.componentsHomePage.commonComponents")}}</p>
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
