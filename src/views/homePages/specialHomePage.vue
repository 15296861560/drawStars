<template>
  <div>
    <div class="g-home-module">
      <router-link to="/home/specialHomePage/transition" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/special/transition.svg" />
          </div>
          <div>
            <p class="m-p">{{$t("homePage.specialHomePage.transition")}}</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/specialHomePage/animation" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/special/animation.svg" />
          </div>
          <div>
            <p class="m-p">{{$t("homePage.specialHomePage.animation")}}</p>
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
