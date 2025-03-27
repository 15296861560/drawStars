<template>
  <div>
    <div class="g-home-module">
      <router-link-normal
        :to="`/home/${homepage}/${page}`"
        :imgName="page"
        :text="$t(`homePage.${homepage}.${page}`)"
        v-for="(page, index) in routes"
        :key="page"
      ></router-link-normal>
    </div>
  </div>
</template>
<script>
import { homePageMixin } from "../mixin/homePageMixin";
export default {
  mixins: [homePageMixin],
  data() {
    return {
      homepage: "manageHomePage",
      routes: ["notice"],
    };
  },
};
</script>
