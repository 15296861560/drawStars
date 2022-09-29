<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-05-23 23:28:07
 * @LastEditors: lgy
 * @LastEditTime: 2022-09-25 23:02:02
-->
<template>
  <div>
    <div class="g-home-module">
      <router-link to="/home/toolHomePage/Lodash" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/tools/lodash.png" />
          </div>
          <div>
            <p class="m-p">{{ $t("homePage.toolHomePage.Lodash") }}</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/toolHomePage/agora" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/tools/agora.png" />
          </div>
          <div>
            <p class="m-p">{{ $t("homePage.toolHomePage.agora") }}</p>
          </div>
        </div>
      </router-link>

      <router-link-normal
        :to="`/home/toolHomePage/${name}`"
        imgSrc="tools/"
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
      routes: ["utilities", "practice", "chat", "translate", "pay", "compress"],
    };
  },
};
</script>
