<template>
  <div>
    <div class="g-home-module">
      <router-link-normal
        to="/home/caseHomePage"
        imgSrc="case/"
        imgName="boards"
        :text="$t('homePage.caseHomePage.board')"
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
