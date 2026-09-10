<template>
  <div class="execution-history">
    <div class="page-toolbar">
      <div class="page-title">
        <h3>执行历史</h3>
        <p>查看流程执行记录，支持取消运行中任务与失败重跑</p>
      </div>
      <div class="page-actions">
        <el-button v-permission="'system:workflow:list'" @click="reload"
          >刷新</el-button
        >
      </div>
    </div>

    <el-card shadow="never" class="panel-card">
      <div class="filter-bar">
        <el-select
          v-model="query.workflowId"
          clearable
          filterable
          placeholder="所属流程"
          style="width: 180px"
        >
          <el-option
            v-for="w in workflows"
            :key="w.id"
            :label="w.name"
            :value="w.id"
          />
        </el-select>
        <el-select
          v-model="query.status"
          clearable
          placeholder="状态"
          style="width: 130px"
        >
          <el-option
            v-for="s in statusOptions"
            :key="s.value"
            :label="s.label"
            :value="s.value"
          />
        </el-select>
        <el-select
          v-model="query.triggerType"
          clearable
          placeholder="触发方式"
          style="width: 130px"
        >
          <el-option
            v-for="t in triggerOptions"
            :key="t.value"
            :label="t.label"
            :value="t.value"
          />
        </el-select>
        <el-date-picker
          v-model="timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          style="width: 360px"
        />
        <el-button type="primary" @click="search">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </div>

      <el-table
        :data="list"
        v-loading="loading"
        border
        stripe
        size="small"
        empty-text="暂无执行历史"
      >
        <el-table-column
          prop="executionNo"
          label="执行编号"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column label="流程名称" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.workflow?.name || `#${row.workflowId}` }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              <span class="status-cell">
                {{ statusText(row.status) }}
                <Loading v-if="row.status === 'RUNNING'" class="tag-loading" />
              </span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="触发方式" width="100" align="center">
          <template #default="{ row }">
            {{ triggerText(row.triggerType) }}
          </template>
        </el-table-column>
        <el-table-column label="触发人/来源" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ triggerSource(row) }}
          </template>
        </el-table-column>
        <el-table-column label="开始时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.startedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="耗时" width="90" align="right">
          <template #default="{ row }">
            {{ formatDuration(row.durationMs) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <div class="row-ops">
              <el-button link type="primary" @click="goDetail(row)"
                >详情</el-button
              >
              <el-button
                v-if="row.status === 'RUNNING'"
                v-permission="'system:workflow:execute'"
                link
                type="danger"
                :loading="cancelLockId === row.id"
                @click="onCancel(row)"
                >取消</el-button
              >
              <el-button
                v-if="canRerun(row)"
                v-permission="'system:workflow:execute'"
                link
                type="warning"
                :loading="rerunLockId === row.id"
                @click="onRerun(row)"
                >重新执行</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          v-model:current-page="pager.curPage"
          v-model:page-size="pager.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
          @current-change="reload"
          @size-change="onSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Workflow, WorkflowExecution } from '@/types/workflow'
import {
  cancelExecution,
  getExecutions,
  getWorkflows,
  rerunExecution
} from '@/api/workflow'

const router = useRouter()

const loading = ref(false)
const list = ref<WorkflowExecution[]>([])
const total = ref(0)
const workflows = ref<Workflow[]>([])
const cancelLockId = ref<number | null>(null)
const rerunLockId = ref<number | null>(null)

const query = reactive({
  workflowId: undefined as number | undefined,
  status: '',
  triggerType: ''
})
const timeRange = ref<[Date, Date] | null>(null)

const pager = reactive({
  curPage: 1,
  pageSize: 20
})

const statusOptions = [
  { value: 'PENDING', label: '待执行' },
  { value: 'RUNNING', label: '运行中' },
  { value: 'SUCCEEDED', label: '执行成功' },
  { value: 'FAILED', label: '执行失败' },
  { value: 'TIMEOUT', label: '执行超时' },
  { value: 'CANCELLED', label: '已取消' },
  { value: 'PAUSED', label: '已暂停' }
]

const triggerOptions = [
  { value: 'CRON', label: '定时触发' },
  { value: 'WEBHOOK', label: 'Webhook' },
  { value: 'MANUAL', label: '手动触发' },
  { value: 'EVENT', label: '事件触发' }
]

const STATUS_TEXT: Record<string, string> = {
  PENDING: '待执行',
  RUNNING: '运行中',
  SUCCEEDED: '执行成功',
  FAILED: '执行失败',
  TIMEOUT: '执行超时',
  CANCELLED: '已取消',
  PAUSED: '已暂停'
}

const STATUS_TAG: Record<string, string> = {
  PENDING: 'info',
  RUNNING: 'warning',
  SUCCEEDED: 'success',
  FAILED: 'danger',
  TIMEOUT: 'danger',
  CANCELLED: 'info',
  PAUSED: 'warning'
}

const TRIGGER_TEXT: Record<string, string> = {
  CRON: '定时触发',
  WEBHOOK: 'Webhook',
  MANUAL: '手动触发',
  EVENT: '事件触发'
}

/** 无独立触发人字段时，按触发方式展示来源 */
const TRIGGER_SOURCE: Record<string, string> = {
  CRON: '定时任务',
  WEBHOOK: '外部回调',
  MANUAL: '手动触发',
  EVENT: '事件触发'
}

function statusText(s: string) {
  return STATUS_TEXT[s] || s
}

function statusTagType(s: string) {
  return STATUS_TAG[s] || 'info'
}

function triggerText(t: string) {
  return TRIGGER_TEXT[t] || t
}

/** 优先从 triggerData 中提取触发人，取不到则展示触发来源 */
function triggerSource(row: WorkflowExecution) {
  const data = row.triggerData
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    const user = d.user ?? d.username ?? d.operator ?? d.userId
    if (user != null && user !== '') {
      return String(user)
    }
  }
  return TRIGGER_SOURCE[row.triggerType] || row.triggerType
}

function formatTime(s: string | null) {
  if (!s) return '-'
  return new Date(s).toLocaleString('zh-CN')
}

function formatDuration(ms: number | null) {
  if (ms == null) return '-'
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}秒` : `${ms}毫秒`
}

function canRerun(row: WorkflowExecution) {
  return ['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(row.status)
}

async function loadWorkflows() {
  try {
    const res = await getWorkflows({ page: 1, pageSize: 100 })
    workflows.value = res.list
  } catch (e: any) {
    ElMessage.error(e?.message || '加载流程列表失败')
  }
}

async function reload() {
  loading.value = true
  try {
    const [start, end] = timeRange.value || []
    const res = await getExecutions({
      page: pager.curPage,
      pageSize: pager.pageSize,
      workflowId: query.workflowId ?? undefined,
      status: query.status || undefined,
      triggerType: query.triggerType || undefined,
      startTime: start ? new Date(start).toISOString() : undefined,
      endTime: end ? new Date(end).toISOString() : undefined
    })
    list.value = res.list
    total.value = res.total
  } catch (e: any) {
    ElMessage.error(e?.message || '加载执行历史失败')
  } finally {
    loading.value = false
  }
}

function search() {
  pager.curPage = 1
  reload()
}

function resetQuery() {
  query.workflowId = undefined
  query.status = ''
  query.triggerType = ''
  timeRange.value = null
  search()
}

function onSizeChange() {
  pager.curPage = 1
  reload()
}

function goDetail(row: WorkflowExecution) {
  router.push(`/home/manageHomePage/workflow/execution/${row.id}`)
}

async function onCancel(row: WorkflowExecution) {
  if (cancelLockId.value) return
  try {
    await ElMessageBox.confirm(`确认取消执行「${row.executionNo}」？`, '提示', {
      type: 'warning'
    })
  } catch {
    return
  }
  cancelLockId.value = row.id
  try {
    const res = await cancelExecution(row.id)
    if (res?.status === false) {
      ElMessage.error(res.msg || '取消失败')
      return
    }
    ElMessage.success('已取消')
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '取消失败')
  } finally {
    cancelLockId.value = null
  }
}

async function onRerun(row: WorkflowExecution) {
  if (rerunLockId.value) return
  try {
    await ElMessageBox.confirm(
      `确认基于「${row.executionNo}」的输入重新执行？`,
      '提示',
      { type: 'warning' }
    )
  } catch {
    return
  }
  rerunLockId.value = row.id
  try {
    const execution = await rerunExecution(row.id)
    ElMessage.success('已重新执行')
    router.push(`/home/manageHomePage/workflow/execution/${execution.id}`)
  } catch (e: any) {
    ElMessage.error(e?.message || '重新执行失败')
  } finally {
    rerunLockId.value = null
  }
}

onMounted(() => {
  loadWorkflows()
  reload()
})
</script>

<style scoped lang="less">
.execution-history {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.page-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.panel-card {
  border-radius: 8px;

  :deep(.el-card__body) {
    padding: 16px 20px;
  }
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.row-ops {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 4px;
  white-space: nowrap;

  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.status-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tag-loading {
  animation: rotating 1.5s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
