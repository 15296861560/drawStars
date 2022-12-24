<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:23
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-17 14:48:53
-->
<template>
  <baidu-map class="map" ref="map" :apiKey="apiKey" :center="point"> </baidu-map>
</template>

<script lang="ts">
import { BaiduMap } from "baidu-map-vue3";
import { ref } from "vue";
const point = ref({
  lng: 116.403963,
  lat: 39.915119,
});
const apiKey = ref("fLZT8N8BfIbR2eAyV4gGRE683PCFOZXn");
// export default {
//   data() {
//     return {
//       point: {
//         lng: 116.403963,
//         lat: 39.915119,
//       },
//       apiKey: "fLZT8N8BfIbR2eAyV4gGRE683PCFOZXn",
//     };
//   },
// };
</script>
<style lang="less">
.map {
  width: 100%;
  height: 400px;
}
</style>
