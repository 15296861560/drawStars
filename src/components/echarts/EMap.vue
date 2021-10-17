<!-- 头部 -->
<template>
  <div :style="{ width: width, height: height }">
    <div :id="echartId" :style="{ width: '100%', height: height }"></div>
  </div>
</template>

<script>
import china from "@/assets/json/china.json";
import { echartMixin } from "../mixin/echartMixin";
export default {
  mixins: [echartMixin],
  data() {
    return {
      myChart: null,
      mapData: [],
      geoCoordMap: {
        江西: [115.892151, 28.676493],
        河南: [113.665412, 34.757975],
        四川: [104.065735, 30.659462],
        重庆: [106.504962, 29.533155],
        西藏: [91.132212, 29.660361],
        贵州: [106.713478, 26.578343],
        辽宁: [123.429096, 41.796767],
        新疆: [87.617733, 43.792818],
        山东: [117.000923, 36.675807],
        上海: [121.472644, 31.231706],
        澳門: [113.54909, 22.198951],
        山西: [112.549248, 37.857014],
        浙江: [120.153576, 30.287459],
        海南: [110.33119, 20.031971],
        福建: [119.306239, 26.075302],
        青海: [101.778916, 36.623178],
        宁夏: [106.278179, 38.46637],
        湖北: [114.298572, 30.584355],
        甘肃: [103.823557, 36.058039],
        安徽: [117.283042, 31.86119],
        台湾: [121.509062, 25.044332],
        陕西: [108.948024, 34.263161],
        广西: [108.320004, 22.82402],
        天津: [117.190182, 39.125596],
        云南: [102.712251, 25.040609],
        黑龙江: [126.642464, 45.756967],
        广东: [113.280637, 23.125178],
        湖南: [112.982279, 28.19409],
        河北: [114.502461, 38.045474],
        内蒙古: [111.670801, 40.818311],
        吉林: [125.3245, 43.886841],
        江苏: [118.767413, 32.041544],
        北京: [116.405285, 39.904989],
        香港: [114.173355, 22.320048],
        澳门: [113.5, 22.2],
      },
    };
  },
  computed: {
    linesEndCoords() {
      let linesEndCoords = {};
      let geoCoordMap = this.geoCoordMap;
      let keys = Object.keys(geoCoordMap);
      keys.forEach((item, index) => {
        linesEndCoords[item] = [130, geoCoordMap[item][1]];
      });

      return linesEndCoords;
    },
  },
  methods: {
    initData(newVal) {
      //显示前10具体数据
      this.mapData = JSON.parse(JSON.stringify(newVal.data));
      let datas = this.mapData
        .sort(function (a, b) {
          return a.value - b.value;
        })
        .slice(0, 10);

      let keys = [];
      datas.forEach((item) => {
        keys.push(item.name);
      });

      //lines的数据
      let linesData = [];
      let linesEndCoords = this.linesEndCoords;
      let geoCoordMap = this.geoCoordMap;

      //显示的值
      let showValue = {};
      datas.forEach((item) => {
        showValue[item.name] = item.value + "m³";
      });
      keys.forEach((item, index) => {
        let toLocation = linesEndCoords[item];
        toLocation[1] = 40 - index * 2;
        linesData.push({
          name: item,
          value: showValue[item], //显示值
          coords: [geoCoordMap[item], toLocation], //起点坐标和终点坐标
          //每条线的样式
          lineStyle: {
            show: true,
            type: "dashed",
            color: "red",
          },
        });
      });

      this.option = {
        title: {
          show: true,
          text: newVal.title,
          x: "center",
          textStyle: { color: "black" },
          top: "2%",
        },
        tooltip: {
          trigger: "item",
        },

        //左侧小导航图标
        visualMap: {
          show: true,
          left: 20,
          top: 20,
          splitList: [
            { start: 200000 },
            { start: 100000, end: 200000 },
            { start: 10000, end: 100000 },
            { start: 0, end: 10000 },
          ],
          inRange: {
            color: ["#6C2398", "#573BC0", "#32B1FF"],
          },
          // color: ["red", "blue", "yellow", "green"],
          textStyle: { color: "black" },
        },

        //配置属性
        series: [
          {
            name: "数据",
            type: "map",
            map: "china",
            roam: true, //是否开启鼠标缩放和平移漫游
            label: {
              show: true, //省份信息
              color: "aqua",

              // formatter: (params) => {
              //   let label = "";

              //   if (keys.indexOf(params.name) == -1) return;
              //   label = params.name + "\n" + params.value + "m³ \n 1.8%";
              //   return label;
              // },
            },
            data: newVal.data, //数据
          },
          {
            // 含引导线的省份，用lines实现
            type: "lines",
            symbol: "circle",
            symbolSize: [6, 4],
            label: {
              show: true,
              // formatter: "{b}{c}",
              formatter: (params) => {
                let showValue = "";
                // console.log(params)
                showValue = params.dataIndex + 1 + "," + params.name + " " + params.value;

                return showValue;
              },
              color: "green",
            },
            data: linesData,
          },
        ],
        // 地理坐标系组件用于地图的绘制，支持在地理坐标系上绘制散点图，线集。
        geo: [
          {
            map: "china",
            roam: true,
          },
        ],
      };

      this.myChart.setOption(this.option, true);

      let that = this;
      this.myChart.on("click", function (params) {
        // that.$router.push({ path: "/MapDetail", query: {} });
        that.getProvince(params);
      });
    },
    getProvince(params) {
      //调用父组件设置的点击事件
      this.$emit("getProvince", params);
    },
    paint() {
      this.$echarts.registerMap("china", china);
      this.myChart = this.$echarts.init(document.getElementById(this.echartId));
      if (this.chartData) this.initData(this.chartData);
      //不重新渲染下排名信息第一次渲染不出来
      this.$nextTick(() => {
        this.resizeChart();
      });
    },
  },
};
</script>
