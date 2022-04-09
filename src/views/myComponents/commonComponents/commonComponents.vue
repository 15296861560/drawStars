<template>
  <div>
    <div class="g-home-module">
      <router-link-normal
        to="/home/componentsHomePage/commonComponents/progressBar"
        imgSrc="myComponents/"
        imgName="progressBar"
        :text="$t('homePage.componentsHomePage.common.progressBar')"
      ></router-link-normal>

      <router-link-normal
        to="/home/componentsHomePage/commonComponents/promptBox"
        imgSrc="myComponents/"
        imgName="promptBox"
        :text="$t('homePage.componentsHomePage.common.promptBox')"
      ></router-link-normal>

      <router-link-normal
        to="/home/componentsHomePage/commonComponents/flop"
        imgSrc="myComponents/"
        imgName="flop"
        :text="$t('homePage.componentsHomePage.common.flop')"
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
    return {};
  },
  methods: {},
};
</script>
<style></style>
