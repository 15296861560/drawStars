<template>
  <div>
    <stackedBar
      ids="StackedBar"
      :itemData="barData"
      class="m-echart-standard"
    ></stackedBar>
  </div>
</template>

<script>
import StackedBar from "@/components/echarts/StackedBar";

export default {
  components: {
    StackedBar,
  },
  data() {
    return {
      barData: {
        color:["#03E4F6", "#2E86F2", "#E99936","#FF8A79","#D9221A","#A8DE96"],
        legend: [
          {
            name: "访问方式一",
            textStyle: {
              color: "black",
            },
          },
          {
            name: "访问方式二",
            textStyle: {
              color: "black",
            },
          },
          {
            name: "访问方式三",
            textStyle: {
              color: "black",
            },
          },
          {
            name: "访问方式四",
            textStyle: {
              color: "black",
            },
          },
          {
            name: "访问方式五",
            textStyle: {
              color: "black",
            },
          },
        ],
        xAxis: ["周一", "周二", "周三"],
        series: [
          {
            name: "访问方式一",
            type: "bar",
            emphasis: {
              focus: "series",
            },
            data: [120, 132, 101],
          },
          {
            name: "访问方式二",
            type: "bar",
            emphasis: {
              focus: "series",
            },
            data: [220, 182, 191],
          },
          {
            name: "访问方式三",
            type: "bar",
            stack: '网络',
            emphasis: {
              focus: "series",
            },
            data: [150, 232, 201],
          },
          {
            name: "访问方式四",
            type: "bar",
            stack: '网络',
            emphasis: {
              focus: "series",
            },
            data: [150, 232, 201],
          },
          {
            name: "访问方式五",
            type: "bar",
            stack: '网络',
            emphasis: {
              focus: "series",
            },
            data: [50, 32, 21],
          },
        ],
      },
    }
  },
  methods: {
    initData() {
    },
  },
  mounted() {
    this.initData();
  },
};
</script>
