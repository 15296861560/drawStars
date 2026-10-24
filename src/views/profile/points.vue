<template>
  <div class="points-page g-list-vertical pc-page">
    <div class="pc-page-title">我的积分</div>
    <points-card
      @view-history="showHistory = true"
      @view-rules="showRules = true"
    />

    <div v-loading="statsLoading" class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">今日获得</div>
        <div class="stat-value">{{ statistics.todayEarned }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">本月获得</div>
        <div class="stat-value">{{ statistics.monthEarned }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">即将过期</div>
        <div class="stat-value warn">
          {{ statistics.expiringPoints }}
          <span class="stat-extra">{{ statistics.expiringDays }}天内</span>
        </div>
      </div>
    </div>

    <points-history v-model="showHistory" />
    <points-rules v-model="showRules" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PointsCard from '@/components/points/PointsCard.vue'
import PointsHistory from '@/components/points/PointsHistory.vue'
import PointsRules from '@/components/points/PointsRules.vue'
import { usePointsInit, usePointsStatistics } from '@/composables/usePoints'
import { userInfoStore } from '@/stores/user-info'

const userStore = userInfoStore()
const showHistory = ref(false)
const showRules = ref(false)
const statsLoading = ref(false)
const { statistics, refresh } = usePointsStatistics()
const { init } = usePointsInit(Number(userStore.getUserId) || 1)

onMounted(async () => {
  await init()
  statsLoading.value = true
  try {
    await refresh(Number(userStore.getUserId) || 1)
  } finally {
    statsLoading.value = false
  }
})
</script>

<style scoped lang="less">
.points-page {
  gap: 1.25rem;

  .pc-page-title {
    margin-bottom: 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
    gap: 1rem;
  }

  .stat-card {
    padding: 1.25rem 1.5rem;
    background: var(--ds-bg);
    border: 1px solid @color-bg-divider;
    border-radius: var(--ds-radius-lg);
    transition:
      border-color var(--ds-duration-fast) var(--ds-ease-out),
      box-shadow var(--ds-duration-fast) var(--ds-ease-out);

    &:hover {
      border-color: var(--ds-primary);
      box-shadow: var(--ds-shadow-sm);
    }
  }

  .stat-label {
    margin-bottom: 0.5rem;
    font-size: @ds-font-sm;
    color: @color-text-secondary;
    text-align: left;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: @color-text-normal;
    text-align: left;

    &.warn {
      color: var(--ds-color-warning);
    }

    .stat-extra {
      margin-left: 0.5rem;
      font-size: @ds-font-xs;
      font-weight: 400;
      color: @color-text-placeholder;
    }
  }
}
</style>
