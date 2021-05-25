<template>
  <div>
    <div class="g-home">
      <div class="g-home-module">
        <div style="display: flex">
          <router-link to="/home/echartHomePage" class="m-router-link">
            <div class="m-home-button">
              <div class="m-img">
                <img class="m-home-img" src="@/assets/img/bar.svg" alt="图表" />
              </div>
              <div>
                <p class="m-p">图表</p>
              </div>
            </div>
          </router-link>
          <router-link to="/home/toolHomePage" class="m-router-link">
            <div class="m-home-button">
              <div class="m-img">
                <img class="m-home-img" src="@/assets/img/tool.svg" alt="工具" />
              </div>
              <div>
                <p class="m-p">工具</p>
              </div>
            </div>
          </router-link>
          <router-link to="/home/componentsHomePage" class="m-router-link">
            <div class="m-home-button">
              <div class="m-img">
                <img class="m-home-img" src="@/assets/img/components.svg" alt="组件" />
              </div>
              <div>
                <p class="m-p">组件</p>
              </div>
            </div>
          </router-link>
          <router-link to="/home/specialHomePage" class="m-router-link">
            <div class="m-home-button">
              <div class="m-img">
                <img class="m-home-img" src="@/assets/img/special.svg" alt="特效" />
              </div>
              <div>
                <p class="m-p">特效</p>
              </div>
            </div>
          </router-link>
          <router-link to="/home/dataHomePage" class="m-router-link">
            <div class="m-home-button">
              <div class="m-img">
                <img class="m-home-img" src="@/assets/img/data.svg" alt="数据传输" />
              </div>
              <div>
                <p class="m-p">数据传输</p>
              </div>
            </div>
          </router-link>
          <router-link to="/home/multimediaHomePage" class="m-router-link">
            <div class="m-home-button">
              <div class="m-img">
                <img class="m-home-img" src="@/assets/img/multimedia.svg" alt="多媒体" />
              </div>
              <div>
                <p class="m-p">多媒体</p>
              </div>
            </div>
          </router-link>
          <router-link to="/home/labHomePage" class="m-router-link">
            <div class="m-home-button">
              <div class="m-img">
                <img class="m-home-img" src="@/assets/img/lab.svg" alt="实验室" />
              </div>
              <div>
                <p class="m-p">实验室</p>
              </div>
            </div>
          </router-link>
          <router-link to="/home/caseHomePage" class="m-router-link">
            <div class="m-home-button">
              <div class="m-img">
                <img class="m-home-img" src="@/assets/img/case.svg" alt="例子" />
              </div>
              <div>
                <p class="m-p">例子</p>
              </div>
            </div>
          </router-link>
        </div>

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
    </div>
  </div>
</template>
<script>
var echarts = require("echarts");
import BasicEchart from "@/components/echarts/BasicEchart.vue";
import chartData from "@/assets/js/testData/chartData";
import Mock from "mockjs";

export default {
  components: {
    BasicEchart,
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
  },
  mounted() {
    this.getChartData();

    if (this.dataTimer) {
      clearInterval(this.dataTimer);
    }
    this.dataTimer = setInterval(() => {
      this.updateChartData();
    }, 3000);
  },
  beforeDestroy() {
    //销毁定时器
   clearInterval(this.dataTimer);
  },
};
</script>
<style></style>
