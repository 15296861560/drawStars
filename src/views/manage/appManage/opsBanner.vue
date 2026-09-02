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
        </div>
      </el-col>
    </el-row>

    <base-table
      ref="tableRef"
      :options="tableOptions"
      :page="null"
      max-height="700"
    >
    </base-table>

    <base-dialog
      ref="dialogRef"
      :options="dialogOptions"
      :title="dialogTitle"
      @confirm="load"
    ></base-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, defineAsyncComponent, computed } from 'vue'
import appApi from '@/assets/js/api/appController/appApi.js'
import { showTips } from '@/utils/message/showTips.js'
import { dialogFields, tableFields } from './config/bannerSchema'
import i18n from '@/lang/index.js'

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

const statusOptions = ref([
  { label: '已上线', value: 'published' },
  { label: '已下线', value: 'offline' }
])

const platformOptions = ref([
  { label: 'Android', value: 'android' },
  { label: 'iOS', value: 'ios' },
  { label: 'H5', value: 'h5' }
])

const searchInfo = reactive({
  title: '',
  status: '',
  platform: ''
})

const searchItems = computed(() => [
  {
    field: 'title',
    label: '标题',
    type: 'input'
  },
  {
    field: 'status',
    label: '状态',
    type: 'select',
    options: statusOptions.value
  },
  {
    field: 'platform',
    label: '平台',
    type: 'select',
    options: platformOptions.value
  }
])

const reset = () => {
  Object.keys(searchInfo).forEach(key => {
    searchInfo[key] = ''
  })
  query()
}

const allList = ref([])
const tableData = ref([])

async function load() {
  const res = await appApi.listOpsBanners()
  allList.value = res?.data?.list || res?.data || []
  query()
}

// 本地过滤（接口一次性返回全量）
function query() {
  const kw = String(searchInfo.title || '').trim().toLowerCase()
  tableData.value = allList.value.filter(item => {
    const hitTitle =
      !kw || String(item.title || '')
        .toLowerCase()
        .includes(kw)
    const hitStatus = !searchInfo.status || item.status === searchInfo.status
    const hitPlatform =
      !searchInfo.platform || String(item.platforms || '').includes(searchInfo.platform)
    return hitTitle && hitStatus && hitPlatform
  })
}

const confirmMethod = async newData => {
  const res = await appApi.saveOpsBanner({ ...newData })
  if (res?.status) {
    showTips('success', '保存成功')
  }
  return res || { status: false, msg: '保存失败' }
}

// 编辑回填
const initMethod = async params => {
  const row = allList.value.find(item => item.id === params.id)
  return { status: true, msg: 'ok', data: [row] }
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
const dialogTitle = ref('新建 Banner')

// 编辑
function edit(row) {
  dialogTitle.value = '编辑 Banner'
  dialogOptions.disabled = false
  dialogOptions.initParams = { id: row.id }
  dialogRef.value?.opentDialog()
}

// 新建
function create() {
  dialogTitle.value = '新建 Banner'
  dialogOptions.disabled = false
  dialogOptions.initParams = { id: '' }
  dialogRef.value?.opentDialog()
}

const tableOptions = reactive({
  tableData,
  tableFields,
  tableName: 'Banner 列表',
  showIndex: true,
  showSelection: false,
  pageTableOperate: [
    {
      label: '编辑',
      type: 'warning',
      action: edit
    }
  ],
  tableOperateWidth: 'auto'
})

onMounted(load)
</script>

<style></style>
