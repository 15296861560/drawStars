<template>
  <div class="manage-page">
    <!-- 星夜页头（PageHero 通用组件） -->
    <page-hero title="接口日志" desc="HTTP 接口请求与响应日志审计">
      <template #side>
        <span class="page-hero__pill">
          <el-icon :size="14"><Connection /></el-icon>
          共 {{ pageInfo.total }} 条
        </span>
      </template>
    </page-hero>

    <filter-bar @search="query" @reset="reset">
      <search-item
        v-for="item in searchItems"
        :key="item.field"
        v-model:field="searchInfo[item.field]"
        :label="item.label"
        :type="item.type"
        :placeholder="item.placeholder"
        :options="item.options"
        clearable
      />
    </filter-bar>

    <BaseTable :options="tableOptions" :page="pageInfo" max-height="700" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, defineAsyncComponent } from 'vue'
import { showTips } from '@/utils/message/showTips.js'
import logApi from '@/assets/js/api/logController/logApi.js'
import { Connection } from '@element-plus/icons-vue'

const BaseTable = defineAsyncComponent(
  () => import('@/components/base/form/BaseTable.vue')
)
const SearchItem = defineAsyncComponent(
  () => import('@/components/base/SearchItem/index.vue')
)
const FilterBar = defineAsyncComponent(
  () => import('@/components/base/FilterBar/index.vue')
)
const PageHero = defineAsyncComponent(
  () => import('@/components/base/PageHero/index.vue')
)

const searchInfo = reactive({
  method: '',
  url: '',
  status: '',
  timeRange: [],
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
      { label: 'POST', value: 'POST' },
      { label: 'PUT', value: 'PUT' },
      { label: 'DELETE', value: 'DELETE' }
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
  const range = Array.isArray(searchInfo.timeRange) ? searchInfo.timeRange : []
  const result = await logApi.queryApiLogs({
    method: searchInfo.method || undefined,
    url: searchInfo.url || undefined,
    status: searchInfo.status || undefined,
    startTime: range[0] || searchInfo.startTime || undefined,
    endTime: range[1] || searchInfo.endTime || undefined,
    timeRange: range.length >= 2 ? range : undefined,
    curPage: pageInfo.curPage,
    pageSize: pageInfo.pageSize
  })
  if (result.status) {
    tableData.value = result.data.list || []
    pageInfo.total = result.data.total || 0
  } else showTips('error', result.msg)
}

const reset = () => {
  searchInfo.method = ''
  searchInfo.url = ''
  searchInfo.status = ''
  searchInfo.timeRange = []
  searchInfo.startTime = ''
  searchInfo.endTime = ''
  pageInfo.curPage = 1
  query()
}

const statusOptions = [
  { label: '成功', value: 'success', type: 'success' },
  { label: '失败', value: 'fail', type: 'danger' }
]

const tableOptions = reactive({
  tableData,
  tableName: '接口日志',
  tableFields: [
    { fieldName: 'method', label: '方法', width: 90 },
    { fieldName: 'originalUrl', label: '接口路径', minWidth: 180 },
    { fieldName: 'params', label: '参数', minWidth: 200 },
    {
      fieldName: 'status',
      label: '状态',
      width: 90,
      type: 'tag',
      options: statusOptions
    },
    { fieldName: 'duration', label: '耗时(ms)', width: 100 },
    { fieldName: 'ip', label: 'IP', width: 140 },
    { fieldName: 'username', label: '用户', width: 100 },
    { fieldName: 'create_time', label: '时间', width: 180 }
  ],
  showIndex: false,
  showSelection: false
})

onMounted(query)
</script>
