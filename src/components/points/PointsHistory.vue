<template>
  <el-dialog
    v-model="visible"
    title="积分明细"
    width="1800px"
    top="4vh"
    class="points-history-dialog"
    :close-on-click-modal="false"
  >
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="filterType" placeholder="交易类型" clearable @change="handleFilter">
        <el-option label="全部" value="" />
        <el-option label="获取" value="EARN" />
        <el-option label="消费" value="SPEND" />
        <el-option label="调整" value="ADJUST" />
      </el-select>
      <el-select v-model="filterSource" placeholder="积分来源" clearable @change="handleFilter">
        <el-option label="全部" value="" />
        <el-option label="签到" value="CHECK_IN" />
        <el-option label="消费" value="PURCHASE" />
        <el-option label="邀请" value="INVITE_FRIEND" />
        <el-option label="任务" value="COMPLETE_TASK" />
        <el-option label="活动" value="EVENT_REWARD" />
        <el-option label="管理员调整" value="ADMIN_ADJUST" />
      </el-select>
    </div>

    <!-- 交易列表 -->
    <el-table
      :data="transactions"
      v-loading="loading"
      style="width: 100%"
      max-height="720"
    >
      <el-table-column label="时间" width="160">
        <template #default="{ row }">
          {{ formatTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="描述" prop="description" />
      <el-table-column label="来源" width="110">
        <template #default="{ row }">
          {{ pointsSourceLabel(row.source) }}
        </template>
      </el-table-column>
      <el-table-column label="操作人" width="100">
        <template #default="{ row }">
          {{ row.operatorName || (row.source === 'ADMIN_ADJUST' ? row.operatorId || '-' : '-') }}
        </template>
      </el-table-column>
      <el-table-column label="类型" width="80">
        <template #default="{ row }">
          <el-tag
            :type="row.type === 'SPEND' ? 'danger' : row.type === 'ADJUST' ? 'warning' : 'success'"
            size="small"
          >
            {{ row.type === 'EARN' ? '获得' : row.type === 'SPEND' ? '消费' : row.type === 'ADJUST' ? '调整' : row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="积分" width="100" align="right">
        <template #default="{ row }">
          <span :class="row.points > 0 ? 'text-success' : 'text-danger'">
            {{ row.points > 0 ? '+' : '' }}{{ row.points }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="余额" width="100" align="right">
        <template #default="{ row }">
          {{ row.balanceAfter }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleFilter"
        @current-change="handleFilter"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePointsTransactions } from '@/composables/usePoints'
import type { PointsSource } from '@/types/points'
import { userInfoStore } from '@/stores/user-info'
import { pointsSourceLabel } from '@/utils/points-labels'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const userStore = userInfoStore()
const { transactions, loading, load } = usePointsTransactions()

const filterType = ref('')
const filterSource = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function handleFilter() {
  const result = await load({
    userId: Number(userStore.getUserId) || undefined,
    page: currentPage.value,
    pageSize: pageSize.value,
    type: filterType.value || undefined,
    source: (filterSource.value as PointsSource) || undefined
  })
  total.value = result.total
}

watch(visible, (val) => {
  if (val) {
    handleFilter()
  }
})
</script>

<style scoped lang="less">
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.text-success {
  color: #67c23a;
  font-weight: bold;
}

.text-danger {
  color: #f56c6c;
  font-weight: bold;
}
</style>

<style lang="less">
.points-history-dialog {
  max-width: 96vw;

  .el-dialog__header {
    .el-dialog__title {
      font-size: 20px;
      font-weight: 700;
      line-height: 1.4;
    }
  }

  .el-dialog__body {
    min-height: 780px;
  }
}
</style>
