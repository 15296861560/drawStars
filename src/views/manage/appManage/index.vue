<template>
  <div class="g-list-vertical">
    <el-row class="mb40" :gutter="20">
      <el-col :span="16">
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
      <el-col :span="8">
        <div class="flex justify-end">
          <el-button type="primary" @click="query">{{
            $t('btn.query')
          }}</el-button>
          <el-button type="warning" @click="reset">{{
            $t('btn.reset')
          }}</el-button>
          <el-button type="success" @click="create">{{
            $t('btn.create')
          }}</el-button>
          <el-button type="primary" plain @click="goShellRelease">
            壳版本发布
          </el-button>
        </div>
      </el-col>
    </el-row>

    <base-table
      ref="tableRef"
      :options="tableOptions"
      :page="pageInfo"
      max-height="700"
      @selection-change="handleSelectionChange"
    >
    </base-table>

    <base-dialog
      ref="dialogRef"
      :options="dialogOptions"
      :title="dialogTitle"
      @confirm="query"
    ></base-dialog>

    <input
      v-show="false"
      type="file"
      ref="uploadRef"
      accept=".zip,.rar"
      @change="uploadApp($event)"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, defineAsyncComponent, computed } from 'vue'
import appApi from '@/assets/js/api/appController/appApi.js'
import { showTips } from '@/utils/message/showTips.js'
import { ElMessageBox } from 'element-plus'
import { dialogFields, tableFields } from './config/schema'
import i18n from '@/lang/index.js'
import { exportFile } from '@/utils/commom/importAndExport.ts'
import router from '@/router'
import { findReq } from '@/assets/js/api'

const $t = i18n.global.t

const BaseDialog = defineAsyncComponent(
  () => import('@/components/base/form/BaseDialog.vue')
)
const BaseTable = defineAsyncComponent(
  () => import('@/components/base/form/BaseTable.vue')
)
const SearchItem = defineAsyncComponent(
  () => import('@/components/base/SearchItem/index.vue')
)

const confirmMethod = async newData => {
  const permissionCodes = Array.isArray(newData.permission_codes)
    ? newData.permission_codes
    : String(newData.permission_codes || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
  const app = {
    name: newData.name,
    version: newData.version,
    status: newData.status,
    category: newData.category,
    icon: newData.icon,
    description: newData.description,
    file_path: newData.file_path,
    module_code: newData.module_code,
    platforms: newData.platforms,
    module_url: newData.module_url,
    checksum: newData.checksum,
    min_shell_version: newData.min_shell_version,
    release_notes: newData.release_notes,
    force_update: newData.force_update,
    permission_codes: permissionCodes
  }
  let confirmFun = appApi.createApp
  let successTips = '创建成功'
  if (newData.id) {
    app.id = newData.id
    confirmFun = appApi.updateApp
    successTips = '编辑成功'
  }
  const result = await confirmFun(app)

  if (result.status) {
    showTips('success', successTips)
    query()
  }
  return result
}

const initMethod = async params => {
  const { id } = params
  const result = await appApi.getAppDetailById(id)
  if (result?.status && Array.isArray(result.data) && result.data[0]) {
    const row = result.data[0]
    if (Array.isArray(row.permission_codes)) {
      row.permission_codes = row.permission_codes.join(',')
    }
  }
  return result
}

const dialogOptions = reactive({
  fieldList: dialogFields,
  confirmMethod,
  confirmParams: {},
  initMethod,
  initParams: {},
  disabled: false
})

const dialogRef = ref()

const dialogTitle = ref('新增')

const searchInfo = reactive({
  name: '',
  status: '',
  category: ''
})

const tableData = ref([])
const checkList = ref([])
const handleSelectionChange = val => {
  checkList.value = val.map(v => v.id)
}

const statusOptions = ref([
  {
    label: '已发布',
    value: 'published'
  },
  {
    label: '未发布',
    value: 'unpublished'
  },
  {
    label: '开发中',
    value: 'developing'
  }
])

const categoryOptions = ref([
  {
    label: '工具类',
    value: 'tool'
  },
  {
    label: '游戏类',
    value: 'game'
  },
  {
    label: '办公类',
    value: 'office'
  },
  {
    label: '社交类',
    value: 'social'
  },
  {
    label: '其他',
    value: 'other'
  }
])

const searchItems = computed(() => [
  {
    field: 'name',
    label: '应用名称',
    type: 'input'
  },
  {
    field: 'status',
    label: '状态',
    type: 'select',
    options: statusOptions.value
  },
  {
    field: 'category',
    label: '分类',
    type: 'select',
    options: categoryOptions.value
  }
])

const reset = () => {
  Object.keys(searchInfo).forEach(key => {
    searchInfo[key] = ''
  })
  query()
}

// 查询
async function query() {
  const params = {
    curPage: pageInfo.curPage,
    pageSize: pageInfo.pageSize,
    ...searchInfo
  }

  const result = await appApi.queryAppList(params)

  if (result.status) {
    const { records, total } = result.data

    tableData.value = records.map(item => {
      item.create_time = new Date(item.create_time).toLocaleString()
      item.update_time = new Date(item.update_time).toLocaleString()
      return item
    })

    pageInfo.total = total
  }
}

const getAllData = async () => {
  let dataList = []
  const params = {
    curPage: 1,
    pageSize: 999,
    ...searchInfo
  }

  const result = await appApi.queryAppList(params)
  if (result.status) {
    const records = result.data?.records || result.data || []
    dataList = (Array.isArray(records) ? records : []).map(item => {
      item.create_time = new Date(item.create_time).toLocaleString()
      item.update_time = new Date(item.update_time).toLocaleString()
      return item
    })
  }

  return dataList
}

// 删除
async function deleteRow(row) {
  const id = row.id
  try {
    await ElMessageBox.confirm('是否确认删除该应用', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch (e) {
    showTips('info', '已取消删除操作')
    return
  }

  const result = await appApi.deleteApp(id)
  if (!result.status) {
    return
  }
  showTips('success', '删除成功')
  query()
}

// 编辑
async function updateRow(row) {
  dialogTitle.value = '编辑'
  dialogOptions.disabled = false
  dialogOptions.initParams = { id: row.id }
  dialogRef.value?.opentDialog()
}

// 创建
function create() {
  dialogTitle.value = '新增'
  dialogOptions.disabled = false
  dialogOptions.initParams = { id: '' }
  dialogRef.value?.opentDialog()
}

// 查看
const getDetail = row => {
  dialogTitle.value = '查看'
  dialogOptions.disabled = true
  dialogOptions.initParams = { id: row.id }
  dialogRef.value?.opentDialog()
}

const uploadApp = async e => {
  const formData = new FormData()
  const file = e.target.files[0]
  formData.append('file', file)
  formData.append('filename', file.name)
  formData.append('type', 4)

  let appZip = { filePath: '', fileName: '' }

  const req = findReq('commomController', 'uploadFile')
  const res = await req(formData)
  if (res.status) {
    appZip = {
      filePath: res.data.url,
      fileName: res.data.name
    }
  } else {
    return
  }

  const result = await appApi.upgradeApp({
    id: temRow.value?.id,
    file_path: JSON.stringify(appZip)
  })
  temRow.value = null
  if (result.status) {
    showTips('success', '更新成功')
    query()
  }
}

const temRow = ref(null)
const uploadRef = ref()
async function upgradeApp(row) {
  temRow.value = row
  uploadRef.value?.click()
}

// 发布
async function offlineApp(row) {
  try {
    await ElMessageBox.confirm(
      '是否确认下架该模块？下架后移动端不可新开',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch (e) {
    showTips('info', '已取消')
    return
  }
  const result = await appApi.offlineApp(row.id)
  if (result.status) {
    showTips('success', '下架成功')
    query()
  }
}

function goShellRelease() {
  router.push('/home/manageHomePage/app/shell')
}

// 与后端 publishFromAppManage 门禁保持一致的前端预检
function validatePublish(row) {
  const plats = (Array.isArray(row.platforms) ? row.platforms : []).map(p =>
    String(p).toLowerCase()
  )
  if (!plats.length) {
    return '发布门禁：请先勾选平台'
  }
  if (!/^\d+\.\d+\.\d+/.test(String(row.version || ''))) {
    return '发布门禁：version 需符合 SemVer (x.y.z)'
  }
  const url = String(row.module_url || '').trim()
  if (url && !/^https:\/\//i.test(url) && !url.startsWith('/')) {
    return '发布门禁：module_url 须为 https 或以 / 开头'
  }
  // 小程序端无法安装本地 zip，必须在线 module_url
  const isMp = plats.some(p => ['mp-weixin', 'mp', 'mini'].includes(p))
  if (isMp && !url) {
    return '发布门禁：小程序平台必须填写 module_url'
  }
  // h5 模块二选一：在线 module_url 或 zip 离线包（壳 App 内下载解压直访）
  const h5Offline = plats.includes('h5') && !url
  const needZip =
    plats.some(p => ['android', 'ios', 'app'].includes(p)) || h5Offline
  if (needZip && !row.file_path) {
    return '发布门禁：App 平台与离线 H5 平台必须上传 zip'
  }
  if (needZip && !row.checksum) {
    return '发布门禁：App 平台与离线 H5 平台必须填写 checksum'
  }
  return ''
}

async function publishApp(row) {
  const invalidMsg = validatePublish(row)
  if (invalidMsg) {
    showTips('error', invalidMsg)
    return
  }
  try {
    await ElMessageBox.confirm('是否确认发布该应用', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch (e) {
    showTips('info', '已取消发布操作')
    return
  }

  // 这里假设有一个发布应用的API
  const result = await appApi.publishApp(row.id)
  if (result.status) {
    showTips('success', '发布成功')
    query()
  }
}

function batchDelete() {
  ElMessageBox.confirm('此操作将永久删除选中, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      // 构造sql
      const ids = checkList.value
      const result = await appApi.batchDeleteApp(ids)
      if (result.status) {
        // 删除成功后操作
        checkList.value = []
        query()
        showTips('success', '删除成功')
      }
    })
    .catch(() => {
      showTips('info', '已取消删除')
    })
}

const exportSelected = () => {
  const dataList =
    tableData.value?.filter(item => checkList.value?.includes(item.id)) || []
  exportFile(dataList)
}

const exportAll = async () => {
  exportAllLoading.value = true
  const dataList = await getAllData()
  exportAllLoading.value = false
  exportFile(dataList)
}

const pageTableOperate = [
  {
    label: '查看',
    type: 'primary',
    action: getDetail
  },
  {
    label: '编辑',
    type: 'warning',
    action: updateRow
  },
  {
    label: '更新',
    type: 'success',
    action: upgradeApp,
    show: row => row.status !== 'published'
  },
  {
    label: '发布',
    type: 'info',
    action: publishApp
    // 注意：不能用 app_manage.status 控制发布按钮显隐，status=published 只是业务状态，
    // 模块目录(mobile_module)只有点发布成功后才会同步，重复点发布后端有版本门禁兜底
  },
  {
    label: '删除',
    type: 'danger',
    action: deleteRow
  },
  {
    label: '版本历史',
    type: 'primary',
    action: versionsRow
  },
  {
    label: '预览码',
    type: 'success',
    action: previewCodeRow
  },
  {
    label: '下架',
    type: 'danger',
    action: offlineApp,
    show: row => row.status === 'published'
  }
]

const exportAllLoading = ref(false)

const tableOperate = [
  {
    label: '导出选中',
    type: 'primary',
    action: exportSelected
  },
  {
    label: '导出全部',
    type: 'warning',
    loading: exportAllLoading,
    action: exportAll
  },
  {
    label: $t('btn.batchDelete'),
    type: 'danger',
    action: batchDelete
  }
]

const tableOptions = reactive({
  tableData,
  tableFields,
  tableName: '应用列表',
  showIndex: false,
  showSelection: true,
  pageTableOperate,
  tableOperate,
  tableOperateWidth: '320'
})

const pageInfo = reactive({
  curPage: 1,
  pageSize: 10,
  total: 100,
  curPageChange: query
})

async function versionsRow(row) {
  const result = await appApi.listVersions(row.id)
  const list = result?.data?.list || []
  const text = list.length
    ? list.map(v => (v.version || '') + ' / ' + (v.status || '')).join('\n')
    : '暂无版本记录'
  ElMessageBox.alert(text, '版本历史 - ' + (row.module_code || row.name), {
    confirmButtonText: '确定'
  })
}

async function previewCodeRow(row) {
  const moduleUrl = row.module_url || row.moduleUrl
  if (!moduleUrl) {
    showTips('warning', '请先填写 module_url')
    return
  }
  const result = await appApi.createPreviewCode({
    moduleCode: row.module_code || row.moduleCode,
    moduleUrl,
    name: row.name,
    ttlSec: 3600
  })
  if (!result?.status) {
    showTips('error', result?.msg || '生成失败')
    return
  }
  const deeplink = result.data?.deeplink || result.data?.text
  ElMessageBox.alert(
    '请用壳扫一扫识别：\n' +
      deeplink +
      '\n过期时间戳：' +
      result.data?.expireAt,
    '预览码 - ' + (row.name || ''),
    { confirmButtonText: '确定' }
  )
}

onMounted(() => {
  query()
})
</script>

<style></style>
