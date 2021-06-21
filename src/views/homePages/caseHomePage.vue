<template>
  <div>
    <div class="g-home-module">
      <router-link to="/home/caseHomePage/" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/case/boards.svg"  />
          </div>
          <div>
            <p class="m-p">{{$t("homePage.caseHomePage.board")}}</p>
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
