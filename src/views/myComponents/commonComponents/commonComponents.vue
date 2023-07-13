<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-29 00:16:57
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-18 16:22:46
-->
<template>
  <div>
    <div class="g-home-module">
      <router-link-normal
        :to="`/home/componentsHomePage/${homepage}/${page}`"
        :imgName="page"
        :text="$t(`homePage.componentsHomePage.common.${page}`)"
        v-for="(page, index) in routes"
        :key="page"
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
      routes: [
        "progressBar",
        //  "progressBar",
        //  "flop"
      ],
    };
  },
  methods: {},
};
</script>
<style></style>
