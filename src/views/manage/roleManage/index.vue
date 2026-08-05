<template>
  <div class="g-list-vertical">
    <search-form
      :model="searchInfo"
      :items="searchFields"
      :visible="showSearch"
      @search="query"
      @reset="reset"
    />

    <base-table
      :options="tableOptions"
      :page="pageInfo"
      :selection-count="selection.length"
      @selection-change="handleSelectionChange"
    />

    <el-dialog
      v-model="formVisible"
      :title="formMode === 'create' ? '新增角色' : '修改角色'"
      width="520px"
      destroy-on-close
      append-to-body
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限字符" prop="code">
          <el-input
            v-model="form.code"
            placeholder="请输入权限字符"
            :disabled="formMode === 'edit'"
          />
        </el-form-item>
        <el-form-item label="角色顺序" prop="sort">
          <el-input-number
            v-model="form.sort"
            :min="0"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="formVisible = false">取 消</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="bindVisible"
      title="绑定菜单"
      width="520px"
      destroy-on-close
      append-to-body
    >
      <el-alert
        v-if="bindIsSuperAdmin"
        type="info"
        :closable="false"
        show-icon
        class="mb16"
        title="超级管理员默认拥有全部菜单权限，无需手动勾选"
      />
      <el-tree
        ref="treeRef"
        :data="menuTree"
        show-checkbox
        node-key="id"
        :props="{ label: 'name', children: 'children' }"
        default-expand-all
        :disabled="bindIsSuperAdmin"
      />
      <template #footer>
        <el-button
          v-if="!bindIsSuperAdmin"
          type="primary"
          @click="submitBind"
          >确 定</el-button
        >
        <el-button @click="bindVisible = false">{{
          bindIsSuperAdmin ? '关 闭' : '取 消'
        }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { nextTick, onMounted, reactive, ref, defineAsyncComponent } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  Download,
  CircleCheck,
  User
} from '@element-plus/icons-vue'
import roleApi from '@/assets/js/api/roleController/roleApi.js'
import menuApi from '@/assets/js/api/menuController/menuApi.js'
import { showTips } from '@/utils/message/showTips.js'
import { exportFile } from '@/utils/commom/importAndExport.ts'
import { tableFields, searchFields } from './config/schema'
import { permissionStore } from '@/stores/permission'

const perm = permissionStore()

const BaseTable = defineAsyncComponent(
  () => import('@/components/base/form/BaseTable.vue')
)
const SearchForm = defineAsyncComponent(
  () => import('@/components/base/SearchForm/index.vue')
)

const showSearch = ref(true)
const searchInfo = reactive({
  name: '',
  code: '',
  status: '',
  dateRange: []
})
const pageInfo = reactive({
  curPage: 1,
  pageSize: 10,
  total: 0,
  curPageChange: query,
  sizeChange: query
})
const tableData = ref([])
const selection = ref([])

const formVisible = ref(false)
const formMode = ref('create')
const formRef = ref()
const form = reactive({
  id: null,
  name: '',
  code: '',
  remark: '',
  sort: 0,
  status: 1
})
const formRules = {
  name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }]
}

const bindVisible = ref(false)
const bindRoleId = ref(null)
const bindIsSuperAdmin = ref(false)
const menuTree = ref([])
const treeRef = ref()

const formatTime = ts => {
  if (!ts) return '-'
  const d = new Date(Number(ts))
  if (Number.isNaN(d.getTime())) return '-'
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const handleSelectionChange = rows => {
  selection.value = rows || []
}

async function query() {
  const [beginTime, endTime] = searchInfo.dateRange || []
  const res = await roleApi.queryList({
    name: searchInfo.name,
    code: searchInfo.code,
    status: searchInfo.status,
    beginTime: beginTime || '',
    endTime: endTime || '',
    curPage: pageInfo.curPage,
    pageSize: pageInfo.pageSize
  })
  if (res.status) {
    tableData.value = (res.data?.list || []).map(item => ({
      ...item,
      createTimeText: formatTime(item.createTime)
    }))
    pageInfo.total = res.data?.total || 0
  } else {
    showTips('error', res.msg || '查询失败')
  }
}

const reset = () => {
  searchInfo.name = ''
  searchInfo.code = ''
  searchInfo.status = ''
  searchInfo.dateRange = []
  pageInfo.curPage = 1
  query()
}

const openCreate = () => {
  formMode.value = 'create'
  Object.assign(form, {
    id: null,
    name: '',
    code: '',
    remark: '',
    sort: 0,
    status: 1
  })
  formVisible.value = true
}

const openEdit = row => {
  if (!row) return
  formMode.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    code: row.code,
    remark: row.remark || '',
    sort: row.sort ?? 0,
    status: row.status ?? 1
  })
  formVisible.value = true
}

const submitForm = async () => {
  if (formRef.value) {
    try {
      await formRef.value.validate()
    } catch {
      return
    }
  }
  let res
  if (formMode.value === 'create') {
    res = await roleApi.create({ ...form })
  } else {
    res = await roleApi.update({ ...form })
  }
  if (res.status) {
    showTips('success', '保存成功')
    formVisible.value = false
    query()
  } else {
    showTips('error', res.msg || '保存失败')
  }
}

const openBind = async row => {
  bindRoleId.value = row.id
  bindIsSuperAdmin.value = row.code === 'super_admin'
  const [treeRes, idsRes] = await Promise.all([
    menuApi.getTree(),
    roleApi.getMenuIds(row.id)
  ])
  menuTree.value = treeRes.status ? treeRes.data || [] : []
  bindVisible.value = true
  await nextTick()
  const ids = idsRes.status ? idsRes.data || [] : []
  treeRef.value?.setCheckedKeys(ids)
}

const submitBind = async () => {
  if (bindIsSuperAdmin.value) {
    ElMessage.info('超级管理员默认拥有全部菜单权限')
    bindVisible.value = false
    return
  }
  const checked = treeRef.value?.getCheckedKeys(false) || []
  const half = treeRef.value?.getHalfCheckedKeys() || []
  const menuIds = [...checked, ...half]
  const res = await roleApi.bindMenus({
    roleId: bindRoleId.value,
    menuIds
  })
  if (res.status) {
    showTips('success', '绑定成功')
    bindVisible.value = false
  } else {
    showTips('error', res.msg || '绑定失败')
  }
}

const handleDelete = async row => {
  try {
    await ElMessageBox.confirm(
      `是否确认删除角色编号为"${row.id}"的数据项？`,
      '警告',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
  } catch {
    return
  }
  const res = await roleApi.delete(row.id)
  if (res.status) {
    showTips('success', '删除成功')
    query()
  } else {
    showTips('error', res.msg || '删除失败')
  }
}

const batchEdit = () => {
  if (selection.value.length !== 1) return
  openEdit(selection.value[0])
}

const batchDelete = async () => {
  if (!selection.value.length) return
  const ids = selection.value.map(r => r.id)
  try {
    await ElMessageBox.confirm(
      `是否确认删除角色编号为"${ids.join(',')}"的数据项？`,
      '警告',
      { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
    )
  } catch {
    return
  }
  for (const id of ids) {
    const res = await roleApi.delete(id)
    if (!res.status) {
      showTips('error', res.msg || `删除 ${id} 失败`)
      query()
      return
    }
  }
  showTips('success', '删除成功')
  query()
}

const exportData = () => {
  const list = (selection.value.length ? selection.value : tableData.value).map(
    row => ({
      角色编号: row.id,
      角色名称: row.name,
      权限字符: row.code,
      显示顺序: row.sort,
      状态: row.status === 1 ? '启用' : '停用',
      创建时间: row.createTimeText || formatTime(row.createTime),
      备注: row.remark || ''
    })
  )
  exportFile(list)
}

const toggleStatus = async (row, val) => {
  const prev = val === 1 ? 0 : 1
  const res = await roleApi.update({
    id: row.id,
    status: val
  })
  if (res.status) {
    showTips('success', val === 1 ? '已启用' : '已停用')
  } else {
    row.status = prev
    showTips('error', res.msg || '状态更新失败')
  }
}

const showRemark = row => {
  ElMessage.info(row.remark || '暂无备注')
}

const roleTableFields = tableFields.map(field => {
  if (field.fieldName !== 'status') return field
  return {
    ...field,
    disabled: () => !perm.hasPermission('system:role:update'),
    onChange: toggleStatus
  }
})

const tableOperate = [
  {
    label: '新增',
    type: 'primary',
    icon: Plus,
    action: openCreate,
    show: () => perm.hasPermission('system:role:create')
  },
  {
    label: '修改',
    type: 'success',
    icon: Edit,
    action: batchEdit,
    show: () => perm.hasPermission('system:role:update'),
    disabled: () => selection.value.length !== 1
  },
  {
    label: '删除',
    type: 'danger',
    icon: Delete,
    action: batchDelete,
    show: () => perm.hasPermission('system:role:delete'),
    disabled: () => !selection.value.length
  },
  {
    label: '导出',
    type: 'warning',
    icon: Download,
    action: exportData
  }
]

const tableTools = [
  { label: '搜索', tip: '搜索', icon: Search, action: toggleSearch },
  { label: '刷新', tip: '刷新', icon: Refresh, action: query }
]

const pageTableOperate = [
  {
    label: '修改',
    tip: '修改',
    type: 'primary',
    icon: Edit,
    action: openEdit,
    show: () => perm.hasPermission('system:role:update')
  },
  {
    label: '删除',
    tip: '删除',
    type: 'primary',
    icon: Delete,
    action: handleDelete,
    show: () => perm.hasPermission('system:role:delete')
  },
  {
    label: '绑定菜单',
    tip: '绑定菜单',
    type: 'primary',
    icon: CircleCheck,
    action: openBind,
    show: () => perm.hasPermission('system:role:bind')
  },
  {
    label: '备注',
    tip: '备注',
    type: 'primary',
    icon: User,
    action: showRemark
  }
]

const tableOptions = reactive({
  tableData,
  tableFields: roleTableFields,
  showIndex: false,
  showSelection: true,
  tableOperate,
  tableTools,
  pageTableOperate,
  tableOperateWidth: '160'
})

onMounted(query)
</script>

<style scoped>
.mb16 {
  margin-bottom: 16px;
}
</style>
