<!-- 头部 -->
<template>
  <div :id="echartId" :style="{ width: width, height: height }"></div>
</template>

<script>
import { echartMixin } from '../mixin/echartMixin'
export default {
  mixins: [echartMixin],
  methods: {
    initData(newVal) {
      // 各系列的渐变描色对：[柱顶主色, 柱底浅色]
      const BAR_COLORS = [
        ['#5B8FF9', '#BFD7FF'],
        ['#5AD8A6', '#B5EDD9']
      ]
      // LinearGradient(0, 0, 0, 1)：自顶向下垂直渐变，offset 0 = 柱顶 → 1 = 柱底
      const barGradient = (top, bottom) =>
        new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: top },
          { offset: 1, color: bottom }
        ])

      // series 支持两种形式：纯数组（按序号命名）与 { name, data } 对象
      const series = newVal.series.map((item, index) => {
        const isRawArray = Array.isArray(item)
        const [solid, light] = BAR_COLORS[index % BAR_COLORS.length]
        return {
          name: isRawArray ? '数据' + (index + 1) : item.name,
          type: 'bar',
          data: isRawArray ? item : item.data,
          // 柱宽支持两种取值：'30px' 绝对像素 / '38%' 占单个类目带宽的比例
          barWidth: newVal.barWidth || '30px',
          // 不同系列的柱间距离
          barGap: '35%',
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: barGradient(solid, light)
          }
        }
      })

      this.option = {
        title: {
          text: newVal.title,
          subtext: newVal.subtext || '',
          left: 'center',
          top: 16,
          textStyle: { fontSize: 16, fontWeight: 600, color: '#1D2129' },
          subtextStyle: { fontSize: 12, color: '#86909C' }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowStyle: { color: 'rgba(91, 143, 249, 0.08)' }
          },
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E8EF',
          borderWidth: 1,
          padding: [8, 16],
          textStyle: { color: '#1D2129', fontSize: 12 },
          extraCssText:
            'box-shadow: 0 4px 12px rgba(29, 33, 41, 0.08); border-radius: 8px;'
        },
        legend: {
          bottom: 8,
          left: 'center',
          icon: 'circle',
          itemWidth: 8,
          itemHeight: 8,
          itemGap: 16,
          textStyle: { color: '#4E5969', fontSize: 12 }
        },
        grid: {
          left: '3%',
          right: '4%',
          top: 90,
          bottom: '18%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: newVal.xAxis.data,
            axisLine: { lineStyle: { color: '#E5E8EF' } },
            axisTick: { show: false },
            axisLabel: { color: '#86909C', fontSize: 12, margin: 12 }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: newVal.yName || '',
            nameTextStyle: {
              color: '#86909C',
              align: 'right',
              padding: [0, 6, 6, 0]
            },
            axisLabel: { color: '#86909C', fontSize: 12 },
            splitLine: { lineStyle: { color: '#E5E8EF', type: 'dashed' } }
          }
        ],
        series
      }
    }
  }
}
</script>
