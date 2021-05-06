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
        xAxis: {
          max: "dataMax",
        },
        yAxis: {
          type: "category",
          data: newVal.yAxis.data,
          inverse: true,
          animationDuration: 300,
          animationDurationUpdate: 300,
          max: 2, // only the largest 3 bars will be displayed
        },
        series: [
          {
            realtimeSort: true,
            name: "热度",
            type: "bar",
            data: newVal.series[0].data,
            label: {
              show: true,
              position: "right",
              valueAnimation: true,
            },
          },
        ],
        legend: {
          show: true,
        },
        animationDuration: 0,
        animationDurationUpdate: 3000,
        animationEasing: "linear",
        animationEasingUpdate: "linear",
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
