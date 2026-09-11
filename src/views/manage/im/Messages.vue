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
const searchInfo = reactive({
  roomId: '',
  conversationId: '',
  keyword: '',
  dateRange: []
})
const tableData = ref<any[]>([])
const pageInfo = reactive({
  curPage: 1,
  pageSize: 20,
  total: 0,
  curPageChange: query,
  sizeChange: query
})

const searchFields = [
  { field: 'roomId', label: '房间ID', type: 'input', placeholder: '房间ID' },
  {
    field: 'conversationId',
    label: '会话ID',
    type: 'input',
    placeholder: '会话ID'
  },
  { field: 'keyword', label: '关键词', type: 'input', placeholder: '关键词' },
  { field: 'dateRange', label: '时间', type: 'daterange', width: 280 }
]

const tableFields = [
  { fieldName: 'msgId', label: '消息ID', width: 180 },
  { fieldName: 'conversationId', label: '会话', width: 160 },
  { fieldName: 'senderId', label: '发送者', width: 120, align: 'center' },
  { fieldName: 'msgType', label: '类型', width: 90, align: 'center' },
  { fieldName: 'contentText', label: '内容', minWidth: 220 },
  { fieldName: 'seq', label: 'seq', width: 80, align: 'center' },
  { fieldName: 'status', label: '状态', width: 90, align: 'center' },
  { fieldName: 'serverTimeText', label: '时间', width: 170, align: 'center' }
]

function fmtTime(t: string): string {
  const n = Number(t)
  if (!n) return '-'
  const d = new Date(n > 1e12 ? n : n)
  const pad = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function query() {
  const [startTime, endTime] = searchInfo.dateRange || []
  const res = await adminApi.searchMessages({
    roomId: searchInfo.roomId || undefined,
    conversationId: searchInfo.conversationId || undefined,
    keyword: searchInfo.keyword || undefined,
    startTime: startTime || undefined,
    endTime: endTime || undefined,
    curPage: pageInfo.curPage,
    pageSize: pageInfo.pageSize
  })
  if (res.status && res.data) {
    tableData.value = (res.data.list || []).map((row: any) => ({
      ...row,
      contentText: row.content?.text || JSON.stringify(row.content || {}),
      serverTimeText: fmtTime(row.serverTime)
    }))
    pageInfo.total = res.data.total
  } else {
    showTips('error', res.msg || '查询失败')
  }
}

function reset() {
  searchInfo.roomId = ''
  searchInfo.conversationId = ''
  searchInfo.keyword = ''
  searchInfo.dateRange = []
  pageInfo.curPage = 1
  query()
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const tableTools = [
  { label: '搜索', tip: '搜索', icon: Search, action: toggleSearch },
  { label: '刷新', tip: '刷新', icon: Refresh, action: query }
]

const tableOptions = reactive({
  tableName: '消息记录',
  tableData,
  tableFields,
  showIndex: false,
  tableTools,
  tableOperateWidth: 'auto'
})

query()
</script>
