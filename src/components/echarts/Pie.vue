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
      // debugger series xAxis
      // 基于准备好的dom，初始化echarts实例
      // let chart = document.getElementById(this.ids);
      // this.AbnormalStatusEchart = this.$echarts.init(chart);

      let chart = this.$echarts.getInstanceByDom(document.getElementById(this.ids));
      if (chart === undefined) {
        this.AbnormalStatusEchart = this.$echarts.init(document.getElementById(this.ids));
      } else {
        this.AbnormalStatusEchart = chart;
      }

      let option = {
        color: ["#00FCFF", "#FF8A79", "#A5C7C8"],
        title: {
          text: newVal.title,
          left: "center",
          top: "20px",
          textStyle: {
            color: "white",
          },
        },
        tooltip: {
          trigger: "item",
        },
        legend: {
          show: newVal.showLegend,
          orient: "vertical",
          bottom: "20px",
          textStyle: {
            color: "#00FCFF",
          },
        },
        series: [
          {
            name: newVal.title,
            type: "pie",
            radius: "50%",
            data: newVal.data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
            label: {
              show: newVal.showLabel,
            },
            itemStyle: {
              borderWidth: 3, //设置border的宽度有多大
              borderColor: "#061720",
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
