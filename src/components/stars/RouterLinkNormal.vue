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
  data() {
    return {
      src: require("@/assets/img/" + this.imgSrc + this.imgName + ".svg"),
    };
  },
  methods: {},
  mounted() {},
};
</script>

<style lang="less" scoped></style>
