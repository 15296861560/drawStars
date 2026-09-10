<template>
  <div class="workflow-tools">
    <div class="page-toolbar">
      <div class="page-title">
        <h3>工具管理</h3>
        <p>维护流程可用的内置与自定义工具，支持 OpenAPI 导入与连通性测试</p>
      </div>
      <div class="page-actions">
        <el-button
          v-permission="'system:workflow:operate'"
          type="primary"
          @click="openCreate"
          >新建工具</el-button
        >
        <el-button v-permission="'system:workflow:operate'" @click="openImport"
          >导入 OpenAPI</el-button
        >
        <el-button v-permission="'system:workflow:list'" @click="reload"
          >刷新</el-button
        >
      </div>
    </div>

    <el-card shadow="never" class="panel-card">
      <div class="filter-bar">
        <el-input
          v-model="query.keyword"
          clearable
          placeholder="名称/编码关键词"
          style="width: 200px"
          @keyup.enter="search"
          @clear="search"
        />
        <el-select
          v-model="query.category"
          clearable
          placeholder="分类"
          style="width: 130px"
        >
          <el-option
            v-for="c in toolCategoryOptions"
            :key="c.value"
            :label="c.label"
            :value="c.value"
          />
        </el-select>
        <el-select
          v-model="query.isBuiltin"
          clearable
          placeholder="来源"
          style="width: 120px"
        >
          <el-option label="内置" value="true" />
          <el-option label="自定义" value="false" />
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
        empty-text="暂无工具"
      >
        <el-table-column
          prop="name"
          label="名称"
          min-width="130"
          show-overflow-tooltip
        />
        <el-table-column label="描述" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="分类" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ categoryText(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="来源" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isBuiltin ? 'info' : 'success'" size="small">
              {{ row.isBuiltin ? '内置' : '自定义' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
              {{ row.enabled ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" fixed="right" align="center">
          <template #default="{ row }">
            <div class="row-ops">
              <el-button
                v-permission="'system:workflow:operate'"
                link
                type="primary"
                @click="openTest(row)"
                >测试</el-button
              >
              <template v-if="!row.isBuiltin">
                <el-button
                  v-permission="'system:workflow:operate'"
                  link
                  type="primary"
                  @click="openEdit(row)"
                  >编辑</el-button
                >
                <el-button
                  v-permission="'system:workflow:operate'"
                  link
                  type="danger"
                  @click="onDelete(row)"
                  >删除</el-button
                >
              </template>
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

    <base-dialog
      ref="dialogRef"
      :options="dialogOptions"
      :title="dialogTitle"
      @confirm="reload"
    />

    <!-- 导入 OpenAPI -->
    <el-dialog
      v-model="importVisible"
      title="导入 OpenAPI"
      width="640px"
      destroy-on-close
    >
      <el-input
        v-model="importText"
        type="textarea"
        :rows="10"
        placeholder="请粘贴 OpenAPI/Swagger JSON 定义"
      />
      <div class="dialog-tip">
        将解析 paths 中的接口自动创建自定义工具，编码重复的接口会被跳过
      </div>
      <template #footer>
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="onImport"
          >导入</el-button
        >
      </template>
    </el-dialog>

    <!-- 测试工具 -->
    <el-dialog
      v-model="testVisible"
      :title="`测试工具：${testRow?.name ?? ''}`"
      width="640px"
      destroy-on-close
    >
      <!-- 参数格式与示例：内置工具配专属示例，自定义工具按参数结构推导 -->
      <div v-if="testExample" class="param-doc">
        <div class="param-doc-header">
          <span class="param-doc-title">测试参数格式与示例</span>
          <el-button link type="primary" size="small" @click="fillExample"
            >填充示例</el-button
          >
        </div>
        <el-table :data="testParamRows" size="small" border>
          <el-table-column
            prop="name"
            label="字段"
            min-width="120"
            show-overflow-tooltip
          />
          <el-table-column prop="type" label="类型" width="90" align="center" />
          <el-table-column
            prop="example"
            label="示例值"
            min-width="200"
            show-overflow-tooltip
          />
        </el-table>
      </div>
      <el-input
        v-model="testParamsText"
        type="textarea"
        :rows="5"
        placeholder='测试参数，JSON 对象格式，如 {"city": "上海"}，留空表示无参'
      />
      <template v-if="testResult">
        <div class="result-summary">
          <el-tag :type="testResult.ok ? 'success' : 'danger'" size="small">
            {{ testResult.ok ? '测试通过' : '测试失败' }}
          </el-tag>
          <span class="result-meta">工具编码：{{ testResult.toolCode }}</span>
          <span v-if="testResult.mocked" class="result-meta">模拟数据</span>
          <span v-if="testResult.status != null" class="result-meta"
            >HTTP {{ testResult.status }}</span
          >
          <span v-if="testResult.durationMs != null" class="result-meta"
            >耗时 {{ formatDuration(testResult.durationMs) }}</span
          >
        </div>
        <div class="json-block">
          <div class="json-label">返回数据</div>
          <pre>{{ formatJson(testResult.data) || '暂无数据' }}</pre>
        </div>
        <div class="json-block">
          <div class="json-label">请求参数</div>
          <pre>{{ formatJson(testResult.params) || '暂无参数' }}</pre>
        </div>
      </template>
      <template #footer>
        <el-button @click="testVisible = false">关闭</el-button>
        <el-button type="primary" :loading="testLoading" @click="onTest"
          >执行测试</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ToolPayload, WorkflowTool } from '@/types/workflow'
import {
  createTool,
  deleteTool,
  getTools,
  importTool,
  testTool,
  updateTool
} from '@/api/workflow'
import type { ToolTestResult } from '@/api/workflow'
import {
  buildToolTestExample,
  builtinToolTestExamples,
  dialogFields,
  toolCategoryOptions,
  toolCategoryText
} from './config/toolsSchema'

const BaseDialog = defineAsyncComponent(
  () => import('@/components/base/form/BaseDialog.vue')
)

const loading = ref(false)
const list = ref<WorkflowTool[]>([])
const total = ref(0)

const query = reactive({
  keyword: '',
  category: '',
  isBuiltin: ''
})

const pager = reactive({
  curPage: 1,
  pageSize: 20
})

function categoryText(c: string) {
  return toolCategoryText[c] || c
}

function formatTime(s: string | null) {
  if (!s) return '-'
  return new Date(s).toLocaleString('zh-CN')
}

function formatDuration(ms: number | null | undefined) {
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

async function reload() {
  loading.value = true
  try {
    const res = await getTools({
      page: pager.curPage,
      pageSize: pager.pageSize,
      keyword: query.keyword.trim() || undefined,
      category: query.category || undefined,
      isBuiltin: query.isBuiltin || undefined
    })
    list.value = res.list
    total.value = res.total
  } catch (e: any) {
    ElMessage.error(e?.message || '加载工具列表失败')
  } finally {
    loading.value = false
  }
}

function search() {
  pager.curPage = 1
  reload()
}

function resetQuery() {
  query.keyword = ''
  query.category = ''
  query.isBuiltin = ''
  search()
}

function onSizeChange() {
  pager.curPage = 1
  reload()
}

// ==================== 新建/编辑弹窗 ====================

const dialogRef = ref()
const dialogTitle = ref('新建工具')

/** 解析 JSON 文本字段：空值返回 undefined，非法返回错误信息 */
function parseJsonObject(
  text: unknown
):
  | { ok: true; value: Record<string, unknown> | undefined }
  | { ok: false; msg: string } {
  if (text == null || String(text).trim() === '') {
    return { ok: true, value: undefined }
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(String(text))
  } catch {
    return { ok: false, msg: '不是合法的 JSON' }
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, msg: '必须是 JSON 对象' }
  }
  return { ok: true, value: parsed as Record<string, unknown> }
}

const confirmMethod = async (data: Record<string, any>) => {
  const payload: Record<string, any> = { ...data }
  const jsonFields = [
    { key: 'authConfig', label: '认证配置' },
    { key: 'paramSchema', label: '参数结构' },
    { key: 'outputSchema', label: '输出结构' }
  ]
  for (const field of jsonFields) {
    const res = parseJsonObject(payload[field.key])
    if (!res.ok) {
      return { status: false, msg: `${field.label}${res.msg}`, data: null }
    }
    payload[field.key] = res.value
  }
  let res
  if (payload.id) {
    const { id, ...rest } = payload
    res = await updateTool(id, rest as Partial<ToolPayload>)
  } else {
    delete payload.id
    res = await createTool(payload as ToolPayload)
  }
  if (res?.status === false) {
    return res
  }
  ElMessage.success('保存成功')
  return { status: true, msg: 'ok', data: res?.data ?? res }
}

const initMethod = async (params: { id: number }) => {
  const row = list.value.find(t => t.id === params.id)
  if (!row) {
    return { status: false, msg: '未找到工具', data: null }
  }
  // JSON 字段序列化为文本，供 textarea 回显
  return {
    status: true,
    msg: 'ok',
    data: [
      {
        ...row,
        authConfig: formatJson(row.authConfig),
        paramSchema: formatJson(row.paramSchema),
        outputSchema: formatJson(row.outputSchema)
      }
    ]
  }
}

const dialogOptions = reactive({
  fieldList: dialogFields,
  confirmMethod,
  confirmParams: {
    category: 'NOTIFICATION',
    method: 'GET',
    enabled: true
  },
  initMethod,
  initParams: {} as { id?: number },
  disabled: false,
  labelPosition: 'left'
})

function openCreate() {
  dialogTitle.value = '新建工具'
  dialogOptions.disabled = false
  dialogOptions.initParams = {}
  dialogRef.value?.opentDialog()
}

function openEdit(row: WorkflowTool) {
  dialogTitle.value = '编辑工具'
  dialogOptions.disabled = false
  dialogOptions.initParams = { id: row.id }
  dialogRef.value?.opentDialog()
}

async function onDelete(row: WorkflowTool) {
  try {
    await ElMessageBox.confirm(`确认删除工具「${row.name}」？`, '提示', {
      type: 'warning'
    })
  } catch {
    return
  }
  try {
    const res = await deleteTool(row.id)
    if (res?.status === false) {
      ElMessage.error(res.msg || '删除失败')
      return
    }
    ElMessage.success('删除成功')
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '删除失败')
  }
}

// ==================== 导入 OpenAPI ====================

const importVisible = ref(false)
const importText = ref('')
const importLoading = ref(false)

function openImport() {
  importText.value = ''
  importVisible.value = true
}

async function onImport() {
  const text = importText.value.trim()
  if (!text) {
    ElMessage.warning('请粘贴 OpenAPI JSON 定义')
    return
  }
  const spec = parseJsonObject(text)
  if (!spec.ok) {
    ElMessage.error(`OpenAPI 定义${spec.msg}`)
    return
  }
  if (!spec.value) {
    ElMessage.error('OpenAPI 定义不能为空')
    return
  }
  importLoading.value = true
  try {
    const res = await importTool({ spec: spec.value })
    if (res?.status === false) {
      ElMessage.error(res.msg || '导入失败')
      return
    }
    const result = res.data
    ElMessage.success(
      `导入成功：新增 ${result?.imported?.length ?? 0} 个，跳过 ${result?.skipped ?? 0} 个`
    )
    importVisible.value = false
    search()
  } catch (e: any) {
    ElMessage.error(e?.message || '导入失败')
  } finally {
    importLoading.value = false
  }
}

// ==================== 测试工具 ====================

const testVisible = ref(false)
const testLoading = ref(false)
const testRow = ref<WorkflowTool | null>(null)
const testParamsText = ref('')
const testResult = ref<ToolTestResult | null>(null)
const testExample = ref<Record<string, unknown> | null>(null)

/** 内置工具取专属示例，其余工具按参数结构推导示例 */
function resolveTestExample(row: WorkflowTool): Record<string, unknown> | null {
  return (
    builtinToolTestExamples[row.code] || buildToolTestExample(row.paramSchema)
  )
}

/** 参数格式表格行：字段 / 类型 / 示例值 */
const testParamRows = computed(() => {
  const schema = testRow.value?.paramSchema
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) return []
  const example = testExample.value || {}
  return Object.entries(schema as Record<string, unknown>).map(
    ([name, type]) => ({
      name,
      type: String(type),
      example: exampleCellText(example[name])
    })
  )
})

/** 单元格内展示示例值：字符串原样，空串显示 ''，对象/数组压缩为单行 JSON */
function exampleCellText(v: unknown): string {
  if (v == null) return '-'
  if (typeof v === 'string') return v === '' ? "''" : v
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

function openTest(row: WorkflowTool) {
  testRow.value = row
  testExample.value = resolveTestExample(row)
  // 默认预填示例，可直接执行测试
  testParamsText.value = testExample.value
    ? JSON.stringify(testExample.value, null, 2)
    : ''
  testResult.value = null
  testVisible.value = true
}

function fillExample() {
  if (!testExample.value) return
  testParamsText.value = JSON.stringify(testExample.value, null, 2)
}

async function onTest() {
  if (!testRow.value) return
  const text = testParamsText.value.trim()
  let params: Record<string, unknown> | undefined
  if (text) {
    const parsed = parseJsonObject(text)
    if (!parsed.ok) {
      ElMessage.error(`测试参数${parsed.msg}`)
      return
    }
    if (!parsed.value) {
      ElMessage.error('测试参数不能为空')
      return
    }
    params = parsed.value
  }
  testLoading.value = true
  try {
    testResult.value = await testTool(testRow.value.id, params)
    ElMessage.success('测试完成')
  } catch (e: any) {
    ElMessage.error(e?.message || '测试失败')
  } finally {
    testLoading.value = false
  }
}

onMounted(reload)
</script>

<style scoped lang="less">
.workflow-tools {
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

// ==================== 导入/测试弹窗 ====================

.dialog-tip {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

// 测试弹窗 - 参数格式与示例
.param-doc {
  margin-bottom: 12px;

  .param-doc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .param-doc-title {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.result-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.result-meta {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.json-block {
  margin-top: 12px;

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
</style>
