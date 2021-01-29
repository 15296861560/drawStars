<template>
  <div>
    <div class="g-home-module">
      <router-link to="/home/componentsHomePage/commonComponents/progressBar" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/myComponents/progressBar.svg" />
          </div>
          <div>
            <p class="m-p">进度条</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/componentsHomePage/commonComponents/promptBox" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/myComponents/promptBox.svg" />
          </div>
          <div>
            <p class="m-p">提示框</p>
          </div>
        </div>
      </router-link>
    </div>
    <div class="g-home-module mt10">
    <router-view/>
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
