<!-- 头部 -->
<template>
  <div :style="{ width: width, height: height }">
    <div :id="echartId" :style="{ width: '100%', height: height }"></div>
  </div>
</template>

<script>
import { markRaw } from 'vue'
import china from '@/assets/json/china.json'
import { echartMixin } from '../mixin/echartMixin'
export default {
  mixins: [echartMixin],
  data() {
    return {
      myChart: null,
      // 省份名 → 地图经纬度坐标：[经度, 纬度]
      geoCoordMap: {
        江西: [115.892151, 28.676493],
        河南: [113.665412, 34.757975],
        四川: [104.065735, 30.659462],
        重庆: [106.504962, 29.533155],
        西藏: [91.132212, 29.660361],
        贵州: [106.713478, 26.578343],
        辽宁: [123.429096, 41.796767],
        新疆: [87.617733, 43.792818],
        山东: [117.000923, 36.675807],
        上海: [121.472644, 31.231706],
        澳門: [113.54909, 22.198951],
        山西: [112.549248, 37.857014],
        浙江: [120.153576, 30.287459],
        海南: [110.33119, 20.031971],
        福建: [119.306239, 26.075302],
        青海: [101.778916, 36.623178],
        宁夏: [106.278179, 38.46637],
        湖北: [114.298572, 30.584355],
        甘肃: [103.823557, 36.058039],
        安徽: [117.283042, 31.86119],
        台湾: [121.509062, 25.044332],
        陕西: [108.948024, 34.263161],
        广西: [108.320004, 22.82402],
        天津: [117.190182, 39.125596],
        云南: [102.712251, 25.040609],
        黑龙江: [126.642464, 45.756967],
        广东: [113.280637, 23.125178],
        湖南: [112.982279, 28.19409],
        河北: [114.502461, 38.045474],
        内蒙古: [111.670801, 40.818311],
        吉林: [125.3245, 43.886841],
        江苏: [118.767413, 32.041544],
        北京: [116.405285, 39.904989],
        香港: [114.173355, 22.320048],
        澳门: [113.5, 22.2]
      }
    }
  },
  computed: {
    // 每省引导线的终点坐标（向右侧偏移）
    linesEndCoords() {
      const linesEndCoords = {}
      const geoCoordMap = this.geoCoordMap
      Object.keys(geoCoordMap).forEach(item => {
        linesEndCoords[item] = [130, geoCoordMap[item][1]]
      })
      return linesEndCoords
    }
  },
  methods: {
    // 组装图表配置（setOption 由 paint/repaint 统一调用）
    initData(newVal) {
      // 引导线榜单取发货量 Top10（降序取最大十条，过滤无坐标数据的省份）
      const top10 = [...newVal.data]
        .sort((a, b) => b.value - a.value)
        .filter(item => this.geoCoordMap[item.name])
        .slice(0, 10)

      const linesData = top10.map((item, index) => {
        const toLocation = this.linesEndCoords[item.name]
        // 终点纬度按排名错落排布：第 1 名最高（40°），之后每名下降 2°，避免右侧标签互相重叠
        toLocation[1] = 40 - index * 2
        return {
          name: item.name,
          value: item.value.toLocaleString() + ' 件',
          coords: [this.geoCoordMap[item.name], toLocation] // 起点坐标和终点坐标
        }
      })

      this.option = {
        title: {
          text: newVal.title,
          subtext: newVal.subtext || '',
          left: 'center',
          top: 16,
          itemGap: 8,
          textStyle: { fontSize: 16, fontWeight: 600, color: '#1D2129' },
          subtextStyle: { fontSize: 12, color: '#86909C' }
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E8EF',
          borderWidth: 1,
          padding: [8, 16],
          textStyle: { color: '#1D2129', fontSize: 12 },
          extraCssText:
            'box-shadow: 0 4px 12px rgba(29, 33, 41, 0.08); border-radius: 8px;',
          // 按 seriesType 区分提示内容：悬浮省份=发货量，悬浮引导线标签=榜单名次
          formatter(params) {
            if (params.seriesType === 'map') {
              const value = Number(params.value)
              return (
                params.name +
                '：' +
                (Number.isFinite(value)
                  ? value.toLocaleString() + ' 件'
                  : '暂无数据')
              )
            }
            return (
              'TOP' +
              (params.dataIndex + 1) +
              '：' +
              params.name +
              ' ' +
              params.value
            )
          }
        },

        // 左侧分段导航（分段从大到小书写，inRange 颜色从浅到深由低值至高值取色）
        visualMap: {
          type: 'piecewise',
          seriesIndex: 0,
          left: 24,
          top: 90,
          splitList: [
            { start: 150000, label: '15万件及以上' },
            { start: 90000, end: 150000, label: '9万 - 15万件' },
            { start: 30000, end: 90000, label: '3万 - 9万件' },
            { start: 5000, end: 30000, label: '5000 - 3万件' },
            { start: 0, end: 5000, label: '5000件以下' }
          ],
          inRange: {
            color: ['#EEF3FF', '#C3D8FF', '#8FB4FF', '#5B8FF9', '#2E5FD8']
          },
          textStyle: { color: '#4E5969', fontSize: 12 }
        },

        // 配置属性
        series: [
          {
            name: '发货量',
            type: 'map',
            map: 'china',
            roam: false, // 双层漫游会与引导线错位，与 geo 保持一致均关闭
            label: {
              show: true, // 省份名称，白色描边保证在色块上可读
              color: '#1D2129',
              fontSize: 10,
              textBorderColor: '#FFFFFF',
              textBorderWidth: 2
            },
            itemStyle: {
              borderColor: '#E5E8EF',
              borderWidth: 1
            },
            emphasis: {
              itemStyle: { areaColor: '#EAF1FF' },
              label: { show: true, color: '#1D2129', fontWeight: 600 }
            },
            data: newVal.data // 数据
          },
          {
            // 含引导线的省份，用 lines 实现，以透明 geo 组件作坐标系宿主
            type: 'lines',
            coordinateSystem: 'geo',
            geoIndex: 0,
            // 引导线首尾符号：起点实心圆点、终点箭头
            symbol: ['circle', 'arrow'],
            symbolSize: 6,
            lineStyle: {
              color: '#9AA7BF',
              width: 1,
              type: 'dashed',
              opacity: 0.85
            },
            label: {
              show: true,
              formatter: params => {
                return (
                  params.dataIndex + 1 + '. ' + params.name + ' ' + params.value
                )
              },
              color: '#1D2129',
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: [3, 6],
              borderRadius: 4,
              borderColor: '#E5E8EF',
              borderWidth: 1
            },
            data: linesData
          }
        ],
        // 透明的 geo 组件：仅作 lines 的坐标系宿主，视觉与交互全关，
        // 避免与 map series 重复渲染同一地图
        geo: {
          map: 'china',
          roam: false,
          silent: true,
          itemStyle: { opacity: 0 },
          label: { show: false }
        }
      }
    },
    getProvince(params) {
      // 调用父组件设置的点击事件
      this.$emit('getProvince', params)
    },
    paint() {
      // 注册地图 GeoJSON，之后 map series 与 geo 组件才能通过 map: 'china' 引用
      this.$echarts.registerMap('china', china)
      if (this.chartData) {
        this.initData(this.chartData)
      }
      // markRaw 防止 Vue3 将 echarts 实例代理为响应式对象
      this.myChart = markRaw(
        this.$echarts.init(document.getElementById(this.echartId))
      )
      this.myChart.setOption(this.option, true)
      // 先解绑再绑定，避免重绘时重复触发
      this.myChart.off('click')
      this.myChart.on('click', params => {
        this.getProvince(params)
      })
      // 不重新渲染下排名信息第一次渲染不出来
      this.$nextTick(() => {
        this.resizeChart()
      })
    }
  }
}
</script>
