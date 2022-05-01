<template>
  <div>
    <div class="g-home-module">
      <router-link-normal
        :to="`/home/componentsHomePage/${homepage}/${page.name}`"
        :imgSrc="imgSrc"
        :imgName="page.imgName"
        :text="$t(`homePage.componentsHomePage.common.${page.name}`)"
        v-for="(page, index) in routes"
        :key="page.name"
      ></router-link-normal>
    </div>
    <div class="g-home-module mt10">
      <router-view />
    </div>
  </div>
</template>
<script>
import { homePageMixin } from "../../mixin/homePageMixin";
export default {
  mixins: [homePageMixin],
  data() {
    return {
      homepage: "commonComponents",
      imgSrc: "myComponents/",
      routes: [
        { name: "progressBar", imgName: "progressBar" },
        { name: "promptBox", imgName: "promptBox" },
        { name: "flop", imgName: "flop" },
      ],
    };
  },
  methods: {},
};
</script>
<style></style>
