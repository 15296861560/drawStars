<!-- 头部 -->
<template>
  <div :id="echartId" :style="{ width: width, height: height }"></div>
</template>

<script>
import { markRaw } from 'vue'
import { echartMixin } from '../mixin/echartMixin'
export default {
  mixins: [echartMixin],
  methods: {
    // 覆写 mixin 的 paint：柱线混合图需要在初始化时绑定点击事件，用于向父组件抛出下钻指令
    paint() {
      if (this.chartData) {
        this.initData(this.chartData)
      }
      this.myChart = markRaw(
        this.$echarts.init(document.getElementById(this.echartId))
      )
      // 先解绑再绑定，避免重复触发
      this.myChart.off('click')
      this.myChart.on('click', object => {
        this.$emit('rp', object)
      })
      this.myChart.setOption(this.option, true)
    },
    initData(newVal) {
      // 双 y 轴单位名称，依次对应左右轴
      const yNames = newVal.yNames || ['', '']

      const seriesData = newVal.series.map(item => {
        if (item.type === 'line') {
          return {
            name: item.name,
            type: 'line',
            // 折线默认挂在第二（右）轴
            yAxisIndex: item.yAxisIndex !== undefined ? item.yAxisIndex : 1,
            smooth: true,
            symbol: 'circle',
            symbolSize: 7,
            showSymbol: false,
            lineStyle: { width: 3 },
            itemStyle: {
              borderWidth: 2,
              borderColor: '#FFFFFF'
            },
            emphasis: { focus: 'series' },
            data: item.data
          }
        }
        return {
          name: item.name,
          type: 'bar',
          // 柱系列默认挂在第一（左）轴
          yAxisIndex: item.yAxisIndex !== undefined ? item.yAxisIndex : 0,
          barWidth: newVal.barWidth || '35%',
          itemStyle: { borderRadius: [4, 4, 0, 0] },
          emphasis: { focus: 'series' },
          data: item.data
        }
      })

      this.option = {
        color: ['#5B8FF9', '#F6BD16'],
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
          show: newVal.openLegend !== false,
          top: 22,
          right: 24,
          icon: 'circle',
          itemWidth: 8,
          itemHeight: 8,
          itemGap: 20,
          textStyle: { color: '#4E5969', fontSize: 12 }
        },
        grid: {
          left: '3%',
          right: '4%',
          top: '25%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: newVal.xAxis,
          axisLine: { lineStyle: { color: '#E5E8EF' } },
          axisTick: { show: false },
          axisLabel: { color: '#86909C', fontSize: 12, margin: 12 }
        },
        // 双 y 轴：索引 0 为左轴（承载柱状系列），索引 1 为右轴（承载折线系列，单位可不同）
        yAxis: [
          {
            type: 'value',
            name: yNames[0] || '',
            nameTextStyle: {
              color: '#86909C',
              align: 'right',
              padding: [0, 6, 6, 0]
            },
            axisLine: { show: false },
            axisLabel: { color: '#86909C', fontSize: 12 },
            splitLine: { lineStyle: { color: '#E5E8EF', type: 'dashed' } }
          },
          {
            type: 'value',
            name: yNames[1] || '',
            nameTextStyle: {
              color: '#86909C',
              align: 'left',
              padding: [0, 0, 6, 6]
            },
            axisLine: { show: false },
            axisLabel: {
              color: '#F6BD16',
              fontSize: 12,
              formatter: '{value}%'
            },
            // 关闭右轴横向网格线，避免与左轴网格线交叉错乱（网格线只保留一根轴的）
            splitLine: { show: false }
          }
        ],
        series: seriesData
      }
    }
  }
}
</script>
