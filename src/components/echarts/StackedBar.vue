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
            // let can = false;
            // for(let i = 0; i < newVal.series.length;i++){
            //   if(newVal.series[i]){
            //     can = true;
            //   }
            // }
            // if(can){
            //   this.initPage(newVal)
            // }
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

      newVal.series.forEach((item) => {
        //柱样式
        if (!item.itemStyle) {
          item.itemStyle = {
            barBorderRadius: 0,
          };
        }
        //柱宽度
        if (!item.barWidth) {
          item.barWidth = "15px";
        }
      });

      let option = {
        color: newVal.color?newVal.color:["#03E4F6", "#2E86F2", "#E99936"],
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
            label: {
              show: true,
            },
          },
        },
        legend: newVal.legend,
        grid: {
          show: false,
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            data: newVal.xAxis,
            //坐标轴轴线相关设置
            axisLine: {
              show: false,
            },
            // 坐标轴刻度相关设置
            axisTick: {
              show: false,
            },
            // 坐标轴刻度标签的相关设置
            axisLabel: {
              show: true,
              textStyle: {
                color: "aqua", //X轴文字颜色
                fontSize: 11,
              },
            },
          },
        ],
        yAxis: [
          {
            type: "value",
            axisLine: {
              lineStyle: {
                color: "aqua",
                width: 0, //不显示y轴
              },
            },
            //坐标轴在 grid 区域中的分隔线。
            splitLine: {
              show: true,
            },
            // 坐标轴刻度相关设置
            axisTick: {
              show: false,
            },
          },
        ],
        series: newVal.series,
      };
      // 使用刚指定的配置项和数据显示图表。
      this.AbnormalStatusEchart.setOption(option, true);
      let that = this;
      this.AbnormalStatusEchart.on("click", function (object) {
        that.drill(object);
      });
    },
    drill(object) {
      console.log(object.name);
      //调用父组件重绘方法
      this.$emit("rp", object);
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
