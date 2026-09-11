<template>
  <div class="g-list-vertical">
    <search-form
      :model="searchInfo"
      :items="searchFields"
      :visible="showSearch"
      @search="query"
      @reset="reset"
    />
    <base-table :options="tableOptions" :page="pageInfo" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, defineAsyncComponent } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { showTips } from '@/utils/message/showTips.js'
import { adminApi } from '@/api/im'

const BaseTable = defineAsyncComponent(
  () => import('@/components/base/form/BaseTable.vue')
)
const SearchForm = defineAsyncComponent(
  () => import('@/components/base/SearchForm/index.vue')
)

const showSearch = ref(true)
const searchInfo = reactive({ status: '' })
const tableData = ref<any[]>([])
const pageInfo = reactive({
  curPage: 1,
  pageSize: 20,
  total: 0,
  curPageChange: query,
  sizeChange: query
})

const searchFields = [
  {
    field: 'status',
    label: '状态',
    type: 'select',
    placeholder: '举报状态',
    options: [
      { label: '待处理', value: 'PENDING' },
      { label: '已处理', value: 'HANDLED' },
      { label: '已驳回', value: 'REJECTED' }
    ]
  }
]

const tableFields = [
  { fieldName: 'id', label: 'ID', width: 120, align: 'center' },
  { fieldName: 'reporterId', label: '举报人', width: 120, align: 'center' },
  { fieldName: 'targetType', label: '对象类型', width: 100, align: 'center' },
  { fieldName: 'targetId', label: '对象ID', width: 140 },
  { fieldName: 'reason', label: '原因', minWidth: 200 },
  {
    fieldName: 'status',
    label: '状态',
    width: 100,
    align: 'center',
    type: 'tag',
    options: [
      { label: '待处理', value: 'PENDING', type: 'warning' },
      { label: '已处理', value: 'HANDLED', type: 'success' },
      { label: '已驳回', value: 'REJECTED', type: 'info' }
    ]
  }
]

async function query() {
  const res = await adminApi.adminReports({
    status: searchInfo.status || undefined,
    curPage: pageInfo.curPage,
    pageSize: pageInfo.pageSize
  })
  if (res.status && res.data) {
    tableData.value = res.data.list
    pageInfo.total = res.data.total
  } else {
    showTips('error', res.msg || '查询失败')
  }
}

function reset() {
  searchInfo.status = ''
  pageInfo.curPage = 1
  query()
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

async function handle(row: any, status: 'HANDLED' | 'REJECTED') {
  const res = await adminApi.handleReport(row.id, status as any)
  if (res.status) {
    showTips('success', status === 'HANDLED' ? '已处置' : '已驳回')
    query()
  } else {
    showTips('error', res.msg || '操作失败')
  }
}

const pageTableOperate = [
  {
    label: '处置',
    tip: '标记为已处理',
    type: 'primary',
    icon: undefined as any,
    action: (row: any) => handle(row, 'HANDLED'),
    show: (op: any, row: any) => row.status === 'PENDING'
  },
  {
    label: '驳回',
    tip: '驳回举报',
    type: 'info',
    icon: undefined as any,
    action: (row: any) => handle(row, 'REJECTED'),
    show: (op: any, row: any) => row.status === 'PENDING'
  }
]

const tableTools = [
  { label: '搜索', tip: '搜索', icon: Search, action: toggleSearch },
  { label: '刷新', tip: '刷新', icon: Refresh, action: query }
]

const tableOptions = reactive({
  tableName: '举报审核',
  tableData,
  tableFields,
  showIndex: false,
  pageTableOperate,
  tableTools,
  tableOperateWidth: '140'
})

query()
</script>
