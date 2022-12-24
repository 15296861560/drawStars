<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:23
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-04 00:19:19
-->
<template>
  <div>
    <barLineDrill
      echartId="barLineDrill"
      :chartData="barLineData"
      class="m-echart-standard"
    ></barLineDrill>
  </div>
</template>

<script>
import BarLineDrill from "@/components/echarts/BarLineDrill.vue";

export default {
  components: {
    BarLineDrill,
  },
  data() {
    return {
      barLineData: {
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
};
</script>
