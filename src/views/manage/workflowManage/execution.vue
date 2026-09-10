<template>
  <div class="execution-detail">
    <div class="page-toolbar">
      <div class="page-title">
        <h3>执行详情</h3>
        <p v-if="detail">
          {{ detail.executionNo }} ·
          {{ detail.workflow?.name || `流程 #${detail.workflowId}` }}
        </p>
      </div>
      <div class="page-actions">
        <el-button @click="goBack">返回</el-button>
        <el-button v-permission="'system:workflow:list'" @click="refresh()"
          >刷新</el-button
        >
        <el-button
          v-if="detail?.status === 'RUNNING'"
          v-permission="'system:workflow:execute'"
          type="danger"
          :loading="cancelLoading"
          @click="onCancel"
          >取消执行</el-button
        >
        <el-button
          v-if="canRerun"
          v-permission="'system:workflow:execute'"
          type="warning"
          :loading="rerunLoading"
          @click="onRerun"
          >重新执行</el-button
        >
      </div>
    </div>

    <el-card shadow="never" class="panel-card" v-loading="loading">
      <template v-if="detail">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">执行编号</span>
            <span class="info-value">{{ detail.executionNo }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">流程名称</span>
            <span class="info-value">{{
              detail.workflow?.name || `#${detail.workflowId}`
            }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">执行版本</span>
            <span class="info-value">v{{ detail.workflowVersion }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">状态</span>
            <span class="info-value">
              <el-tag :type="statusTagType(detail.status)" size="small">
                <span class="status-cell">
                  {{ statusText(detail.status) }}
                  <Loading
                    v-if="detail.status === 'RUNNING'"
                    class="tag-loading"
                  />
                </span>
              </el-tag>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">触发方式</span>
            <span class="info-value">{{
              triggerText(detail.triggerType)
            }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">开始时间</span>
            <span class="info-value">{{ formatTime(detail.startedAt) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">结束时间</span>
            <span class="info-value">{{ formatTime(detail.finishedAt) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">耗时</span>
            <span class="info-value">{{
              formatDuration(detail.durationMs)
            }}</span>
          </div>
        </div>
      </template>
      <el-empty v-else-if="!loading" description="执行记录不存在" />
    </el-card>

    <div v-if="detail" class="detail-body">
      <el-card shadow="never" class="panel-card graph-card">
        <template #header><span>执行拓扑</span></template>
        <div class="graph-wrap">
          <svg
            v-if="stepLogs.length"
            :width="graphWidth"
            :height="graphHeight"
            class="flow-svg"
          >
            <defs>
              <marker
                id="flow-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6 Z" fill="#909399" />
              </marker>
            </defs>
            <g v-for="(log, i) in stepLogs" :key="log.id">
              <line
                v-if="i > 0"
                :x1="nodeCenterX"
                :y1="nodeTop(i - 1) + NODE_H"
                :x2="nodeCenterX"
                :y2="nodeTop(i) - 6"
                stroke="#909399"
                stroke-width="1.5"
                marker-end="url(#flow-arrow)"
              />
              <g class="flow-node" @click="locateNode(log.nodeId)">
                <rect
                  :x="NODE_X"
                  :y="nodeTop(i)"
                  :width="NODE_W"
                  :height="NODE_H"
                  rx="8"
                  class="node-rect"
                  :stroke="stepColor(log.status)"
                  :fill="stepFill(log.status)"
                  stroke-width="1.5"
                />
                <text
                  :x="nodeCenterX"
                  :y="nodeTop(i) + 23"
                  text-anchor="middle"
                  class="node-name"
                >
                  {{ log.nodeName || log.nodeId }}
                </text>
                <text
                  :x="nodeCenterX"
                  :y="nodeTop(i) + 42"
                  text-anchor="middle"
                  class="node-status"
                  :fill="stepColor(log.status)"
                >
                  {{ nodeStatusText(log) }}
                </text>
              </g>
            </g>
          </svg>
          <el-empty v-else description="暂无执行日志" :image-size="80" />
        </div>
      </el-card>

      <el-card shadow="never" class="panel-card logs-card">
        <template #header><span>节点执行日志</span></template>
        <div class="logs-scroll">
          <div
            v-for="log in stepLogs"
            :key="log.id"
            :ref="el => setNodeCardRef(el, log.nodeId)"
            class="node-card"
          >
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
            v-if="!stepLogs.length"
            description="暂无执行日志"
            :image-size="80"
          />
        </div>
      </el-card>
    </div>

    <el-card v-if="detail" shadow="never" class="panel-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="日志流" name="logs">
          <el-timeline v-if="stepLogs.length" class="log-timeline">
            <el-timeline-item
              v-for="log in stepLogs"
              :key="log.id"
              :timestamp="formatTime(log.startedAt || log.createdAt)"
              :type="stepTagType(log.status)"
              :color="stepColor(log.status)"
              :hollow="log.status !== 'SUCCEEDED'"
            >
              <span
                >节点「{{ log.nodeName || log.nodeId }}」{{
                  stepText(log.status)
                }}</span
              >
              <span v-if="log.durationMs != null" class="timeline-duration">
                （{{ formatDuration(log.durationMs) }}）</span
              >
              <div v-if="log.errorMessage" class="error-text">
                {{ log.errorMessage }}
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无日志流" :image-size="80" />
        </el-tab-pane>

        <el-tab-pane label="变量上下文" name="context">
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
        </el-tab-pane>

        <el-tab-pane label="错误详情" name="error">
          <template v-if="detail.errorMessage || errorSteps.length">
            <div v-if="detail.errorMessage" class="error-text">
              {{ detail.errorMessage }}
            </div>
            <div v-if="detail.errorNodeId" class="error-node">
              出错节点：{{ detail.errorNodeId }}
            </div>
            <div v-for="log in errorSteps" :key="log.id" class="error-step">
              <div class="error-step-title">
                节点「{{ log.nodeName || log.nodeId }}」
              </div>
              <div class="error-text">{{ log.errorMessage }}</div>
            </div>
          </template>
          <el-empty v-else description="暂无错误信息" :image-size="80" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ExecutionStepLog, WorkflowExecution } from '@/types/workflow'
import {
  cancelExecution,
  getExecutionDetail,
  getExecutionLogs,
  rerunExecution
} from '@/api/workflow'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const detail = ref<WorkflowExecution | null>(null)
const stepLogs = ref<ExecutionStepLog[]>([])
const activeTab = ref('logs')
const cancelLoading = ref(false)
const rerunLoading = ref(false)

const executionId = computed(() => {
  const id = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id
  const n = Number(id)
  return Number.isFinite(n) ? n : null
})

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

const STEP_COLOR: Record<string, string> = {
  PENDING: '#c0c4cc',
  RUNNING: '#e6a23c',
  SUCCEEDED: '#67c23a',
  FAILED: '#f56c6c',
  SKIPPED: '#c0c4cc'
}

const STEP_FILL: Record<string, string> = {
  PENDING: '#f4f4f5',
  RUNNING: '#fdf6ec',
  SUCCEEDED: '#f0f9eb',
  FAILED: '#fef0f0',
  SKIPPED: '#f4f4f5'
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

function stepColor(s: string) {
  return STEP_COLOR[s] || '#c0c4cc'
}

function stepFill(s: string) {
  return STEP_FILL[s] || '#f4f4f5'
}

function stepTagType(s: string) {
  return STEP_TAG[s] || 'info'
}

/** SVG 节点状态行：状态文本 + 耗时 */
function nodeStatusText(log: ExecutionStepLog) {
  const base = stepText(log.status)
  return log.durationMs != null
    ? `${base} · ${formatDuration(log.durationMs)}`
    : base
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

// ==================== 拓扑布局（按步骤日志纵向执行链） ====================

const NODE_W = 300
const NODE_H = 56
const NODE_GAP = 26
const NODE_X = 20

const graphWidth = NODE_X * 2 + NODE_W
const graphHeight = computed(
  () => stepLogs.value.length * (NODE_H + NODE_GAP) + 10
)
const nodeCenterX = NODE_X + NODE_W / 2

function nodeTop(i: number) {
  return i * (NODE_H + NODE_GAP) + 10
}

// ==================== 节点卡片定位 ====================

const nodeCards = new Map<string, HTMLElement>()

function setNodeCardRef(el: unknown, nodeId: string) {
  if (el) {
    nodeCards.set(nodeId, el as HTMLElement)
  } else {
    nodeCards.delete(nodeId)
  }
}

function locateNode(nodeId: string) {
  const el = nodeCards.get(nodeId)
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// ==================== 数据加载与轮询 ====================

const canRerun = computed(() =>
  detail.value
    ? ['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(detail.value.status)
    : false
)

const errorSteps = computed(() =>
  stepLogs.value.filter(l => l.status === 'FAILED' && l.errorMessage)
)

let pollTimer: number | undefined

async function refresh(silent = false) {
  if (executionId.value == null) return
  if (!silent) loading.value = true
  try {
    const [d, l] = await Promise.all([
      getExecutionDetail(executionId.value),
      getExecutionLogs(executionId.value)
    ])
    detail.value = d
    stepLogs.value = l.list
  } catch (e: any) {
    detail.value = null
    stepLogs.value = []
    ElMessage.error(e?.message || '加载执行详情失败')
  } finally {
    loading.value = false
    syncPolling()
  }
}

function syncPolling() {
  if (detail.value?.status === 'RUNNING') {
    startPolling()
  } else {
    stopPolling()
  }
}

function startPolling() {
  if (pollTimer != null) return
  pollTimer = window.setInterval(() => refresh(true), 5000)
}

function stopPolling() {
  if (pollTimer != null) {
    clearInterval(pollTimer)
    pollTimer = undefined
  }
}

watch(executionId, () => {
  stopPolling()
  refresh()
})

// ==================== 操作 ====================

function goBack() {
  router.back()
}

async function onCancel() {
  if (!detail.value || cancelLoading.value) return
  try {
    await ElMessageBox.confirm(
      `确认取消执行「${detail.value.executionNo}」？`,
      '提示',
      { type: 'warning' }
    )
  } catch {
    return
  }
  cancelLoading.value = true
  try {
    const res = await cancelExecution(detail.value.id)
    if (res?.status === false) {
      ElMessage.error(res.msg || '取消失败')
      return
    }
    ElMessage.success('已取消')
    await refresh()
  } catch (e: any) {
    ElMessage.error(e?.message || '取消失败')
  } finally {
    cancelLoading.value = false
  }
}

async function onRerun() {
  if (!detail.value || rerunLoading.value) return
  try {
    await ElMessageBox.confirm(
      `确认基于「${detail.value.executionNo}」的输入重新执行？`,
      '提示',
      { type: 'warning' }
    )
  } catch {
    return
  }
  rerunLoading.value = true
  try {
    const execution = await rerunExecution(detail.value.id)
    ElMessage.success('已重新执行')
    router.replace(`/home/manageHomePage/workflow/execution/${execution.id}`)
  } catch (e: any) {
    ElMessage.error(e?.message || '重新执行失败')
  } finally {
    rerunLoading.value = false
  }
}

onMounted(() => refresh())
onUnmounted(stopPolling)
</script>

<style scoped lang="less">
.execution-detail {
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

// ==================== 基本信息 ====================

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.info-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.info-value {
  font-size: 13px;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ==================== 左右两栏 ====================

.detail-body {
  display: flex;
  gap: 16px;
  align-items: stretch;

  .graph-card {
    flex: 0 0 55%;
    max-width: 55%;
  }

  .logs-card {
    flex: 1;
    min-width: 0;
  }
}

.graph-wrap {
  overflow: auto;
  max-height: 520px;
}

.flow-svg {
  display: block;
}

.flow-node {
  cursor: pointer;
}

.node-rect {
  transition: stroke-width 0.2s;
}

.flow-node:hover .node-rect {
  stroke-width: 2.5;
}

.node-name {
  font-size: 13px;
  fill: #303133;
}

.node-status {
  font-size: 12px;
}

.logs-scroll {
  max-height: 520px;
  overflow-y: auto;
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

// ==================== JSON / 错误 ====================

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

.error-node {
  font-size: 13px;
  color: var(--el-text-color-primary);
  margin-top: 8px;
}

.error-step {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px dashed var(--el-border-color-lighter);

  .error-step-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

// ==================== 日志流时间线 ====================

.log-timeline {
  padding-left: 4px;
}

.timeline-duration {
  color: var(--el-text-color-secondary);
  font-size: 13px;
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
