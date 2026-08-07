<template>
  <div class="points-levels">
    <div class="page-toolbar">
      <div class="page-title">
        <h3>等级配置</h3>
        <p>配置会员等级门槛、权益与排序</p>
      </div>
      <div class="page-actions">
        <el-button
          v-permission="'system:points:operate'"
          type="primary"
          @click="openCreate"
          >新增等级</el-button
        >
        <el-button @click="load">刷新</el-button>
      </div>
    </div>

    <el-card shadow="never" class="panel-card">
      <el-table :data="list" v-loading="loading" border stripe size="small">
        <el-table-column prop="level" label="等级" width="80" align="center" />
        <el-table-column
          prop="name"
          label="名称"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column prop="icon" label="图标" width="100" />
        <el-table-column
          prop="requiredPoints"
          label="所需积分"
          width="120"
          align="right"
        />
        <el-table-column
          prop="sortOrder"
          label="排序"
          width="80"
          align="center"
        />
        <el-table-column label="权益" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatBenefits(row.benefits) }}
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
import type { PointsLevel } from '@/types/points'
import {
  createPointsLevel,
  deletePointsLevel,
  getPointsLevels,
  updatePointsLevel
} from '@/api/points'
import { showTips } from '@/utils/message/showTips.js'
import { pointsStore } from '@/stores/points'
import { dialogFields } from './config/levelsSchema'

const BaseDialog = defineAsyncComponent(
  () => import('@/components/base/form/BaseDialog.vue')
)

const store = pointsStore()
const loading = ref(false)
const list = ref<PointsLevel[]>([])
const dialogRef = ref()
const dialogTitle = ref('新增等级')

function formatBenefits(benefits: Record<string, any> = {}) {
  try {
    return JSON.stringify(benefits)
  } catch {
    return ''
  }
}

const confirmMethod = async (data: Record<string, any>) => {
  let benefits: Record<string, any> = {}
  try {
    benefits = JSON.parse(data.benefits || '{}')
  } catch {
    return { status: false, msg: '权益 JSON 格式不正确' }
  }
  const payload = {
    ...data,
    benefits
  }
  let res
  if (payload.id) {
    res = await updatePointsLevel(payload as PointsLevel & { id: number })
  } else {
    delete payload.id
    res = await createPointsLevel(payload)
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
    return { status: false, msg: '未找到等级', data: null }
  }
  return {
    status: true,
    msg: 'ok',
    data: [
      {
        ...row,
        sortOrder: row.sortOrder ?? row.level,
        benefits: formatBenefits(row.benefits || {})
      }
    ]
  }
}

const dialogOptions = reactive({
  fieldList: dialogFields,
  confirmMethod,
  confirmParams: {
    level: 1,
    requiredPoints: 0,
    sortOrder: 0,
    benefits: '{}'
  },
  initMethod,
  initParams: {} as { id?: number },
  disabled: false,
  labelPosition: 'left'
})

async function load() {
  loading.value = true
  try {
    list.value = await getPointsLevels()
    store.levels = list.value
  } catch (e: any) {
    showTips('error', e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  dialogTitle.value = '新增等级'
  dialogOptions.disabled = false
  dialogOptions.initParams = {}
  dialogRef.value?.opentDialog()
}

function openEdit(row: PointsLevel) {
  if (!row.id) {
    showTips('error', '缺少等级 id')
    return
  }
  dialogTitle.value = '编辑等级'
  dialogOptions.disabled = false
  dialogOptions.initParams = { id: row.id }
  dialogRef.value?.opentDialog()
}

async function handleDelete(row: PointsLevel) {
  if (!row.id) {
    showTips('error', '缺少等级 id')
    return
  }
  try {
    await ElMessageBox.confirm(`确认删除等级「${row.name}」？`, '提示', {
      type: 'warning'
    })
  } catch {
    return
  }
  const res = await deletePointsLevel(row.id)
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
.points-levels {
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
