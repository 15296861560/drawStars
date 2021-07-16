<template>
  <div>
    <div class="g-home-module">
      <router-link to="/home/dataHomePage/Mock" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <h1>{{ $t("homePage.dataHomePage.Mock") }}</h1>
          </div>
          <!-- <div>
            <p class="m-p">Mock</p>
          </div> -->
        </div>
      </router-link>
      <router-link to="/home/dataHomePage/axios" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <h1>{{ $t("homePage.dataHomePage.axios") }}</h1>
          </div>
          <!-- <div>
            <p class="m-p">axios</p>
          </div> -->
        </div>
      </router-link>

      <router-link to="/home/dataHomePage/Sqlite" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img"><h1>Sqlite</h1></div>
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
