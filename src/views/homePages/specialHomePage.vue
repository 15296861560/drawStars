<template>
  <div>
    <div class="g-home-module">
      <router-link-normal
        to="/home/specialHomePage/transition"
        imgSrc="special/"
        imgName="transition"
        :text="$t('homePage.specialHomePage.transition')"
      ></router-link-normal>
      <router-link-normal
        to="/home/specialHomePage/animation"
        imgSrc="special/"
        imgName="animation"
        :text="$t('homePage.specialHomePage.animation')"
      ></router-link-normal>
      <router-link-normal
        to="/home/specialHomePage/words"
        imgSrc="special/"
        imgName="words"
        :text="$t('homePage.specialHomePage.words')"
      ></router-link-normal>
    </div>
  </div>
</template>
<script>
import { homePageMixin } from "../mixin/homePageMixin";
export default {
  mixins: [homePageMixin],
};
</script>
