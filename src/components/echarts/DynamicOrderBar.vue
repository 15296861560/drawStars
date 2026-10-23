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
      this.option = {
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
        grid: {
          left: '3%',
          right: '12%',
          top: 90,
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          // 数值轴上限自动取当前数据最大值，柱体再长也不会顶出绘图区
          max: 'dataMax',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#86909C', fontSize: 12 },
          splitLine: { lineStyle: { color: '#E5E8EF', type: 'dashed' } }
        },
        yAxis: {
          type: 'category',
          data: newVal.yAxis,
          // 类目轴倒序：数据数组第 0 位渲染在最顶部，符合「第一名在最上」的直觉
          inverse: true,
          // 仅显示排名前 showCount 的柱子
          max: (newVal.showCount || 5) - 1,
          // 类目轴自身动画：条目进出排行时类目平移的过渡时长
          animationDuration: 300,
          animationDurationUpdate: 300,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#4E5969', fontSize: 12, margin: 12 }
        },
        series: [
          {
            // 动态排序柱状图核心开关：数据更新时柱体带连位动画地按数值自动重排
            realtimeSort: true,
            name: newVal.seriesName || '数值',
            type: 'bar',
            data: newVal.series[0].data,
            barWidth: '55%',
            itemStyle: {
              borderRadius: [0, 6, 6, 0],
              // 横向渐变：浅蓝 -> 主色蓝
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#BFD7FF' },
                { offset: 1, color: '#5B8FF9' }
              ])
            },
            label: {
              show: true,
              position: 'right',
              // 柱端数字随排序动画一起平滑滚动到新值，而非瞬间跳变
              valueAnimation: true,
              color: '#4E5969',
              fontSize: 12,
              formatter: p => p.value.toLocaleString()
            }
          }
        ],
        // 图表级动画：首次渲染不做动画（0ms），数据更新统一走 900ms 线性缓动，
        // 让每轮排名变化呈现为柱体连续滑动的效果
        animationDuration: 0,
        animationDurationUpdate: 900,
        animationEasing: 'linear',
        animationEasingUpdate: 'linear'
      }
    }
  }
}
</script>
