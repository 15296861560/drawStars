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
      // 兼容传单值或数组
      const value = Array.isArray(newVal.data) ? newVal.data[0] : newVal.data

      this.option = {
        // title 数组形式：第一组为常规标题，第二组作环中心的数值文案
        title: [
          {
            text: newVal.title || '',
            subtext: newVal.subtext || '',
            left: 'center',
            top: 16,
            textStyle: { fontSize: 16, fontWeight: 600, color: '#1D2129' },
            subtextStyle: { fontSize: 12, color: '#86909C' }
          },
          {
            // 环中心：百分比数值
            text: value + '%',
            subtext: newVal.name || '',
            left: 'center',
            top: '44%',
            itemGap: 4,
            textStyle: { fontSize: 40, fontWeight: 700, color: '#1D2129' },
            subtextStyle: { fontSize: 14, color: '#86909C' }
          }
        ],
        tooltip: {
          trigger: 'item',
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E8EF',
          borderWidth: 1,
          padding: [8, 16],
          textStyle: { color: '#1D2129', fontSize: 12 },
          extraCssText:
            'box-shadow: 0 4px 12px rgba(29, 33, 41, 0.08); border-radius: 8px;',
          // formatter 直接拼好整段字符串返回，悬浮任何位置展示同一内容
          formatter: (newVal.tooltip || '数值') + '：' + value + '%'
        },
        // 角度轴：把 0~100 的数值映射到 0°~360° 圆周，max=100 即转满一圈正好 100%
        angleAxis: {
          max: 100,
          show: false
        },
        // 半径轴：极坐标的类目方向，此处只有一层环、整根半径算同一个类目
        radiusAxis: {
          type: 'category',
          show: false
        },
        // 半径带：进度环的厚度（外径 68% - 内径 62%）
        polar: {
          center: ['50%', '50%'],
          radius: ['62%', '68%']
        },
        series: [
          {
            // 柱状图挂到极坐标系：矩形柱被"卷"成一段圆弧，与灰色背景环组成进度环
            type: 'bar',
            data: [value],
            coordinateSystem: 'polar',
            name: newVal.name,
            barWidth: '100%',
            // 弧段两端圆角，进度环首尾贴合更顺滑
            roundCap: true,
            // 先铺一圈灰色底环，蓝色弧段叠加其上表示当前进度
            showBackground: true,
            backgroundStyle: { color: '#E5E8EF' },
            itemStyle: { color: '#5B8FF9' }
          }
        ]
      }
    }
  }
}
</script>
