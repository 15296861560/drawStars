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
// 品牌卡：星夜 -> 靛蓝渐变 + 白色星点微光
.points-card {
  position: relative;
  padding: 1.5rem;
  overflow: hidden;
  color: var(--ds-night-text-active);
  background: linear-gradient(
    135deg,
    var(--ds-night-deep),
    var(--ds-primary-active)
  );
  border-radius: var(--ds-radius-lg);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(
        circle at 84% 18%,
        rgba(255, 255, 255, 0.85) 0 1.5px,
        transparent 2px
      ),
      radial-gradient(
        circle at 72% 64%,
        rgba(255, 255, 255, 0.5) 0 1px,
        transparent 1.5px
      ),
      radial-gradient(
        circle at 10% 78%,
        rgba(255, 255, 255, 0.6) 0 1.5px,
        transparent 2px
      ),
      radial-gradient(
        circle at 26% 12%,
        rgba(255, 255, 255, 0.45) 0 1px,
        transparent 1.5px
      ),
      radial-gradient(
        circle at 95% 55%,
        rgba(255, 255, 255, 0.35) 0 1px,
        transparent 1.5px
      );
  }

  .points-balance {
    position: relative;
    margin-bottom: 1.25rem;

    .balance-info {
      display: flex;
      align-items: baseline;
      gap: 0.625rem;
      margin-bottom: 0.75rem;

      .label {
        font-size: @ds-font-md;
        opacity: 0.85;
      }

      .value {
        font-size: 2rem;
        font-weight: bold;
        line-height: 1.1;
      }
    }

    .level-info {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      flex-wrap: wrap;

      .level-progress {
        flex: 1;
        min-width: 6.25rem;

        :deep(.el-progress-bar__outer) {
          background-color: rgba(255, 255, 255, 0.15);
        }
      }

      .next-level-tip {
        font-size: @ds-font-xs;
        opacity: 0.85;
      }
    }
  }

  .quick-actions {
    position: relative;
    display: flex;
    gap: 0.625rem;
    margin-bottom: 1rem;
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
        color: var(--ds-night-text-active);

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }

  .check-in-streak {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.12);
    border-radius: var(--ds-radius-md);

    .streak-label {
      font-size: @ds-font-xs;
      opacity: 0.85;
    }

    .streak-value {
      font-size: @ds-font-lg;
      font-weight: bold;
    }
  }
}
</style>
