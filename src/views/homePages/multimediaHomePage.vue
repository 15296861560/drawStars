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
      homepage: "multimediaHomePage",
      imgSrc: "multimedia/",
      routes: [
        { name: "simpleUse", imgName: "simple" },
        { name: "camera", imgName: "camera" },
        { name: "pictureEditing", imgName: "crop" },
        { name: "processVideo", imgName: "processVideo" },
      ],
    };
  },
};
</script>
