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
      homepage: "echartHomePage",
      imgSrc: "echarts/",
      routes: [
        { name: "basicBar", imgName: "bar" },
        { name: "basicLine", imgName: "line" },
        { name: "basicPie", imgName: "pie" },
        { name: "baiduMap", imgName: "location" },
        { name: "bar", imgName: "bar" },
        { name: "stackedBar", imgName: "stackedBar" },
        { name: "barLineDrill", imgName: "barLineDrill" },
        { name: "polar", imgName: "polar" },
        { name: "dynamicOrderBar", imgName: "dynamicOrderBar" },
        { name: "basicBar", imgName: "bar" },
        { name: "eMap", imgName: "map" },
      ],
    };
  },
};
</script>
