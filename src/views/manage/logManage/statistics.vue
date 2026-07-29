<template>
  <div class="statistics-container">
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in summaryData" :key="item.title">
        <el-card shadow="hover">
          <div class="statistic-item">
            <div class="title">{{ item.title }}</div>
            <div class="value">{{ item.value }}</div>
            <div class="compare">
              <span :class="item.trend > 0 ? 'up' : 'down'">
                {{ item.trend > 0 ? '↑' : '↓' }}{{ Math.abs(item.trend) }}%
              </span>
              较昨日
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover">
          <div class="chart-title">登录统计</div>
          <div ref="loginChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <div class="chart-title">操作统计</div>
          <div ref="operationChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import logApi from '@/assets/js/api/logController/logApi.js'

const summaryData = ref([
  { title: '今日登录', value: 0, trend: 0 },
  { title: '今日操作', value: 0, trend: 0 },
  { title: '异常登录', value: 0, trend: 0 },
  { title: '异常操作', value: 0, trend: 0 }
])

const loginChart = ref(null)
const operationChart = ref(null)

onMounted(async () => {
  // 获取统计数据
  const result = await logApi.getLogStatistics()
  if (result.status) {
    summaryData.value = [
      {
        title: '今日登录',
        value: result.data.todayLogin,
        trend: result.data.loginTrend || 0
      },
      {
        title: '今日操作',
        value: result.data.todayOperation,
        trend: result.data.operationTrend || 0
      },
      {
        title: '异常登录',
        value: result.data.errorLogin,
        trend: result.data.errorLoginTrend || 0
      },
      {
        title: '异常操作',
        value: result.data.errorOperation,
        trend: result.data.errorOperationTrend || 0
      }
    ]

    // 初始化图表
    initLoginChart(result.data?.charts?.loginChart)
    initOperationChart(result.data?.charts?.operationChart)
  }
})

function initLoginChart(data) {
  const chart = echarts.init(loginChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['成功登录', '失败登录']
    },
    xAxis: {
      type: 'category',
      data: data.dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '成功登录',
        type: 'line',
        data: data.success
      },
      {
        name: '失败登录',
        type: 'line',
        data: data.fail
      }
    ]
  }
  chart.setOption(option)
}

function initOperationChart(data) {
  const chart = echarts.init(operationChart.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        name: '操作类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: data.insert || 0, name: '新增' },
          { value: data.update || 0, name: '修改' },
          { value: data.delete || 0, name: '删除' },
          { value: data.select || 0, name: '查询' }
        ]
      }
    ]
  }

  console.log(option)
  chart.setOption(option)
}
</script>

<style scoped lang="less">
.statistic-item {
  text-align: center;
  .title {
    font-size: 14px;
    color: #909399;
  }
  .value {
    font-size: 24px;
    margin: 8px 0;
  }
  .compare {
    font-size: 12px;
    .up {
      color: #f56c6c;
    }
    .down {
      color: #67c23a;
    }
  }
}
.chart-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
}
</style>
