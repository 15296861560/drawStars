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
            $t('btn.search')
          }}</el-button>
          <el-button type="warning" @click="reset">{{
            $t('btn.reset')
          }}</el-button>
          <el-button
            v-permission="'system:user:create'"
            type="success"
            @click="openCreate"
            >{{ $t('btn.create') }}</el-button
          >
        </div>
      </el-col>
    </el-row>

    <base-table
      :options="tableOptions"
      :page="pageInfo"
      max-height="700"
    ></base-table>

    <el-dialog
      v-model="formVisible"
      :title="formMode === 'create' ? '新增用户' : '编辑用户'"
      width="520px"
      destroy-on-close
    >
      <el-form :model="form" label-width="90px">
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="账号别名">
          <el-input v-model="form.accountAlias" />
        </el-form-item>
        <el-form-item v-if="formMode === 'create'" label="密码">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" class="w-full">
            <el-option label="正常" value="active" />
            <el-option label="停用" value="deactivated" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="form.roleIds"
            multiple
            clearable
            class="w-full"
            placeholder="选择角色"
          >
            <el-option
              v-for="r in roleOptions"
              :key="r.id"
              :label="r.name"
              :value="r.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="assignVisible"
      title="分配角色"
      width="420px"
      destroy-on-close
    >
      <el-select
        v-model="assignRoleIds"
        multiple
        clearable
        class="w-full"
        placeholder="选择角色"
      >
        <el-option
          v-for="r in roleOptions"
          :key="r.id"
          :label="r.name"
          :value="r.id"
        />
      </el-select>
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssign">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="pwdVisible"
      title="重置密码"
      width="400px"
      destroy-on-close
    >
      <el-input
        v-model="newPassword"
        type="password"
        show-password
        placeholder="新密码"
      />
      <template #footer>
        <el-button @click="pwdVisible = false">取消</el-button>
        <el-button type="primary" @click="submitResetPwd">确定</el-button>
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
import userManageApi from '@/assets/js/api/userManageController/userManageApi.js'
import roleApi from '@/assets/js/api/roleController/roleApi.js'
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
  status: '',
  roleId: ''
})
const pageInfo = reactive({
  curPage: 1,
  pageSize: 10,
  total: 0,
  curPageChange: query
})
const tableData = ref([])
const roleOptions = ref([])

const formVisible = ref(false)
const formMode = ref('create')
const form = reactive({
  id: null,
  name: '',
  phone: '',
  email: '',
  accountAlias: '',
  password: '',
  status: 'active',
  roleIds: []
})

const assignVisible = ref(false)
const assignUserId = ref(null)
const assignRoleIds = ref([])

const pwdVisible = ref(false)
const pwdUserId = ref(null)
const newPassword = ref('')

const statusOptions = [
  { label: '正常', value: 'active' },
  { label: '停用', value: 'deactivated' }
]

const searchItems = computed(() => [
  {
    field: 'keyword',
    label: '关键词',
    placeholder: '姓名/手机/邮箱',
    type: 'input'
  },
  {
    field: 'status',
    label: '状态',
    placeholder: '请选择',
    type: 'select',
    options: statusOptions
  },
  {
    field: 'roleId',
    label: '角色',
    placeholder: '请选择',
    type: 'select',
    options: roleOptions.value.map(r => ({ label: r.name, value: r.id }))
  }
])

const loadRoles = async () => {
  const res = await roleApi.queryList({ curPage: 1, pageSize: 100 })
  if (res.status) {
    roleOptions.value = res.data?.list || []
  }
}

async function query() {
  const res = await userManageApi.queryList({
    ...searchInfo,
    curPage: pageInfo.curPage,
    pageSize: pageInfo.pageSize
  })
  if (res.status) {
    tableData.value = (res.data?.list || []).map(item => ({
      ...item,
      roleNames: (item.roles || []).map(r => r.name).join('、') || '-'
    }))
    pageInfo.total = res.data?.total || 0
  } else {
    showTips('error', res.msg || '查询失败')
  }
}

const reset = () => {
  Object.keys(searchInfo).forEach(key => {
    searchInfo[key] = ''
  })
  pageInfo.curPage = 1
  query()
}

const openCreate = () => {
  formMode.value = 'create'
  Object.assign(form, {
    id: null,
    name: '',
    phone: '',
    email: '',
    accountAlias: '',
    password: '',
    status: 'active',
    roleIds: []
  })
  formVisible.value = true
}

const openEdit = row => {
  formMode.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.name || '',
    phone: row.phone || '',
    email: row.email || '',
    accountAlias: row.accountAlias || '',
    password: '',
    status: row.status || 'active',
    roleIds: [...(row.roleIds || [])]
  })
  formVisible.value = true
}

const submitForm = async () => {
  let res
  if (formMode.value === 'create') {
    res = await userManageApi.create({ ...form })
  } else {
    const { password, ...rest } = form
    res = await userManageApi.update(rest)
  }
  if (res.status) {
    showTips('success', '保存成功')
    formVisible.value = false
    query()
  } else {
    showTips('error', res.msg || '保存失败')
  }
}

const openAssign = row => {
  assignUserId.value = row.id
  assignRoleIds.value = [...(row.roleIds || [])]
  assignVisible.value = true
}

const submitAssign = async () => {
  const res = await userManageApi.assignRoles({
    userId: assignUserId.value,
    roleIds: assignRoleIds.value
  })
  if (res.status) {
    showTips('success', '分配成功')
    assignVisible.value = false
    query()
  } else {
    showTips('error', res.msg || '分配失败')
  }
}

const openResetPwd = row => {
  pwdUserId.value = row.id
  newPassword.value = ''
  pwdVisible.value = true
}

const submitResetPwd = async () => {
  if (!newPassword.value) {
    showTips('error', '请输入新密码')
    return
  }
  const res = await userManageApi.resetPassword({
    userId: pwdUserId.value,
    password: newPassword.value
  })
  if (res.status) {
    showTips('success', '重置成功')
    pwdVisible.value = false
  } else {
    showTips('error', res.msg || '重置失败')
  }
}

const handleDelete = async row => {
  try {
    await ElMessageBox.confirm(
      `是否确认删除用户「${row.name || row.phone}」？`,
      '提示',
      { type: 'warning' }
    )
  } catch (e) {
    showTips('info', '已取消删除操作')
    return
  }
  const res = await userManageApi.delete(row.id)
  if (res.status) {
    showTips('success', '删除成功')
    query()
  } else {
    showTips('error', res.msg || '删除失败')
  }
}

const pageTableOperate = [
  {
    label: '编辑',
    type: 'warning',
    action: openEdit,
    show: () => perm.hasPermission('system:user:update')
  },
  {
    label: '分配角色',
    type: 'primary',
    action: openAssign,
    show: () => perm.hasPermission('system:user:assign')
  },
  {
    label: '重置密码',
    type: 'info',
    action: openResetPwd,
    show: () => perm.hasPermission('system:user:update')
  },
  {
    label: '删除',
    type: 'danger',
    action: handleDelete,
    show: () => perm.hasPermission('system:user:delete')
  }
]

const tableOptions = reactive({
  tableData,
  tableFields,
  tableName: '用户列表',
  showIndex: false,
  showSelection: false,
  pageTableOperate,
  tableOperateWidth: '280'
})

onMounted(async () => {
  await loadRoles()
  query()
})
</script>
