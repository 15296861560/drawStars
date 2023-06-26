<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2023-06-25 22:46:31
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-26 23:48:15
-->
<template>
  <div>
    <gauge echartId="gauge" :chartData="gaugeData" class="m-echart-standard"></gauge>

    <div class="network-info">
      <h2>网络：{{ effectiveType }}</h2>
      <h2>往返时延：{{ rtt }}</h2>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, reactive, watch, computed, nextTick } from "vue";
import Gauge from "@/components/echarts/Gauge.vue";

let connection = reactive({});

const effectiveType = computed(() => {
  return connection?.effectiveType;
});
const rtt = computed(() => {
  return connection?.rtt;
});
const downlink = computed(() => {
  return connection?.downlink;
});

const gaugeData = computed(() => {
  return {
    unit: "MB/S",
    data: [
      {
        name: "网速",
        value: downlink,
      },
    ],
  };
});

onMounted(() => {
  const conn =
    navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  connection.effectiveType = conn.effectiveType;
  connection.rtt = conn.rtt;
  connection.downlink = conn.downlink;
});
</script>
<style scoped>
.network-info {
  display: flex;
  justify-content: space-around;
}
</style>
