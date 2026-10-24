<template>
  <div class="manage-page">
    <!-- 星夜页头（PageHero 通用组件） -->
    <page-hero title="任务审核" desc="审核待发布任务，驳回须填写原因">
      <template #side>
        <span class="page-hero__pill">
          共 {{ store.adminList.length }} 条待审
        </span>
        <el-button class="page-hero__btn" @click="reload">刷新</el-button>
      </template>
    </page-hero>

    <!-- 待审核任务列表 -->
    <div class="base-table">
      <el-table
        :data="store.adminList"
        v-loading="store.loading"
        border
        stripe
        size="small"
        empty-text="暂无待审核任务"
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
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            {{ typeText(row.taskType) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="difficulty"
          label="难度"
          width="80"
          align="center"
        />
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              v-permission="'system:task:audit'"
              type="success"
              link
              :loading="lockingId === row.id"
              @click="onApprove(row)"
              >通过</el-button
            >
            <el-button
              v-permission="'system:task:audit'"
              type="danger"
              link
              :loading="lockingId === row.id"
              @click="openReject(row)"
              >驳回</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="rejectVisible" title="驳回原因" width="420px">
      <el-input
        v-model="rejectReason"
        type="textarea"
        :rows="4"
        maxlength="200"
        show-word-limit
        placeholder="请填写驳回原因（必填）"
      />
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" :loading="!!lockingId" @click="onReject"
          >确认驳回</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { taskStore } from '@/stores/task'
import type { Task } from '@/types/task'

const PageHero = defineAsyncComponent(
  () => import('@/components/base/PageHero/index.vue')
)

const store = taskStore()
const lockingId = ref<number | null>(null)
const rejectVisible = ref(false)
const rejectReason = ref('')
const current = ref<Task | null>(null)

const TYPE_TEXT: Record<string, string> = {
  DAILY: '日常',
  ONCE: '一次性',
  LIMITED: '限时',
  ACHIEVEMENT: '成就',
  CUSTOM: '自定义'
}

function typeText(s: string) {
  return TYPE_TEXT[s] || s
}

async function reload() {
  try {
    await store.loadAdminList({ status: 'PENDING', curPage: 1, pageSize: 50 })
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  }
}

async function onApprove(row: Task) {
  if (lockingId.value) return
  lockingId.value = row.id
  try {
    await store.auditTask(row.id, { action: 'APPROVE' })
    ElMessage.success('已通过')
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    lockingId.value = null
  }
}

function openReject(row: Task) {
  current.value = row
  rejectReason.value = ''
  rejectVisible.value = true
}

async function onReject() {
  if (!current.value || lockingId.value) return
  const reason = rejectReason.value.trim()
  if (!reason) {
    ElMessage.warning('请填写驳回原因')
    return
  }
  lockingId.value = current.value.id
  try {
    await store.auditTask(current.value.id, {
      action: 'REJECT',
      reason
    })
    ElMessage.success('已驳回')
    rejectVisible.value = false
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    lockingId.value = null
  }
}

onMounted(reload)
</script>

<style scoped lang="less">
/* 页面骨架与表格白卡样式统一由 .manage-page 全局类（g.less）接管；
   星夜页头样式统一由 PageHero 通用组件携带，本文件仅保留页面局部定制 */
</style>
