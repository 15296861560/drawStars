<template>
  <div class="points-rules">
    <div class="page-toolbar">
      <div class="page-title">
        <h3>规则配置</h3>
        <p>管理积分获取规则、限额与启用状态</p>
      </div>
      <div class="page-actions">
        <el-button
          v-permission="'system:points:operate'"
          type="primary"
          @click="openCreate"
          >新增规则</el-button
        >
        <el-button @click="load">刷新</el-button>
      </div>
    </div>

    <el-card shadow="never" class="panel-card">
      <el-table :data="list" v-loading="loading" border stripe size="small">
        <el-table-column
          prop="name"
          label="规则名称"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="code"
          label="编码"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column label="来源" width="120">
          <template #default="{ row }">
            {{ pointsSourceLabel(row.source) }}
          </template>
        </el-table-column>
        <el-table-column label="积分类型" width="110">
          <template #default="{ row }">
            {{ pointsTypeLabel(row.pointsType) }}
          </template>
        </el-table-column>
        <el-table-column label="计算方式" width="100">
          <template #default="{ row }">
            {{ calcMethodLabel(row.calcMethod) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="pointsValue"
          label="积分值"
          width="100"
          align="right"
        />
        <el-table-column label="每日上限" width="90" align="center">
          <template #default="{ row }">
            {{ row.dailyLimit || '不限' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="priority"
          label="优先级"
          width="80"
          align="center"
        />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
              {{ row.enabled ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          label="说明"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              v-permission="'system:points:operate'"
              link
              type="primary"
              @click="openEdit(row)"
              >编辑</el-button
            >
            <el-button
              v-permission="'system:points:operate'"
              link
              type="danger"
              @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

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
import type { PointsRule } from '@/types/points'
import {
  createPointsRule,
  deletePointsRule,
  getPointsRules,
  updatePointsRule
} from '@/api/points'
import { showTips } from '@/utils/message/showTips.js'
import { pointsStore } from '@/stores/points'
import { dialogFields } from './config/rulesSchema'
import { pointsSourceLabel, pointsTypeLabel } from '@/utils/points-labels'

const BaseDialog = defineAsyncComponent(
  () => import('@/components/base/form/BaseDialog.vue')
)

const store = pointsStore()
const loading = ref(false)
const list = ref<PointsRule[]>([])
const dialogRef = ref()
const dialogTitle = ref('新增规则')

function calcMethodLabel(method: string) {
  return (
    (
      { FIXED: '固定值', RATIO: '比例', FORMULA: '公式' } as Record<
        string,
        string
      >
    )[method] || method
  )
}

const confirmMethod = async (data: Record<string, any>) => {
  const payload = { ...data }
  let res
  if (payload.id) {
    res = await updatePointsRule(payload as PointsRule & { id: number })
  } else {
    delete payload.id
    res = await createPointsRule(payload)
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
  return { status: true, msg: 'ok', data: [row] }
}

const dialogOptions = reactive({
  fieldList: dialogFields,
  confirmMethod,
  confirmParams: {
    source: 'CHECK_IN',
    pointsType: 'GENERAL',
    calcMethod: 'FIXED',
    pointsValue: 10,
    dailyLimit: 0,
    monthlyLimit: 0,
    singleLimit: 0,
    validDays: 365,
    priority: 0,
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
    list.value = await getPointsRules()
    store.rules = list.value
  } catch (e: any) {
    showTips('error', e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  dialogTitle.value = '新增规则'
  dialogOptions.disabled = false
  dialogOptions.initParams = {}
  dialogRef.value?.opentDialog()
}

function openEdit(row: PointsRule) {
  dialogTitle.value = '编辑规则'
  dialogOptions.disabled = false
  dialogOptions.initParams = { id: row.id }
  dialogRef.value?.opentDialog()
}

async function handleDelete(row: PointsRule) {
  try {
    await ElMessageBox.confirm(`确认删除规则「${row.name}」？`, '提示', {
      type: 'warning'
    })
  } catch {
    return
  }
  const res = await deletePointsRule(row.id)
  if (res?.status === false) {
    showTips('error', res.msg || '删除失败')
    return
  }
  showTips('success', '删除成功')
  await load()
}

onMounted(load)
</script>

<style scoped lang="less">
.points-rules {
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

  :deep(.el-card__body) {
    padding: 16px 20px;
  }
}
</style>
