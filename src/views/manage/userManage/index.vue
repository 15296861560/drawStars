<template>
  <div class="manage-page">
    <!-- 星夜页头（PageHero 通用组件） -->
    <page-hero title="用户管理" desc="平台账号、角色与权限的统一管理入口">
      <template #side>
        <span class="page-hero__pill">
          <el-icon :size="14"><User /></el-icon>
          共 {{ pageInfo.total }} 位用户
        </span>
        <el-button
          v-permission="'system:user:create'"
          class="page-hero__btn"
          :icon="Plus"
          @click="openCreate"
          >{{ $t('btn.create') }}</el-button
        >
      </template>
    </page-hero>

    <!-- 筛选栏 -->
    <filter-bar @search="applyFilter" @reset="reset">
      <el-input
        v-model="searchInfo.keyword"
        class="filter-bar__keyword"
        :prefix-icon="Search"
        placeholder="搜索姓名 / 手机 / 邮箱"
        clearable
        @keyup.enter="applyFilter"
        @clear="applyFilter"
      />
      <el-segmented
        v-model="statusSegment"
        :options="statusSegments"
        @change="onStatusChange"
      />
      <el-select
        v-model="searchInfo.roleId"
        class="filter-bar__role"
        placeholder="全部角色"
        clearable
        filterable
        @change="applyFilter"
      >
        <el-option
          v-for="r in roleOptions"
          :key="r.id"
          :label="r.name"
          :value="r.id"
        />
      </el-select>
    </filter-bar>

    <!-- 用户列表 -->
    <base-table
      class="user-table"
      :options="tableOptions"
      :page="pageInfo"
      :border="false"
      :stripe="false"
      max-height="700"
    >
      <template #table>
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="cell-user">
              <div
                class="cell-user__avatar"
                :class="{ 'is-off': row.status === 'deactivated' }"
              >
                {{ avatarChar(row) }}
              </div>
              <div class="cell-user__meta">
                <span class="cell-user__name">{{ row.name || '—' }}</span>
                <span class="cell-user__alias">{{
                  row.accountAlias ? `@${row.accountAlias}` : '—'
                }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="140">
          <template #default="{ row }">
            <span class="cell-mono">{{ row.phone || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="email"
          label="邮箱"
          min-width="180"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="cell-dim">{{ row.email || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="96">
          <template #default="{ row }">
            <span
              class="cell-status"
              :class="row.status === 'active' ? 'is-on' : 'is-off'"
            >
              {{ row.status === 'active' ? '正常' : '停用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="等级" width="80" align="center">
          <template #default="{ row }">
            <span class="cell-level">Lv.{{ row.level }}</span>
          </template>
        </el-table-column>
        <el-table-column label="角色" min-width="220">
          <template #default="{ row }">
            <div v-if="roleTagsOf(row).length" class="cell-roles">
              <span
                v-for="(name, idx) in roleTagsOf(row).slice(0, 3)"
                :key="idx"
                class="cell-roles__chip"
                >{{ name }}</span
              >
              <el-tooltip
                v-if="roleTagsOf(row).length > 3"
                placement="top"
                effect="dark"
              >
                <span class="cell-roles__chip cell-roles__more"
                  >+{{ roleTagsOf(row).length - 3 }}</span
                >
                <template #content>
                  <div v-for="(name, idx) in roleTagsOf(row)" :key="idx">
                    {{ name }}
                  </div>
                </template>
              </el-tooltip>
            </div>
            <span v-else class="cell-dim">未分配</span>
          </template>
        </el-table-column>
      </template>
    </base-table>

    <el-dialog
      v-model="formVisible"
      class="user-dialog"
      :title="formMode === 'create' ? '新增用户' : '编辑用户'"
      width="520px"
      destroy-on-close
    >
      <el-form :model="form" label-width="88px">
        <el-form-item label="姓名">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="账号别名">
          <el-input
            v-model="form.accountAlias"
            placeholder="登录账号别名（可选）"
          />
        </el-form-item>
        <el-form-item v-if="formMode === 'create'" label="密码">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入初始密码"
            autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="active">正常</el-radio>
            <el-radio value="deactivated">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="form.roleIds"
            multiple
            clearable
            class="w-full"
            placeholder="选择角色（可多选）"
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
      class="user-dialog"
      title="分配角色"
      width="420px"
      destroy-on-close
    >
      <p class="dialog-context">
        正在为
        <strong>{{ assignUserName }}</strong>
        分配角色，保存后将全量覆盖其现有角色。
      </p>
      <el-select
        v-model="assignRoleIds"
        multiple
        clearable
        class="w-full"
        placeholder="选择角色（可多选）"
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
      class="user-dialog"
      title="重置密码"
      width="400px"
      destroy-on-close
    >
      <p class="dialog-context">
        将为 <strong>{{ pwdUserName }}</strong> 设置新的登录密码。
      </p>
      <el-input
        v-model="newPassword"
        type="password"
        show-password
        placeholder="请输入新密码"
        autocomplete="new-password"
      />
      <p class="dialog-tip">重置成功后，请通知该用户使用新密码重新登录。</p>
      <template #footer>
        <el-button @click="pwdVisible = false">取消</el-button>
        <el-button type="primary" @click="submitResetPwd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, defineAsyncComponent } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import userManageApi from '@/assets/js/api/userManageController/userManageApi.js'
import roleApi from '@/assets/js/api/roleController/roleApi.js'
import { showTips } from '@/utils/message/showTips.js'
import { invalidateUserSelectCache } from '@/composables/useUserSelectOptions'
import { permissionStore } from '@/stores/permission'
import i18n from '@/lang/index.js'

const $t = i18n.global.t
const perm = permissionStore()

const BaseTable = defineAsyncComponent(
  () => import('@/components/base/form/BaseTable.vue')
)
const FilterBar = defineAsyncComponent(
  () => import('@/components/base/FilterBar/index.vue')
)
const PageHero = defineAsyncComponent(
  () => import('@/components/base/PageHero/index.vue')
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
const assignUserName = ref('')
const assignRoleIds = ref([])

const pwdVisible = ref(false)
const pwdUserId = ref(null)
const pwdUserName = ref('')
const newPassword = ref('')

/* 状态筛选（分段控制器，all 映射为空串以查询全部） */
const statusSegment = ref('all')
const statusSegments = [
  { label: '全部', value: 'all' },
  { label: '正常', value: 'active' },
  { label: '停用', value: 'deactivated' }
]
const onStatusChange = val => {
  searchInfo.status = val === 'all' ? '' : val
  applyFilter()
}

const applyFilter = () => {
  pageInfo.curPage = 1
  query()
}

/* 单元格辅助 */
const avatarChar = row => {
  const source = String(row.name || row.accountAlias || row.phone || '').trim()
  return source ? source.charAt(0).toUpperCase() : '·'
}
const roleTagsOf = row => (row.roles || []).map(r => r.name).filter(Boolean)

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
    tableData.value = res.data?.list || []
    pageInfo.total = res.data?.total || 0
  } else {
    showTips('error', res.msg || '查询失败')
  }
}

const reset = () => {
  searchInfo.keyword = ''
  searchInfo.status = ''
  searchInfo.roleId = ''
  statusSegment.value = 'all'
  applyFilter()
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
    const { password: _password, ...rest } = form
    res = await userManageApi.update(rest)
  }
  if (res.status) {
    showTips('success', '保存成功')
    formVisible.value = false
    invalidateUserSelectCache()
    query()
  } else {
    showTips('error', res.msg || '保存失败')
  }
}

const openAssign = row => {
  assignUserId.value = row.id
  assignUserName.value = row.name || row.accountAlias || row.phone || '该用户'
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
  pwdUserName.value = row.name || row.accountAlias || row.phone || '该用户'
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
    invalidateUserSelectCache()
    query()
  } else {
    showTips('error', res.msg || '删除失败')
  }
}

const pageTableOperate = [
  {
    label: '编辑',
    type: 'primary',
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
    type: 'primary',
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
  showIndex: false,
  showSelection: false,
  pageTableOperate,
  operateFixed: 'right'
})

onMounted(async () => {
  await loadRoles()
  query()
})
</script>

<style scoped lang="less">
/* 页面骨架与表格白卡样式统一由 .manage-page 全局类（g.less）接管；
   星夜页头样式统一由 PageHero 通用组件携带，本文件仅保留页面局部定制 */

/* ===== 筛选栏字段宽度 ===== */
.filter-bar__keyword {
  width: 280px;
}

.filter-bar__role {
  width: 180px;
}

/* ===== 单元格 ===== */
.cell-user {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  &__avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    font-size: 14px;
    font-weight: 600;
    color: @ds-primary;
    background: @ds-primary-light;
    border-radius: 50%;

    &.is-off {
      color: @color-text-placeholder;
      background: @color-gray-scale-4;
    }
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__name {
    font-weight: 500;
    color: @color-text-normal;
  }

  &__alias {
    font-size: @ds-font-xs;
    color: @color-text-secondary;
  }
}

.cell-mono {
  font-variant-numeric: tabular-nums;
}

.cell-dim {
  color: @color-text-placeholder;
}

.cell-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  &.is-on {
    color: @ds-color-success;

    &::before {
      background: @ds-color-success;
      box-shadow: 0 0 0 3px fade(@ds-color-success, 15%);
    }
  }

  &.is-off {
    color: @ds-color-not-started;

    &::before {
      background: @ds-color-not-started;
      box-shadow: 0 0 0 3px fade(@ds-color-not-started, 15%);
    }
  }
}

.cell-level {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: @ds-font-xs;
  font-weight: 600;
  line-height: 18px;
  color: @ds-primary;
  background: @ds-primary-light;
  border-radius: @ds-radius-sm;
}

.cell-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  &__chip {
    padding: 2px 8px;
    font-size: @ds-font-xs;
    line-height: 18px;
    color: @color-text-secondary;
    background: @color-gray-scale-4;
    border-radius: @ds-radius-sm;
  }

  &__more {
    color: @ds-primary;
    background: @ds-primary-light;
  }
}

/* ===== 对话框插槽内容 ===== */
.dialog-context {
  margin: 0 0 14px;
  font-size: @ds-font-sm;
  line-height: 1.7;
  color: @color-text-secondary;

  strong {
    font-weight: 600;
    color: @color-text-normal;
  }
}

.dialog-tip {
  margin: 10px 0 0;
  font-size: @ds-font-xs;
  color: @color-text-placeholder;
}
</style>

<style lang="less">
/* el-dialog 传送至 body，标题等 chrome 需要非 scoped 全局样式配合唯一 class 命中 */
.user-dialog {
  border-radius: @ds-radius-lg;

  .el-dialog__header {
    padding-bottom: 12px;
    margin-right: 0;
  }

  .el-dialog__title {
    font-size: 15px;
    font-weight: 600;
    color: @color-text-normal;
  }
}
</style>
