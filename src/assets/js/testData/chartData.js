/* 图表测试数据 */

let echarts = require('echarts');
export default {
  // 基础面积图测试数据
  areaOption: {
    grid: {
      top: '20%', // 调整上边距
      bottom: '10%' // 调整下边距
    },
    title: {
      top: '5%',
      left: 'center',
      text: '访问量',
      subtext: 'Mock数据'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], // 横坐标数据
    },
    yAxis: {
      type: 'value',
    },
    series: [{
      data: [120, 200, 150, 80, 70, 110, 130], // 纵坐标数据
      type: 'line',
      areaStyle: {
        // 面积颜色
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0,
          color: '#56ad66'
        },
        {
          offset: 0.5,
          color: 'rgba(98, 199, 98, 0.3)'
        },
        {
          offset: 1,
          color: 'rgba(98, 199, 98, 0.1)'
        },
        ]),
      },
    },],
  },

  // 基础折线图测试数据
  lineOption: {
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    yAxis: {
      type: 'value',
    },
    series: [{
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'line',
    },],
  },

  // 基础饼图测试数据
  pieOption: {
    grid: {
      top: '30%', // 调整上边距
      bottom: '10%' // 调整下边距
    },
    title: {
      text: '用户访问来源',
      subtext: 'Mock数据',
      left: 'center',
      top: '5%',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: '5%',
      top: '10%',
    },
    series: [{
      name: '访问来源',
      type: 'pie',
      radius: '50%',
      data: [{
        value: 1048,
        name: '搜索引擎'
      },
      {
        value: 735,
        name: '直接访问'
      },
      {
        value: 580,
        name: '邮件营销'
      },
      {
        value: 484,
        name: '联盟广告'
      },
      {
        value: 300,
        name: '视频广告'
      },
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },],
  },

};