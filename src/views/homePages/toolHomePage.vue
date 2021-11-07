<template>
  <div>
    <div class="g-home-module">
      <router-link to="/home/toolHomePage/Lodash" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/tools/lodash.png" />
          </div>
          <div>
            <p class="m-p">{{ $t("homePage.toolHomePage.Lodash") }}</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/toolHomePage/utilities" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/tools/utilities.svg" />
          </div>
          <div>
            <p class="m-p">{{ $t("homePage.toolHomePage.utilities") }}</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/toolHomePage/practice" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/tools/practice.svg" />
          </div>
          <div>
            <p class="m-p">{{ $t("homePage.toolHomePage.practice") }}</p>
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
