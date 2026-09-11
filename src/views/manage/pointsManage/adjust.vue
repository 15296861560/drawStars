<template>
  <div class="points-adjust">
    <div class="page-toolbar">
      <div class="page-title">
        <h3>新增积分</h3>
        <p>为指定用户发放积分，须填写原因，操作人自动记录</p>
      </div>
      <el-tag type="info" effect="plain" round
        >操作人：{{ operatorLabel }}</el-tag
      >
    </div>

    <el-row :gutter="16" class="content-row">
      <el-col :xs="24" :lg="10">
        <el-card shadow="never" class="panel-card form-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">发放表单</span>
            </div>
          </template>
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="96px"
            label-position="left"
            class="grant-form"
            @submit.prevent
          >
            <el-form-item label="目标用户" prop="userId">
              <el-select
                v-model="form.userId"
                filterable
                remote
                clearable
                reserve-keyword
                placeholder="输入姓名/手机/邮箱搜索"
                :remote-method="searchUsers"
                :loading="userLoading"
                class="w-full"
              >
                <el-option
                  v-for="item in userOptions"
                  :key="item.id"
                  :label="formatUserLabel(item)"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="新增积分" prop="points">
              <el-input-number
                v-model="form.points"
                :min="1"
                :max="999999"
                :step="1"
                controls-position="right"
                class="w-full"
              />
            </el-form-item>
            <el-form-item label="新增原因" prop="reason">
              <el-input
                v-model="form.reason"
                type="textarea"
                :rows="4"
                maxlength="200"
                show-word-limit
                placeholder="请说明新增积分的原因（必填）"
              />
            </el-form-item>
            <el-form-item class="form-actions">
              <el-button
                v-permission="'system:points:operate'"
                type="primary"
                :loading="submitting"
                @click="submit"
                >确认新增</el-button
              >
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="14">
        <el-card shadow="never" class="panel-card list-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">管理员调整记录</span>
              <el-button link type="primary" @click="loadLogs">刷新</el-button>
            </div>
          </template>
          <el-table
            :data="logs"
            v-loading="logLoading"
            border
            stripe
            size="small"
            class="log-table"
            empty-text="暂无调整记录"
          >
            <el-table-column label="时间" width="160">
              <template #default="{ row }">
                {{ formatTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="userId"
              label="用户ID"
              width="88"
              align="center"
            />
            <el-table-column
              prop="points"
              label="积分"
              width="88"
              align="right"
            >
              <template #default="{ row }">
                <span class="text-success">+{{ row.points }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="description"
              label="原因"
              min-width="140"
              show-overflow-tooltip
            />
            <el-table-column
              prop="operatorName"
              label="操作人"
              width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ row.operatorName || row.operatorId || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="balanceAfter"
              label="余额"
              width="88"
              align="right"
            />
          </el-table>
          <div class="pager">
            <el-pagination
              v-model:current-page="page.curPage"
              v-model:page-size="page.pageSize"
              :total="page.total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              background
              @size-change="loadLogs"
              @current-change="loadLogs"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { adminGrantPoints, getAdminTransactions } from '@/api/points'
import type { PointsTransaction } from '@/types/points'
import userManageApi from '@/assets/js/api/userManageController/userManageApi.js'
import { userInfoStore } from '@/stores/user-info'
import { showTips } from '@/utils/message/showTips.js'

const userStore = userInfoStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const userLoading = ref(false)
const logLoading = ref(false)
const userOptions = ref<any[]>([])
const logs = ref<PointsTransaction[]>([])

const form = reactive({
  userId: undefined as number | undefined,
  points: 100,
  reason: ''
})

const page = reactive({
  curPage: 1,
  pageSize: 10,
  total: 0
})

const operatorLabel = computed(() => {
  return (
    userStore.getUserName ||
    userStore.userInfo.accountAlias ||
    `ID:${userStore.getUserId}`
  )
})

const rules: FormRules = {
  userId: [{ required: true, message: '请选择目标用户', trigger: 'change' }],
  points: [{ required: true, message: '请输入积分', trigger: 'blur' }],
  reason: [
    { required: true, message: '请填写新增原因', trigger: 'blur' },
    { min: 2, message: '原因至少 2 个字', trigger: 'blur' }
  ]
}

function formatUserLabel(item: any) {
  const name = item.name || item.accountAlias || '-'
  const phone = item.phone ? ` / ${item.phone}` : ''
  return `${name}${phone} (ID:${item.id})`
}

function formatTime(time?: string) {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

async function searchUsers(keyword: string) {
  userLoading.value = true
  try {
    const res = await userManageApi.queryList({
      keyword: keyword || '',
      curPage: 1,
      pageSize: 20
    })
    if (res.status) {
      userOptions.value = res.data?.list || []
    }
  } finally {
    userLoading.value = false
  }
}

async function loadLogs() {
  logLoading.value = true
  try {
    const res = await getAdminTransactions({
      source: 'ADMIN_ADJUST',
      page: page.curPage,
      pageSize: page.pageSize
    })
    logs.value = res?.list || []
    page.total = res?.total || 0
  } finally {
    logLoading.value = false
  }
}

function resetForm() {
  // resetFields 会恢复初始值并清除校验；避免手动清空 userId 触发 change 规则
  if (formRef.value) {
    formRef.value.resetFields()
    return
  }
  form.userId = undefined
  form.points = 100
  form.reason = ''
}

async function submit() {
  const ok = await formRef.value?.validate().catch(() => false)
  if (!ok) return
  submitting.value = true
  try {
    const data = await adminGrantPoints({
      userId: Number(form.userId),
      points: Number(form.points),
      reason: form.reason.trim()
    })
    if (data?.success !== false) {
      showTips('success', data?.message || '新增积分成功')
      resetForm()
      // 再清一次，防止 select 异步 change 在 reset 后再次带出校验
      await nextTick()
      formRef.value?.clearValidate()
      page.curPage = 1
      await loadLogs()
    } else {
      showTips('error', data?.message || '操作失败')
    }
  } catch (e: any) {
    showTips('error', e?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  searchUsers('')
  loadLogs()
})
</script>

<style scoped lang="less">
.points-adjust {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  text-align: left;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1.4;
  }

  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
  }
}

.content-row {
  :deep(.el-col) {
    display: flex;

    @media (max-width: 1199px) {
      &:not(:last-child) {
        margin-bottom: 16px;
      }
    }
  }
}

.panel-card {
  width: 100%;
  border-radius: 8px;
  display: flex;
  flex-direction: column;

  :deep(.el-card__header) {
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  :deep(.el-card__body) {
    flex: 1;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.grant-form {
  max-width: 100%;

  :deep(.el-form-item__label) {
    justify-content: flex-start;
    text-align: left;
  }
}

.form-actions {
  margin-bottom: 0;

  :deep(.el-form-item__content) {
    gap: 8px;
  }
}

.w-full {
  width: 100%;
}

.form-card {
  :deep(.el-card__body) {
    padding: 20px 24px;
  }
}

.list-card {
  min-height: 100%;

  :deep(.el-card__body) {
    padding: 16px 20px 12px;
  }
}

.log-table {
  :deep(.el-table__inner-wrapper::before) {
    display: none;
  }

  :deep(.el-table__empty-block) {
    min-height: 280px;
  }
}

.text-success {
  color: var(--el-color-success);
  font-weight: 600;
}

.pager {
  margin-top: 12px;
  padding: 4px 0 0;
  display: flex;
  justify-content: flex-end;
  border-top: none;
}
</style>
