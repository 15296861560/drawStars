<!--
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2023-06-25 23:30:28
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-26 22:44:28
-->
<template>
  <div>
    <div id="echart-gauge" class="m-echart-standard"></div>
  </div>
</template>

<script>
import { echartViewsMixin } from '../mixin/echartViewsMixin'
export default {
  mixins: [echartViewsMixin],
  data() {
    return {
      myChart: null,
      option: {
        title: {
          text: '服务器实时监控',
          subtext: '示例数据 · CPU 使用率每 2 秒刷新一次',
          left: 'center',
          top: 16,
          itemGap: 8,
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
          trigger: 'item',
          // 模板变量：{b} = 数据名（CPU 使用率），{c} = 当前值
          formatter: '{b}：{c}%',
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E8EF',
          padding: [8, 16],
          textStyle: {
            color: '#1D2129',
            fontSize: 12
          },
          extraCssText:
            'box-shadow: 0 4px 12px rgba(29, 33, 41, 0.08); border-radius: 8px;'
        },
        series: [
          {
            type: 'gauge',
            center: ['50%', '54%'],
            radius: '68%',
            // 表盘角度范围：从 210° 顺时针扫到 -30°，底部留出开口
            startAngle: 210,
            endAngle: -30,
            min: 0,
            max: 100,
            // 刻度均分段数：0~100 均分 5 段 → 刻度落在 0/20/40/60/80/100
            splitNumber: 5,
            axisLine: {
              // 轨道两端圆角，与下方 progress 的圆头衔接成完整进度条样式
              roundCap: true,
              lineStyle: {
                width: 14,
                // 分配式颜色：二维数组 [截止占比 0~1, 颜色]，此处整条轨道统一铺灰作为底色
                color: [[1, '#E5E8EF']]
              }
            },
            // 进度弧：按当前值在灰色轨道上覆盖的蓝色弧段，宽度与 axisLine 一致
            progress: {
              show: true,
              roundCap: true,
              width: 14
            },
            itemStyle: {
              color: '#5B8FF9',
              // 蓝色光晕投在表盘上，让指针位置一眼可辨
              shadowBlur: 12,
              shadowColor: 'rgba(91, 143, 249, 0.45)'
            },
            pointer: {
              width: 4,
              // 指针长度占表盘半径的比例
              length: '62%',
              itemStyle: {
                color: '#1D2129'
              }
            },
            // 指针根部的圆点锚，showAbove 使锚点绘制在指针图层之上
            anchor: {
              show: true,
              showAbove: true,
              size: 12,
              itemStyle: {
                color: '#5B8FF9',
                borderColor: '#FFFFFF',
                borderWidth: 3
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              distance: 4,
              length: 6,
              lineStyle: {
                color: '#C9CDD4',
                width: 1
              }
            },
            axisLabel: {
              distance: 18,
              color: '#86909C',
              fontSize: 12
            },
            title: {
              // offsetCenter 相对圆心偏移定位：[水平, 垂直]，百分比基于表盘半径计算
              offsetCenter: [0, '54%'],
              fontSize: 13,
              color: '#86909C'
            },
            detail: {
              // 数据更新时数字从旧值平滑滚动到新值，而非瞬间替换
              valueAnimation: true,
              offsetCenter: [0, '34%'],
              formatter: '{value}%',
              fontSize: 40,
              fontWeight: 700,
              color: '#1D2129'
            },
            data: [
              {
                value: 46.8,
                name: 'CPU 使用率'
              }
            ]
          }
        ]
      },
      timer: null
    }
  },
  methods: {
    paint() {
      // 基于准备好的dom，初始化echarts实例
      this.myChart = this.$echarts.init(document.getElementById('echart-gauge'))
      // 绘制图表
      this.myChart.setOption(this.option)

      // 定时器：模拟实时刷新的 CPU 使用率（30% ~ 80% 之间波动）
      this.timer = setInterval(() => {
        // 增量 setOption：只传变化的 series.data，其余配置按合并模式保留
        this.myChart.setOption({
          series: [
            {
              data: [
                {
                  value: +(30 + Math.random() * 50).toFixed(1)
                }
              ]
            }
          ]
        })
      }, 2000)
    }
  },
  beforeUnmount() {
    // 清除定时器，避免组件销毁后继续刷新图表
    this.timer && clearInterval(this.timer)
  }
}
</script>
