<template>
  <div class="manage-page">
    <!-- 星夜页头（PageHero 通用组件） -->
    <page-hero title="奖励发放" desc="处理实物奖励的发放与物流信息">
      <template #side>
        <span class="page-hero__pill">
          共 {{ store.claims.length }} 条记录
        </span>
        <el-button class="page-hero__btn" @click="reload">刷新</el-button>
      </template>
    </page-hero>

    <!-- 发货记录列表 -->
    <div class="base-table">
      <el-table
        :data="store.claims"
        v-loading="loading"
        border
        stripe
        size="small"
        empty-text="暂无发货记录"
      >
        <el-table-column
          prop="taskTitle"
          label="任务"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column
          prop="userName"
          label="用户"
          width="100"
          show-overflow-tooltip
        />
        <el-table-column
          prop="itemName"
          label="物品"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="statusType(row.status)">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="trackingNo"
          label="运单号"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'PENDING_SHIP'"
              v-permission="'system:task:operate'"
              type="primary"
              link
              @click="openShip(row)"
              >发货</el-button
            >
            <span v-else class="muted">-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="shipVisible" title="填写发货信息" width="420px">
      <el-form label-width="88px">
        <el-form-item label="物流公司" required>
          <el-input v-model="shipForm.company" placeholder="如：顺丰 / 中通" />
        </el-form-item>
        <el-form-item label="运单号" required>
          <el-input v-model="shipForm.trackingNo" placeholder="请输入运单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="onShip"
          >确认发货</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { taskStore } from '@/stores/task'
import type { RewardClaimRecord } from '@/types/task'

const PageHero = defineAsyncComponent(
  () => import('@/components/base/PageHero/index.vue')
)

const store = taskStore()
const loading = ref(false)
const shipVisible = ref(false)
const submitting = ref(false)
const current = ref<RewardClaimRecord | null>(null)
const shipForm = reactive({
  company: '',
  trackingNo: ''
})

const STATUS_MAP: Record<string, string> = {
  PENDING_ADDRESS: '待填地址',
  PENDING_SHIP: '待发货',
  SHIPPED: '已发货',
  RECEIVED: '已签收'
}

function statusLabel(s: string) {
  return STATUS_MAP[s] || s
}

function statusType(s: string) {
  if (s === 'SHIPPED' || s === 'RECEIVED') return 'success'
  if (s === 'PENDING_SHIP') return 'warning'
  return 'info'
}

async function reload() {
  loading.value = true
  try {
    await store.loadClaims()
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function openShip(row: RewardClaimRecord) {
  current.value = row
  shipForm.company = ''
  shipForm.trackingNo = ''
  shipVisible.value = true
}

async function onShip() {
  if (!current.value || submitting.value) return
  if (!shipForm.company.trim() || !shipForm.trackingNo.trim()) {
    ElMessage.warning('请填写物流公司与运单号')
    return
  }
  submitting.value = true
  try {
    await store.shipReward({
      claimId: current.value.id,
      logisticsCompany: shipForm.company.trim(),
      trackingNo: shipForm.trackingNo.trim()
    })
    ElMessage.success('发货成功')
    shipVisible.value = false
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '发货失败')
  } finally {
    submitting.value = false
  }
}

onMounted(reload)
</script>

<style scoped lang="less">
/* 页面骨架与表格白卡样式统一由 .manage-page 全局类（g.less）接管；
   星夜页头样式统一由 PageHero 通用组件携带，本文件仅保留页面局部定制 */

/* ===== 单元格 ===== */
.muted {
  color: var(--el-text-color-placeholder);
}
</style>
