<template>
  <div class="manage-page">
    <!-- 星夜页头（PageHero 通用组件） -->
    <page-hero title="调试白名单" desc="调试设备白名单的维护管理">
      <template #side>
        <span class="page-hero__pill">
          <el-icon :size="14"><Key /></el-icon>
          共 {{ allList.length }} 条
        </span>
        <el-button
          type="success"
          class="page-hero__btn"
          :icon="Plus"
          @click="create"
          >{{ $t('btn.create') }}</el-button
        >
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
import { Plus, Key } from '@element-plus/icons-vue'
import { dialogFields, tableFields } from './config/whitelistSchema'
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
const FilterBar = defineAsyncComponent(
  () => import('@/components/base/FilterBar/index.vue')
)
const PageHero = defineAsyncComponent(
  () => import('@/components/base/PageHero/index.vue')
)

const searchInfo = reactive({
  pattern: '',
  remark: ''
})

const searchItems = computed(() => [
  {
    field: 'pattern',
    label: '匹配串',
    type: 'input'
  },
  {
    field: 'remark',
    label: '备注',
    type: 'input'
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
  const res = await appApi.listDebugWhitelist()
  allList.value = res?.data?.list || []
  query()
}

// 本地过滤（接口一次性返回全量）
function query() {
  const pattern = String(searchInfo.pattern || '')
    .trim()
    .toLowerCase()
  const remark = String(searchInfo.remark || '')
    .trim()
    .toLowerCase()
  tableData.value = allList.value.filter(item => {
    const hitPattern =
      !pattern ||
      String(item.pattern || '')
        .toLowerCase()
        .includes(pattern)
    const hitRemark =
      !remark ||
      String(item.remark || '')
        .toLowerCase()
        .includes(remark)
    return hitPattern && hitRemark
  })
}

const confirmMethod = async newData => {
  const res = await appApi.addDebugWhitelist({
    pattern: newData.pattern,
    remark: newData.remark
  })
  if (res?.status) {
    showTips('success', '添加成功')
  }
  return res || { status: false, msg: '添加失败' }
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
const dialogTitle = ref('新增白名单')

// 新增
function create() {
  dialogTitle.value = '新增白名单'
  dialogOptions.disabled = false
  dialogOptions.initParams = { id: '' }
  dialogRef.value?.opentDialog()
}

const tableOptions = reactive({
  tableData,
  tableFields,
  tableName: '调试白名单',
  showIndex: true,
  showSelection: false,
  pageTableOperate: [],
  tableOperateWidth: 'auto'
})

onMounted(load)
</script>
