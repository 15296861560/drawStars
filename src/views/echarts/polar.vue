<template>
  <div>
    <polar echartId="polar" :chartData="polarData" class="m-echart-standard"></polar>
  </div>
</template>

<script>
import Polar from "@/components/echarts/Polar";

export default {
  components: {
    Polar,
  },
  data() {
    return {
      polarData: {
        tooltip: "达成率",
        data: [66.6],
        name: "已达成",
      },
    };
  },
};
</script>
