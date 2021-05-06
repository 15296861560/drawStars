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
        // 调色盘颜色列表。如果系列没有设置颜色，则会依次循环从该列表中取颜色作为系列颜色
        color: ["#5f9041", "yellow", "#4472c4"],
        //标题
        title: {
          show: true,
          //主标题文本
          text: newVal.title,
          //主标题样式
          textStyle: {
            //字体大小
            fontSize: 32,
          },
          // 副标题文本
          subtext: newVal.title.subtext,
          //副标题样式
          textStyle: {
            //字体大小
            fontSize: 24,
          },
          // 标题内边距
          padding: [3, 3, 3, 3],
          // 主副标题之间的间距
          itemGap: 10,
          // 标题离容器左侧的距离
          left: "5%",
          // 标题离容器顶部的距离
          top: "5%",
        },
        // 图例组件
        legend: {
          show: true,
          // 图例列表的布局朝向
          orient: "horizontal",
          // 图例标记和文本的对齐
          align: "left",
          // 图例内边距
          padding: [5, 5, 5, 5],
          // 图例每项之间的间隔
          itemGap: 13.5,
          // 图例项的 icon
          icon: "circle",
          top: "20px",
          textStyle: {
            color: "#00FCFF",
          },
          // 图例的 提示框组件
          tooltip: {
            show: true,
          },
        },
        // 直角坐标系内绘图网格
        grid: {
          left: "3%",
          right: "4%",
          top: "10%",
          bottom: "3%",
          //grid 区域是否包含坐标轴的刻度标签
          containLabel: true,
        },
        // 提示框组件
        tooltip: {
          // 触发类型
          trigger: "axis",
          // 坐标轴指示器，坐标轴触发有效
          axisPointer: {
            type: "shadow",
            // 坐标轴指示器的文本标签
            label: {
              show: true,
            },
          },
          //模板变量有 {a}, {b}，{c}，{d}，{e}，分别表示系列名，数据名，数据值等。 在 trigger 为 'axis' 的时候，会有多个系列的数据，此时可以通过 {a0}, {a1}, {a2} 这种后面加索引的方式表示系列的索引。 不同图表类型下的 {a}，{b}，{c}，{d} 含义不一样。 其中变量{a}, {b}, {c}, {d}在不同图表类型下代表数据含义为：
          // 折线（区域）图、柱状（条形）图、K线图 : {a}（系列名称），{b}（类目值），{c}（数值）, {d}（无）
          // 散点图（气泡）图 : {a}（系列名称），{b}（数据名称），{c}（数值数组）, {d}（无）
          // 地图 : {a}（系列名称），{b}（区域名称），{c}（合并数值）, {d}（无）
          // 饼图、仪表盘、漏斗图: {a}（系列名称），{b}（数据项名称），{c}（数值）, {d}（百分比）
          formatter: "{a} <br/>{b}: {c} ({d}%)",
        },
        //x轴属性
        xAxis: [
          {
            type: "category",
            // 坐标轴两边留白策略
            boundaryGap: true,
            data: newVal.xAxis.data,
            //坐标轴轴线相关设置
            axisLine: {
              lineStyle: {
                color: "aqua",
              },
              symbol: newVal.symbol,
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
        //y轴属性
        yAxis: [
          {
            type: "value",
            axisLine: {
              show: true,
              lineStyle: {
                color: "aqua",
              },
              symbol: newVal.symbol,
            },
            //坐标轴在 grid 区域中的分隔线。
            splitLine: {
              show: true,
            },
          },
        ],
        series: [
          {
            // 系列名称
            name: "数据1",
            data: newVal.series[0],
            type: "bar",
            //不同系列的柱间距离
            barGap: "50%",
            //柱条的宽度
            barWidth: newVal.barWidth ? newVal.barWidth : "30px",
            //柱条的样式
            itemStyle: {
              normal: {
                //柱条的颜色
                color: "yellow",
                // 柱条的描边角度(圆角半径，单位px)
                barBorderRadius: [30, 30, 0, 0],
                // 柱条阴影颜色
                shadowColor: "rgba(0,160,221,1)",
                //图形阴影的模糊大小
                shadowBlur: 4,
              },
            },
            // 图形上的文本标签
            label: {
              show: true,
            },
          },
          {
            // 系列名称
            name: "数据2",
            data: newVal.series[1],
            type: "bar",
            //不同系列的柱间距离
            barGap: "50%",
            //柱条的宽度
            barWidth: newVal.barWidth ? newVal.barWidth : "30px",
            //柱条的样式
            itemStyle: {
              normal: {
                //柱条的颜色
                color: "green",
                // 柱条的描边角度(圆角半径，单位px)
                barBorderRadius: [30, 30, 0, 0],
                // 柱条阴影颜色
                shadowColor: "rgba(0,160,221,1)",
                //图形阴影的模糊大小
                shadowBlur: 4,
              },
            },
            // 图形上的文本标签
            label: {
              show: true,
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
