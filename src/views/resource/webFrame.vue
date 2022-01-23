<template>
  <div class="g-list-vertical">
    <p
      v-for="(item, index) in webFrameAddress"
      :href="item.address"
      :key="index"
      class="u-link"
      @click="open(item)"
    >
      {{ item.name }}
    </p>
  </div>
</template>
<script>
import { queryWebsite } from "@/assets/js/api/webAdressContrller/webAdressApi.js";
export default {
  data() {
    return {
      webFrameAddress: [],
    };
  },
  methods: {
    query() {
      queryWebsite()
        .then((result) => {
          if (result.status) {
            this.webFrameAddress = result.data.map((item) => {
              item.create_time = new Date(item.create_time).toLocaleString();
              item.update_time = new Date(item.update_time).toLocaleString();
              return item;
            });
          } else {
            this.$message({
              type: "error",
              message: result.msg,
            });
          }
        })
        .catch((err) => {});
    },
    open(openObj) {
      switch (openObj.open_way) {
        case "newTab":
          window.open(openObj.href);
          break;
        default:
          break;
      }
    },
  },
  created() {
    this.query();
  },
};
</script>
<style></style>
