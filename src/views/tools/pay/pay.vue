<template>
  <div>
    <div class="g-home-module">
      <router-link-normal
        :to="`/home/toolHomePage/${homepage}/${page.name}`"
        :imgSrc="imgSrc"
        :imgName="page.imgName"
        :text="$t(`homePage.toolHomePage.payment.${page.name}`)"
        v-for="(page, index) in routes"
        :key="page.name"
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
      routes: [{ name: "Alipay", imgName: "Alipay" }],
    };
  },
  methods: {},
};
</script>
<style></style>
