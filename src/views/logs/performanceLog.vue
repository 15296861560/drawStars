<template>
  <div class="log-container g-list-vertical">
    <el-row class="mb40" :gutter="20">
      <el-col :span="20">
        <div class="flex">
          <search-item
            v-for="item in searchItems"
            :key="item.field"
            v-model:field="searchInfo[item.field]"
            :label="item.label"
            :type="item.type"
            :placeholder="item.placeholder"
            :options="item.options"
            clearable
            :class="`w-1/${searchItems.length}`"
          ></search-item>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="flex justify-end">
          <el-button type="primary" @click="query">{{
            $t('btn.search')
          }}</el-button>
          <el-button type="warning" @click="reset">{{
            $t('btn.reset')
          }}</el-button>
        </div>
      </el-col>
    </el-row>
    <BaseTable :options="tableOptions" :page="pageInfo" max-height="700" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, defineAsyncComponent } from 'vue'
import { showTips } from '@/utils/message/showTips.js'
import logApi from '@/assets/js/api/logController/logApi.js'

const BaseTable = defineAsyncComponent(
  () => import('@/components/base/form/BaseTable.vue')
)
const SearchItem = defineAsyncComponent(
  () => import('@/components/base/SearchItem/index.vue')
)

const searchInfo = reactive({
  method: '',
  url: '',
  status: '',
  startTime: '',
  endTime: ''
})
const tableData = ref([])
const pageInfo = reactive({
  curPage: 1,
  pageSize: 10,
  total: 0,
  curPageChange: query
})

const searchItems = computed(() => [
  {
    field: 'method',
    label: '请求方法',
    type: 'select',
    options: [
      { label: 'GET', value: 'GET' },
      { label: 'POST', value: 'POST' }
    ],
    placeholder: '请选择方法'
  },
  {
    field: 'url',
    label: '接口路径',
    type: 'input',
    placeholder: '请输入路径关键字'
  },
  {
    field: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '成功', value: 'success' },
      { label: '失败', value: 'fail' }
    ],
    placeholder: '请选择状态'
  },
  {
    field: 'timeRange',
    label: '时间范围',
    type: 'daterange',
    startField: 'startTime',
    endField: 'endTime'
  }
])

async function query() {
  const result = await logApi.queryPerformanceLogs({
    ...searchInfo,
    curPage: pageInfo.curPage,
    pageSize: pageInfo.pageSize
  })
  if (result.status) {
    tableData.value = result.data.list || []
    pageInfo.total = result.data.total || 0
  } else showTips('error', result.msg)
}

const reset = () => {
  Object.keys(searchInfo).forEach(k => (searchInfo[k] = ''))
  pageInfo.curPage = 1
  query()
}

const statusOptions = [
  { label: '成功', value: 'success', type: 'success' },
  { label: '失败', value: 'fail', type: 'danger' }
]

const tableOptions = reactive({
  tableData,
  tableName: '性能日志',
  tableFields: [
    { fieldName: 'title', label: '标题', width: 120 },
    { fieldName: 'method', label: '方法', width: 90 },
    { fieldName: 'originalUrl', label: '接口路径', minWidth: 180 },
    { fieldName: 'params', label: '参数', minWidth: 200 },
    { fieldName: 'duration', label: '耗时(ms)', width: 110 },
    {
      fieldName: 'status',
      label: '状态',
      width: 90,
      type: 'tag',
      options: statusOptions
    },
    { fieldName: 'create_time', label: '时间', width: 180 }
  ],
  showIndex: false,
  showSelection: false
})

onMounted(query)
</script>
