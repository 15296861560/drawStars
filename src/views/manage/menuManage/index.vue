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

    <el-dialog
      v-model="formVisible"
      :title="formMode === 'create' ? '新增菜单' : '编辑菜单'"
      width="560px"
      destroy-on-close
    >
      <el-form :model="form" label-width="90px">
        <el-form-item label="上级ID">
          <el-input-number v-model="form.parentId" :min="0" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" class="w-full">
            <el-option label="目录" :value="1" />
            <el-option label="菜单" :value="2" />
            <el-option label="按钮" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.type !== 3" label="路径">
          <el-input v-model="form.path" placeholder="/home/..." />
        </el-form-item>
        <el-form-item label="组件">
          <el-input v-model="form.component" placeholder="可选" />
        </el-form-item>
        <el-form-item label="权限码">
          <el-input
            v-model="form.permission"
            placeholder="如 system:user:create"
          />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="可见">
          <el-select v-model="form.visible" class="w-full">
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" class="w-full">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
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
import { tableFields } from './config/schema'
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

const searchInfo = reactive({
  keyword: '',
  type: '',
  status: ''
})
const tableData = ref([])
const rawTree = ref([])

const formVisible = ref(false)
const formMode = ref('create')
const form = reactive({
  id: null,
  parentId: 0,
  name: '',
  type: 2,
  path: '',
  component: '',
  permission: '',
  icon: '',
  sort: 0,
  visible: 1,
  status: 1
})

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

const openCreate = parentId => {
  formMode.value = 'create'
  Object.assign(form, {
    id: null,
    parentId: parentId || 0,
    name: '',
    type: 2,
    path: '',
    component: '',
    permission: '',
    icon: '',
    sort: 0,
    visible: 1,
    status: 1
  })
  formVisible.value = true
}

const openEdit = row => {
  formMode.value = 'edit'
  Object.assign(form, {
    id: row.id,
    parentId: row.parentId ?? 0,
    name: row.name,
    type: row.type,
    path: row.path || '',
    component: row.component || '',
    permission: row.permission || '',
    icon: row.icon || '',
    sort: row.sort ?? 0,
    visible: row.visible ?? 1,
    status: row.status ?? 1
  })
  formVisible.value = true
}

const submitForm = async () => {
  let res
  if (formMode.value === 'create') {
    res = await menuApi.create({ ...form })
  } else {
    res = await menuApi.update({ ...form })
  }
  if (res.status) {
    showTips('success', '保存成功')
    formVisible.value = false
    loadTree()
  } else {
    showTips('error', res.msg || '保存失败')
  }
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
  /* 树形表格：展开箭头与名称同一行垂直居中 */
  :deep(.el-table__body .el-table__cell .cell) {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    line-height: 1.5;
  }

  :deep(.el-table__indent) {
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

  :deep(.el-table__placeholder) {
    flex-shrink: 0;
  }

  :deep(.el-table__body .el-table__cell .cell > div) {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    line-height: inherit;
  }
}
</style>
