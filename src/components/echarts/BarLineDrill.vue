<!-- 头部 -->
<template>
  <div class="charts" :style="{ width: width, height: height }">
    <div :id="ids" :style="{ width: '100%', height: height }"></div>
    <slot></slot>
  </div>
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
      //是否开启legend
      let showLegend = false;
      let legend = [];
      if (newVal.openLegend) {
        showLegend = true;
        for (let i = 0; i < newVal.legend.length; i++) {
          if (newVal.legend[i].name.indexOf("率") != -1) {
            legend.push({
              show: showLegend,
              data: [
                {
                  name: newVal.legend[i].name,
                  icon: "", //'image://../asset/ico/favicon.png',//标志图形类型，默认自动选择（8种类型循环使用，不显示标志图形可设为'none'），默认循环选择类型有：'circle' | 'rectangle' | 'triangle' | 'diamond' |'emptyCircle' | 'emptyRectangle' | 'emptyTriangle' | 'emptyDiamond'另外，还支持五种更特别的标志图形'heart'（心形）、'droplet'（水滴）、'pin'（标注）、'arrow'（箭头）和'star'（五角星），这并不出现在常规的8类图形中，但无论是在系列级还是数据级上你都可以指定使用，同时，'star' + n（n>=3)可变化出N角星，如指定为'star6'则可以显示6角星
                  textStyle: { fontWeight: "bold", color: newVal.legend[i].textColor },
                },
              ],
              // data: ["量率", "入库面积"],
              top: "2%",
              itemWidth: 13, // 设置宽度
              itemHeight: 10, // 设置高度
              right: i == 0 ? 30 : i * 200,
              textStyle: {
                color: "rgba(250,250,250,0.6)",
                fontSize: 16,
              },
            });
          } else {
            legend.push({
              show: showLegend,
              data: [
                {
                  name: newVal.legend[i].name,
                  icon: "rect", //'image://../asset/ico/favicon.png',//标志图形类型，默认自动选择（8种类型循环使用，不显示标志图形可设为'none'），默认循环选择类型有：'circle' | 'rectangle' | 'triangle' | 'diamond' |'emptyCircle' | 'emptyRectangle' | 'emptyTriangle' | 'emptyDiamond'另外，还支持五种更特别的标志图形'heart'（心形）、'droplet'（水滴）、'pin'（标注）、'arrow'（箭头）和'star'（五角星），这并不出现在常规的8类图形中，但无论是在系列级还是数据级上你都可以指定使用，同时，'star' + n（n>=3)可变化出N角星，如指定为'star6'则可以显示6角星
                  textStyle: { fontWeight: "bold", color: newVal.legend[i].textColor },
                },
              ],
              top: "2%",
              itemWidth: 10, // 设置宽度//
              itemHeight: 10, // 设置高度
              right: i == 0 ? 10 : i * 200,
              textStyle: {
                color: "rgba(250,250,250,0.6)",
                fontSize: 11,
              },
            });
          }
        }
      }
      let seriesData = [];
      for (let i = 0; i < newVal.series.length; i++) {
        if (newVal.series[i].type == "line") {
          seriesData.push({
            name: newVal.series[i].name,
            type: newVal.series[i].type,

            showAllSymbol: true, //显示所有图形。
            symbol: "circle", //标记的图形为实心圆
            symbolSize: 10, //标记的大小
            itemStyle: {
              //折线拐点标志的样式
              color: newVal.series[i].color,
              borderColor: "#fff",
              borderWidth:2,
              // width: 2,
              // shadowColor: "#3D7EEB",
              // shadowBlur: 4
            },
            lineStyle: {
              color: newVal.series[i].color,
              width: 2,
              type: newVal.series[i].lineType,
              // shadowColor: "#3D7EEB",
              // shadowBlur: 4
            },
            data: newVal.series[i].data,
          });
        } else {
          seriesData.push({
            name: newVal.series[i].name,
            type: newVal.series[i].type,
            barWidth: newVal.barWidth?newVal.barWidth:15,
            itemStyle: {
              normal: {
                //条形颜色
                color: newVal.series[i].color,
                barBorderRadius: [30, 30, 30, 30],
                // shadowColor: 'rgba(0,160,221,1)',
                // shadowBlur: 4,
                // barGap: 100,
              },
            },
            data: newVal.series[i].data,
          });
        }
      }
      // 基于准备好的dom，初始化echarts实例
      // let chart = document.getElementById(this.ids);
      // this.AbnormalStatusEchart = this.$echarts.init(chart);

      let chart = this.$echarts.getInstanceByDom(document.getElementById(this.ids));
      if (chart === undefined) {
        this.AbnormalStatusEchart = this.$echarts.init(document.getElementById(this.ids));
      } else {
        this.AbnormalStatusEchart = chart;
      }

      let axisLabel = {};
      if (newVal.biasText) {
        //开启了文字倾斜
        axisLabel = {
          interval: 0,
          rotate: 20,
          margin: 10,
          textStyle: {
            color: "black", //X轴文字颜色
            fontSize: 11,
          },
        };
      } else {
        axisLabel = {
          show: true,
          textStyle: {
            color: "black", //X轴文字颜色
            fontSize: 11,
          },
        };
      }

      let option = {
        color: newVal.color,
        grid: {
          top: "19%",
          // left:'5%',
          left: newVal.gridLeft ? newVal.gridLeft : "25px",
          right: newVal.gridRight ? newVal.gridRight : "5%",
          bottom: newVal.gridBottom ? newVal.gridBottom : "25px",
        },
        // 提示框组件
        tooltip: {
          // 触发类型
          trigger: "axis",
          // 坐标轴指示器配置项
          axisPointer: {
            type: "shadow",
            // 坐标轴指示器的文本标签
            label: {
              show: true,
            },
          },
        },
        legend: legend,
        xAxis: {
          data: newVal.xAxis,
          axisLine: {
            show: true, //隐藏X轴轴线
            lineStyle: {
              color: "aqua",
              width: 2,
            },
          },
          axisTick: {
            show: false, //隐藏X轴刻度
          },
          axisLabel: axisLabel,
        },
        yAxis: [
          {
            type: "value",
            nameTextStyle: {
              color: "#ebf8ac",
              fontSize: 16,
            },
            splitLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: "aqua",
                width: 2,
              },
            },
            axisLabel: {
              show: true,
              formatter: "{value} ", //左侧Y轴文字显示
              textStyle: {
                color: "black",
                fontSize: 11,
              },
            },
          },
        ],
        series: seriesData,
      };
      // 使用刚指定的配置项和数据显示图表。
      this.AbnormalStatusEchart.setOption(option, true);
      this.AbnormalStatusEchart.off("click");//使点击事件只触发一次
      this.AbnormalStatusEchart.on("click", (object) => {
        this.drill(object);
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
