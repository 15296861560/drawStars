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
        to="/home/labHomePage/vue-reactivity"
        imgSrc="lab/"
        imgName="bind"
        :text="$t('homePage.labHomePage.vueReactivity')"
      ></router-link-normal>
      <router-link-normal
        to="/home/labHomePage/webpack"
        imgSrc="lab/"
        imgName="webpack"
        :text="$t('homePage.labHomePage.webpack')"
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
