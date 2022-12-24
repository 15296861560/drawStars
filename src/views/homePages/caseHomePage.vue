<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-09-29 23:49:47
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-13 14:02:34
-->
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
      homepage: "caseHomePage",
      imgSrc: "case/",
      routes: [
        { name: "board", imgName: "boards" },
        { name: "demo", imgName: "demos" },
        { name: "game", imgName: "games" },
      ],
    };
  },
};
</script>
