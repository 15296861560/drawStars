<template>
  <div>
    <div id="echart-area" class="m-echart-standard"></div>
  </div>
</template>

<script>
import { echartViewsMixin } from '../mixin/echartViewsMixin'

// 每个系列的 [线条实色, 面积渐变终点色（同色低透明度）]
const AREA_COLORS = [
  ['#5B8FF9', 'rgba(91, 143, 249, 0.05)'],
  ['#5AD8A6', 'rgba(90, 216, 166, 0.05)'],
  ['#F6BD16', 'rgba(246, 189, 22, 0.05)'],
  ['#E8684A', 'rgba(232, 104, 74, 0.05)'],
  ['#6DC8EC', 'rgba(109, 200, 236, 0.05)']
]

export default {
  mixins: [echartViewsMixin],
  data() {
    return {
      myChart: null,
      option: {},

      // 横轴：最近一周
      XData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],

      // 访问来源渠道及每日数据（示例数据）
      seriesData: [
        { name: '搜索引擎', data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '直接访问', data: [120, 132, 101, 134, 90, 230, 210] },
        { name: '邮件营销', data: [220, 182, 191, 234, 290, 330, 310] },
        { name: '联盟广告', data: [150, 232, 201, 254, 190, 330, 410] },
        { name: '视频广告', data: [80, 92, 91, 94, 140, 130, 150] }
      ]
    }
  },
  methods: {
    paint() {
      this.initData()

      // 基于准备好的dom，初始化echarts实例
      this.myChart = this.$echarts.init(document.getElementById('echart-area'))
      // 绘制图表
      this.myChart.setOption(this.option)
    },
    initData() {
      const series = this.seriesData.map((item, index) => ({
        name: item.name,
        type: 'line',
        // stack：同名系列自动堆叠叠加，形成“总量”走势；底层按声明顺序先绘制
        stack: '总量',
        data: item.data,
        // 平滑曲线 + 默认隐藏数据点，减少多系列下的视觉噪声
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        showSymbol: false,
        lineStyle: { width: 3, color: AREA_COLORS[index][0] },
        itemStyle: { color: AREA_COLORS[index][0] },
        // 面积渐变：自顶向下从系列实色过渡到同色近透明，多层堆叠时仍能透出下层面板
        areaStyle: {
          color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: AREA_COLORS[index][0] },
            { offset: 1, color: AREA_COLORS[index][1] }
          ])
        },
        // hover 聚焦当前系列，其余系列淡化
        emphasis: { focus: 'series' }
      }))

      this.option = {
        color: AREA_COLORS.map(item => item[0]),
        title: {
          text: '访问来源趋势',
          subtext: '示例数据 · 最近一周',
          left: 'center',
          top: 16,
          textStyle: { fontSize: 16, fontWeight: 600, color: '#1D2129' },
          subtextStyle: { fontSize: 12, color: '#86909C' }
        },
        tooltip: {
          // 轴触发：悬浮时同一列内所有系列一起显示，并按堆叠从上到下排列
          trigger: 'axis',
          // 'line' 竖向指示线：折线 / 面积类图表常用（柱状图用 shadow）
          axisPointer: { type: 'line', lineStyle: { color: '#C9CDD4' } },
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E8EF',
          borderWidth: 1,
          padding: [8, 16],
          textStyle: { color: '#1D2129', fontSize: 12 },
          extraCssText:
            'box-shadow: 0 4px 12px rgba(29, 33, 41, 0.08); border-radius: 8px;'
        },
        legend: {
          top: 22,
          right: 24,
          icon: 'circle',
          itemWidth: 8,
          itemHeight: 8,
          itemGap: 16,
          textStyle: { color: '#4E5969', fontSize: 12 }
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
          axisLine: { lineStyle: { color: '#E5E8EF' } },
          axisTick: { show: false },
          axisLabel: { color: '#86909C', fontSize: 12, margin: 12 }
        },
        yAxis: {
          type: 'value',
          name: '人次',
          nameTextStyle: {
            color: '#86909C',
            align: 'right',
            padding: [0, 6, 6, 0]
          },
          axisLabel: { color: '#86909C', fontSize: 12 },
          splitLine: { lineStyle: { color: '#E5E8EF', type: 'dashed' } }
        },
        series
      }
    }
  }
}
</script>
