<template>
  <div class="task-achievements">
    <div class="page-toolbar">
      <div class="page-title">
        <h3>成就墙</h3>
        <p>展示已解锁与进行中的成就任务</p>
      </div>
      <el-button @click="reload">刷新</el-button>
    </div>

    <div v-loading="loading" class="wall">
      <div
        v-for="item in store.achievements"
        :key="item.id"
        class="ach-card"
        :class="stateOf(item)"
      >
        <div class="ach-icon">
          <el-icon :size="28"><Trophy /></el-icon>
        </div>
        <div class="ach-body">
          <div class="ach-title">{{ item.title }}</div>
          <div class="ach-tier">{{ tierLabel(item) }}</div>
          <div class="ach-desc">{{ item.description || '-' }}</div>
          <TaskProgress
            class="ach-progress"
            :current="item.userProgress?.currentCount || 0"
            :target="item.targetCount || 1"
            :percent="item.userProgress?.progressPercent"
          />
          <div class="ach-state">{{ stateLabel(item) }}</div>
        </div>
      </div>
      <el-empty
        v-if="!loading && !store.achievements.length"
        description="暂无成就"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Trophy } from '@element-plus/icons-vue'
import { taskStore } from '@/stores/task'
import type { Task } from '@/types/task'
import TaskProgress from '@/components/task/TaskProgress.vue'

const store = taskStore()
const loading = ref(false)

function stateOf(task: Task) {
  const s = task.userProgress?.status
  if (s === 'REWARD_CLAIMED' || s === 'COMPLETED') return 'completed'
  if (s === 'IN_PROGRESS' || s === 'SUBMITTED' || s === 'REWARD_PENDING') {
    return 'in-progress'
  }
  return 'locked'
}

function stateLabel(task: Task) {
  const k = stateOf(task)
  if (k === 'completed') return '已完成'
  if (k === 'in-progress') return '进行中'
  return '未解锁'
}

const TIER_LABELS = ['青铜', '白银', '黄金', '钻石', '王者']

function tierLabel(task: Task) {
  const d = task.difficulty || 1
  const idx = Math.min(Math.max(d - 1, 0), TIER_LABELS.length - 1)
  const progress = task.userProgress?.progressPercent ?? 0
  if (progress >= 100 || stateOf(task) === 'completed') {
    return TIER_LABELS[idx] + ' · 已达成'
  }
  if (stateOf(task) === 'in-progress') {
    return TIER_LABELS[idx] + ' · 进行中'
  }
  return TIER_LABELS[idx] + ' · 未解锁'
}

async function reload() {
  loading.value = true
  try {
    await store.loadAchievements()
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(reload)
</script>

<style scoped lang="less">
.task-achievements {
  padding: 16px;
  text-align: left;
}

.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

.wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  min-height: 160px;
}

.ach-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);

  &.locked {
    opacity: 0.55;
    filter: grayscale(0.4);
  }

  &.completed {
    border-color: var(--el-color-success-light-5);
  }

  &.in-progress {
    border-color: var(--el-color-primary-light-5);
  }
}

.ach-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ach-title {
  font-size: 15px;
  font-weight: 600;
}

.ach-tier {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-warning);
}

.ach-card.completed .ach-tier {
  color: var(--el-color-success);
}

.ach-card.locked .ach-tier {
  color: var(--el-text-color-placeholder);
}

.ach-desc {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

.ach-progress {
  margin-top: 10px;
}

.ach-state {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-color-primary);
}

.ach-card.locked .ach-state {
  color: var(--el-text-color-placeholder);
}

.ach-card.completed .ach-state {
  color: var(--el-color-success);
}
</style>
