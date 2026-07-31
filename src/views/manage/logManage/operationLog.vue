<template>
  <div class="log-container">
    <el-row class="mb40" :gutter="20">
      <el-col :span="22">
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
      <el-col :span="2">
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

    <BaseTable
      :options="tableOptions"
      :page="pageInfo"
      max-height="700"
      @selection-change="handleSelectionChange"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, defineAsyncComponent } from 'vue'
import { showTips } from '@/utils/message/showTips.js'
import { ElMessageBox, ElTooltip } from 'element-plus'
import logApi from '@/assets/js/api/logController/logApi.js'
import { exportFile } from '@/utils/commom/importAndExport.ts'
const BaseTable = defineAsyncComponent(
  () => import('@/components/base/form/BaseTable.vue')
)
const SearchItem = defineAsyncComponent(
  () => import('@/components/base/SearchItem/index.vue')
)

// 搜索条件
const searchInfo = reactive({
  username: '',
  operation: '',
  status: '',
  timeRange: [],
  startTime: '',
  endTime: ''
})

// 表格数据
const tableData = ref([])
const checkList = ref([])

// 分页信息
const pageInfo = reactive({
  curPage: 1,
  pageSize: 10,
  total: 0,
  curPageChange: query
})

// 操作类型选项
const operationOptions = [
  { label: '新增', value: 'insert' },
  { label: '修改', value: 'update' },
  { label: '删除', value: 'delete' },
  { label: '查询', value: 'select' },
  { label: '登录', value: 'login' },
  { label: '登出', value: 'logout' }
]

// 状态选项
const statusOptions = [
  { label: '成功', value: 'success' },
  { label: '失败', value: 'fail' }
]

// 搜索项配置
const searchItems = computed(() => [
  {
    field: 'username',
    label: '操作用户',
    type: 'input',
    placeholder: '请输入用户名'
  },
  {
    field: 'operation',
    label: '操作类型',
    type: 'select',
    options: operationOptions,
    placeholder: '请选择操作类型'
  },
  {
    field: 'status',
    label: '状态',
    type: 'select',
    options: statusOptions,
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

// 查询方法
async function query() {
  const range = Array.isArray(searchInfo.timeRange)
    ? searchInfo.timeRange
    : []
  const params = {
    username: searchInfo.username || undefined,
    operation: searchInfo.operation || undefined,
    status: searchInfo.status || undefined,
    startTime: range[0] || searchInfo.startTime || undefined,
    endTime: range[1] || searchInfo.endTime || undefined,
    timeRange: range.length >= 2 ? range : undefined,
    curPage: pageInfo.curPage,
    pageSize: pageInfo.pageSize
  }

  const result = await logApi.queryOperationLogs(params)
  if (result.status) {
    tableData.value = result.data.list
    pageInfo.total = result.data.total
  } else {
    showTips('error', result.msg)
  }
}

// 重置方法
const reset = () => {
  searchInfo.username = ''
  searchInfo.operation = ''
  searchInfo.status = ''
  searchInfo.timeRange = []
  searchInfo.startTime = ''
  searchInfo.endTime = ''
  pageInfo.curPage = 1
  query()
}

// 选择变化
const handleSelectionChange = val => {
  checkList.value = val.map(v => v.id)
}

// 批量删除
const batchDelete = () => {
  if (checkList.value.length === 0) {
    showTips('warning', '请选择要删除的日志')
    return
  }

  ElMessageBox.confirm('确定要删除选中的日志吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const result = await logApi.batchDeleteLogs(checkList.value)
      if (result.status) {
        showTips('success', '删除成功')
        query()
      }
    })
    .catch(() => {
      showTips('info', '已取消删除')
    })
}

// 导出选中
const exportSelected = () => {
  const data = tableData.value.filter(item => checkList.value.includes(item.id))
  exportFile(data, '操作日志')
}

// 表格配置
const tableOptions = reactive({
  tableData,
  tableName: '操作日志',
  tableFields: [
    { fieldName: 'username', label: '操作用户', width: 120 },
    { fieldName: 'operation', label: '操作类型', minWidth: 150 },
    { fieldName: 'method', label: '请求方法', minWidth: 150 },
    { fieldName: 'params', label: '请求参数', width: 200, slotName: 'params' },
    { fieldName: 'ip', label: 'IP地址', width: 150 },
    { fieldName: 'status', label: '状态', width: 100 },
    { fieldName: 'msg', label: '消息' },
    {
      fieldName: 'errorMsg',
      label: '错误信息',
      slotName: 'errorMsg'
    },
    { fieldName: 'create_time', label: '操作时间', width: 180 }
  ],
  showIndex: false,
  showSelection: true,
  pageTableOperate: [
    {
      label: '查看',
      type: 'primary',
      icon: 'View',
      action: row => handleView(row)
    },
    {
      label: '删除',
      type: 'danger',
      icon: 'Delete',
      action: row => handleDelete(row)
    }
  ],
  tableOperate: [
    { label: '导出选中', type: 'primary', action: exportSelected },
    { label: '批量删除', type: 'danger', action: batchDelete }
  ]
})

// 查看详情
const handleView = row => {
  ElMessageBox.alert(
    `
    <div class="log-detail">
      <p><strong>操作用户：</strong>${row.username}</p>
      <p><strong>操作类型：</strong>${row.operation}</p>
      <p><strong>请求方法：</strong>${row.method}</p>
      <p><strong>请求参数：</strong>${row.params}</p>
      <p><strong>IP地址：</strong>${row.ip}</p>
      <p><strong>状态：</strong>${row.status}</p>
      ${row.errorMsg ? `<p><strong>错误信息：</strong>${row.errorMsg}</p>` : ''}
      <p><strong>操作时间：</strong>${row.create_time}</p>
    </div>
  `,
    '操作日志详情',
    {
      dangerouslyUseHTMLString: true,
      customClass: 'log-detail-dialog',
      width: '600px'
    }
  )
}

// 单条删除
const handleDelete = row => {
  ElMessageBox.confirm(`确定要删除这条操作日志吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const result = await logApi.deleteLog(row.id)
      if (result.status) {
        showTips('success', '删除成功')
        query()
      }
    })
    .catch(() => {
      showTips('info', '已取消删除')
    })
}

onMounted(() => {
  query()
})
</script>

<style scoped>
.text-ellipsis {
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
