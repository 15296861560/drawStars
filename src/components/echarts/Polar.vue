<!-- 头部 -->
<template>
  <div class="charts" :id="ids" :style="{ width: width, height: height }"></div>
</template>

<script>
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
    };
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
    // 监听窗口发生变化，resize组件
    window.addEventListener("resize", this.$_handleResizeChart);
    // 通过hook监听组件销毁钩子函数，并取消监听事件
    this.$once("hook:beforeDestroy", () => {
      window.removeEventListener("resize", this.$_handleResizeChart);
    });
  },

  methods: {
    initPage(newVal) {
      let chart = this.$echarts.getInstanceByDom(document.getElementById(this.ids));
      if (chart === undefined) {
        this.AbnormalStatusEchart = this.$echarts.init(document.getElementById(this.ids));
      } else {
        this.AbnormalStatusEchart = chart;
      }

      let option = {
        // color: ["#02FCFB"],
        // 提示框
        tooltip: {
          trigger: "item",
          formatter: newVal.tooltip + "<br/>{a}：{c}%",
        },
        //标题
        title: {
          text: newVal.data + "%",
          subtext: newVal.tooltip,
          textStyle: {
            color: "aqua",
            fontSize: 32,
            fontWeight: "bold",
            fontFamily: this.fontFamily,
          },
          subtextStyle: {
            color: "aqua",
            fontSize: 24,
            fontWeight: "bold",
            fontFamily: this.fontFamily,
          },
          left: "center",
          top: "center",
        },
        angleAxis: {
          max: 100,
          show: false,
        },
        radiusAxis: {
          type: "category",

          axisLine: {
            show: false,
          },
        },
        polar: {
          radius: "100%",
          center: ["50%", "50%"],
        },
        series: [
          {
            type: "bar",
            data: newVal.data,
            showBackground: true,
            // 该系列使用的坐标系
            coordinateSystem: "polar",
            name: newVal.name,
            stack: "a",
            roundCap: true,
            barWidth: 12,
            itemStyle: {
              barBorderRadius: 10,
              color: "#02FCFB",
            },
          },
        ],
      };
      // 使用刚指定的配置项和数据显示图表。
      this.AbnormalStatusEchart.setOption(option, true);
    },
    $_handleResizeChart() {
      if (this.AbnormalStatusEchart) {
        this.AbnormalStatusEchart.resize();
      }
    },
  },
};
</script>
<style lang="less" scoped></style>
