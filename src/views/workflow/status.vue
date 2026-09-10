<template>
  <div class="execution-status">
    <div class="page-toolbar">
      <div class="page-title">
        <h3>执行状态</h3>
        <p>查看我创建流程的执行记录，跟踪运行进度与节点日志</p>
      </div>
      <el-button :loading="loading" @click="reload">刷新</el-button>
    </div>

    <el-card shadow="never" class="panel-card">
      <div class="filter-bar">
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
        <el-button type="primary" @click="search">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </div>

      <el-table
        :data="list"
        v-loading="loading"
        border
        stripe
        size="small"
        empty-text="暂无执行记录"
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
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="触发方式" width="100" align="center">
          <template #default="{ row }">
            {{ triggerText(row.triggerType) }}
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
        <el-table-column label="操作" width="90" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)"
              >详情</el-button
            >
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

    <el-dialog v-model="detailVisible" title="执行详情" width="720px" top="6vh">
      <div v-loading="detailLoading" class="detail-body">
        <template v-if="detail">
          <el-descriptions :column="2" border size="small" class="detail-desc">
            <el-descriptions-item label="执行编号">{{
              detail.executionNo
            }}</el-descriptions-item>
            <el-descriptions-item label="流程名称">{{
              detail.workflow?.name || `#${detail.workflowId}`
            }}</el-descriptions-item>
            <el-descriptions-item label="执行版本">
              v{{ detail.workflowVersion }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusTagType(detail.status)" size="small">{{
                statusText(detail.status)
              }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="触发方式">{{
              triggerText(detail.triggerType)
            }}</el-descriptions-item>
            <el-descriptions-item label="耗时">{{
              formatDuration(detail.durationMs)
            }}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{
              formatTime(detail.startedAt)
            }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{
              formatTime(detail.finishedAt)
            }}</el-descriptions-item>
          </el-descriptions>

          <div v-if="detail.errorMessage" class="error-text">
            {{ detail.errorMessage }}
          </div>

          <div class="json-block">
            <div class="json-label">触发输入（triggerData）</div>
            <pre v-if="formatJson(detail.triggerData)">{{
              formatJson(detail.triggerData)
            }}</pre>
            <div v-else class="empty-text">暂无数据</div>
          </div>
          <div class="json-block">
            <div class="json-label">执行结果（result）</div>
            <pre v-if="formatJson(detail.result)">{{
              formatJson(detail.result)
            }}</pre>
            <div v-else class="empty-text">暂无数据</div>
          </div>

          <div class="section-title">节点执行日志</div>
          <div class="logs-list">
            <div v-for="log in stepLogs" :key="log.id" class="node-card">
              <div class="node-card-head">
                <span class="node-card-title">{{
                  log.nodeName || log.nodeId
                }}</span>
                <el-tag :type="stepTagType(log.status)" size="small">{{
                  stepText(log.status)
                }}</el-tag>
              </div>
              <div class="node-card-meta">
                <span>{{ log.nodeType }}</span>
                <span v-if="log.durationMs != null"
                  >耗时 {{ formatDuration(log.durationMs) }}</span
                >
                <span v-if="log.retryCount > 0"
                  >重试 {{ log.retryCount }} 次</span
                >
              </div>
              <div v-if="formatJson(log.inputData)" class="json-block">
                <div class="json-label">输入</div>
                <pre>{{ formatJson(log.inputData) }}</pre>
              </div>
              <div v-if="formatJson(log.outputData)" class="json-block">
                <div class="json-label">输出</div>
                <pre>{{ formatJson(log.outputData) }}</pre>
              </div>
              <div v-if="log.errorMessage" class="error-text">
                {{ log.errorMessage }}
              </div>
            </div>
            <el-empty
              v-if="!detailLoading && !stepLogs.length"
              description="暂无执行日志"
              :image-size="80"
            />
          </div>
        </template>
        <el-empty v-else-if="!detailLoading" description="执行记录不存在" />
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { ExecutionStepLog, WorkflowExecution } from '@/types/workflow'
import {
  getExecutionDetail,
  getExecutionLogs,
  getMyExecutions
} from '@/api/workflow'

const loading = ref(false)
const list = ref<WorkflowExecution[]>([])
const total = ref(0)

const query = reactive({
  status: '',
  triggerType: ''
})

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

// ==================== 状态映射 ====================

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

const STEP_TEXT: Record<string, string> = {
  PENDING: '待执行',
  RUNNING: '执行中',
  SUCCEEDED: '成功',
  FAILED: '失败',
  SKIPPED: '跳过'
}

const STEP_TAG: Record<string, string> = {
  PENDING: 'info',
  RUNNING: 'warning',
  SUCCEEDED: 'success',
  FAILED: 'danger',
  SKIPPED: 'info'
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

function stepText(s: string) {
  return STEP_TEXT[s] || s
}

function stepTagType(s: string) {
  return STEP_TAG[s] || 'info'
}

// ==================== 格式化 ====================

function formatTime(s: string | null) {
  if (!s) return '-'
  return new Date(s).toLocaleString('zh-CN')
}

function formatDuration(ms: number | null) {
  if (ms == null) return '-'
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}秒` : `${ms}毫秒`
}

function formatJson(v: unknown) {
  if (v == null) return ''
  if (typeof v === 'string') return v
  try {
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}

// ==================== 列表 ====================

async function reload() {
  loading.value = true
  try {
    const res = await getMyExecutions({
      page: pager.curPage,
      pageSize: pager.pageSize,
      status: query.status || undefined,
      triggerType: query.triggerType || undefined
    })
    list.value = res.list
    total.value = res.total
  } catch (e: any) {
    ElMessage.error(e?.message || '加载执行记录失败')
  } finally {
    loading.value = false
  }
}

function search() {
  pager.curPage = 1
  reload()
}

function resetQuery() {
  query.status = ''
  query.triggerType = ''
  search()
}

function onSizeChange() {
  pager.curPage = 1
  reload()
}

// ==================== 详情（只读） ====================

const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<WorkflowExecution | null>(null)
const stepLogs = ref<ExecutionStepLog[]>([])

async function openDetail(row: WorkflowExecution) {
  detailVisible.value = true
  detailLoading.value = true
  detail.value = null
  stepLogs.value = []
  try {
    const [d, l] = await Promise.all([
      getExecutionDetail(row.id),
      getExecutionLogs(row.id)
    ])
    detail.value = d
    stepLogs.value = l.list
  } catch (e: any) {
    ElMessage.error(e?.message || '加载执行详情失败')
  } finally {
    detailLoading.value = false
  }
}

onMounted(() => {
  reload()
})
</script>

<style scoped lang="less">
.execution-status {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  text-align: left;
  box-sizing: border-box;
}

.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
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

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

// ==================== 详情弹窗 ====================

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 120px;
  max-height: 68vh;
  overflow-y: auto;
  padding-right: 4px;
}

.detail-desc {
  :deep(.el-descriptions__label) {
    width: 90px;
  }
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.node-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 10px 12px;
}

.node-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.node-card-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.json-block {
  margin-top: 8px;

  .json-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
  }

  pre {
    margin: 0;
    padding: 8px 12px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
  }
}

.empty-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.error-text {
  color: var(--el-color-danger);
  font-size: 13px;
  margin-top: 4px;
  word-break: break-all;
}
</style>
