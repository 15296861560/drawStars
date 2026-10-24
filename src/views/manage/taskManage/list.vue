<template>
  <div class="manage-page">
    <!-- 星夜页头（PageHero 通用组件） -->
    <page-hero title="任务列表" desc="创建、编辑与管理任务生命周期">
      <template #side>
        <span class="page-hero__pill">
          <el-icon :size="14"><Tickets /></el-icon>
          共 {{ store.adminTotal }} 条任务
        </span>
        <el-button
          v-permission="'system:task:create'"
          class="page-hero__btn"
          @click="openCreate"
          >创建任务</el-button
        >
        <el-button class="page-hero__btn" @click="reload">刷新</el-button>
      </template>
    </page-hero>

    <!-- 筛选栏 -->
    <filter-bar @search="search" @reset="resetQuery">
      <el-input
        v-model="query.title"
        clearable
        placeholder="标题 / 任务编号"
        style="width: 200px"
        @keyup.enter="search"
      />
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
        v-model="query.taskType"
        clearable
        placeholder="类型"
        style="width: 140px"
      >
        <el-option
          v-for="t in typeOptions"
          :key="t.value"
          :label="t.label"
          :value="t.value"
        />
      </el-select>
    </filter-bar>

    <!-- 任务列表 -->
    <div class="base-table">
      <el-table
        ref="tableRef"
        :data="store.adminList"
        v-loading="store.loading"
        border
        stripe
        size="small"
        empty-text="暂无数据"
      >
        <el-table-column
          prop="taskNo"
          label="任务编号"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="title"
          label="标题"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column label="分类" width="100" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.category?.name || row.categoryId }}
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            {{ typeText(row.taskType) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="statusTag(row.status)">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="difficulty"
          label="难度"
          width="70"
          align="center"
        />
        <el-table-column
          label="操作"
          fixed="right"
          align="center"
          :width="opsColumnWidth"
          :min-width="opsColumnMinWidth"
        >
          <template #default="{ row }">
            <div class="row-ops">
              <el-button
                v-permission="'system:task:update'"
                link
                type="primary"
                @click="openEdit(row)"
                >编辑</el-button
              >
              <el-button
                v-permission="'system:task:create'"
                link
                type="primary"
                @click="onCopy(row)"
                >复制</el-button
              >
              <el-button
                v-if="row.status === 'DRAFT'"
                v-permission="'system:task:update'"
                link
                type="warning"
                :loading="lockId === row.id"
                @click="submitAudit(row)"
                >提交审核</el-button
              >
              <el-button
                v-if="row.status === 'APPROVED'"
                v-permission="'system:task:status'"
                link
                type="warning"
                @click="onPause(row)"
                >暂停</el-button
              >
              <el-button
                v-if="row.status === 'PAUSED'"
                v-permission="'system:task:status'"
                link
                type="success"
                @click="onResume(row)"
                >恢复</el-button
              >
              <el-button
                v-if="row.status === 'APPROVED' || row.status === 'PAUSED'"
                v-permission="'system:task:status'"
                link
                type="info"
                @click="onOffline(row)"
                >下线</el-button
              >
              <el-button
                v-if="row.status === 'APPROVED'"
                v-permission="'system:task:claim'"
                link
                type="warning"
                :loading="claimLockId === row.id"
                @click="onClaim(row)"
                >领取</el-button
              >
              <el-button
                v-permission="'system:task:assign'"
                link
                type="primary"
                @click="openAssign(row)"
                >指派</el-button
              >
              <el-button
                v-permission="'system:task:delete'"
                link
                type="danger"
                @click="onDelete(row)"
                >删除</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager base-table__pagination">
        <el-pagination
          v-model:current-page="pager.curPage"
          v-model:page-size="pager.pageSize"
          :total="store.adminTotal"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
          @current-change="reload"
          @size-change="onSizeChange"
        />
      </div>
    </div>

    <TaskFormDialog
      v-model="formVisible"
      :editing-task="editingTask"
      :categories="store.categories"
      :reward-templates="store.rewardTemplates"
      :submitting="submitting"
      @submit="submitForm"
    />

    <el-dialog v-model="assignVisible" title="指派任务" width="420px">
      <el-form label-width="88px">
        <el-form-item label="用户 ID">
          <el-input v-model="assignUserIds" placeholder="逗号分隔，如 1,2,3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button :loading="submitting" @click="submitRevoke"
          >撤销指派</el-button
        >
        <el-button type="primary" :loading="submitting" @click="submitAssign">
          确认指派
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { taskStore } from '@/stores/task'
import { userInfoStore } from '@/stores/user-info'
import type { CreateTaskPayload, Task } from '@/types/task'
import * as taskApi from '@/api/task'
import TaskFormDialog from '@/components/task/admin/TaskFormDialog.vue'
import FilterBar from '@/components/base/FilterBar/index.vue'
import { Tickets } from '@element-plus/icons-vue'

const PageHero = defineAsyncComponent(
  () => import('@/components/base/PageHero/index.vue')
)

const store = taskStore()
const userStore = userInfoStore()
const tableRef = ref()
const formVisible = ref(false)
const assignVisible = ref(false)
const submitting = ref(false)
const lockId = ref<number | null>(null)
const claimLockId = ref<number | null>(null)
const editingTask = ref<Task | null>(null)
const assignTaskId = ref<number | null>(null)
const assignUserIds = ref('')
const measuredOpsWidth = ref(0)

/** 按最长操作组合估算 */
const opsColumnMinWidth = 300
const opsColumnWidth = computed(() =>
  measuredOpsWidth.value > 0 ? measuredOpsWidth.value : opsColumnMinWidth
)

function measureOpsWidth() {
  nextTick(() => {
    const root = tableRef.value?.$el as HTMLElement | undefined
    if (!root) return
    const nodes = root.querySelectorAll('.row-ops')
    let max = 0
    nodes.forEach(node => {
      const el = node as HTMLElement
      max = Math.max(max, el.scrollWidth, el.offsetWidth)
    })
    if (max > 0) {
      measuredOpsWidth.value = Math.ceil(max + 24)
      nextTick(() => tableRef.value?.doLayout?.())
    }
  })
}

const query = reactive({
  title: '',
  status: '',
  taskType: ''
})

const pager = reactive({
  curPage: 1,
  pageSize: 20
})

const statusOptions = [
  { value: 'DRAFT', label: '草稿' },
  { value: 'PENDING', label: '待审核' },
  { value: 'APPROVED', label: '已通过' },
  { value: 'REJECTED', label: '已驳回' },
  { value: 'PAUSED', label: '已暂停' },
  { value: 'OFFLINE', label: '已下线' }
]

const typeOptions = [
  { value: 'DAILY', label: '日常' },
  { value: 'ONCE', label: '一次性' },
  { value: 'LIMITED', label: '限时' },
  { value: 'ACHIEVEMENT', label: '成就' },
  { value: 'CUSTOM', label: '自定义' }
]

const STATUS_TEXT: Record<string, string> = {
  DRAFT: '草稿',
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已驳回',
  PAUSED: '已暂停',
  OFFLINE: '已下线',
  DELETED: '已删除'
}

const TYPE_TEXT: Record<string, string> = {
  DAILY: '日常',
  ONCE: '一次性',
  LIMITED: '限时',
  ACHIEVEMENT: '成就',
  CUSTOM: '自定义'
}

function statusText(s: string) {
  return STATUS_TEXT[s] || s
}

function typeText(s: string) {
  return TYPE_TEXT[s] || s
}

function statusTag(s: string) {
  if (s === 'APPROVED') return 'success'
  if (s === 'PENDING' || s === 'PAUSED') return 'warning'
  if (s === 'REJECTED') return 'danger'
  if (s === 'DRAFT' || s === 'OFFLINE') return 'info'
  return ''
}

function parseUserIds() {
  return assignUserIds.value
    .split(/[,\s]+/)
    .map(s => Number(s.trim()))
    .filter(n => Number.isFinite(n) && n > 0)
}

async function reload() {
  try {
    await store.loadAdminList({
      title: query.title || undefined,
      status: query.status || undefined,
      taskType: query.taskType || undefined,
      curPage: pager.curPage,
      pageSize: pager.pageSize
    })
    measureOpsWidth()
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  }
}

function search() {
  pager.curPage = 1
  reload()
}

function resetQuery() {
  query.title = ''
  query.status = ''
  query.taskType = ''
  search()
}

function onSizeChange() {
  pager.curPage = 1
  reload()
}

function openCreate() {
  editingTask.value = null
  formVisible.value = true
}

function openEdit(row: Task) {
  editingTask.value = row
  formVisible.value = true
}

async function submitForm(payload: CreateTaskPayload) {
  if (submitting.value) return
  submitting.value = true
  try {
    if (editingTask.value) {
      await store.updateTask(editingTask.value.id, payload)
      ElMessage.success('更新成功')
    } else {
      await store.createTask(payload)
      ElMessage.success('创建成功')
    }
    formVisible.value = false
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

async function onCopy(row: Task) {
  try {
    await store.copyTask(row.id)
    ElMessage.success('复制成功')
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '复制失败')
  }
}

async function submitAudit(row: Task) {
  if (lockId.value) return
  lockId.value = row.id
  try {
    await taskApi.updateTask(row.id, { status: 'PENDING' } as any)
    ElMessage.success('已提交审核')
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    lockId.value = null
  }
}

async function onPause(row: Task) {
  try {
    await ElMessageBox.confirm(
      '确认暂停该任务？暂停后用户端将不可领取',
      '提示',
      {
        type: 'warning'
      }
    )
    await store.pauseTask(row.id)
    ElMessage.success('已暂停')
    await reload()
  } catch (e: any) {
    if (e === 'cancel' || e === 'close') return
    ElMessage.error(e?.message || '操作失败')
  }
}

async function onResume(row: Task) {
  try {
    await store.resumeTask(row.id)
    ElMessage.success('已恢复')
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

async function onOffline(row: Task) {
  try {
    await ElMessageBox.confirm(
      '确认下线该任务？下线后用户端将不再展示',
      '提示',
      {
        type: 'warning'
      }
    )
    await store.offlineTask(row.id)
    ElMessage.success('已下线')
    await reload()
  } catch (e: any) {
    if (e === 'cancel' || e === 'close') return
    ElMessage.error(e?.message || '操作失败')
  }
}

/** 领取：将当前登录用户指派为该任务执行人 */
async function onClaim(row: Task) {
  if (claimLockId.value) return
  const userId = Number(userStore.getUserId)
  if (!userId) {
    ElMessage.warning('无法获取当前用户，请重新登录')
    return
  }
  claimLockId.value = row.id
  try {
    await store.assignTask({ taskId: row.id, userIds: [userId] })
    ElMessage.success('领取成功，已指派给当前账号')
  } catch (e: any) {
    ElMessage.error(e?.message || '领取失败')
  } finally {
    claimLockId.value = null
  }
}

async function onDelete(row: Task) {
  try {
    await ElMessageBox.confirm('确认删除该任务？（软删除）', '提示', {
      type: 'warning'
    })
    await store.deleteTask(row.id)
    ElMessage.success('已删除')
    await reload()
  } catch (e: any) {
    if (e === 'cancel' || e === 'close') return
    ElMessage.error(e?.message || '删除失败')
  }
}

function openAssign(row: Task) {
  assignTaskId.value = row.id
  assignUserIds.value = ''
  assignVisible.value = true
}

async function submitAssign() {
  if (submitting.value || !assignTaskId.value) return
  const ids = parseUserIds()
  if (!ids.length) {
    ElMessage.warning('请输入用户 ID')
    return
  }
  submitting.value = true
  try {
    await store.batchAssign({ taskId: assignTaskId.value, userIds: ids })
    ElMessage.success('指派成功')
    assignVisible.value = false
  } catch (e: any) {
    ElMessage.error(e?.message || '指派失败')
  } finally {
    submitting.value = false
  }
}

async function submitRevoke() {
  if (submitting.value || !assignTaskId.value) return
  const ids = parseUserIds()
  if (!ids.length) {
    ElMessage.warning('请输入要撤销的用户 ID')
    return
  }
  submitting.value = true
  try {
    await store.revokeAssign({ taskId: assignTaskId.value, userIds: ids })
    ElMessage.success('撤销成功')
    assignVisible.value = false
  } catch (e: any) {
    ElMessage.error(e?.message || '撤销失败')
  } finally {
    submitting.value = false
  }
}

watch(
  () => store.adminList,
  () => measureOpsWidth(),
  { deep: true }
)

onMounted(async () => {
  try {
    await Promise.all([store.loadCategories(), store.loadRewardTemplates()])
  } catch (_) {
    /* ignore */
  }
  await reload()
})
</script>

<style scoped lang="less">
/* 页面骨架与表格白卡样式统一由 .manage-page 全局类（g.less）接管；
   星夜页头样式统一由 PageHero 通用组件携带，本文件仅保留页面局部定制 */

/* ===== 单元格 ===== */
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
}
</style>
