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
          <el-button type="primary" @click="loadTree">{{
            $t('btn.search')
          }}</el-button>
          <el-button type="warning" @click="reset">{{
            $t('btn.reset')
          }}</el-button>
          <el-button
            v-permission="'system:menu:create'"
            type="success"
            @click="openCreate(0)"
            >{{ $t('btn.create') }}</el-button
          >
        </div>
      </el-col>
    </el-row>

    <base-table
      class="menu-tree-table"
      :options="tableOptions"
      :page="null"
      max-height="700"
      default-expand-all
      :tree-props="{ children: 'children' }"
    ></base-table>

    <base-dialog
      ref="dialogRef"
      :options="dialogOptions"
      :title="dialogTitle"
      @confirm="loadTree"
    />
  </div>
</template>

<script setup>
import {
  onMounted,
  reactive,
  ref,
  computed,
  defineAsyncComponent
} from 'vue'
import { ElMessageBox } from 'element-plus'
import menuApi from '@/assets/js/api/menuController/menuApi.js'
import { showTips } from '@/utils/message/showTips.js'
import { tableFields, dialogFields } from './config/schema'
import { permissionStore } from '@/stores/permission'
import i18n from '@/lang/index.js'

const $t = i18n.global.t
const perm = permissionStore()

const BaseTable = defineAsyncComponent(
  () => import('@/components/base/form/BaseTable.vue')
)
const SearchItem = defineAsyncComponent(
  () => import('@/components/base/SearchItem/index.vue')
)
const BaseDialog = defineAsyncComponent(
  () => import('@/components/base/form/BaseDialog.vue')
)

const searchInfo = reactive({
  keyword: '',
  type: '',
  status: ''
})
const tableData = ref([])
const rawTree = ref([])
const dialogRef = ref()
const dialogTitle = ref('新增菜单')

const typeOptions = [
  { label: '目录', value: 1 },
  { label: '菜单', value: 2 },
  { label: '按钮', value: 3 }
]

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 }
]

const searchItems = computed(() => [
  {
    field: 'keyword',
    label: '关键词',
    placeholder: '名称/路径/权限码',
    type: 'input'
  },
  {
    field: 'type',
    label: '类型',
    placeholder: '请选择',
    type: 'select',
    options: typeOptions
  },
  {
    field: 'status',
    label: '状态',
    placeholder: '请选择',
    type: 'select',
    options: statusOptions
  }
])

const typeLabel = type => {
  if (type === 1) return '目录'
  if (type === 2) return '菜单'
  if (type === 3) return '按钮'
  return String(type)
}

function mapTree(nodes) {
  return (nodes || []).map(n => ({
    ...n,
    typeLabel: typeLabel(n.type),
    children: n.children?.length ? mapTree(n.children) : undefined
  }))
}

function filterTree(nodes) {
  const kw = (searchInfo.keyword || '').trim().toLowerCase()
  const type = searchInfo.type
  const status = searchInfo.status

  const walk = list => {
    const out = []
    for (const node of list || []) {
      const children = walk(node.children || [])
      const hitKw =
        !kw ||
        String(node.name || '')
          .toLowerCase()
          .includes(kw) ||
        String(node.path || '')
          .toLowerCase()
          .includes(kw) ||
        String(node.permission || '')
          .toLowerCase()
          .includes(kw)
      const hitType =
        type === '' ||
        type === null ||
        type === undefined ||
        Number(node.type) === Number(type)
      const hitStatus =
        status === '' ||
        status === null ||
        status === undefined ||
        Number(node.status) === Number(status)
      if ((hitKw && hitType && hitStatus) || children.length) {
        out.push({
          ...node,
          children: children.length ? children : undefined
        })
      }
    }
    return out
  }
  return walk(nodes)
}

const applyFilter = () => {
  tableData.value = filterTree(mapTree(rawTree.value))
}

const loadTree = async () => {
  const res = await menuApi.getTree()
  if (res.status) {
    rawTree.value = res.data || []
    applyFilter()
  } else {
    showTips('error', res.msg || '加载失败')
  }
}

const reset = () => {
  searchInfo.keyword = ''
  searchInfo.type = ''
  searchInfo.status = ''
  applyFilter()
}

const confirmMethod = async data => {
  const payload = { ...data }
  let res
  if (payload.id) {
    res = await menuApi.update(payload)
  } else {
    delete payload.id
    res = await menuApi.create(payload)
  }
  if (!res?.status) {
    return res || { status: false, msg: '保存失败' }
  }
  showTips('success', '保存成功')
  // 侧边栏菜单来自 permission 缓存，保存后立即刷新
  try {
    await perm.loadPermission()
  } catch (_) {
    /* ignore */
  }
  return { status: true, msg: 'ok', data: res.data }
}

const initMethod = async params => {
  const { id } = params
  const res = await menuApi.getDetail(id)
  if (!res?.status) {
    return res || { status: false, msg: '加载失败', data: null }
  }
  const row = res.data
  return { status: true, msg: 'ok', data: [row] }
}

const dialogOptions = reactive({
  fieldList: dialogFields,
  confirmMethod,
  confirmParams: {
    parentId: 0,
    type: 2,
    path: '',
    component: '',
    permission: '',
    client: 'pc',
    moduleCode: '',
    isTab: 0,
    icon: '',
    sort: 0,
    visible: 1,
    status: 1
  },
  initMethod,
  initParams: {},
  disabled: false,
  labelPosition: 'left'
})

const openCreate = parentId => {
  dialogTitle.value = '新增菜单'
  dialogOptions.disabled = false
  dialogOptions.confirmParams = {
    parentId: parentId || 0,
    type: 2,
    path: '',
    component: '',
    permission: '',
    client: 'pc',
    moduleCode: '',
    isTab: 0,
    icon: '',
    sort: 0,
    visible: 1,
    status: 1
  }
  dialogOptions.initParams = {}
  dialogRef.value?.opentDialog()
}

const openEdit = row => {
  dialogTitle.value = '编辑菜单'
  dialogOptions.disabled = false
  dialogOptions.initParams = { id: row.id }
  dialogRef.value?.opentDialog()
}

const handleDelete = async row => {
  try {
    await ElMessageBox.confirm(`是否确认删除菜单「${row.name}」？`, '提示', {
      type: 'warning'
    })
  } catch (e) {
    showTips('info', '已取消删除操作')
    return
  }
  const res = await menuApi.delete(row.id)
  if (res.status) {
    showTips('success', '删除成功')
    try {
      await perm.loadPermission()
    } catch (_) {
      /* ignore */
    }
    loadTree()
  } else {
    showTips('error', res.msg || '删除失败')
  }
}

const pageTableOperate = [
  {
    label: '新增子级',
    type: 'primary',
    action: row => openCreate(row.id),
    show: (_op, row) =>
      row.type !== 3 && perm.hasPermission('system:menu:create')
  },
  {
    label: '编辑',
    type: 'warning',
    action: openEdit,
    show: () => perm.hasPermission('system:menu:update')
  },
  {
    label: '删除',
    type: 'danger',
    action: handleDelete,
    show: () => perm.hasPermission('system:menu:delete')
  }
]

const tableOptions = reactive({
  tableData,
  tableFields,
  tableName: '菜单配置',
  showIndex: false,
  showSelection: false,
  pageTableOperate,
  tableOperateWidth: '220',
  rowKey: 'id'
})

onMounted(loadTree)
</script>

<style scoped lang="less">
.menu-tree-table {
  /* 仅首列（名称）横向排布展开箭头与文字，避免影响操作列 */
  :deep(.el-table__body .el-table__row > .el-table__cell:first-child .cell) {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    line-height: 1.5;
  }

  :deep(.el-table__indent),
  :deep(.el-table__placeholder) {
    flex-shrink: 0;
  }

  :deep(.el-table__expand-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    height: 1.5em;
    margin-right: 6px;
    vertical-align: middle;
  }
}
</style>
