<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 14:38:16
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-18 03:28:39
-->
<template>
  <div>
    <router-link :to="to" class="m-router-link">
      <div class="m-home-button">
        <div class="m-img">
          <span class="m-home-img" :class="`drawstars-icon-${imgName}`"></span>
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
    text: {
      type: String,
      default: "",
    },
    format: {
      type: String,
      default: "svg",
    },
  },
};
</script>

<style lang="less" scoped></style>
