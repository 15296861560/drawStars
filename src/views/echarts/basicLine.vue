<template>
  <div>
    <div id="echart-line" class="m-echart-standard"></div>
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

      // mock：页面浏览量 PV 与独立访客数 UV（人次）
      PVData: [1520, 1940, 1802, 2360, 2610, 3120, 2890],
      UVData: [820, 932, 901, 1290, 1330, 1520, 1420]
    }
  },
  methods: {
    paint() {
      this.initData()

      // 基于准备好的dom，初始化echarts实例
      this.myChart = this.$echarts.init(document.getElementById('echart-line'))
      // 绘制图表
      this.myChart.setOption(this.option)
    },
    // 组装图表配置：PV / UV 双折线，平滑曲线 + 圆形图例 + 现代坐标轴
    initData() {
      this.option = {
        // 全局调色盘：按 series 声明顺序依次取色，同时驱动图例颜色
        color: ['#5B8FF9', '#5AD8A6'],
        title: {
          text: '访问量趋势',
          subtext: '示例数据 · 最近一周 PV / UV',
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
            // 'line' 竖向指示线：折线 / 面积类图表常用（柱状图用 shadow）
            type: 'line',
            lineStyle: {
              color: '#C9CDD4'
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
        legend: {
          // 圆点式图例：替代折线图默认的“线段”样式，更轻量
          icon: 'circle',
          itemWidth: 8,
          itemHeight: 8,
          itemGap: 20,
          align: 'left',
          top: 22,
          right: 24,
          textStyle: {
            color: '#4E5969',
            fontSize: 12
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '25%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          // 折线图惯例：关闭类目轴两端留白（boundaryGap），首尾数据点贴齐坐标轴
          boundaryGap: false,
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
          splitLine: {
            lineStyle: {
              color: '#E5E8EF',
              type: 'dashed'
            }
          }
        },
        series: [
          {
            name: '浏览量 PV',
            type: 'line',
            // smooth：折线转贝塞尔平滑曲线
            smooth: true,
            symbol: 'circle',
            symbolSize: 7,
            // showSymbol false：平时只显示曲线不画数据点，悬浮时由 tooltip 用圆点定位，
            // 避免数据密集时点挤在一起
            showSymbol: false,
            lineStyle: {
              width: 3
            },
            emphasis: {
              // focus 'series'：hover 聚焦当前系列，其余系列淡化，便于对比阅读
              focus: 'series',
              itemStyle: {
                // 悬停显示的数据点加白色描边，避免圆点被同色曲线吞掉
                borderWidth: 2,
                borderColor: '#FFFFFF'
              }
            },
            data: this.PVData
          },
          {
            name: '访客数 UV',
            type: 'line',
            // 同 PV 系列：平滑曲线 + 默认隐藏数据点 + hover 聚焦
            smooth: true,
            symbol: 'circle',
            symbolSize: 7,
            showSymbol: false,
            lineStyle: {
              width: 3
            },
            emphasis: {
              focus: 'series',
              itemStyle: {
                borderWidth: 2,
                borderColor: '#FFFFFF'
              }
            },
            data: this.UVData
          }
        ]
      }
    }
  }
}
</script>
