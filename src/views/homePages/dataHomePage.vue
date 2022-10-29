<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-05-23 23:24:08
 * @LastEditors: lgy
 * @LastEditTime: 2022-10-29 17:15:28
-->
<template>
  <div>
    <div class="g-home-module">
      <router-link
        :to="`/home/${homepage}/${name}`"
        class="m-router-link"
        v-for="(name, index) in routes"
        :key="name"
      >
        <div class="m-home-button">
          <div class="m-img">
            <h1>{{ name }}</h1>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>
<script>
import { homePageMixin } from "../mixin/homePageMixin";
export default {
  mixins: [homePageMixin],
  data() {
    return {
      homepage: "dataHomePage",
      imgSrc: "",
      routes: ["Mock", "axios", "Sqlite", "MySQL", "WebSocket"],
    };
  },
};
</script>
