<template>
  <div>
    <div id="echart-pie" class="m-echart-standard"></div>
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

      // 各渠道访问量（示例数据）
      pieData: [
        { value: 1048, name: '搜索引擎' },
        { value: 735, name: '直接访问' },
        { value: 580, name: '邮件营销' },
        { value: 484, name: '联盟广告' },
        { value: 300, name: '视频广告' },
        { value: 214, name: '社交媒体' }
      ]
    }
  },
  methods: {
    paint() {
      this.initData()

      // 基于准备好的dom，初始化echarts实例
      this.myChart = this.$echarts.init(document.getElementById('echart-pie'))
      // 绘制图表
      this.myChart.setOption(this.option)
    },
    initData() {
      const total = this.pieData.reduce((sum, item) => sum + item.value, 0)

      this.option = {
        // 全局调色盘：按 data 声明顺序依次给扇区着色
        color: [
          '#5B8FF9',
          '#5AD8A6',
          '#F6BD16',
          '#E8684A',
          '#6DC8EC',
          '#9270CA'
        ],
        // title 支持数组形式（多标题）：第一个为常规图表标题，第二个用作环形中心的总量文案
        title: [
          {
            text: '用户访问来源',
            subtext: '示例数据 · 总计 ' + total.toLocaleString() + ' 人次',
            left: 'center',
            top: 16,
            textStyle: { fontSize: 16, fontWeight: 600, color: '#1D2129' },
            subtextStyle: { fontSize: 12, color: '#86909C' }
          },
          {
            // 环形中心：总量展示
            text: total.toLocaleString(),
            subtext: '总访问人次',
            left: 'center',
            top: '41%',
            itemGap: 6,
            textStyle: { fontSize: 28, fontWeight: 700, color: '#1D2129' },
            subtextStyle: { fontSize: 12, color: '#86909C' }
          }
        ],
        tooltip: {
          // item 触发：悬浮单个扇区时才提示（饼图类不使用 axis 触发）
          trigger: 'item',
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E8EF',
          borderWidth: 1,
          padding: [8, 16],
          textStyle: { color: '#1D2129', fontSize: 12 },
          extraCssText:
            'box-shadow: 0 4px 12px rgba(29, 33, 41, 0.08); border-radius: 8px;',
          // 模板变量：{b}=数据名 {c}=数值 {d}=该扇区占总量百分比
          formatter: '{b}<br/>{c} 人次（{d}%）'
        },
        legend: {
          bottom: 16,
          left: 'center',
          icon: 'circle',
          itemWidth: 8,
          itemHeight: 8,
          itemGap: 16,
          textStyle: { color: '#4E5969', fontSize: 12 }
        },
        series: [
          {
            name: '访问来源',
            type: 'pie',
            // [内半径, 外半径]：内外双半径构成“环形图”，环内留白放总量文案
            radius: ['45%', '62%'],
            // 环心水平居中、略上移，为底部图例腾出空间
            center: ['50%', '46%'],
            data: this.pieData,
            itemStyle: {
              // 白色圆角描边：在相邻扇区间形成分隔缝，视觉更清爽
              borderRadius: 8,
              borderColor: '#FFFFFF',
              borderWidth: 2
            },
            // 关闭扇区外置标签与引导线，信息交由图例与 tooltip 承担，画面更干净
            label: { show: false },
            labelLine: { show: false },
            emphasis: {
              // hover 时扇区整体放大（scale）并附加投影，突出选中扇区
              scale: true,
              scaleSize: 6,
              itemStyle: {
                shadowBlur: 12,
                shadowColor: 'rgba(29, 33, 41, 0.16)'
              }
            }
          }
        ]
      }
    }
  }
}
</script>
