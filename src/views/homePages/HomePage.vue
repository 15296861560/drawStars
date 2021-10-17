<template>
  <div>
    <div class="g-home">
      <div class="g-home-module">
        <div class="g-home-block">
          <router-link to="/home/echartHomePage" class="m-router-link">
            <div class="m-home-button">
              <div class="m-img">
                <img
                  class="m-home-img"
                  src="@/assets/img/bar.svg"
                  :alt="$t('homePage.echart')"
                />
              </div>
              <div>
                <p class="m-p">{{ $t("homePage.echart") }}</p>
              </div>
            </div>
          </router-link>
          <router-link to="/home/toolHomePage" class="m-router-link">
            <div class="m-home-button">
              <div class="m-img">
                <img
                  class="m-home-img"
                  src="@/assets/img/tool.svg"
                  :alt="$t('homePage.tool')"
                />
              </div>
              <div>
                <p class="m-p">{{ $t("homePage.tool") }}</p>
              </div>
            </div>
          </router-link>
          <router-link to="/home/componentsHomePage" class="m-router-link">
            <div class="m-home-button">
              <div class="m-img">
                <img
                  class="m-home-img"
                  src="@/assets/img/components.svg"
                  :alt="$t('homePage.components')"
                />
              </div>
              <div>
                <p class="m-p">{{ $t("homePage.components") }}</p>
              </div>
            </div>
          </router-link>
          <router-link to="/home/specialHomePage" class="m-router-link">
            <div class="m-home-button">
              <div class="m-img">
                <img
                  class="m-home-img"
                  src="@/assets/img/special.svg"
                  :alt="$t('homePage.special')"
                />
              </div>
              <div>
                <p class="m-p">{{ $t("homePage.special") }}</p>
              </div>
            </div>
          </router-link>
          <router-link to="/home/dataHomePage" class="m-router-link">
            <div class="m-home-button">
              <div class="m-img">
                <img
                  class="m-home-img"
                  src="@/assets/img/data.svg"
                  :alt="$t('homePage.data')"
                />
              </div>
              <div>
                <p class="m-p">{{ $t("homePage.data") }}</p>
              </div>
            </div>
          </router-link>
          <router-link to="/home/multimediaHomePage" class="m-router-link">
            <div class="m-home-button">
              <div class="m-img">
                <img
                  class="m-home-img"
                  src="@/assets/img/multimedia.svg"
                  :alt="$t('homePage.multimedia')"
                />
              </div>
              <div>
                <p class="m-p">{{ $t("homePage.multimedia") }}</p>
              </div>
            </div>
          </router-link>
          <router-link to="/home/labHomePage" class="m-router-link">
            <div class="m-home-button">
              <div class="m-img">
                <img
                  class="m-home-img"
                  src="@/assets/img/lab.svg"
                  :alt="$t('homePage.lab')"
                />
              </div>
              <div>
                <p class="m-p">{{ $t("homePage.lab") }}</p>
              </div>
            </div>
          </router-link>
          <router-link to="/home/caseHomePage" class="m-router-link">
            <div class="m-home-button">
              <div class="m-img">
                <img
                  class="m-home-img"
                  src="@/assets/img/case.svg"
                  :alt="$t('homePage.case')"
                />
              </div>
              <div>
                <p class="m-p">{{ $t("homePage.case") }}</p>
              </div>
            </div>
          </router-link>
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

        <div class="g-home-block">
          <dependence></dependence>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Dependence from "@/components/stars/dependence.vue";
import BasicEchart from "@/components/echarts/BasicEchart.vue";
import chartData from "@/assets/js/testData/chartData";
import Mock from "mockjs";

export default {
  components: {
    BasicEchart,
    Dependence,
  },
  data() {
    return {
      dataTimer: null, //定时器
      dataTimer2: null, //定时器
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
      this.dataTimer2 = setInterval(function () {
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

    // if (this.dataTimer) {
    //   clearInterval(this.dataTimer);
    // }
    // this.dataTimer = setInterval(() => {
    //   this.updateChartData();
    // }, 3000);
    this.autoTooltip(this.pieOption);
  },
  beforeDestroy() {
    //销毁定时器
    clearInterval(this.dataTimer);
    clearInterval(this.dataTimer2);
  },
};
</script>
<style></style>
