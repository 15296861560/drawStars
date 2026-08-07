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
import { ElMessageBox } from 'element-plus'
import logApi from '@/assets/js/api/logController/logApi.js'
import { exportFile } from '@/utils/commom/importAndExport.ts'

const BaseTable = defineAsyncComponent(
  () => import('@/components/base/form/BaseTable.vue')
)
const SearchItem = defineAsyncComponent(
  () => import('@/components/base/SearchItem/index.vue')
)

const searchInfo = reactive({
  username: '',
  operation: '',
  status: '',
  startTime: '',
  endTime: ''
})

const tableData = ref([])
const checkList = ref([])

const pageInfo = reactive({
  curPage: 1,
  pageSize: 10,
  total: 0,
  curPageChange: query
})

const operationOptions = [
  { label: '新增', value: 'insert' },
  { label: '修改', value: 'update' },
  { label: '删除', value: 'delete' },
  { label: '查询', value: 'select' },
  { label: '登录', value: 'login' },
  { label: '登出', value: 'logout' }
]

const statusOptions = [
  { label: '成功', value: 'success' },
  { label: '失败', value: 'fail' }
]

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

async function query() {
  const params = {
    ...searchInfo,
    curPage: pageInfo.curPage,
    pageSize: pageInfo.pageSize
  }
  const result = await logApi.queryOperationLogs(params)
  if (result.status) {
    tableData.value = result.data.list || []
    pageInfo.total = result.data.total || 0
  } else {
    showTips('error', result.msg)
  }
}

const reset = () => {
  Object.keys(searchInfo).forEach(key => {
    searchInfo[key] = ''
  })
  pageInfo.curPage = 1
  query()
}

const handleSelectionChange = val => {
  checkList.value = val.map(v => v.id)
}

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
    .catch(() => {})
}

const exportSelected = () => {
  const data = tableData.value.filter(item => checkList.value.includes(item.id))
  exportFile(data, '操作日志')
}

const tableOptions = reactive({
  tableData,
  tableName: '操作日志',
  tableFields: [
    { fieldName: 'username', label: '操作用户', width: 120 },
    { fieldName: 'operation', label: '操作类型', minWidth: 160 },
    { fieldName: 'method', label: '请求方法', minWidth: 220 },
    { fieldName: 'params', label: '请求参数', width: 200 },
    { fieldName: 'ip', label: 'IP地址', width: 150 },
    { fieldName: 'status', label: '状态', width: 100 },
    { fieldName: 'msg', label: '消息' },
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

const handleView = row => {
  ElMessageBox.alert(
    `<div class="log-detail">
      <p><strong>操作用户：</strong>${row.username || '-'}</p>
      <p><strong>操作类型：</strong>${row.operation || '-'}</p>
      <p><strong>请求方法：</strong>${row.method || '-'}</p>
      <p><strong>请求参数：</strong>${row.params || '-'}</p>
      <p><strong>IP地址：</strong>${row.ip || '-'}</p>
      <p><strong>状态：</strong>${row.status || '-'}</p>
      <p><strong>消息：</strong>${row.msg || '-'}</p>
      ${row.errorMsg ? `<p><strong>错误信息：</strong>${row.errorMsg}</p>` : ''}
      <p><strong>操作时间：</strong>${row.create_time || '-'}</p>
    </div>`,
    '操作日志详情',
    { dangerouslyUseHTMLString: true, width: '600px' }
  )
}

const handleDelete = row => {
  ElMessageBox.confirm('确定要删除这条操作日志吗?', '提示', {
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
    .catch(() => {})
}

onMounted(() => {
  query()
})
</script>
