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
  module: '',
  type: '',
  operator: '',
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

const moduleOptions = [
  { label: '前端埋点', value: 'frontend' },
  { label: '用户管理', value: 'user' },
  { label: '角色管理', value: 'role' },
  { label: '系统设置', value: 'system' },
  { label: '日志管理', value: 'log' }
]

const logTypeOptions = [
  { label: '页面访问', value: 'pageview' },
  { label: '点击事件', value: 'click' },
  { label: '业务日志', value: 'business' },
  { label: '系统日志', value: 'system' },
  { label: '异常日志', value: 'error' }
]

const searchItems = computed(() => [
  {
    field: 'module',
    label: '业务模块',
    type: 'select',
    options: moduleOptions,
    placeholder: '请选择业务模块'
  },
  {
    field: 'type',
    label: '日志类型',
    type: 'select',
    options: logTypeOptions,
    placeholder: '请选择日志类型'
  },
  {
    field: 'operator',
    label: '操作人',
    type: 'input',
    placeholder: '请输入操作人'
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
  const result = await logApi.queryBusinessLogs(params)
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
  exportFile(data, '业务日志')
}

const tableOptions = reactive({
  tableData,
  tableName: '业务日志',
  tableFields: [
    { fieldName: 'module', label: '业务模块', width: 120 },
    { fieldName: 'type', label: '日志类型', width: 120 },
    { fieldName: 'title', label: '日志标题', width: 200 },
    { fieldName: 'path', label: '页面路径', width: 200 },
    { fieldName: 'content', label: '日志内容' },
    { fieldName: 'operator', label: '操作人', width: 120 },
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
      <p><strong>业务模块：</strong>${row.module || '-'}</p>
      <p><strong>日志类型：</strong>${row.type || '-'}</p>
      <p><strong>标题：</strong>${row.title || '-'}</p>
      <p><strong>路径：</strong>${row.path || '-'}</p>
      <p><strong>内容：</strong>${row.content || '-'}</p>
      <p><strong>操作人：</strong>${row.operator || '-'}</p>
      <p><strong>时间：</strong>${row.create_time || '-'}</p>
    </div>`,
    '业务日志详情',
    { dangerouslyUseHTMLString: true, width: '600px' }
  )
}

const handleDelete = row => {
  ElMessageBox.confirm('确定要删除这条业务日志吗?', '提示', {
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
