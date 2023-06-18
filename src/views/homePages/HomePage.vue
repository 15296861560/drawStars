<template>
  <div>
    <div class="g-home">
      <div class="g-home-module">
        <div class="g-home-block">
          <router-link-normal
            v-for="route in routes"
            :key="route.name"
            :to="route.path"
            :imgName="route.name"
            :text="$t(`homePage.${route.name}`)"
          ></router-link-normal>
        </div>
        <div class="g-home-block">
          <div class="g-module-item">
            <BasicEchart
              v-if="!isHidden"
              :chartData="areaOption"
              echartId="echart-area"
              class="m-echart-small"
            ></BasicEchart>
          </div>
          <div class="g-module-item">
            <BasicEchart
              v-if="!isHidden"
              :chartData="pieOption"
              echartId="echart-pie"
              class="m-echart-small"
            ></BasicEchart>
          </div>
        </div>

        <div class="g-flex-between w-per100">
          <dependence></dependence>
          <commitInfo></commitInfo>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Dependence from "@/components/part/dependence.vue";
import CommitInfo from "@/components/part/commitInfo.vue";
import RouterLinkNormal from "@/components/stars/RouterLinkNormal.vue";
import BasicEchart from "@/components/echarts/BasicEchart.vue";
import chartData from "@/assets/js/testData/chartData";
import Mock from "mockjs";

export default {
  components: {
    BasicEchart,
    Dependence,
    CommitInfo,
    RouterLinkNormal,
  },
  data() {
    return {
      dataTimer: null, //定时器
      routes: [
        { name: "echart", path: "/home/echartHomePage" },
        { name: "tool", path: "/home/toolHomePage" },
        { name: "components", path: "/home/componentsHomePage" },
        { name: "special", path: "/home/specialHomePage" },
        { name: "data", path: "/home/dataHomePage" },
        { name: "multimedia", path: "/home/multimediaHomePage" },
        { name: "lab", path: "/home/labHomePage" },
        { name: "case", path: "/home/caseHomePage" },
        { name: "resource", path: "/home/resourceHomePage" },
      ],
      areaOption: {},
      lineOption: {},
      pieOption: {},
      isHidden: true,
    };
  },
  methods: {
    getChartData() {
      this.areaOption = chartData.areaOption;
      this.lineOption = chartData.lineOption;
      this.pieOption = chartData.pieOption;
    },
    //模拟更新数据
    updateChartData() {
      let data = this.areaOption.series[0].data;
      data.forEach((element, index, arr) => {
        arr[index] = Mock.mock({
          "number|0-250": 1,
        }).number;
      });
      this.areaOption.series[0].data = [];
      this.areaOption.series[0].data = data;
    },
    autoTooltip(option) {
      let pieChart = this.$echarts.getInstanceByDom(
        document.getElementById("echart-pie")
      );
      let currentIndex = 0;
      this.dataTimer = setInterval(function () {
        let dataLen = option.series[0].data.length;
        // 取消之前高亮的图形
        pieChart.dispatchAction({
          type: "downplay",
          seriesIndex: 0,
          dataIndex: currentIndex,
        });
        currentIndex = (currentIndex + 1) % dataLen;
        // 高亮当前图形
        pieChart.dispatchAction({
          type: "highlight",
          seriesIndex: 0,
          dataIndex: currentIndex,
        });
        // 显示 tooltip
        pieChart.dispatchAction({
          type: "showTip",
          seriesIndex: 0,
          dataIndex: currentIndex,
        });
      }, 1000);
    },
  },
  activated() {
    this.isHidden = false;
    this.$nextTick(() => {
      this.getChartData();
      this.autoTooltip(this.pieOption);
    });
  },
  mounted() {},
  deactivated() {
    this.isHidden = true;
    //销毁定时器
    clearInterval(this.dataTimer);
  },
  beforeDestroy() {
    //销毁定时器
    clearInterval(this.dataTimer);
  },
};
</script>
<style></style>
