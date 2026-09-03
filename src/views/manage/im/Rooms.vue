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
import { ElMessageBox } from 'element-plus'
import { showTips } from '@/utils/message/showTips.js'
import { adminApi } from '@/api/im'

const BaseTable = defineAsyncComponent(() => import('@/components/base/form/BaseTable.vue'))
const SearchForm = defineAsyncComponent(() => import('@/components/base/SearchForm/index.vue'))

const showSearch = ref(true)
const searchInfo = reactive({ keyword: '' })
const tableData = ref<any[]>([])
const pageInfo = reactive({
  curPage: 1,
  pageSize: 20,
  total: 0,
  curPageChange: query,
  sizeChange: query
})

const searchFields = [
  { field: 'keyword', label: '关键字', type: 'input', placeholder: '房间ID/标题' }
]

const tableFields = [
  { fieldName: 'roomId', label: '房间ID', width: 200 },
  { fieldName: 'title', label: '标题', minWidth: 160 },
  { fieldName: 'categoryId', label: '分类', width: 110, align: 'center' },
  {
    fieldName: 'status',
    label: '状态',
    width: 100,
    align: 'center',
    type: 'tag',
    options: [
      { label: '活跃', value: 'ACTIVE', type: 'success' },
      { label: '已封禁', value: 'BANNED', type: 'danger' },
      { label: '已关闭', value: 'CLOSED', type: 'info' }
    ]
  },
  {
    fieldName: 'official',
    label: '官方',
    width: 80,
    align: 'center',
    type: 'tag',
    options: [
      { label: '是', value: true, type: 'warning' },
      { label: '-', value: false, type: 'info' }
    ]
  },
  { fieldName: 'manualWeight', label: '权重', width: 80, align: 'center' }
]

async function query() {
  const res = await adminApi.analyticsRooms()
  // status=true 即成功；data.list 可能为空数组，空列表不应弹错误
  if (res.status) {
    const kw = searchInfo.keyword.trim().toLowerCase()
    const all = res.data?.list ?? []
    tableData.value = kw
      ? all.filter((r: any) => String(r.roomId).toLowerCase().includes(kw) || String(r.title).toLowerCase().includes(kw))
      : all
    pageInfo.total = tableData.value.length
  } else {
    showTips('error', res.msg || '查询失败')
  }
}

function reset() {
  searchInfo.keyword = ''
  pageInfo.curPage = 1
  query()
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

async function toggleBan(row: any) {
  const banned = row.status !== 'BANNED'
  try {
    await ElMessageBox.confirm(`确认${banned ? '封禁' : '解封'}房间「${row.title}」？`, '警告', { type: 'warning' })
  } catch {
    return
  }
  const res = await adminApi.banRoom(row.roomId, banned)
  if (res.status) {
    showTips('success', banned ? '已封禁' : '已解封')
    query()
  } else {
    showTips('error', res.msg || '操作失败')
  }
}

async function toggleOfficial(row: any) {
  const res = await adminApi.setRoomWeight(row.roomId, { official: !row.official })
  if (res.status) {
    showTips('success', '已更新')
    query()
  } else {
    showTips('error', res.msg || '操作失败')
  }
}

async function setWeight(row: any) {
  let value = String(row.manualWeight ?? 1)
  try {
    const r = await ElMessageBox.prompt('输入权重值（0-10）', '加权', { inputValue: value })
    value = r.value
  } catch {
    return
  }
  const n = Number(value)
  if (Number.isNaN(n)) {
    showTips('error', '请输入数字')
    return
  }
  const res = await adminApi.setRoomWeight(row.roomId, { manualWeight: n })
  if (res.status) {
    showTips('success', '已更新')
    query()
  } else {
    showTips('error', res.msg || '操作失败')
  }
}

const pageTableOperate = [
  {
    label: '封禁',
    tip: '封禁/解封',
    type: 'danger',
    icon: undefined as any,
    action: toggleBan,
    show: (op: any, row: any) => row.status !== 'BANNED'
  },
  {
    label: '解封',
    tip: '解封',
    type: 'success',
    icon: undefined as any,
    action: toggleBan,
    show: (op: any, row: any) => row.status === 'BANNED'
  },
  { label: '加权', tip: '调整权重', type: 'primary', icon: undefined as any, action: setWeight },
  {
    label: '设为官方',
    tip: '设为官方',
    type: 'warning',
    icon: undefined as any,
    action: toggleOfficial,
    show: (op: any, row: any) => !row.official
  },
  {
    label: '取消官方',
    tip: '取消官方',
    type: 'info',
    icon: undefined as any,
    action: toggleOfficial,
    show: (op: any, row: any) => !!row.official
  }
]

const tableTools = [
  { label: '搜索', tip: '搜索', icon: Search, action: toggleSearch },
  { label: '刷新', tip: '刷新', icon: Refresh, action: query }
]

const tableOptions = reactive({
  tableName: '房间管理',
  tableData,
  tableFields,
  showIndex: false,
  pageTableOperate,
  tableTools,
  tableOperateWidth: '220'
})

query()
</script>
