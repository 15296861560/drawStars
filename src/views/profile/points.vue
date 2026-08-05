<template>
  <div class="points-page g-list-vertical">
    <points-card
      class="mb20"
      @view-history="showHistory = true"
      @view-rules="showRules = true"
    />

    <el-row :gutter="16" class="stats-row mb20" v-loading="statsLoading">
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover">
          <div class="stat-label">今日获得</div>
          <div class="stat-value">{{ statistics.todayEarned }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover">
          <div class="stat-label">本月获得</div>
          <div class="stat-value">{{ statistics.monthEarned }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover">
          <div class="stat-label">即将过期</div>
          <div class="stat-value warn">
            {{ statistics.expiringPoints }}
            <span class="stat-extra">{{ statistics.expiringDays }}天内</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  border-radius: 4px;
}

.mb20 {
  margin-bottom: 20px;
}

.stats-row {
  padding: 0 16px 16px;
  box-sizing: border-box;
  margin-left: 0 !important;
  margin-right: 0 !important;
  width: 100%;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;

  &.warn {
    color: #e6a23c;
  }

  .stat-extra {
    margin-left: 8px;
    font-size: 12px;
    font-weight: 400;
    color: #909399;
  }
}
</style>
