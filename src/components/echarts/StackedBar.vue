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
      const series = newVal.series.map(item => ({
        name: item.name,
        type: 'bar',
        // 未指定 stack 时统一堆叠为「总量」
        stack: item.stack || '总量',
        barWidth: item.barWidth || '38%',
        data: item.data,
        // hover 聚焦当前系列，其余系列淡化
        emphasis: { focus: 'series' },
        // 段间白色分隔线，增强堆叠层辨识度
        itemStyle: { borderColor: '#FFFFFF', borderWidth: 1 }
      }))

      this.option = {
        color: newVal.color || [
          '#5B8FF9',
          '#5AD8A6',
          '#F6BD16',
          '#E8684A',
          '#6DC8EC',
          '#9270CA'
        ],
        title: {
          text: newVal.title || '',
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
          bottom: '14%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: newVal.xAxis,
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
