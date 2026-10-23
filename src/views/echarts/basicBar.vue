<template>
  <div>
    <div id="echart-basic-bar" class="m-echart-standard"></div>
  </div>
</template>

<script>
import { echartViewsMixin } from '../mixin/echartViewsMixin'
export default {
  mixins: [echartViewsMixin],
  data() {
    return {
      myChart: null,
      option: {},

      // 横轴类目：一周七天
      XData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],

      // mock：平台每日访问量（人次）
      statisticalData: [820, 932, 901, 1290, 1330, 1820, 1620]
    }
  },
  methods: {
    paint() {
      this.initData()

      // 基于准备好的dom，初始化echarts实例
      this.myChart = this.$echarts.init(
        document.getElementById('echart-basic-bar')
      )
      // 绘制图表
      this.myChart.setOption(this.option)
    },
    // 组装图表配置：标题 + 提示框 + 现代坐标轴 + 渐变圆角柱
    initData() {
      this.option = {
        title: {
          text: '平台每日访问量',
          subtext: '示例数据 · 最近一周',
          left: 'center',
          top: 16,
          textStyle: {
            fontSize: 16,
            fontWeight: 600,
            color: '#1D2129'
          },
          subtextStyle: {
            fontSize: 12,
            color: '#86909C'
          }
        },
        tooltip: {
          // 轴触发：悬浮时同一列内所有系列一起显示在提示框中
          trigger: 'axis',
          axisPointer: {
            // 'shadow' 阴影块指示：柱状图标配，悬浮时淡蓝高亮整列所在的类目带
            type: 'shadow',
            shadowStyle: {
              color: 'rgba(91, 143, 249, 0.08)'
            }
          },
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E8EF',
          borderWidth: 1,
          padding: [8, 16],
          textStyle: {
            color: '#1D2129',
            fontSize: 12
          },
          extraCssText:
            'box-shadow: 0 4px 12px rgba(29, 33, 41, 0.08); border-radius: 8px;'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '25%',
          // containLabel：把坐标轴刻度标签计算进栅格尺寸，避免 Y 轴文字被裁切
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: this.XData,
          axisLine: {
            lineStyle: {
              color: '#E5E8EF'
            }
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#86909C',
            fontSize: 12,
            margin: 12
          }
        },
        yAxis: {
          type: 'value',
          name: '人次',
          nameTextStyle: {
            color: '#86909C',
            align: 'right',
            padding: [0, 6, 6, 0]
          },
          axisLabel: {
            color: '#86909C',
            fontSize: 12
          },
          // 虚线网格：弱化横向视觉噪声，突出柱体本身
          splitLine: {
            lineStyle: {
              color: '#E5E8EF',
              type: 'dashed'
            }
          }
        },
        series: [
          {
            name: '访问量',
            type: 'bar',
            // 柱宽占单个类目带宽的比例，留出柱间呼吸感
            barWidth: '40%',
            data: this.statisticalData,
            itemStyle: {
              // 仅顶部两角圆角，柱底贴合坐标轴保持直角
              borderRadius: [6, 6, 0, 0],
              // LinearGradient(0, 0, 0, 1, ...)：自顶向下垂直渐变，柱顶主色 → 柱底浅色
              color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#5B8FF9' },
                { offset: 1, color: '#A6C6FF' }
              ])
            },
            // emphasis：hover 高亮态，渐变整体加深一档
            emphasis: {
              itemStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#3C74E8' },
                  { offset: 1, color: '#85A9FF' }
                ])
              }
            }
          }
        ]
      }
    }
  }
}
</script>
