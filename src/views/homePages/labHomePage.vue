<template>
  <div>
    <div class="g-home-module">
      <router-link to="/home/labHomePage/vue-reactivity" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/lab/bind.svg"  />
          </div>
          <div>
            <p class="m-p">{{$t("homePage.labHomePage.vueReactivity")}}</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/labHomePage/promise" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <h1>{{$t("homePage.labHomePage.promise")}}</h1>
          </div>
          <div>
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
 
  },
};
</script>
<style></style>
