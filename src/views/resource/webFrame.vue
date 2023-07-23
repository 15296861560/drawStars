<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:22
 * @LastEditors: lgy
 * @LastEditTime: 2023-07-23 19:08:32
-->
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
import { queryWebsite } from "@/assets/js/api/webAdressController/webAdressApi.js";
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
          window.open(openObj.address);
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
