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
import { dialogFields, tableFields } from './config/shellSchema'
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

const platformOptions = ref([
  { label: 'Android', value: 'android' },
  { label: 'iOS', value: 'ios' },
  { label: 'H5', value: 'h5' }
])

const channelOptions = ref([])

const searchInfo = reactive({
  platform: '',
  channel: '',
  version: ''
})

const searchItems = computed(() => [
  {
    field: 'platform',
    label: '平台',
    type: 'select',
    options: platformOptions.value
  },
  {
    field: 'channel',
    label: '渠道',
    type: 'select',
    options: channelOptions.value
  },
  {
    field: 'version',
    label: '版本',
    type: 'input'
  }
])

const reset = () => {
  Object.keys(searchInfo).forEach(key => {
    searchInfo[key] = ''
  })
  query()
}

const tableData = ref([])
const allList = ref([])

async function load() {
  const res = await appApi.listShellReleases()
  allList.value = res?.data?.list || []

  // 渠道选项从数据中提取
  const channels = [
    ...new Set(allList.value.map(item => item.channel).filter(Boolean))
  ]
  channelOptions.value = channels.map(c => ({ label: c, value: c }))

  query()
}

// 本地过滤（接口一次性返回全量）
function query() {
  tableData.value = allList.value.filter(item => {
    const hitPlatform =
      !searchInfo.platform || item.platform === searchInfo.platform
    const hitChannel =
      !searchInfo.channel || item.channel === searchInfo.channel
    const hitVersion =
      !searchInfo.version ||
      String(item.version || '')
        .toLowerCase()
        .includes(String(searchInfo.version).toLowerCase())
    return hitPlatform && hitChannel && hitVersion
  })
}

const confirmMethod = async newData => {
  const res = await appApi.createShellRelease({
    platform: newData.platform,
    channel: newData.channel,
    version: newData.version,
    buildNumber: newData.buildNumber,
    packageUrl: newData.packageUrl,
    forceUpdate: !!newData.forceUpdate,
    releaseNotes: newData.releaseNotes
  })
  if (res?.status) {
    showTips('success', '发布成功')
  }
  return res || { status: false, msg: '发布失败' }
}

const dialogOptions = reactive({
  fieldList: dialogFields,
  confirmMethod,
  confirmParams: {},
  initMethod: null,
  initParams: {},
  disabled: false
})

const dialogRef = ref()
const dialogTitle = ref('发布壳版本')

function create() {
  dialogTitle.value = '发布壳版本'
  dialogOptions.disabled = false
  dialogOptions.initParams = { id: '' }
  dialogRef.value?.opentDialog()
}

const tableOptions = reactive({
  tableData,
  tableFields,
  tableName: '壳版本列表',
  showIndex: true,
  showSelection: false,
  pageTableOperate: [],
  tableOperateWidth: 'auto'
})

onMounted(load)
</script>

<style></style>
