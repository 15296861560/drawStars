<template>
  <div v-loading="loading" class="workflow-designer">
    <!-- 顶部工具栏 -->
    <div class="designer-toolbar">
      <div class="toolbar-left">
        <el-button :icon="Back" @click="goBack">返回</el-button>
        <el-input
          v-model="form.name"
          class="name-input"
          placeholder="请输入流程名称"
          maxlength="50"
        />
        <el-tag
          v-if="workflow"
          :type="statusTagType(workflow.status)"
          effect="light"
        >
          {{ WORKFLOW_STATUS_LABEL[workflow.status] || workflow.status }}
        </el-tag>
        <el-tag v-if="workflow?.currentVersion" type="info" effect="plain">
          v{{ workflow.currentVersion }}
        </el-tag>
      </div>
      <div class="toolbar-right">
        <el-button
          :icon="RefreshLeft"
          :disabled="!canUndo"
          title="撤销"
          @click="undo"
        />
        <el-button
          :icon="RefreshRight"
          :disabled="!canRedo"
          title="重做"
          @click="redo"
        />
        <div class="zoom-group">
          <el-button
            :icon="ZoomOut"
            :disabled="zoom <= MIN_ZOOM"
            @click="zoomOut"
          />
          <span class="zoom-text">{{ Math.round(zoom * 100) }}%</span>
          <el-button
            :icon="ZoomIn"
            :disabled="zoom >= MAX_ZOOM"
            @click="zoomIn"
          />
        </div>
        <el-button
          v-permission="'system:workflow:execute'"
          :loading="testing"
          @click="onTest"
        >
          测试运行
        </el-button>
        <el-button
          v-permission="'system:workflow:publish'"
          :disabled="!canPublish"
          @click="onPublish"
        >
          提交发布
        </el-button>
        <el-button
          v-permission="'system:workflow:design'"
          type="primary"
          :loading="saving"
          @click="onSave"
        >
          保存
        </el-button>
      </div>
    </div>

    <!-- 主体：左侧节点面板 / 画布 / 右侧配置面板 -->
    <div class="designer-body">
      <!-- 左侧节点面板 -->
      <div class="node-panel">
        <div class="panel-title">节点面板</div>
        <div
          v-for="item in NODE_TYPES"
          :key="item.type"
          class="node-item"
          draggable="true"
          @dragstart="onDragStart(item.type, $event)"
          @click="addNode(item.type)"
        >
          <span class="node-dot" :style="{ background: item.color }" />
          <div class="node-item-text">
            <div class="node-item-name">{{ item.label }}</div>
            <div class="node-item-desc">{{ item.desc }}</div>
          </div>
        </div>
        <div class="panel-tip">拖拽或点击节点添加到画布</div>
        <div class="panel-tip">
          快捷键：Delete 删除 / Ctrl+D 复制 / Ctrl+S 保存
        </div>
      </div>

      <!-- 画布 -->
      <div
        ref="canvasWrapRef"
        class="canvas-wrap"
        @dragover.prevent
        @drop="onDrop"
        @click="onCanvasClick"
      >
        <div
          ref="canvasRef"
          class="canvas"
          :style="{
            width: `${canvasSize.w}px`,
            height: `${canvasSize.h}px`,
            transform: `scale(${zoom})`,
            transformOrigin: '0 0'
          }"
        >
          <!-- 连线层 -->
          <svg class="edge-layer" :width="canvasSize.w" :height="canvasSize.h">
            <defs>
              <marker
                id="workflow-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <path d="M 0 0 L 8 4 L 0 8 Z" fill="#b1b5ba" />
              </marker>
            </defs>
            <g v-for="edge in graph.edges" :key="edge.id">
              <path
                class="edge-hit"
                :d="edgePath(edge)"
                @click.stop="onEdgeClick(edge)"
                @dblclick.stop="onEdgeLabel(edge)"
              />
              <path class="edge-line" :d="edgePath(edge)" />
              <text
                v-if="edge.label"
                class="edge-label"
                :x="edgeLabelPos(edge).x"
                :y="edgeLabelPos(edge).y"
              >
                {{ edge.label }}
              </text>
            </g>
            <!-- 连线预览 -->
            <path
              v-if="linking && linkPos"
              class="edge-preview"
              :d="previewPath"
            />
          </svg>

          <!-- 节点 -->
          <div
            v-for="node in graph.nodes"
            :key="node.id"
            class="graph-node"
            :class="{
              selected: node.id === selectedNodeId,
              'link-target': !!linking && linking.source !== node.id
            }"
            :style="{
              left: `${node.position.x}px`,
              top: `${node.position.y}px`
            }"
            @mousedown.stop="onNodeMouseDown(node, $event)"
            @click.stop="onNodeClick(node)"
          >
            <div class="node-header">
              <span
                class="node-dot"
                :style="{ background: NODE_META[node.type].color }"
              />
              <span class="node-name" :title="node.name">{{ node.name }}</span>
              <span
                class="node-type-tag"
                :style="{ color: NODE_META[node.type].color }"
              >
                {{ NODE_META[node.type].label }}
              </span>
            </div>
            <div class="node-sub">{{ nodeSubtitle(node) }}</div>
            <!-- 连接点 -->
            <div
              class="node-port"
              title="点击后选择目标节点进行连线"
              @mousedown.stop
              @click.stop="startLink(node)"
            />
          </div>
        </div>

        <!-- 连线模式提示 -->
        <div v-if="linking" class="linking-tip">
          连线中：请点击目标节点完成连线，按 ESC 或点击空白取消
        </div>
        <div v-if="!graph.nodes.length" class="canvas-empty">
          画布为空，从左侧添加节点开始编排
        </div>
      </div>

      <!-- 右侧配置面板 -->
      <div class="config-panel">
        <template v-if="selectedNode">
          <div class="panel-title">
            {{ NODE_META[selectedNode.type].label }}配置
          </div>
          <el-form label-position="top" size="small" class="config-form">
            <el-form-item label="节点名称" required>
              <el-input
                v-model="selectedNode.name"
                maxlength="30"
                placeholder="请输入节点名称"
              />
            </el-form-item>

            <!-- 触发器 -->
            <template v-if="selectedNode.type === 'TRIGGER'">
              <el-form-item label="触发方式">
                <el-radio-group
                  v-model="cfg.triggerType"
                  @change="onTriggerTypeChange"
                >
                  <el-radio value="MANUAL">手动</el-radio>
                  <el-radio value="CRON">定时</el-radio>
                  <el-radio value="WEBHOOK">Webhook</el-radio>
                  <el-radio value="EVENT">事件</el-radio>
                </el-radio-group>
              </el-form-item>
              <template v-if="cfg.triggerType === 'CRON'">
                <el-form-item label="Cron 表达式">
                  <el-input v-model="cfg.cron" placeholder="如：0 0 9 * * ?" />
                </el-form-item>
                <el-form-item label="时区">
                  <el-input
                    v-model="cfg.timezone"
                    placeholder="如：Asia/Shanghai"
                  />
                </el-form-item>
              </template>
              <template v-else-if="cfg.triggerType === 'WEBHOOK'">
                <el-form-item label="Webhook 路径（全局唯一）">
                  <el-input
                    v-model="cfg.path"
                    placeholder="如：/webhook/order-created"
                  >
                    <template #prepend>/webhook</template>
                  </el-input>
                </el-form-item>
                <el-form-item label="请求方式">
                  <el-radio-group v-model="cfg.method">
                    <el-radio value="GET">GET</el-radio>
                    <el-radio value="POST">POST</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="认证方式">
                  <el-select v-model="cfg.authType" style="width: 100%">
                    <el-option label="无认证" value="NONE" />
                    <el-option label="Bearer Token" value="BEARER" />
                    <el-option label="HMAC 签名" value="HMAC" />
                  </el-select>
                </el-form-item>
                <el-form-item v-if="cfg.authType !== 'NONE'" label="认证密钥">
                  <el-input
                    v-model="cfg.authSecret"
                    placeholder="认证密钥"
                    show-password
                  />
                </el-form-item>
                <el-form-item label="限流（次/分钟）">
                  <el-input-number
                    v-model="cfg.rateLimitMax"
                    :min="1"
                    :max="10000"
                    style="width: 100%"
                  />
                </el-form-item>
              </template>
              <template v-else-if="cfg.triggerType === 'EVENT'">
                <el-form-item label="事件类型">
                  <el-input
                    v-model="cfg.eventType"
                    placeholder="如：order.created"
                  />
                </el-form-item>
                <el-form-item label="事件队列地址">
                  <el-input v-model="cfg.queueUrl" placeholder="队列 URL" />
                </el-form-item>
              </template>
              <div v-else class="config-tip">
                手动触发无需额外配置，可在流程列表手动执行
              </div>
            </template>

            <!-- AI 节点 -->
            <template v-else-if="selectedNode.type === 'AGENT'">
              <el-form-item label="模型" required>
                <el-select v-model="cfg.model" style="width: 100%">
                  <el-option label="GPT-4o" value="gpt-4o" />
                  <el-option label="GPT-3.5 Turbo" value="gpt-3.5-turbo" />
                  <el-option
                    label="OpenAI 兼容模型"
                    value="openai-compatible"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="系统提示词" required>
                <el-input
                  v-model="cfg.systemPrompt"
                  type="textarea"
                  :rows="4"
                  placeholder="支持变量插值，如 {{input.field}}"
                />
              </el-form-item>
              <el-form-item label="用户消息模板">
                <el-input
                  v-model="cfg.userPrompt"
                  type="textarea"
                  :rows="3"
                  placeholder="可选，如：请总结 {{trigger.body.content}}"
                />
              </el-form-item>
              <el-form-item label="输入 Schema（JSON）">
                <el-input
                  :model-value="jsonText('inputSchema')"
                  type="textarea"
                  :rows="3"
                  placeholder='{"field":"type"}'
                  @blur="(e: FocusEvent) => applyJson('inputSchema', e)"
                />
              </el-form-item>
              <el-form-item label="输出 Schema（JSON）">
                <el-input
                  :model-value="jsonText('outputSchema')"
                  type="textarea"
                  :rows="3"
                  placeholder='{"summary":"string"}'
                  @blur="(e: FocusEvent) => applyJson('outputSchema', e)"
                />
              </el-form-item>
              <el-form-item label="温度（0-2）">
                <el-slider
                  v-model="cfg.temperature"
                  :min="0"
                  :max="2"
                  :step="0.1"
                  show-input
                />
              </el-form-item>
              <el-form-item label="最大 Token">
                <el-input-number
                  v-model="cfg.maxTokens"
                  :min="1"
                  :max="100000"
                  style="width: 100%"
                />
              </el-form-item>
            </template>

            <!-- 工具节点 -->
            <template v-else-if="selectedNode.type === 'TOOL'">
              <el-form-item label="选择工具" required>
                <el-select
                  v-model="cfg.toolId"
                  filterable
                  placeholder="请选择工具"
                  style="width: 100%"
                >
                  <el-option
                    v-for="t in toolOptions"
                    :key="t.code"
                    :label="t.name"
                    :value="t.code"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="参数映射（JSON）" required>
                <el-input
                  :model-value="jsonText('paramMapping')"
                  type="textarea"
                  :rows="5"
                  placeholder='{"chat_id":"{{trigger.body.chat_id}}","content":"{{step1.output.summary}}"}'
                  @blur="(e: FocusEvent) => applyJson('paramMapping', e)"
                />
                <!-- v-pre：插值语法按字面展示，不做模板求值 -->
                <div v-pre class="config-tip">
                  支持插值：{{ trigger.body }}、{{ step1.output }}、{{
                    input.field
                  }}
                </div>
              </el-form-item>
            </template>

            <!-- 条件分支 -->
            <template v-else-if="selectedNode.type === 'CONDITION'">
              <el-form-item label="条件表达式" required>
                <el-input
                  v-model="cfg.expression"
                  placeholder="如：{{step1.output.score}} > 80"
                />
                <div class="config-tip">
                  操作符：== != &gt; &lt; &gt;= &lt;= contains in &amp;&amp; ||
                  isEmpty
                </div>
              </el-form-item>
              <el-form-item label="分支列表（2-10 个）">
                <div class="branch-list">
                  <div
                    v-for="(b, i) in conditionBranches"
                    :key="i"
                    class="branch-row"
                  >
                    <el-input v-model="b.name" placeholder="分支名称" />
                    <el-input
                      v-model="b.condition"
                      placeholder="分支条件表达式"
                    />
                    <el-button
                      :icon="Delete"
                      circle
                      size="small"
                      :disabled="conditionBranches.length <= 1"
                      @click="removeBranch(i)"
                    />
                  </div>
                  <el-button
                    :icon="Plus"
                    size="small"
                    :disabled="conditionBranches.length >= 10"
                    @click="addBranch"
                  >
                    添加分支
                  </el-button>
                </div>
                <div class="config-tip">
                  连线时可双击连线设置分支标签，与分支名称对应
                </div>
              </el-form-item>
            </template>

            <!-- 数据转换 -->
            <template v-else-if="selectedNode.type === 'TRANSFORM'">
              <el-form-item label="转换类型">
                <el-select v-model="cfg.transformType" style="width: 100%">
                  <el-option label="数据映射（MAPPING）" value="MAPPING" />
                  <el-option label="数据过滤（FILTER）" value="FILTER" />
                  <el-option label="数据转换（TRANSFORM）" value="TRANSFORM" />
                  <el-option label="脚本转换（SCRIPT）" value="SCRIPT" />
                </el-select>
              </el-form-item>
              <el-form-item label="映射规则（JSON）" required>
                <el-input
                  :model-value="jsonText('mapping')"
                  type="textarea"
                  :rows="5"
                  placeholder='{"user_name":"{{step1.output.name}}"}'
                  @blur="(e: FocusEvent) => applyJson('mapping', e)"
                />
                <div class="config-tip">
                  内置函数：length map filter sum join dateFormat default
                </div>
              </el-form-item>
            </template>

            <!-- 输出节点 -->
            <template v-else-if="selectedNode.type === 'OUTPUT'">
              <el-form-item label="输出通道" required>
                <el-select v-model="cfg.outputType" style="width: 100%">
                  <el-option label="飞书消息" value="FEISHU" />
                  <el-option label="邮件" value="EMAIL" />
                  <el-option label="钉钉" value="DINGTALK" />
                  <el-option label="回调通知" value="CALLBACK" />
                  <el-option label="站内通知" value="NOTIFY" />
                  <el-option label="数据存储" value="STORAGE" />
                </el-select>
              </el-form-item>
              <el-form-item label="输出模板">
                <el-input
                  v-model="cfg.template"
                  type="textarea"
                  :rows="4"
                  placeholder="支持变量插值，如：处理结果：{{step1.output.summary}}"
                />
              </el-form-item>
            </template>

            <!-- 通用错误处理 -->
            <template v-if="selectedNode.type !== 'TRIGGER'">
              <el-divider content-position="left">错误处理</el-divider>
              <el-form-item label="超时时间（秒）">
                <el-input-number
                  v-model="cfg.timeout"
                  :min="1"
                  :max="3600"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="重试次数">
                <el-input-number
                  v-model="cfg.retryTimes"
                  :min="0"
                  :max="10"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="重试间隔（秒）">
                <el-input-number
                  v-model="cfg.retryInterval"
                  :min="1"
                  :max="300"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="失败策略">
                <el-select v-model="cfg.failStrategy" style="width: 100%">
                  <el-option label="终止流程" value="ABORT" />
                  <el-option label="跳过继续" value="CONTINUE" />
                </el-select>
              </el-form-item>
            </template>
          </el-form>
          <div class="panel-actions">
            <el-button
              v-if="selectedNode.type !== 'TRIGGER'"
              type="danger"
              plain
              size="small"
              :icon="Delete"
              @click="deleteSelected"
            >
              删除节点
            </el-button>
            <el-button size="small" :icon="CopyDocument" @click="copySelected"
              >复制节点</el-button
            >
          </div>
        </template>

        <!-- 未选中节点：画布设置 -->
        <template v-else>
          <div class="panel-title">画布设置</div>
          <el-form label-position="top" size="small" class="config-form">
            <el-form-item label="流程描述">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="3"
                maxlength="200"
                placeholder="请输入流程描述"
              />
            </el-form-item>
            <el-form-item label="所属分类">
              <el-select
                v-model="form.categoryId"
                style="width: 100%"
                placeholder="请选择分类"
              >
                <el-option
                  v-for="c in categoryOptions"
                  :key="c.id"
                  :label="c.name"
                  :value="c.id"
                />
              </el-select>
            </el-form-item>
            <el-divider content-position="left">全局配置</el-divider>
            <el-form-item label="全局超时（秒）">
              <el-input-number
                v-model="globalConfig.timeout"
                :min="1"
                :max="86400"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="全局重试次数">
              <el-input-number
                v-model="globalConfig.retryTimes"
                :min="0"
                :max="10"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="全局重试间隔（秒）">
              <el-input-number
                v-model="globalConfig.retryInterval"
                :min="1"
                :max="300"
                style="width: 100%"
              />
            </el-form-item>
          </el-form>
          <div class="config-tip">点击画布中的节点可配置节点参数</div>
        </template>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="status-bar">
      <span>节点：{{ graph.nodes.length }}</span>
      <span>连线：{{ graph.edges.length }}</span>
      <span>最后保存：{{ lastSavedAt || '未保存' }}</span>
      <span v-if="workflow?.updatedAt"
        >更新时间：{{ formatTime(workflow.updatedAt) }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Back,
  CopyDocument,
  Delete,
  Plus,
  RefreshLeft,
  RefreshRight,
  ZoomIn,
  ZoomOut
} from '@element-plus/icons-vue'
import {
  getCategories,
  getTools,
  getWorkflowDetail,
  publishWorkflow,
  testWorkflow,
  updateWorkflow
} from '@/api/workflow'
import type {
  GraphData,
  GraphEdge,
  GraphNode,
  NodeType,
  Workflow,
  WorkflowCategory,
  WorkflowPayload,
  WorkflowTool
} from '@/types/workflow'

defineOptions({ name: 'WorkflowDesigner' })

const NODE_WIDTH = 180
const NODE_HEIGHT = 64
const MIN_ZOOM = 0.5
const MAX_ZOOM = 1.5
const HISTORY_LIMIT = 50

const NODE_TYPES: Array<{
  type: NodeType
  label: string
  desc: string
  color: string
}> = [
  {
    type: 'TRIGGER',
    label: '触发器',
    desc: '手动 / 定时 / Webhook / 事件',
    color: '#e6a23c'
  },
  {
    type: 'AGENT',
    label: 'AI 节点',
    desc: '调用大模型处理内容',
    color: '#7c3aed'
  },
  {
    type: 'TOOL',
    label: '工具节点',
    desc: '调用内置 / 自定义工具',
    color: '#409eff'
  },
  {
    type: 'CONDITION',
    label: '条件分支',
    desc: '按表达式分流执行',
    color: '#f56c6c'
  },
  {
    type: 'TRANSFORM',
    label: '数据转换',
    desc: '映射 / 过滤 / 转换数据',
    color: '#67c23a'
  },
  {
    type: 'OUTPUT',
    label: '输出节点',
    desc: '飞书 / 邮件 / 回调等',
    color: '#909399'
  }
]

const NODE_META: Record<NodeType, { label: string; color: string }> =
  NODE_TYPES.reduce(
    (map, item) => {
      map[item.type] = { label: item.label, color: item.color }
      return map
    },
    {} as Record<NodeType, { label: string; color: string }>
  )

const TRIGGER_LABEL: Record<string, string> = {
  MANUAL: '手动触发',
  CRON: '定时触发',
  WEBHOOK: 'Webhook 触发',
  EVENT: '事件触发'
}

const OUTPUT_LABEL: Record<string, string> = {
  FEISHU: '飞书消息',
  EMAIL: '邮件',
  DINGTALK: '钉钉',
  CALLBACK: '回调通知',
  NOTIFY: '站内通知',
  STORAGE: '数据存储'
}

const WORKFLOW_STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  PENDING: '待审核',
  PUBLISHED: '已发布',
  REJECTED: '已驳回',
  PAUSED: '已暂停',
  OFFLINE: '已下线'
}

const EXEC_STATUS_LABEL: Record<string, string> = {
  PENDING: '等待中',
  RUNNING: '运行中',
  SUCCEEDED: '成功',
  FAILED: '失败',
  TIMEOUT: '超时',
  CANCELLED: '已取消',
  PAUSED: '已暂停'
}

const route = useRoute()
const router = useRouter()
const routeId = computed(() => (route.params.id as string) || '')

const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const workflow = ref<Workflow | null>(null)
const lastSavedAt = ref('')

const form = reactive({
  name: '',
  description: '',
  categoryId: '' as number | string
})

const globalConfig = reactive({
  timeout: 300,
  retryTimes: 3,
  retryInterval: 5
})

const graph = reactive<GraphData>({ nodes: [], edges: [] })

const selectedNodeId = ref('')
const selectedNode = computed(
  () => graph.nodes.find(n => n.id === selectedNodeId.value) || null
)

/** 配置对象（宽松类型便于模板双向绑定） */
const cfg = computed<Record<string, any>>(() => {
  const node = selectedNode.value
  if (!node) return {}
  if (!node.config) node.config = {}
  return node.config
})

const linking = ref<{ source: string } | null>(null)
const linkPos = ref<{ x: number; y: number } | null>(null)

const zoom = ref(1)
const canvasWrapRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLElement | null>(null)

const toolOptions = ref<WorkflowTool[]>([])
const categoryOptions = ref<WorkflowCategory[]>([])

const history = reactive({ past: [] as GraphData[], future: [] as GraphData[] })
const canUndo = computed(() => history.past.length > 0)
const canRedo = computed(() => history.future.length > 0)

const canPublish = computed(() => {
  const s = workflow.value?.status
  return !s || s === 'DRAFT' || s === 'REJECTED'
})

const canvasSize = computed(() => {
  const maxX = graph.nodes.reduce(
    (m, n) => Math.max(m, n.position.x + NODE_WIDTH + 160),
    800
  )
  const maxY = graph.nodes.reduce(
    (m, n) => Math.max(m, n.position.y + NODE_HEIGHT + 120),
    600
  )
  return { w: maxX, h: maxY }
})

let nodeSeq = 0
let edgeSeq = 0
let dragState: {
  id: string
  startX: number
  startY: number
  origX: number
  origY: number
  moved: boolean
  before: GraphData
} | null = null
let dragNodeType: NodeType | null = null

// ==================== 初始化 ====================

function defaultConfig(type: NodeType): Record<string, unknown> {
  switch (type) {
    case 'TRIGGER':
      return { triggerType: 'MANUAL' }
    case 'AGENT':
      return {
        model: 'gpt-4o',
        systemPrompt: '',
        userPrompt: '',
        temperature: 0.7,
        maxTokens: 2048,
        timeout: 60,
        retryTimes: 3,
        retryInterval: 5,
        failStrategy: 'ABORT'
      }
    case 'TOOL':
      return {
        toolId: '',
        paramMapping: {},
        timeout: 30,
        retryTimes: 2,
        retryInterval: 5,
        failStrategy: 'ABORT'
      }
    case 'CONDITION':
      return { expression: '', branches: [{ name: '分支1', condition: '' }] }
    case 'TRANSFORM':
      return { transformType: 'MAPPING', mapping: {} }
    case 'OUTPUT':
      return { outputType: 'NOTIFY', template: '' }
  }
}

/** 补齐节点缺失的默认配置（嵌套对象需单独保证存在） */
function normalizeNode(node: GraphNode) {
  node.config = { ...defaultConfig(node.type), ...(node.config || {}) }
  if (node.type === 'TRIGGER' && node.config.triggerType === 'WEBHOOK') {
    if (
      typeof node.config.rateLimit !== 'object' ||
      node.config.rateLimit === null
    ) {
      node.config.rateLimit = { maxPerMinute: 100 }
    }
  }
}

function createTriggerNode(): GraphNode {
  return {
    id: `node_${Date.now().toString(36)}_1`,
    type: 'TRIGGER',
    name: '触发器',
    position: { x: 80, y: 60 },
    config: defaultConfig('TRIGGER')
  }
}

async function loadDetail() {
  if (!routeId.value) {
    ElMessage.warning('缺少流程标识，请从流程列表进入设计器')
    setTimeout(() => goBack(), 1200)
    return
  }
  loading.value = true
  try {
    const detail = await getWorkflowDetail(routeId.value)
    workflow.value = detail
    form.name = detail.name
    form.description = detail.description || ''
    form.categoryId = detail.categoryId
    const gc = (detail.globalConfig || {}) as Record<string, number>
    if (gc.timeout) globalConfig.timeout = gc.timeout
    if (gc.retryTimes !== undefined) globalConfig.retryTimes = gc.retryTimes
    if (gc.retryInterval !== undefined)
      globalConfig.retryInterval = gc.retryInterval
    if (
      detail.graphData &&
      Array.isArray(detail.graphData.nodes) &&
      detail.graphData.nodes.length
    ) {
      graph.nodes = detail.graphData.nodes.map(n => ({
        ...n,
        position: { ...n.position }
      }))
      graph.edges = (detail.graphData.edges || []).map(e => ({ ...e }))
    } else {
      graph.nodes = [createTriggerNode()]
      graph.edges = []
    }
    graph.nodes.forEach(normalizeNode)
    history.past = []
    history.future = []
    selectedNodeId.value = ''
    linking.value = null
  } catch (e: any) {
    ElMessage.error(e?.message || '加载流程详情失败')
  } finally {
    loading.value = false
  }
}

async function loadOptions() {
  try {
    const [toolRes, cateRes] = await Promise.all([
      getTools({ page: 1, pageSize: 200 }),
      getCategories()
    ])
    toolOptions.value = (toolRes.list || []).filter(t => t.enabled !== false)
    categoryOptions.value = (cateRes.list || []).filter(c => c.enabled)
  } catch {
    // 下拉数据加载失败不阻塞设计器
  }
}

// ==================== 历史栈 ====================

function snapshot(): GraphData {
  return JSON.parse(JSON.stringify({ nodes: graph.nodes, edges: graph.edges }))
}

function pushHistory() {
  history.past.push(snapshot())
  if (history.past.length > HISTORY_LIMIT) history.past.shift()
  history.future = []
}

function applySnapshot(s: GraphData) {
  graph.nodes = s.nodes.map(n => ({ ...n, position: { ...n.position } }))
  graph.edges = s.edges.map(e => ({ ...e }))
}

function undo() {
  if (!history.past.length) return
  history.future.push(snapshot())
  applySnapshot(history.past.pop()!)
  if (!graph.nodes.some(n => n.id === selectedNodeId.value))
    selectedNodeId.value = ''
}

function redo() {
  if (!history.future.length) return
  history.past.push(snapshot())
  applySnapshot(history.future.pop()!)
  if (!graph.nodes.some(n => n.id === selectedNodeId.value))
    selectedNodeId.value = ''
}

// ==================== 节点操作 ====================

function addNode(type: NodeType, pos?: { x: number; y: number }) {
  if (type === 'TRIGGER' && graph.nodes.some(n => n.type === 'TRIGGER')) {
    ElMessage.warning('触发器节点最多只能有一个')
    return
  }
  pushHistory()
  const index = graph.nodes.length + 1
  const node: GraphNode = {
    id: `node_${Date.now().toString(36)}_${++nodeSeq}`,
    type,
    name: `${NODE_META[type].label}${index}`,
    position: pos || {
      x: 80 + (index % 4) * 230,
      y: 60 + Math.floor(index / 4) * 130
    },
    config: defaultConfig(type)
  }
  graph.nodes.push(node)
  selectedNodeId.value = node.id
}

function onDragStart(type: NodeType, e: DragEvent) {
  dragNodeType = type
  e.dataTransfer?.setData('text/plain', type)
}

function onDrop(e: DragEvent) {
  const type =
    dragNodeType || (e.dataTransfer?.getData('text/plain') as NodeType)
  dragNodeType = null
  if (!type || !NODE_META[type]) return
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  const pos = {
    x: Math.max(
      0,
      Math.round((e.clientX - rect.left) / zoom.value - NODE_WIDTH / 2)
    ),
    y: Math.max(
      0,
      Math.round((e.clientY - rect.top) / zoom.value - NODE_HEIGHT / 2)
    )
  }
  addNode(type, pos)
}

function onNodeClick(node: GraphNode) {
  if (linking.value) {
    completeLink(node.id)
    return
  }
  selectedNodeId.value = node.id
}

function onNodeMouseDown(node: GraphNode, e: MouseEvent) {
  if (e.button !== 0) return
  selectedNodeId.value = node.id
  dragState = {
    id: node.id,
    startX: e.clientX,
    startY: e.clientY,
    origX: node.position.x,
    origY: node.position.y,
    moved: false,
    before: snapshot()
  }
}

function onWindowMouseMove(e: MouseEvent) {
  if (dragState) {
    const node = graph.nodes.find(n => n.id === dragState!.id)
    if (node) {
      node.position.x = Math.round(
        dragState!.origX + (e.clientX - dragState!.startX) / zoom.value
      )
      node.position.y = Math.round(
        dragState!.origY + (e.clientY - dragState!.startY) / zoom.value
      )
      dragState.moved = true
    }
  }
  if (linking.value && canvasRef.value) {
    const rect = canvasRef.value.getBoundingClientRect()
    linkPos.value = {
      x: (e.clientX - rect.left) / zoom.value,
      y: (e.clientY - rect.top) / zoom.value
    }
  }
}

function onWindowMouseUp() {
  if (dragState?.moved) {
    history.past.push(dragState.before)
    if (history.past.length > HISTORY_LIMIT) history.past.shift()
    history.future = []
  }
  dragState = null
}

function deleteSelected() {
  const node = selectedNode.value
  if (!node) return
  if (node.type === 'TRIGGER') {
    ElMessage.warning('触发器节点不可在此删除')
    return
  }
  pushHistory()
  graph.nodes = graph.nodes.filter(n => n.id !== node.id)
  graph.edges = graph.edges.filter(
    e => e.source !== node.id && e.target !== node.id
  )
  selectedNodeId.value = ''
}

function copySelected() {
  const node = selectedNode.value
  if (!node) return
  pushHistory()
  const copy: GraphNode = {
    id: `node_${Date.now().toString(36)}_${++nodeSeq}`,
    type: node.type,
    name: `${node.name}副本`,
    position: { x: node.position.x + 40, y: node.position.y + 48 },
    config: JSON.parse(JSON.stringify(node.config || {}))
  }
  graph.nodes.push(copy)
  selectedNodeId.value = copy.id
}

// ==================== 连线操作 ====================

function startLink(node: GraphNode) {
  linking.value = { source: node.id }
  const rect = canvasRef.value?.getBoundingClientRect()
  linkPos.value = {
    x: node.position.x + NODE_WIDTH / 2,
    y: node.position.y + NODE_HEIGHT + 20
  }
  void rect
}

function completeLink(targetId: string) {
  const link = linking.value
  linking.value = null
  if (!link) return
  if (link.source === targetId) return
  if (
    graph.edges.some(e => e.source === link.source && e.target === targetId)
  ) {
    ElMessage.warning('两个节点之间已存在连线')
    return
  }
  pushHistory()
  graph.edges.push({
    id: `edge_${Date.now().toString(36)}_${++edgeSeq}`,
    source: link.source,
    target: targetId
  })
}

async function onEdgeClick(edge: GraphEdge) {
  try {
    await ElMessageBox.confirm('确定删除该连线吗？', '删除连线', {
      type: 'warning'
    })
  } catch {
    return
  }
  pushHistory()
  graph.edges = graph.edges.filter(e => e.id !== edge.id)
}

async function onEdgeLabel(edge: GraphEdge) {
  let label = ''
  try {
    const r = await ElMessageBox.prompt(
      '输入连线标签（条件分支名）',
      '连线标签',
      {
        inputValue: edge.label || ''
      }
    )
    label = (r.value || '').trim()
  } catch {
    return
  }
  pushHistory()
  const target = graph.edges.find(e => e.id === edge.id)
  if (target) {
    if (label) target.label = label
    else delete target.label
  }
}

function edgeEnds(edge: GraphEdge) {
  const s = graph.nodes.find(n => n.id === edge.source)
  const t = graph.nodes.find(n => n.id === edge.target)
  if (!s || !t) return null
  return {
    sx: s.position.x + NODE_WIDTH / 2,
    sy: s.position.y + NODE_HEIGHT,
    tx: t.position.x + NODE_WIDTH / 2,
    ty: t.position.y
  }
}

function edgePath(edge: GraphEdge) {
  const ends = edgeEnds(edge)
  if (!ends) return ''
  const { sx, sy, tx, ty } = ends
  const c = Math.max(40, Math.abs(ty - sy) / 2)
  return `M ${sx} ${sy} C ${sx} ${sy + c}, ${tx} ${ty - c}, ${tx} ${ty}`
}

function edgeLabelPos(edge: GraphEdge) {
  const ends = edgeEnds(edge)
  if (!ends) return { x: 0, y: 0 }
  return { x: (ends.sx + ends.tx) / 2, y: (ends.sy + ends.ty) / 2 - 6 }
}

const previewPath = computed(() => {
  const link = linking.value
  if (!link || !linkPos.value) return ''
  const s = graph.nodes.find(n => n.id === link.source)
  if (!s) return ''
  const sx = s.position.x + NODE_WIDTH / 2
  const sy = s.position.y + NODE_HEIGHT
  const { x, y } = linkPos.value
  const c = Math.max(40, Math.abs(y - sy) / 2)
  return `M ${sx} ${sy} C ${sx} ${sy + c}, ${x} ${y - c}, ${x} ${y}`
})

function onCanvasClick() {
  selectedNodeId.value = ''
  linking.value = null
}

// ==================== 配置面板辅助 ====================

const conditionBranches = computed<Array<{ name: string; condition: string }>>(
  () => {
    const node = selectedNode.value
    if (!node || node.type !== 'CONDITION') return []
    if (!Array.isArray(node.config.branches)) {
      node.config.branches = [{ name: '分支1', condition: '' }]
    }
    return node.config.branches as Array<{ name: string; condition: string }>
  }
)

function addBranch() {
  const list = conditionBranches.value
  list.push({ name: `分支${list.length + 1}`, condition: '' })
}

function removeBranch(index: number) {
  conditionBranches.value.splice(index, 1)
}

function onTriggerTypeChange(value: string | number | boolean | undefined) {
  const node = selectedNode.value
  if (!node) return
  if (value === 'WEBHOOK') {
    if (
      typeof node.config.rateLimit !== 'object' ||
      node.config.rateLimit === null
    ) {
      node.config.rateLimit = { maxPerMinute: 100 }
    }
  }
}

function jsonText(key: string): string {
  const v = selectedNode.value?.config?.[key]
  if (v === undefined || v === null || v === '') return ''
  return typeof v === 'string' ? v : JSON.stringify(v, null, 2)
}

function applyJson(key: string, e: FocusEvent) {
  const node = selectedNode.value
  if (!node) return
  const raw = ((e.target as HTMLInputElement).value || '').trim()
  if (!raw) {
    node.config[key] = {}
    return
  }
  try {
    node.config[key] = JSON.parse(raw)
  } catch {
    ElMessage.error('JSON 格式不正确，请检查后重新输入')
  }
}

function nodeSubtitle(node: GraphNode): string {
  const c = (node.config || {}) as Record<string, any>
  switch (node.type) {
    case 'TRIGGER':
      return TRIGGER_LABEL[String(c.triggerType)] || '手动触发'
    case 'AGENT':
      return `模型：${c.model || 'gpt-4o'}`
    case 'TOOL':
      return c.toolId ? `工具：${c.toolId}` : '未选择工具'
    case 'CONDITION':
      return `分支 ${Array.isArray(c.branches) ? c.branches.length : 0} 个`
    case 'TRANSFORM':
      return String(c.transformType || 'MAPPING')
    case 'OUTPUT':
      return OUTPUT_LABEL[String(c.outputType)] || ''
    default:
      return ''
  }
}

// ==================== 缩放 ====================

function zoomIn() {
  zoom.value = Math.min(MAX_ZOOM, Math.round((zoom.value + 0.1) * 10) / 10)
}

function zoomOut() {
  zoom.value = Math.max(MIN_ZOOM, Math.round((zoom.value - 0.1) * 10) / 10)
}

// ==================== 保存 / 测试 / 发布 ====================

function validate(): boolean {
  if (!form.name.trim()) {
    ElMessage.warning('请填写流程名称')
    return false
  }
  const triggers = graph.nodes.filter(n => n.type === 'TRIGGER')
  if (triggers.length > 1) {
    ElMessage.warning('触发器节点最多只能有一个')
    return false
  }
  return true
}

async function onSave() {
  if (!routeId.value) return
  if (!validate()) return
  saving.value = true
  try {
    const payload: Partial<WorkflowPayload> = {
      name: form.name.trim(),
      description: form.description,
      categoryId: form.categoryId,
      graphData: JSON.parse(
        JSON.stringify({ nodes: graph.nodes, edges: graph.edges })
      ),
      globalConfig: { ...globalConfig }
    }
    const res = await updateWorkflow(routeId.value, payload)
    if (res?.status === false) {
      ElMessage.error(res.msg || '保存失败')
      return
    }
    if (res?.data) workflow.value = res.data
    lastSavedAt.value = new Date().toLocaleTimeString('zh-CN', {
      hour12: false
    })
    ElMessage.success('保存成功')
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function onTest() {
  if (!routeId.value) return
  if (!validate()) return
  testing.value = true
  try {
    const exec = await testWorkflow(routeId.value, {})
    const statusLabel = EXEC_STATUS_LABEL[exec.status] || exec.status
    const rows = [
      `<p><b>执行编号：</b>${exec.executionNo || '-'}</p>`,
      `<p><b>执行状态：</b>${statusLabel}</p>`,
      `<p><b>耗时：</b>${exec.durationMs ?? 0} ms</p>`
    ]
    if (exec.errorMessage)
      rows.push(
        `<p style="color:#f56c6c"><b>错误：</b>${exec.errorMessage}</p>`
      )
    ElMessageBox.alert(rows.join(''), '测试运行完成', {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '知道了'
    })
  } catch (e: any) {
    ElMessage.error(e?.message || '测试运行失败')
  } finally {
    testing.value = false
  }
}

async function onPublish() {
  if (!routeId.value) return
  try {
    await ElMessageBox.confirm(
      '提交后将进入发布审核流程，确定提交吗？',
      '提交发布',
      {
        type: 'warning'
      }
    )
  } catch {
    return
  }
  try {
    const res = await publishWorkflow(routeId.value)
    if (res?.status === false) {
      ElMessage.error(res.msg || '提交发布失败')
      return
    }
    if (res?.data) workflow.value = res.data
    else if (workflow.value) workflow.value.status = 'PENDING'
    ElMessage.success('已提交发布审核')
  } catch (e: any) {
    ElMessage.error(e?.message || '提交发布失败')
  }
}

// ==================== 其他 ====================

function goBack() {
  router.push('/home/manageHomePage/workflow/list')
}

function statusTagType(
  status: string
): 'success' | 'warning' | 'info' | 'danger' | 'primary' {
  const map: Record<
    string,
    'success' | 'warning' | 'info' | 'danger' | 'primary'
  > = {
    DRAFT: 'info',
    PENDING: 'warning',
    PUBLISHED: 'success',
    REJECTED: 'danger',
    PAUSED: 'warning',
    OFFLINE: 'info'
  }
  return map[status] || 'info'
}

function formatTime(value: string): string {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 19)
}

function onKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  if (e.key === 'Escape') {
    linking.value = null
    selectedNodeId.value = ''
    return
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedNode.value) {
      e.preventDefault()
      deleteSelected()
    }
    return
  }
  const key = e.key.toLowerCase()
  if ((e.ctrlKey || e.metaKey) && key === 'd') {
    if (selectedNode.value) {
      e.preventDefault()
      copySelected()
    }
    return
  }
  if ((e.ctrlKey || e.metaKey) && key === 's') {
    e.preventDefault()
    onSave()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('mousemove', onWindowMouseMove)
  window.addEventListener('mouseup', onWindowMouseUp)
  loadDetail()
  loadOptions()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('mousemove', onWindowMouseMove)
  window.removeEventListener('mouseup', onWindowMouseUp)
})
</script>

<style scoped lang="less">
.workflow-designer {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 254px);
  min-height: 520px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
}

// 顶部工具栏
.designer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;

    .name-input {
      width: 260px;
    }
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .zoom-group {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 0 4px;

      .zoom-text {
        width: 44px;
        text-align: center;
        font-size: 12px;
        color: #606266;
      }
    }
  }
}

// 主体
.designer-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

// 左侧节点面板
.node-panel {
  width: 220px;
  flex-shrink: 0;
  padding: 12px;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;

  .panel-title {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
  }

  .node-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    margin-bottom: 8px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    cursor: grab;
    transition: all 0.2s;
    background: #fafafa;

    &:hover {
      border-color: #409eff;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.12);
    }

    &:active {
      cursor: grabbing;
    }

    .node-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .node-item-text {
      min-width: 0;

      .node-item-name {
        font-size: 13px;
        font-weight: 500;
        color: #303133;
      }

      .node-item-desc {
        font-size: 11px;
        color: #909399;
        margin-top: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .panel-tip {
    font-size: 11px;
    color: #909399;
    line-height: 1.6;
    margin-top: 10px;
  }
}

// 画布
.canvas-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: auto;
  background-color: #f5f7fa;
  background-image: linear-gradient(
      rgba(144, 147, 153, 0.12) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(144, 147, 153, 0.12) 1px, transparent 1px);
  background-size: 20px 20px;

  .canvas {
    position: relative;
  }

  .edge-layer {
    position: absolute;
    left: 0;
    top: 0;
    pointer-events: none;
    overflow: visible;

    .edge-hit {
      fill: none;
      stroke: transparent;
      stroke-width: 12;
      pointer-events: stroke;
      cursor: pointer;
    }

    .edge-line {
      fill: none;
      stroke: #b1b5ba;
      stroke-width: 2;
      marker-end: url(#workflow-arrow);
      pointer-events: none;
    }

    .edge-hit:hover + .edge-line,
    .edge-hit:hover {
      stroke: #f56c6c;
    }

    .edge-label {
      font-size: 12px;
      fill: #606266;
      text-anchor: middle;
      paint-order: stroke;
      stroke: #f5f7fa;
      stroke-width: 4px;
      pointer-events: none;
    }

    .edge-preview {
      fill: none;
      stroke: #409eff;
      stroke-width: 2;
      stroke-dasharray: 6 4;
      pointer-events: none;
    }
  }

  .graph-node {
    position: absolute;
    width: 180px;
    height: 64px;
    background: #fff;
    border: 1.5px solid #dcdfe6;
    border-radius: 8px;
    padding: 10px 12px;
    cursor: move;
    user-select: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    transition:
      border-color 0.2s,
      box-shadow 0.2s;

    &:hover {
      border-color: #409eff;
    }

    &.selected {
      border-color: #409eff;
      box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.18);
    }

    &.link-target {
      border-color: #67c23a;
      box-shadow: 0 0 0 3px rgba(103, 194, 58, 0.2);
    }

    .node-header {
      display: flex;
      align-items: center;
      gap: 6px;

      .node-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .node-name {
        font-size: 13px;
        font-weight: 500;
        color: #303133;
        flex: 1;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .node-type-tag {
        font-size: 11px;
        flex-shrink: 0;
      }
    }

    .node-sub {
      font-size: 11px;
      color: #909399;
      margin-top: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .node-port {
      position: absolute;
      left: 50%;
      bottom: -7px;
      transform: translateX(-50%);
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid #409eff;
      cursor: crosshair;
      transition: transform 0.15s;

      &:hover {
        transform: translateX(-50%) scale(1.3);
        background: #409eff;
      }
    }
  }

  .linking-tip {
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(64, 158, 255, 0.92);
    color: #fff;
    font-size: 12px;
    padding: 6px 16px;
    border-radius: 4px;
    pointer-events: none;
    z-index: 5;
  }

  .canvas-empty {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #909399;
    font-size: 14px;
    pointer-events: none;
  }
}

// 右侧配置面板
.config-panel {
  width: 320px;
  flex-shrink: 0;
  border-left: 1px solid #e4e7ed;
  padding: 12px;
  overflow-y: auto;

  .panel-title {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
  }

  .config-form {
    :deep(.el-form-item) {
      margin-bottom: 14px;
    }

    :deep(.el-form-item__label) {
      font-size: 12px;
      padding-bottom: 4px;
    }
  }

  .config-tip {
    font-size: 11px;
    color: #909399;
    line-height: 1.6;
    margin-top: 4px;
  }

  .branch-list {
    width: 100%;

    .branch-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;

      :deep(.el-input) {
        flex: 1;
        min-width: 0;
      }
    }
  }

  .panel-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }

  :deep(.el-divider__text) {
    font-size: 12px;
    color: #606266;
  }
}

// 底部状态栏
.status-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 6px 16px;
  border-top: 1px solid #e4e7ed;
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
  background: #fafafa;
}
</style>
