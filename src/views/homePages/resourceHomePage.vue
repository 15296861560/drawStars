<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:23
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-18 16:05:06
-->
<template>
  <div>
    <div class="g-home-module">
      <router-link-normal
        :to="`/home/${homepage}/${page}`"
        :imgName="page"
        :text="$t(`homePage.${homepage}.${page}`)"
        v-for="(page, index) in routes"
        :key="page"
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
      homepage: "resourceHomePage",
      routes: ["configure", "webFrame"],
    };
  },
};
</script>
