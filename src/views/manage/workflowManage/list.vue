<template>
  <div class="workflow-list">
    <div class="page-toolbar">
      <div class="page-title">
        <h3>{{ isRecycle ? '流程回收站' : '流程管理' }}</h3>
        <p>
          {{
            isRecycle
              ? '恢复误删的流程，长期未恢复的流程将被定期彻底清理'
              : '编排、发布与治理自动化流程'
          }}
        </p>
      </div>
      <div class="page-actions">
        <el-button
          v-if="!isRecycle"
          v-permission="'system:workflow:create'"
          type="primary"
          @click="openCreate"
          >新建流程</el-button
        >
        <el-button @click="reload">刷新</el-button>
      </div>
    </div>

    <el-card shadow="never" class="panel-card">
      <div class="filter-bar">
        <el-input
          v-model="query.keyword"
          clearable
          placeholder="名称 / 描述关键词"
          style="width: 200px"
          @keyup.enter="search"
        />
        <el-select
          v-model="query.categoryId"
          clearable
          placeholder="分类"
          style="width: 140px"
        >
          <el-option
            v-for="c in categories"
            :key="c.id"
            :label="c.name"
            :value="c.id"
          />
        </el-select>
        <el-select
          v-model="query.status"
          clearable
          placeholder="状态"
          style="width: 140px"
        >
          <el-option
            v-for="s in statusOptions"
            :key="s.value"
            :label="s.label"
            :value="s.value"
          />
        </el-select>
        <el-select
          v-if="!isRecycle"
          v-model="query.triggerType"
          clearable
          placeholder="触发方式"
          style="width: 140px"
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

      <el-alert
        v-if="isRecycle"
        class="recycle-alert"
        type="warning"
        :closable="false"
        show-icon
        title="回收站中的流程可恢复为草稿继续编辑；长期未恢复的流程将被定期彻底删除。"
      />

      <el-table :data="list" v-loading="loading" border stripe size="small">
        <template #empty>
          <el-empty
            :image-size="80"
            :description="
              isRecycle ? '回收站为空' : '暂无流程，去新建或浏览模板市场'
            "
          />
        </template>

        <el-table-column
          prop="workflowNo"
          label="流程编号"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column label="流程名称" min-width="200">
          <template #default="{ row }">
            <div class="wf-name">
              <MenuIcon :name="row.icon" class="wf-icon" />
              <el-tooltip
                v-if="row.description"
                :content="row.description"
                placement="top"
              >
                <span class="wf-name-text">{{ row.name }}</span>
              </el-tooltip>
              <span v-else class="wf-name-text">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="110" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.category?.name || '-' }}
          </template>
        </el-table-column>

        <el-table-column
          v-if="!isRecycle"
          label="状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag size="small" :type="statusTag(row.status)">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isRecycle"
          label="当前版本"
          width="90"
          align="center"
        >
          <template #default="{ row }"> v{{ row.currentVersion }} </template>
        </el-table-column>
        <el-table-column
          v-if="!isRecycle"
          label="触发方式"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            {{ triggerText(row.triggerType) }}
          </template>
        </el-table-column>
        <el-table-column v-if="!isRecycle" label="标签" min-width="150">
          <template #default="{ row }">
            <template v-if="rowTags(row).length">
              <el-tag
                v-for="tag in rowTags(row)"
                :key="tag"
                size="small"
                type="info"
                effect="plain"
                class="wf-tag"
                >{{ tag }}</el-tag
              >
            </template>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isRecycle"
          prop="executionCount"
          label="执行次数"
          width="90"
          align="right"
        />
        <el-table-column v-if="!isRecycle" label="最近执行" width="165">
          <template #default="{ row }">
            {{ formatTime(row.lastExecutedAt) }}
          </template>
        </el-table-column>
        <el-table-column v-if="!isRecycle" label="更新时间" width="165">
          <template #default="{ row }">
            {{ formatTime(row.updatedAt) }}
          </template>
        </el-table-column>

        <el-table-column v-if="isRecycle" label="删除时间" width="165">
          <template #default="{ row }">
            {{ formatTime(row.deletedAt) }}
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          fixed="right"
          align="center"
          :width="isRecycle ? 90 : 210"
        >
          <template #default="{ row }">
            <div v-if="isRecycle" class="row-ops">
              <el-button
                v-permission="'system:workflow:publish'"
                link
                type="primary"
                @click="onRestore(row)"
                >恢复</el-button
              >
            </div>
            <div v-else class="row-ops">
              <el-button
                v-permission="'system:workflow:design'"
                link
                type="primary"
                @click="goDesign(row)"
                >编辑</el-button
              >
              <el-button
                v-if="row.status === 'PUBLISHED'"
                v-permission="'system:workflow:execute'"
                link
                type="success"
                @click="onExecute(row)"
                >执行</el-button
              >
              <el-button
                v-if="row.status === 'DRAFT' || row.status === 'REJECTED'"
                v-permission="'system:workflow:publish'"
                link
                type="warning"
                @click="onPublish(row)"
                >发布</el-button
              >
              <el-dropdown trigger="click" @command="cmd => onMore(cmd, row)">
                <el-button link type="primary">
                  更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-if="row.status === 'DRAFT'"
                      v-permission="'system:workflow:execute'"
                      command="test"
                      >测试运行</el-dropdown-item
                    >
                    <el-dropdown-item
                      v-if="row.status === 'PENDING'"
                      v-permission="'system:workflow:audit'"
                      command="audit"
                      >审核</el-dropdown-item
                    >
                    <el-dropdown-item
                      v-if="row.status === 'PUBLISHED'"
                      v-permission="'system:workflow:publish'"
                      command="pause"
                      >暂停</el-dropdown-item
                    >
                    <el-dropdown-item
                      v-if="row.status === 'PAUSED'"
                      v-permission="'system:workflow:publish'"
                      command="resume"
                      >恢复</el-dropdown-item
                    >
                    <el-dropdown-item
                      v-if="
                        row.status === 'PUBLISHED' || row.status === 'PAUSED'
                      "
                      v-permission="'system:workflow:publish'"
                      command="offline"
                      >下线</el-dropdown-item
                    >
                    <el-dropdown-item
                      v-permission="'system:workflow:create'"
                      command="copy"
                      >复制</el-dropdown-item
                    >
                    <el-dropdown-item
                      v-permission="'system:workflow:design'"
                      command="versions"
                      >版本</el-dropdown-item
                    >
                    <el-dropdown-item
                      v-permission="'system:workflow:delete'"
                      command="delete"
                      divided
                      >删除</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
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

    <el-dialog v-model="auditVisible" title="流程审核" width="480px">
      <div v-if="auditRow" class="audit-meta">
        <p class="audit-name">
          {{ auditRow.name }}（{{ auditRow.workflowNo }}）
        </p>
        <p v-if="auditRow.description" class="audit-desc">
          {{ auditRow.description }}
        </p>
      </div>
      <el-form label-width="80px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditResult">
            <el-radio value="approve">通过并发布</el-radio>
            <el-radio value="reject">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input
            v-model="auditRemark"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            :placeholder="
              auditResult === 'approve' ? '选填，如审核意见' : '请填写驳回原因'
            "
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="auditSubmitting"
          @click="submitAudit"
          >提交审核结果</el-button
        >
      </template>
    </el-dialog>

    <el-drawer v-model="versionVisible" :title="versionTitle" size="560px">
      <el-table
        :data="versions"
        v-loading="versionLoading"
        border
        stripe
        size="small"
      >
        <template #empty>
          <el-empty description="暂无版本记录" :image-size="60" />
        </template>
        <el-table-column label="版本" width="70" align="center">
          <template #default="{ row }"> v{{ row.version }} </template>
        </el-table-column>
        <el-table-column label="变更说明" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.changeNote || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="createdBy"
          label="操作人"
          width="80"
          align="center"
        />
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90" align="center">
          <template #default="{ row }">
            <el-button
              v-permission="'system:workflow:design'"
              link
              type="primary"
              :disabled="row.version === versionRow?.currentVersion"
              @click="onRollback(row)"
              >回滚</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type {
  Workflow,
  WorkflowCategory,
  WorkflowListQuery,
  WorkflowPayload,
  WorkflowVersion
} from '@/types/workflow'
import {
  auditWorkflow,
  copyWorkflow,
  createWorkflow,
  deleteWorkflow,
  executeWorkflow,
  getCategories,
  getWorkflowVersions,
  getWorkflows,
  offlineWorkflow,
  pauseWorkflow,
  publishWorkflow,
  restoreWorkflow,
  resumeWorkflow,
  rollbackWorkflow,
  testWorkflow
} from '@/api/workflow'
import MenuIcon from '@/components/layout/MenuIcon.vue'
import { dialogFields } from './config/listSchema'

const BaseDialog = defineAsyncComponent(
  () => import('@/components/base/form/BaseDialog.vue')
)

const router = useRouter()

const loading = ref(false)
const list = ref<Workflow[]>([])
const total = ref(0)
const categories = ref<WorkflowCategory[]>([])

const query = reactive({
  keyword: '',
  categoryId: '' as number | string,
  status: '',
  triggerType: ''
})

const pager = reactive({
  curPage: 1,
  pageSize: 10
})

const statusOptions = [
  { value: 'DRAFT', label: '草稿' },
  { value: 'PENDING', label: '待审核' },
  { value: 'PUBLISHED', label: '已发布' },
  { value: 'REJECTED', label: '已驳回' },
  { value: 'PAUSED', label: '已暂停' },
  { value: 'OFFLINE', label: '已下线' },
  { value: 'RECYCLE', label: '回收站' }
]

const triggerOptions = [
  { value: 'CRON', label: '定时触发' },
  { value: 'WEBHOOK', label: 'Webhook' },
  { value: 'MANUAL', label: '手动触发' },
  { value: 'EVENT', label: '事件触发' }
]

const STATUS_TEXT: Record<string, string> = {
  DRAFT: '草稿',
  PENDING: '待审核',
  PUBLISHED: '已发布',
  REJECTED: '已驳回',
  PAUSED: '已暂停',
  OFFLINE: '已下线'
}

const STATUS_TAG: Record<string, string> = {
  DRAFT: 'info',
  PENDING: 'warning',
  PUBLISHED: 'success',
  REJECTED: 'danger',
  PAUSED: 'warning',
  OFFLINE: 'info'
}

const TRIGGER_TEXT: Record<string, string> = {
  CRON: '定时触发',
  WEBHOOK: 'Webhook',
  MANUAL: '手动触发',
  EVENT: '事件触发'
}

function statusText(s: string) {
  return STATUS_TEXT[s] || s
}

function statusTag(s: string) {
  return STATUS_TAG[s] || 'info'
}

function triggerText(t: string) {
  return TRIGGER_TEXT[t] || t
}

/** 回收站模式：状态下拉选择“回收站”时启用 */
const isRecycle = computed(() => query.status === 'RECYCLE')

function formatTime(t?: string | null) {
  if (!t) return '-'
  const d = new Date(t)
  return Number.isNaN(d.getTime())
    ? '-'
    : d.toLocaleString('zh-CN', { hour12: false })
}

function rowTags(row: Workflow): string[] {
  const tags = row.tags
  if (Array.isArray(tags)) {
    return tags.map(t => String(t)).filter(Boolean)
  }
  if (typeof tags === 'string') {
    return tags
      .split(/[,，]/)
      .map(s => s.trim())
      .filter(Boolean)
  }
  return []
}

// ==================== 列表加载 ====================

async function reload() {
  loading.value = true
  try {
    const params: WorkflowListQuery & { triggerType?: string } = {
      page: pager.curPage,
      pageSize: pager.pageSize,
      keyword: query.keyword.trim() || undefined,
      categoryId: query.categoryId || undefined,
      status: !isRecycle.value && query.status ? query.status : undefined,
      deleted: isRecycle.value ? '1' : undefined,
      triggerType: query.triggerType || undefined
    }
    const res = await getWorkflows(params)
    list.value = res.list || []
    total.value = res.total || 0
  } catch (e: any) {
    ElMessage.error(e?.message || '加载流程列表失败')
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    const res = await getCategories()
    categories.value = res.list || []
    const field = fieldList.find(f => f.fieldName === 'categoryId')
    if (field) {
      field.options = categories.value
        .filter(c => c.enabled)
        .map(c => ({ label: c.name, value: c.id }))
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '加载分类失败')
  }
}

function search() {
  pager.curPage = 1
  reload()
}

function resetQuery() {
  query.keyword = ''
  query.categoryId = ''
  query.status = ''
  query.triggerType = ''
  search()
}

function onSizeChange() {
  pager.curPage = 1
  reload()
}

// ==================== 新建流程 ====================

const dialogRef = ref()
const dialogTitle = ref('新建流程')

const fieldList = reactive(
  dialogFields.map(f => ({
    ...f,
    options: f.options ? [...f.options] : f.options
  }))
)

const confirmMethod = async (data: Record<string, any>) => {
  try {
    const tags = String(data.tags || '')
      .split(/[,，]/)
      .map(s => s.trim())
      .filter(Boolean)
    const payload: WorkflowPayload = {
      name: String(data.name || '').trim(),
      description: String(data.description || '').trim() || undefined,
      categoryId: Number(data.categoryId),
      tags
    }
    const res = await createWorkflow(payload)
    if (res?.status === false) {
      return res
    }
    ElMessage.success('创建成功，正在进入流程设计器')
    const createdId = res?.data?.id
    if (createdId) {
      router.push(`/home/manageHomePage/workflow/designer/${createdId}`)
    }
    return { status: true, msg: 'ok', data: res?.data ?? res }
  } catch (e: any) {
    return { status: false, msg: e?.message || '创建失败', data: null }
  }
}

const dialogOptions = reactive({
  fieldList,
  confirmMethod,
  confirmParams: {} as Record<string, any>,
  initParams: {} as { id?: number },
  disabled: false,
  labelPosition: 'left'
})

async function openCreate() {
  dialogTitle.value = '新建流程'
  dialogOptions.disabled = false
  dialogOptions.initParams = {}
  await loadCategories()
  dialogRef.value?.opentDialog()
}

// ==================== 行操作 ====================

function goDesign(row: Workflow) {
  router.push(`/home/manageHomePage/workflow/designer/${row.id}`)
}

async function onExecute(row: Workflow) {
  try {
    const execution = await executeWorkflow(row.id)
    ElMessage.success('已触发执行')
    if (execution?.id) {
      router.push(`/home/manageHomePage/workflow/execution/${execution.id}`)
    } else {
      await reload()
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '触发执行失败')
  }
}

async function onTest(row: Workflow) {
  try {
    await testWorkflow(row.id)
    ElMessage.success('测试运行完成')
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '测试运行失败')
  }
}

async function onPublish(row: Workflow) {
  try {
    const res = await publishWorkflow(row.id)
    if (res?.status === false) {
      ElMessage.error(res.msg || '提交审核失败')
      return
    }
    ElMessage.success('已提交审核')
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '提交审核失败')
  }
}

async function onPause(row: Workflow) {
  try {
    const res = await pauseWorkflow(row.id)
    if (res?.status === false) {
      ElMessage.error(res.msg || '暂停失败')
      return
    }
    ElMessage.success('已暂停')
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '暂停失败')
  }
}

async function onResume(row: Workflow) {
  try {
    const res = await resumeWorkflow(row.id)
    if (res?.status === false) {
      ElMessage.error(res.msg || '恢复失败')
      return
    }
    ElMessage.success('已恢复')
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '恢复失败')
  }
}

async function onOffline(row: Workflow) {
  try {
    const res = await offlineWorkflow(row.id)
    if (res?.status === false) {
      ElMessage.error(res.msg || '下线失败')
      return
    }
    ElMessage.success('已下线')
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '下线失败')
  }
}

async function onCopy(row: Workflow) {
  try {
    const res = await copyWorkflow(row.id)
    if (res?.status === false) {
      ElMessage.error(res.msg || '复制失败')
      return
    }
    ElMessage.success('复制成功')
    pager.curPage = 1
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '复制失败')
  }
}

async function onDelete(row: Workflow) {
  try {
    await ElMessageBox.confirm(
      `确认删除流程「${row.name}」？删除后将进入回收站。`,
      '删除确认',
      { type: 'warning' }
    )
  } catch {
    return
  }
  try {
    const res = await deleteWorkflow(row.id)
    if (res?.status === false) {
      ElMessage.error(res.msg || '删除失败')
      return
    }
    ElMessage.success('已移入回收站')
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '删除失败')
  }
}

async function onRestore(row: Workflow) {
  try {
    const res = await restoreWorkflow(row.id)
    if (res?.status === false) {
      ElMessage.error(res.msg || '恢复失败')
      return
    }
    ElMessage.success('已恢复为草稿')
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '恢复失败')
  }
}

function onMore(cmd: string, row: Workflow) {
  switch (cmd) {
    case 'test':
      onTest(row)
      break
    case 'audit':
      openAudit(row)
      break
    case 'pause':
      onPause(row)
      break
    case 'resume':
      onResume(row)
      break
    case 'offline':
      onOffline(row)
      break
    case 'copy':
      onCopy(row)
      break
    case 'versions':
      openVersions(row)
      break
    case 'delete':
      onDelete(row)
      break
  }
}

// ==================== 审核 ====================

const auditVisible = ref(false)
const auditRow = ref<Workflow | null>(null)
const auditResult = ref<'approve' | 'reject'>('approve')
const auditRemark = ref('')
const auditSubmitting = ref(false)

function openAudit(row: Workflow) {
  auditRow.value = row
  auditResult.value = 'approve'
  auditRemark.value = ''
  auditVisible.value = true
}

async function submitAudit() {
  const row = auditRow.value
  if (!row || auditSubmitting.value) return
  auditSubmitting.value = true
  try {
    const res = await auditWorkflow(row.id, {
      approved: auditResult.value === 'approve',
      remark: auditRemark.value.trim() || undefined
    })
    if (res?.status === false) {
      ElMessage.error(res.msg || '审核操作失败')
      return
    }
    ElMessage.success(
      auditResult.value === 'approve' ? '已通过并发布' : '已驳回'
    )
    auditVisible.value = false
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '审核操作失败')
  } finally {
    auditSubmitting.value = false
  }
}

// ==================== 版本 ====================

const versionVisible = ref(false)
const versionRow = ref<Workflow | null>(null)
const versions = ref<WorkflowVersion[]>([])
const versionLoading = ref(false)

const versionTitle = computed(() =>
  versionRow.value ? `版本记录 - ${versionRow.value.name}` : '版本记录'
)

async function openVersions(row: Workflow) {
  versionRow.value = row
  versions.value = []
  versionVisible.value = true
  versionLoading.value = true
  try {
    const res = await getWorkflowVersions(row.id)
    versions.value = res.list || []
  } catch (e: any) {
    ElMessage.error(e?.message || '加载版本列表失败')
  } finally {
    versionLoading.value = false
  }
}

async function onRollback(v: WorkflowVersion) {
  const row = versionRow.value
  if (!row) return
  try {
    await ElMessageBox.confirm(
      `确认将「${row.name}」回滚到 v${v.version}？回滚会生成新的版本快照。`,
      '回滚确认',
      { type: 'warning' }
    )
  } catch {
    return
  }
  try {
    const res = await rollbackWorkflow(row.id, v.version)
    if (res?.status === false) {
      ElMessage.error(res.msg || '回滚失败')
      return
    }
    ElMessage.success('回滚成功')
    versionVisible.value = false
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '回滚失败')
  }
}

onMounted(() => {
  loadCategories()
  reload()
})
</script>

<style scoped lang="less">
.workflow-list {
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

.page-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.panel-card {
  border-radius: 8px;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.recycle-alert {
  margin-bottom: 12px;
}

.wf-name {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;

  .wf-icon {
    flex-shrink: 0;
    color: var(--el-color-primary);
  }

  .wf-name-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.wf-tag {
  margin-right: 4px;

  &:last-child {
    margin-right: 0;
  }
}

.text-muted {
  color: var(--el-text-color-placeholder);
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

.audit-meta {
  margin-bottom: 16px;

  .audit-name {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .audit-desc {
    margin: 6px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
    word-break: break-all;
  }
}
</style>
