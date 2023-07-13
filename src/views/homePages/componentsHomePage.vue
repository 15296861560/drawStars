<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:23
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-18 15:58:56
-->
<template>
  <div>
    <div class="g-home-module">
      <router-link-normal
        :to="`/home/${homepage}/${page.name}`"
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
      homepage: "componentsHomePage",
      routes: [
        // { name: "dragAndDropComponents", imgName: "drag" },
        { name: "commonComponents", imgName: "common" },
      ],
    };
  },
};
</script>
