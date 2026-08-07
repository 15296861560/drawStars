<template>
  <div>
    <div class="relative g-home z-1">
      <div class="g-home-module">
        <el-row class="g-home-module">
          <router-link-normal
            v-for="route in routes"
            :key="route.name"
            :to="route.path"
            :imgName="route.name"
            :text="$t(`homePage.${route.name}`)"
          ></router-link-normal>
        </el-row>

        <el-row class="w-per100">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <div class="home-echart-container">
              <BasicEchart
                v-if="!isHidden"
                :chartData="areaOption"
                echartId="echart-area"
                class="home-echart"
              ></BasicEchart>
            </div>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <div class="home-echart-container">
              <BasicEchart
                v-if="!isHidden"
                :chartData="pieOption"
                echartId="echart-pie"
                class="home-echart"
              ></BasicEchart>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="w-per100">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <dependence></dependence>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <commitInfo></commitInfo>
          </el-col>
        </el-row>
      </div>
    </div>

    <Assistant></Assistant>
  </div>
</template>
<script>
import Dependence from '@/components/part/dependence.vue'
import CommitInfo from '@/components/part/commitInfo.vue'
import RouterLinkNormal from '@/components/stars/RouterLinkNormal.vue'
import BasicEchart from '@/components/echarts/BasicEchart.vue'
import chartData from '@/assets/js/testData/chartData'
import Mock from 'mockjs'

export default {
  components: {
    BasicEchart,
    Dependence,
    CommitInfo,
    RouterLinkNormal
  },
  data() {
    return {
      dataTimer: null, // 定时器
      routes: [
        { name: 'echart', path: '/home/echartHomePage' },
        { name: 'tool', path: '/home/toolHomePage' },
        { name: 'components', path: '/home/componentsHomePage' },
        { name: 'special', path: '/home/specialHomePage' },
        { name: 'data', path: '/home/dataHomePage' },
        { name: 'multimedia', path: '/home/multimediaHomePage' },
        { name: 'lab', path: '/home/labHomePage' },
        { name: 'case', path: '/home/caseHomePage' },
        { name: 'resource', path: '/home/resourceHomePage' },
        { name: 'survey', path: '/home/surveyHomePage' }
      ],
      areaOption: {},
      lineOption: {},
      pieOption: {},
      isHidden: true
    }
  },
  methods: {
    getChartData() {
      this.areaOption = chartData.areaOption
      this.lineOption = chartData.lineOption
      this.pieOption = chartData.pieOption
      this.loadAnalyticsCharts()
    },
    async loadAnalyticsCharts() {
      try {
        const analyticsApi = (
          await import('@/assets/js/api/analyticsController/analyticsApi.js')
        ).default
        const res = await analyticsApi.getHomeCharts()
        if (!res?.status || !res.data) return

        const pageviews = res.data.pageviews || []
        const referrers = res.data.referrers || []
        const echarts = await import('echarts')

        this.areaOption = {
          ...chartData.areaOption,
          title: {
            ...chartData.areaOption.title,
            text: '访问量',
            subtext: '近7日真实数据'
          },
          xAxis: {
            ...chartData.areaOption.xAxis,
            data: pageviews.map(i => String(i.t).slice(5))
          },
          series: [
            {
              ...chartData.areaOption.series[0],
              data: pageviews.map(i => i.y),
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#56ad66' },
                  { offset: 0.5, color: 'rgba(98, 199, 98, 0.3)' },
                  { offset: 1, color: 'rgba(98, 199, 98, 0.1)' }
                ])
              }
            }
          ]
        }

        this.pieOption = {
          ...chartData.pieOption,
          title: {
            ...chartData.pieOption.title,
            text: '用户访问来源',
            subtext: '近7日真实数据'
          },
          series: [
            {
              ...chartData.pieOption.series[0],
              data: (referrers.length
                ? referrers
                : [{ name: '暂无数据', value: 0 }]
              ).map(i => ({
                name: i.name || i.x,
                value: i.value ?? i.y
              }))
            }
          ]
        }

        this.$nextTick(() => {
          if (this.pieOption?.series?.[0]?.data?.length) {
            clearInterval(this.dataTimer)
            this.autoTooltip(this.pieOption)
          }
        })
      } catch (e) {
        console.warn('loadAnalyticsCharts failed', e)
      }
    },
    // 模拟更新数据
    updateChartData() {
      let data = this.areaOption.series[0].data
      data.forEach((element, index, arr) => {
        arr[index] = Mock.mock({
          'number|0-250': 1
        }).number
      })
      this.areaOption.series[0].data = []
      this.areaOption.series[0].data = data
    },
    autoTooltip(option) {
      let pieChart = this.$echarts.getInstanceByDom(
        document.getElementById('echart-pie')
      )
      let currentIndex = 0
      this.dataTimer = setInterval(function () {
        let dataLen = option.series[0].data.length
        // 取消之前高亮的图形
        pieChart.dispatchAction({
          type: 'downplay',
          seriesIndex: 0,
          dataIndex: currentIndex
        })
        currentIndex = (currentIndex + 1) % dataLen
        // 高亮当前图形
        pieChart.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          dataIndex: currentIndex
        })
        // 显示 tooltip
        pieChart.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          dataIndex: currentIndex
        })
      }, 1000)
    }
  },
  activated() {
    this.isHidden = false
    this.$nextTick(() => {
      this.getChartData()
      this.autoTooltip(this.pieOption)
    })
  },
  mounted() {},
  deactivated() {
    this.isHidden = true
    // 销毁定时器
    clearInterval(this.dataTimer)
  },
  beforeDestroy() {
    // 销毁定时器
    clearInterval(this.dataTimer)
  }
}
</script>
<style scoped lang="less">
.home-echart-container {
  border-radius: 5px;
  padding: 10px;
  border-color: transparent;
  overflow: hidden;
  width: 100%;
  margin: 20px 0px;
}
.home-echart {
  width: 100%;
  height: 35vh;
  background-color: white;
  border-radius: 15px;
  box-shadow: #cfd5d6 0px 0px 10px;
}
</style>
