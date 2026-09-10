<template>
  <div class="workflow-templates">
    <div class="page-toolbar">
      <div class="page-title">
        <h3>模板市场</h3>
        <p>浏览并一键安装流程模板，或将已有流程发布为模板</p>
      </div>
      <div class="page-actions">
        <el-button @click="reload">刷新</el-button>
      </div>
    </div>

    <el-card shadow="never" class="panel-card">
      <div class="filter-bar">
        <el-input
          v-model="query.keyword"
          clearable
          placeholder="模板名称 / 描述"
          style="width: 220px"
          @keyup.enter="search"
          @clear="search"
        />
        <el-select
          v-model="query.category"
          clearable
          placeholder="分类"
          style="width: 160px"
        >
          <el-option
            v-for="c in categories"
            :key="c.code"
            :label="c.name"
            :value="c.code"
          />
        </el-select>
        <div class="official-switch">
          <span>仅官方</span>
          <el-switch v-model="query.isOfficial" @change="search" />
        </div>
        <el-button type="primary" @click="search">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
        <el-button
          v-permission="'system:workflow:operate'"
          class="publish-btn"
          type="primary"
          plain
          @click="openPublish"
          >发布模板</el-button
        >
      </div>

      <div v-loading="loading" class="tpl-area">
        <el-row v-if="templates.length" :gutter="16" class="tpl-grid">
          <el-col
            v-for="t in templates"
            :key="t.id"
            :xs="24"
            :sm="12"
            :span="6"
          >
            <div class="tpl-card">
              <div class="tpl-head">
                <div class="tpl-icon">{{ (t.name || '').slice(0, 1) }}</div>
                <div class="tpl-tags">
                  <el-tag v-if="t.isOfficial" type="warning" size="small"
                    >官方</el-tag
                  >
                  <el-tag size="small" effect="plain">{{
                    categoryText(t.category)
                  }}</el-tag>
                </div>
              </div>
              <div class="tpl-name" :title="t.name">{{ t.name }}</div>
              <div class="tpl-desc">{{ t.description || '暂无描述' }}</div>
              <div class="tpl-stats">
                <span class="tpl-installs">{{ t.installCount }} 次安装</span>
                <el-rate
                  :model-value="t.rating"
                  disabled
                  size="small"
                  class="tpl-rate"
                />
              </div>
              <div class="tpl-ops">
                <el-button
                  v-permission="'system:workflow:create'"
                  type="primary"
                  size="small"
                  @click="openInstall(t)"
                  >安装</el-button
                >
                <el-button size="small" @click="openDetail(t)">详情</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-empty v-else-if="!loading" description="暂无模板" />
      </div>

      <el-pagination
        v-model:current-page="pager.curPage"
        v-model:page-size="pager.pageSize"
        :total="total"
        :page-sizes="[8, 12, 20]"
        layout="total, sizes, prev, pager, next"
        background
        class="pager"
        @current-change="reload"
        @size-change="onSizeChange"
      />
    </el-card>

    <!-- 安装模板 -->
    <el-dialog
      v-model="installVisible"
      title="安装模板"
      width="480px"
      destroy-on-close
    >
      <el-form label-width="88px">
        <el-form-item label="流程名称" required>
          <el-input v-model="installForm.name" maxlength="64" />
        </el-form-item>
        <el-form-item label="流程分类" required>
          <el-select
            v-model="installForm.categoryId"
            placeholder="选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="c in categories"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="installVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitInstall">
          安装并去编排
        </el-button>
      </template>
    </el-dialog>

    <!-- 模板详情 -->
    <el-dialog
      v-model="detailVisible"
      title="模板详情"
      width="720px"
      destroy-on-close
    >
      <div v-loading="detailLoading" class="detail-body">
        <template v-if="detail">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="名称" :span="2">{{
              detail.name
            }}</el-descriptions-item>
            <el-descriptions-item label="分类">{{
              categoryText(detail.category)
            }}</el-descriptions-item>
            <el-descriptions-item label="来源">
              <el-tag v-if="detail.isOfficial" type="warning" size="small"
                >官方</el-tag
              >
              <el-tag v-else type="info" size="small">用户共享</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="安装次数">{{
              detail.installCount
            }}</el-descriptions-item>
            <el-descriptions-item label="评分">
              <el-rate :model-value="detail.rating" disabled size="small" />
            </el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">{{
              detail.description || '暂无描述'
            }}</el-descriptions-item>
            <el-descriptions-item label="更新时间" :span="2">{{
              detail.updatedAt
            }}</el-descriptions-item>
          </el-descriptions>

          <div class="detail-section">
            <div class="detail-section-title">
              画布预览（{{ detailNodes.length }} 个节点 /
              {{ detailEdges.length }} 条连线）
            </div>
            <div class="node-list">
              <div v-for="n in detailNodes" :key="n.id" class="node-item">
                <el-tag size="small" effect="plain">{{
                  nodeTypeText(n.type)
                }}</el-tag>
                <span class="node-name">{{ n.name }}</span>
              </div>
              <el-empty
                v-if="!detailNodes.length"
                description="暂无节点"
                :image-size="60"
              />
            </div>
          </div>

          <div class="detail-section">
            <div class="detail-section-title">全局配置</div>
            <pre class="config-pre">{{ globalConfigText }}</pre>
          </div>
        </template>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 发布模板 -->
    <el-dialog
      v-model="publishVisible"
      title="发布模板"
      width="520px"
      destroy-on-close
    >
      <el-form label-width="88px">
        <el-form-item label="选择流程" required>
          <el-select
            v-model="publishForm.workflowId"
            filterable
            placeholder="选择要发布为模板的流程"
            style="width: 100%"
            :loading="workflowLoading"
          >
            <el-option
              v-for="w in workflows"
              :key="w.id"
              :label="w.name"
              :value="w.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="模板名称" required>
          <el-input v-model="publishForm.name" maxlength="64" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="publishForm.description"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="模板分类" required>
          <el-select
            v-model="publishForm.category"
            placeholder="选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="c in categories"
              :key="c.code"
              :label="c.name"
              :value="c.code"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="publishVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitPublish"
          >发布</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getTemplates,
  getTemplateDetail,
  installTemplate,
  createTemplate,
  getWorkflows,
  getWorkflowDetail,
  getCategories
} from '@/api/workflow'
import type {
  WorkflowTemplate,
  WorkflowCategory,
  Workflow,
  GraphData,
  TemplatePayload
} from '@/types/workflow'

const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const detailLoading = ref(false)
const workflowLoading = ref(false)

const templates = ref<WorkflowTemplate[]>([])
const categories = ref<WorkflowCategory[]>([])
const workflows = ref<Workflow[]>([])
const total = ref(0)

const query = reactive({
  keyword: '',
  category: '',
  isOfficial: false
})
const pager = reactive({
  curPage: 1,
  pageSize: 12
})

// ==================== 安装 ====================
const installVisible = ref(false)
const installTarget = ref<WorkflowTemplate | null>(null)
const installForm = reactive({
  name: '',
  categoryId: '' as number | string
})

// ==================== 详情 ====================
const detailVisible = ref(false)
const detail = ref<WorkflowTemplate | null>(null)

// ==================== 发布 ====================
const publishVisible = ref(false)
const publishForm = reactive({
  workflowId: null as number | null,
  name: '',
  description: '',
  category: ''
})

const fallbackCategoryText: Record<string, string> = {
  office: '办公协同',
  data: '数据处理',
  service: '客户服务'
}

const nodeTypeTextMap: Record<string, string> = {
  TRIGGER: '触发',
  AGENT: '智能体',
  TOOL: '工具',
  CONDITION: '条件',
  TRANSFORM: '转换',
  OUTPUT: '输出'
}

function categoryText(code: string) {
  const hit = categories.value.find(c => c.code === code)
  return hit?.name || fallbackCategoryText[code] || code
}

function nodeTypeText(type: string) {
  return nodeTypeTextMap[type] || type
}

const detailNodes = computed(
  () => (detail.value?.graphData as GraphData | undefined)?.nodes || []
)

const detailEdges = computed(
  () => (detail.value?.graphData as GraphData | undefined)?.edges || []
)

const globalConfigText = computed(() =>
  detail.value?.globalConfig
    ? JSON.stringify(detail.value.globalConfig, null, 2)
    : '暂无配置'
)

// ==================== 列表 ====================
async function reload() {
  loading.value = true
  try {
    const res = await getTemplates({
      page: pager.curPage,
      pageSize: pager.pageSize,
      keyword: query.keyword.trim() || undefined,
      category: query.category || undefined,
      isOfficial: query.isOfficial ? 'true' : undefined
    })
    templates.value = res.list
    total.value = res.total
  } catch (e: any) {
    ElMessage.error(e?.message || '加载模板列表失败')
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
  query.isOfficial = false
  search()
}

function onSizeChange() {
  pager.curPage = 1
  reload()
}

async function loadCategories() {
  try {
    const res = await getCategories({ enabled: 'true' })
    categories.value = res.list
  } catch (e: any) {
    ElMessage.error(e?.message || '加载分类失败')
  }
}

// ==================== 安装 ====================
function openInstall(t: WorkflowTemplate) {
  installTarget.value = t
  installForm.name = `${t.name}(来自模板)`
  installForm.categoryId = categories.value[0]?.id ?? ''
  installVisible.value = true
}

async function submitInstall() {
  if (submitting.value || !installTarget.value) return
  if (!installForm.name.trim()) {
    ElMessage.warning('请输入流程名称')
    return
  }
  if (installForm.categoryId === '' || installForm.categoryId == null) {
    ElMessage.warning('请选择流程分类')
    return
  }
  submitting.value = true
  try {
    const res = await installTemplate(installTarget.value.id, {
      categoryId: installForm.categoryId,
      name: installForm.name.trim()
    })
    if (res?.status === false) {
      ElMessage.error(res?.msg || '安装失败')
      return
    }
    ElMessage.success('安装成功')
    installVisible.value = false
    const newId = res?.data?.id
    if (newId != null) {
      router.push(`/home/manageHomePage/workflow/designer/${newId}`)
    } else {
      search()
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '安装失败')
  } finally {
    submitting.value = false
  }
}

// ==================== 详情 ====================
async function openDetail(t: WorkflowTemplate) {
  detailVisible.value = true
  detailLoading.value = true
  detail.value = null
  try {
    detail.value = await getTemplateDetail(t.id)
  } catch (e: any) {
    ElMessage.error(e?.message || '加载模板详情失败')
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

// ==================== 发布 ====================
async function loadWorkflows() {
  workflowLoading.value = true
  try {
    const res = await getWorkflows({ page: 1, pageSize: 100 })
    workflows.value = res.list
  } catch (e: any) {
    ElMessage.error(e?.message || '加载流程列表失败')
  } finally {
    workflowLoading.value = false
  }
}

function openPublish() {
  publishForm.workflowId = null
  publishForm.name = ''
  publishForm.description = ''
  publishForm.category = categories.value[0]?.code ?? ''
  publishVisible.value = true
  loadWorkflows()
}

async function submitPublish() {
  if (submitting.value) return
  if (publishForm.workflowId == null) {
    ElMessage.warning('请选择流程')
    return
  }
  if (!publishForm.name.trim()) {
    ElMessage.warning('请输入模板名称')
    return
  }
  if (!publishForm.category) {
    ElMessage.warning('请选择模板分类')
    return
  }
  submitting.value = true
  try {
    const wf = await getWorkflowDetail(publishForm.workflowId)
    const graphData = wf.graphData as GraphData | undefined
    if (
      !graphData ||
      !Array.isArray(graphData.nodes) ||
      !graphData.nodes.length
    ) {
      ElMessage.error('该流程没有画布数据，无法发布为模板')
      return
    }
    const payload: TemplatePayload = {
      name: publishForm.name.trim(),
      description: publishForm.description.trim() || undefined,
      icon: wf.icon ?? undefined,
      category: publishForm.category,
      graphData,
      globalConfig:
        (wf.globalConfig as Record<string, unknown> | undefined) ?? undefined
    }
    const res = await createTemplate(payload)
    if (res?.status === false) {
      ElMessage.error(res?.msg || '发布失败')
      return
    }
    ElMessage.success('发布成功')
    publishVisible.value = false
    search()
  } catch (e: any) {
    ElMessage.error(e?.message || '发布失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadCategories()
  reload()
})
</script>

<style scoped lang="less">
.workflow-templates {
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
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

.page-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.panel-card {
  border-radius: 8px;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.official-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.publish-btn {
  margin-left: auto;
}

.tpl-area {
  min-height: 200px;
}

.tpl-grid {
  :deep(.el-col) {
    display: flex;
    margin-bottom: 16px;
  }
}

.tpl-card {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
}

.tpl-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.tpl-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  background: var(--el-color-primary);
}

.tpl-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.tpl-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tpl-desc {
  min-height: 40px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tpl-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.tpl-installs {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.tpl-rate {
  height: 18px;

  :deep(.el-rate__icon) {
    font-size: 14px;
  }
}

.tpl-ops {
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.detail-body {
  min-height: 120px;
}

.detail-section {
  margin-top: 16px;
}

.detail-section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}

.node-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.node-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  font-size: 13px;
}

.node-name {
  color: var(--el-text-color-regular);
}

.config-pre {
  margin: 0;
  padding: 12px;
  max-height: 200px;
  overflow: auto;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-fill-color-light);
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
