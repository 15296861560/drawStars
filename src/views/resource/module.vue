<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2023-07-24 23:38:40
 * @LastEditors: lgy
 * @LastEditTime: 2023-07-26 23:26:08
-->
<template>
  <iframe class="normal-frame" :src="frameSrc"></iframe>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
const frameSrc = ref("");

onMounted(() => {
  frameSrc.value = route.query.address;
});
</script>
<style scoped>
.normal-frame {
  width: 100%;
  height: calc(100vh - 182px);
  border: none;
}
</style>
