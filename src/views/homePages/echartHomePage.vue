<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:23
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-25 23:40:04
-->
<template>
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
</template>
<script>
import { homePageMixin } from "../mixin/homePageMixin";

export default {
  mixins: [homePageMixin],
  data() {
    return {
      homepage: "echartHomePage",
      imgSrc: "echarts/",
      routes: [
        { name: "basicBar", imgName: "bar" },
        { name: "basicLine", imgName: "line" },
        { name: "basicArea", imgName: "area" },
        { name: "basicPie", imgName: "pie" },
        { name: "baiduMap", imgName: "location" },
        { name: "bar", imgName: "bar" },
        { name: "stackedBar", imgName: "stackedBar" },
        { name: "barLineDrill", imgName: "barLineDrill" },
        { name: "polar", imgName: "polar" },
        { name: "dynamicOrderBar", imgName: "dynamicOrderBar" },
        { name: "eMap", imgName: "map" },
        { name: "gauge", imgName: "gauge" },
      ],
    };
  },
};
</script>
