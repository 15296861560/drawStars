<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 14:38:16
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-27 23:39:22
-->
<template>
  <div>
    <router-link :to="to" class="m-router-link">
      <div class="m-home-button">
        <div class="m-img">
          <img class="m-home-img" :src="src" :alt="text" />
        </div>
        <div>
          <p class="m-p">{{ text }}</p>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
export default {
  name: "RouterLinkNormal",
  props: {
    to: {
      type: String,
      default: "#",
    },
    imgName: {
      type: String,
      default: "",
    },
    imgSrc: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      default: "",
    },
    format: {
      type: String,
      default: "svg",
    },
  },
  computed: {
    src() {
      let url = `/src/assets/img/${this.imgSrc}${this.imgName}.svg`;
      return new URL(url, import.meta.url).href;
    },
  },
};
</script>

<style lang="less" scoped></style>
