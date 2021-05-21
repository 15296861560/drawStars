<!-- 头部 -->
<template>
  <div class="charts" :style="{ width: width, height: height }">
    <div :id="ids" :style="{ width: '100%', height: height }"></div>
    <slot></slot>
  </div>
</template>

<script>
import china from "@/assets/json/china.json";
export default {
  props: {
    ids: {
      type: String,
    },
    itemData: {
      type: Object,
      default: {},
    },
    width: {
      type: String,
      default: "",
    },
    height: {
      type: String,
      default: "1",
    },
  },
  data() {
    return {
      AbnormalStatusEchart: "",
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

  components: {},
  watch: {
    itemData: {
      handler: function (newVal, oldVal) {
        if (Object.keys(newVal).length != 0) {
          this.$nextTick(() => {
            this.initPage(newVal);
          });
        }
      },
      immediate: true,
      deep: true,
    },
  },

  mounted() {
    this.$echarts.registerMap("china", china);
    // 监听窗口发生变化，resize组件
    window.addEventListener("resize", this.$_handleResizeChart);
    // 通过hook监听组件销毁钩子函数，并取消监听事件
    this.$once("hook:beforeDestroy", () => {
      window.removeEventListener("resize", this.$_handleResizeChart);
    });
  },

  methods: {
    initPage(newVal) {
      console.log("map");
      console.log(newVal);
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
      console.log("linesEndCoords");
      console.log(linesEndCoords);
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

      // 基于准备好的dom，初始化echarts实例
      // let chart = document.getElementById(this.ids);
      // this.AbnormalStatusEchart = this.$echarts.init(chart);

      let chart = this.$echarts.getInstanceByDom(
        document.getElementById(this.ids),
        "macarons"
      );
      if (chart === undefined) {
        this.AbnormalStatusEchart = this.$echarts.init(document.getElementById(this.ids));
      } else {
        this.AbnormalStatusEchart = chart;
      }

      let option = {
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
      // 使用刚指定的配置项和数据显示图表。
      this.AbnormalStatusEchart.setOption(option, true);

      let that = this;
      this.AbnormalStatusEchart.on("click", function (params) {
        // that.$router.push({ path: "/MapDetail", query: {} });
        that.getProvince(params);
      });
    },
    getProvince(params) {
      //调用父组件设置的点击事件
      this.$emit("getProvince", params);
    },
    $_handleResizeChart() {
      if (this.AbnormalStatusEchart) {
        this.AbnormalStatusEchart.resize();
      }
    },
  },
};
</script>
<style lang="less" scoped>
.charts {
  position: relative;
  .title {
    position: absolute;
    top: 0;
    left: 0rem;
    margin-bottom: 1vh;
    width: 1.5rem;
    display: flex;
    align-items: center;
    padding: 0.01rem 0;
    background-color: rgba(32, 75, 93, 0.5);
    span {
      font-size: 0.11rem;
      font-family: Source Han Sans CN Medium, Source Han Sans CN Medium-Medium;
      font-weight: 500;
      color: #00ecff;
    }
    img {
      margin-left: 0.07rem;
      margin-right: 0.05rem;
      width: 0.07rem;
    }
  }
}
</style>
