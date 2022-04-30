<template>
  <div>
    <div class="g-home-module">
      <router-link to="/home/labHomePage/promise" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <h1>{{ $t("homePage.labHomePage.promise") }}</h1>
          </div>
          <div></div>
        </div>
      </router-link>

      <router-link-normal
        :to="`/home/${homepage}/${page.name}`"
        :imgSrc="imgSrc"
        :imgName="page.imgName"
        :text="$t(`homePage.${homepage}.${page.name}`)"
        v-for="(page, index) in routes"
        :key="page.name"
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
      homepage: "labHomePage",
      imgSrc: "lab/",
      routes: [
        { name: "vueReactivity", imgName: "bind" },
        { name: "webpack", imgName: "webpack" },
      ],
    };
  },
};
</script>
