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
      routes: ["Mock", "axios", "Sqlite", "MySQL"],
    };
  },
};
</script>
