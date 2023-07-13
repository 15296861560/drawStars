<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:22
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-18 03:34:22
-->
<template>
  <div>
    <div class="g-home-module">
      <router-link-normal
        :to="`/home/toolHomePage/${homepage}/${page}`"
        :imgName="page"
        :text="$t(`homePage.toolHomePage.payment.${page}`)"
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
      homepage: "pay",
      imgSrc: "tools/pay/",
      routes: ["alipay"],
    };
  },
  methods: {},
};
</script>
<style></style>
