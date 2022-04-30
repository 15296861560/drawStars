<template>
  <div>
    <div class="g-home-module">
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
      homepage: "specialHomePage",
      imgSrc: "special/",
      routes: [
        { name: "transition", imgName: "transition" },
        { name: "animation", imgName: "animation" },
        { name: "words", imgName: "words" },
        { name: "drag", imgName: "drag" },
      ],
    };
  },
};
</script>
