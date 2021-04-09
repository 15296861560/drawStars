<template>
  <div>
    <barLineDrill
      ids="barLineDrill"
      :itemData="barData"
      class="m-echart-standard"
      height="80vh"
    ></barLineDrill>
  </div>
</template>

<script>
import BarLineDrill from "@/components/echarts/BarLineDrill";

export default {
  components: {
    BarLineDrill,
  },
  data() {
    return {
      barData: {
        gridLeft: "40px",
        gridBottom: "40px",
        openLegend: true,
        barWidth: "30px",
        legend: [
          {
            name: "浏览人数",
            textColor: "#02E9FB",
          },
          {
            name: "下载人数",
            textColor: "#F2A23F",
          },
        ],
        xAxis: ["1月", "2月", "3月", "", "", "1号", "2号", "3号"],
        series: [
          {
            name: "下载人数",
            type: "bar",
            color: "#F2A23F",
            data: [100, 100, 100, "", "", 100, 100, 100],
          },
          {
            name: "浏览人数",
            type: "line",
            yAxisIndex: 1,
            color: "#02E9FB",
            data: [100, 100, 100, "", "", 100, 100, 100],
            lineType: "dashed",
          },
        ],
      },
    };
  },
  methods: {
    initData() {},
  },
  mounted() {
    this.initData();
  },
};
</script>
