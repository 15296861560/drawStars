<template>
  <div>
    <div class="g-home-module">
      <router-link-normal
        to="/home/resourceHomePage/configure"
        imgSrc="resource/"
        imgName="configure"
        :text="$t('homePage.resourceHomePage.configure')"
      ></router-link-normal>
      <router-link-normal
        to="/home/resourceHomePage/webFrame"
        imgSrc="resource/"
        imgName="webFrame"
        :text="$t('homePage.resourceHomePage.webFrame')"
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
