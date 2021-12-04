<template>
  <div>
    <div class="g-home">
      <div class="g-home-module">
        <div class="g-home-block">
          <router-link-normal to="/home/echartHomePage" imgName="bar" :text="$t('homePage.echart')" ></router-link-normal>
          <router-link-normal to="/home/toolHomePage" imgName="tool" :text="$t('homePage.tool')" ></router-link-normal>
          <router-link-normal to="/home/componentsHomePage" imgName="components" :text="$t('homePage.components')" ></router-link-normal>
          <router-link-normal to="/home/specialHomePage" imgName="special" :text="$t('homePage.special')" ></router-link-normal>
          <router-link-normal to="/home/dataHomePage" imgName="data" :text="$t('homePage.data')" ></router-link-normal>
          <router-link-normal to="/home/multimediaHomePage" imgName="multimedia" :text="$t('homePage.multimedia')" ></router-link-normal>
          <router-link-normal to="/home/labHomePage" imgName="lab" :text="$t('homePage.lab')" ></router-link-normal>
          <router-link-normal to="/home/caseHomePage" imgName="case" :text="$t('homePage.case')" ></router-link-normal>
        </div>
        <div class="g-home-block">
          <div class="g-module-item">
            <BasicEchart
              :chartData="areaOption"
              echartId="echart-area"
              class="m-echart-small"
            ></BasicEchart>
          </div>
          <div class="g-module-item">
            <BasicEchart
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
    RouterLinkNormal
  },
  data() {
    return {
      dataTimer: null, //定时器
      areaOption: {},
      lineOption: {},
      pieOption: {},
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
  mounted() {
    this.getChartData();

    this.autoTooltip(this.pieOption);
  },
  beforeDestroy() {
    //销毁定时器
    clearInterval(this.dataTimer);
  },
};
</script>
<style></style>
