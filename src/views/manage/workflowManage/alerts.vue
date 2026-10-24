<template>
  <div class="manage-page">
    <!-- 星夜页头（PageHero 通用组件） -->
    <page-hero title="告警规则" desc="配置流程执行异常的告警阈值与通知方式">
      <template #side>
        <span class="page-hero__pill">
          <el-icon :size="14"><Bell /></el-icon>
          共 {{ page.total }} 条规则
        </span>
        <el-button
          v-permission="'system:workflow:operate'"
          class="page-hero__btn"
          @click="openCreate"
          >新建规则</el-button
        >
        <el-button class="page-hero__btn" @click="load">刷新</el-button>
      </template>
    </page-hero>
    <!-- 筛选栏 -->
    <filter-bar @search="search" @reset="resetQuery">
      <el-select
        v-model="query.workflowId"
        clearable
        placeholder="关联流程"
        style="width: 180px"
      >
        <el-option
          v-for="w in workflowOptions"
          :key="w.value"
          :label="w.label"
          :value="w.value"
        />
      </el-select>
      <el-select
        v-model="query.enabled"
        clearable
        placeholder="状态"
        style="width: 120px"
      >
        <el-option label="启用" value="true" />
        <el-option label="停用" value="false" />
      </el-select>
    </filter-bar>

    <!-- 规则列表 -->
    <div class="base-table">
      <el-table :data="list" v-loading="loading" border stripe size="small">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column label="关联流程" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.workflow?.name || '全部流程' }}
          </template>
        </el-table-column>
        <el-table-column label="规则类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="ruleTagType(row.ruleType)" size="small">
              {{ ruleTypeLabel(row.ruleType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="阈值" width="90" align="right">
          <template #default="{ row }">
            {{ thresholdText(row) }}
          </template>
        </el-table-column>
        <el-table-column label="统计窗口" width="100" align="center">
          <template #default="{ row }"> {{ row.windowMinutes }} 分钟 </template>
        </el-table-column>
        <el-table-column label="通知方式" min-width="120">
          <template #default="{ row }">
            <el-tag
              v-for="c in channelsOf(row)"
              :key="c"
              size="small"
              type="info"
              class="channel-tag"
            >
              {{ channelLabel(c) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
              {{ row.enabled ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
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
              @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="pager base-table__pagination">
        <el-pagination
          v-model:current-page="page.curPage"
          v-model:page-size="page.pageSize"
          :total="page.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
          @size-change="load"
          @current-change="load"
        />
      </div>
    </div>

    <base-dialog
      ref="dialogRef"
      :options="dialogOptions"
      :title="dialogTitle"
      @confirm="load"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import type { AlertPayload, WorkflowAlertRule } from '@/types/workflow'
import {
  createAlertRule,
  deleteAlertRule,
  getAlertRules,
  getWorkflows,
  updateAlertRule
} from '@/api/workflow'
import { showTips } from '@/utils/message/showTips.js'
import { dialogFields } from './config/alertsSchema'
import { Bell } from '@element-plus/icons-vue'

const BaseDialog = defineAsyncComponent(
  () => import('@/components/base/form/BaseDialog.vue')
)

const FilterBar = defineAsyncComponent(
  () => import('@/components/base/FilterBar/index.vue')
)

const PageHero = defineAsyncComponent(
  () => import('@/components/base/PageHero/index.vue')
)

const loading = ref(false)
const list = ref<WorkflowAlertRule[]>([])
const workflowOptions = ref<{ label: string; value: number }[]>([])
const dialogRef = ref()
const dialogTitle = ref('新建规则')

const query = reactive({
  workflowId: undefined as number | string | undefined,
  enabled: ''
})

const page = reactive({
  curPage: 1,
  pageSize: 10,
  total: 0
})

// 弹窗字段需动态填充"关联流程"下拉，复制一份避免污染 schema 常量
const fieldList = reactive(
  dialogFields.map(f => ({
    ...f,
    options: f.options ? [...f.options] : f.options,
    attrs: f.attrs ? { ...f.attrs } : f.attrs
  }))
)

function ruleTypeLabel(t: string) {
  return (
    (
      { FAILURE_RATE: '失败率', FAILURE_COUNT: '失败次数' } as Record<
        string,
        string
      >
    )[t] || t
  )
}

function ruleTagType(t: string) {
  return t === 'FAILURE_RATE' ? 'warning' : 'danger'
}

function thresholdText(row: WorkflowAlertRule) {
  return row.ruleType === 'FAILURE_RATE'
    ? `${row.threshold}%`
    : `${row.threshold} 次`
}

function channelLabel(c: string) {
  return (
    ({ EMAIL: '邮件', MESSAGE: '站内信' } as Record<string, string>)[c] || c
  )
}

function channelsOf(row: WorkflowAlertRule): string[] {
  return Array.isArray(row.notifyChannels)
    ? (row.notifyChannels as string[])
    : []
}

async function loadWorkflowOptions() {
  try {
    const res = await getWorkflows({ page: 1, pageSize: 999 })
    workflowOptions.value = (res.list || []).map(w => ({
      label: w.name,
      value: w.id
    }))
    const field = fieldList.find(f => f.fieldName === 'workflowId')
    if (field) field.options = workflowOptions.value
  } catch (e: any) {
    showTips('error', e?.message || '加载流程失败')
  }
}

const confirmMethod = async (data: Record<string, any>) => {
  const payload = { ...data }
  let res
  if (payload.id) {
    const { id, ...rest } = payload
    res = await updateAlertRule(id, rest as Partial<AlertPayload>)
  } else {
    delete payload.id
    res = await createAlertRule(payload as AlertPayload)
  }
  if (res?.status === false) {
    return res
  }
  showTips('success', '保存成功')
  return { status: true, msg: 'ok', data: res?.data ?? res }
}

const initMethod = async (params: { id: number }) => {
  const row = list.value.find(r => r.id === params.id)
  if (!row) {
    return { status: false, msg: '未找到规则', data: null }
  }
  return {
    status: true,
    msg: 'ok',
    data: [{ ...row, notifyChannels: channelsOf(row) }]
  }
}

const dialogOptions = reactive({
  fieldList,
  confirmMethod,
  confirmParams: {
    ruleType: 'FAILURE_RATE',
    threshold: 10,
    windowMinutes: 30,
    notifyChannels: ['EMAIL'],
    enabled: true
  },
  initMethod,
  initParams: {} as { id?: number },
  disabled: false,
  labelPosition: 'left'
})

async function load() {
  loading.value = true
  try {
    const res = await getAlertRules({
      page: page.curPage,
      pageSize: page.pageSize,
      workflowId: query.workflowId || undefined,
      enabled: query.enabled || undefined
    })
    list.value = res.list || []
    page.total = res.total || 0
  } catch (e: any) {
    showTips('error', e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function search() {
  page.curPage = 1
  load()
}

function resetQuery() {
  query.workflowId = undefined
  query.enabled = ''
  search()
}

function openCreate() {
  dialogTitle.value = '新建规则'
  dialogOptions.disabled = false
  dialogOptions.initParams = {}
  dialogRef.value?.opentDialog()
}

function openEdit(row: WorkflowAlertRule) {
  dialogTitle.value = '编辑规则'
  dialogOptions.disabled = false
  dialogOptions.initParams = { id: row.id }
  dialogRef.value?.opentDialog()
}

async function handleDelete(row: WorkflowAlertRule) {
  try {
    await ElMessageBox.confirm(
      `确认删除该告警规则（ID: ${row.id}）？`,
      '提示',
      { type: 'warning' }
    )
  } catch {
    return
  }
  const res = await deleteAlertRule(row.id)
  if (res?.status === false) {
    showTips('error', res.msg || '删除失败')
    return
  }
  showTips('success', '删除成功')
  await load()
  if (!list.value.length && page.curPage > 1) {
    page.curPage -= 1
    await load()
  }
}

onMounted(() => {
  load()
  loadWorkflowOptions()
})
</script>

<style scoped lang="less">
/* 页面骨架与表格白卡样式统一由 .manage-page 全局类（g.less）接管；
   星夜页头样式统一由 PageHero 通用组件携带，本文件仅保留页面局部定制 */

/* ===== 单元格 ===== */
.channel-tag {
  margin-right: 4px;

  &:last-child {
    margin-right: 0;
  }
}

.pager {
  display: flex;
  justify-content: flex-end;
}
</style>
