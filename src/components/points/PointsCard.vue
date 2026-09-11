<template>
  <div class="points-card">
    <div class="points-balance">
      <div class="balance-info">
        <span class="label">可用积分</span>
        <span class="value">{{ formatPoints(availablePoints) }}</span>
      </div>
      <div v-if="currentLevel" class="level-info">
        <el-tag :type="levelTagType" size="small" effect="dark">
          {{ levelName }}
        </el-tag>
        <el-progress
          :percentage="progress"
          :stroke-width="6"
          :show-text="false"
          class="level-progress"
        />
        <span v-if="nextLevel" class="next-level-tip">
          距 {{ nextLevel.name }} 还需 {{ pointsToNextLevel() }} 积分
        </span>
      </div>
    </div>

    <div class="quick-actions">
      <el-button
        type="primary"
        :disabled="hasCheckedInToday"
        :loading="checkInLoading"
        @click="handleCheckIn"
      >
        {{ hasCheckedInToday ? '今日已签到' : '签到领积分' }}
      </el-button>
      <el-button @click="$emit('view-history')">积分明细</el-button>
      <el-button @click="$emit('view-rules')">积分规则</el-button>
    </div>

    <div v-if="consecutiveDays > 0" class="check-in-streak">
      <span class="streak-label">连续签到</span>
      <span class="streak-value">{{ consecutiveDays }} 天</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  usePointsAccount,
  useCheckIn,
  usePointsLevel,
  usePointsStatistics
} from '@/composables/usePoints'
import { userInfoStore } from '@/stores/user-info'

defineEmits<{
  'view-history': []
  'view-rules': []
}>()

const userStore = userInfoStore()
const { availablePoints, level, levelName } = usePointsAccount()
const { hasCheckedInToday, consecutiveDays, checkIn, loadStatus } = useCheckIn()
const { currentLevel, nextLevel, progress, pointsToNextLevel } =
  usePointsLevel()
const { formatPoints } = usePointsStatistics()

const checkInLoading = ref(false)

const levelTagType = computed(() => {
  const levelVal = level.value
  if (levelVal >= 5) return 'danger'
  if (levelVal >= 4) return 'warning'
  if (levelVal >= 3) return 'success'
  return 'info'
})

function resolveUserId() {
  return Number(userStore.getUserId) || 1
}

async function handleCheckIn() {
  if (hasCheckedInToday.value) return
  checkInLoading.value = true
  try {
    const result = await checkIn(resolveUserId())
    ElMessage.success(`签到成功！获得 ${result.points} 积分`)
  } catch (error: any) {
    const msg = error?.response?.data?.msg || error?.message || '签到失败'
    ElMessage.error(msg)
    // 后端已签到但前端状态未同步时，刷新状态避免重复点击
    if (String(msg).includes('今日已签到')) {
      try {
        await loadStatus(resolveUserId())
      } catch {
        /* ignore */
      }
    }
  } finally {
    checkInLoading.value = false
  }
}

onMounted(async () => {
  await loadStatus(resolveUserId())
})
</script>

<style scoped lang="less">
.points-card {
  padding: 20px;
  background: linear-gradient(135deg, #1d4e89 0%, #2a9d8f 100%);
  border-radius: 4px;
  color: #fff;

  .points-balance {
    margin-bottom: 20px;

    .balance-info {
      display: flex;
      align-items: baseline;
      gap: 10px;
      margin-bottom: 12px;

      .label {
        font-size: 14px;
        opacity: 0.85;
      }

      .value {
        font-size: 32px;
        font-weight: bold;
      }
    }

    .level-info {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;

      .level-progress {
        flex: 1;
        min-width: 100px;
      }

      .next-level-tip {
        font-size: 12px;
        opacity: 0.85;
      }
    }
  }

  .quick-actions {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
    flex-wrap: wrap;

    :deep(.el-button) {
      &--primary {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }

      &:not(.el-button--primary) {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
        color: #fff;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }

  .check-in-streak {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 8px;

    .streak-label {
      font-size: 12px;
      opacity: 0.85;
    }

    .streak-value {
      font-size: 16px;
      font-weight: bold;
    }
  }
}
</style>
