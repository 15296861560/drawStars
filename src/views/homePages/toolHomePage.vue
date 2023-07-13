<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-05-23 23:28:07
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-22 17:22:21
-->
<template>
  <div>
    <div class="g-home-module">
      <router-link to="/home/toolHomePage/Lodash" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/png/lodash.png" />
          </div>
          <div>
            <p class="m-p">{{ $t("homePage.toolHomePage.Lodash") }}</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/toolHomePage/agora" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/png/agora.png" />
          </div>
          <div>
            <p class="m-p">{{ $t("homePage.toolHomePage.agora") }}</p>
          </div>
        </div>
      </router-link>

      <router-link-normal
        :to="`/home/toolHomePage/${name}`"
        :imgName="name"
        :text="$t(`homePage.toolHomePage.${name}`)"
        v-for="(name, index) in routes"
        :key="name"
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
      routes: ["chat","utilities", "practice", "translate", "pay", "compress","networkStrength"],
    };
  },
};
</script>
