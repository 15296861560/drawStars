<template>
  <div class="task-card" @click="$emit('detail', task)">
    <div class="card-head">
      <div class="icon-wrap">
        <el-icon :size="22"><component :is="iconComp" /></el-icon>
      </div>
      <div class="head-main">
        <div class="title" :title="task.title">{{ task.title }}</div>
        <div class="tags">
          <el-tag v-if="task.category?.name" size="small" effect="plain">
            {{ task.category.name }}
          </el-tag>
          <el-tag size="small" type="info" effect="plain">
            {{ typeLabel }}
          </el-tag>
          <el-tag
            v-for="tag in task.tags || []"
            :key="tag"
            size="small"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
      <div class="difficulty" :title="'难度 ' + task.difficulty">
        <span
          v-for="n in 4"
          :key="n"
          class="star"
          :class="{ on: n <= task.difficulty }"
          >★</span
        >
      </div>
    </div>

    <TaskReward class="reward-row" :reward-config="task.rewardConfig" />

    <TaskProgress
      v-if="showProgress"
      class="progress-row"
      :current="progress.current"
      :target="progress.target"
      :percent="progress.percent"
    />

    <div class="card-foot" @click.stop>
      <el-button
        v-if="cta === 'accept'"
        type="primary"
        size="small"
        @click="$emit('accept', task)"
        >接取</el-button
      >
      <el-button
        v-else-if="cta === 'continue'"
        type="primary"
        plain
        size="small"
        @click="$emit('continue', task)"
        >继续</el-button
      >
      <el-button
        v-else-if="cta === 'claim'"
        type="warning"
        size="small"
        @click="$emit('claim', task)"
        >领取奖励</el-button
      >
      <el-button v-else-if="cta === 'done'" size="small" disabled
        >已完成</el-button
      >
      <el-button v-else size="small" @click="$emit('detail', task)"
        >详情</el-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Calendar,
  User,
  Share,
  Trophy,
  Guide,
  Document,
  Present,
  Reading
} from '@element-plus/icons-vue'
import type { Task } from '@/types/task'
import TaskProgress from './TaskProgress.vue'
import TaskReward from './TaskReward.vue'

const props = defineProps<{
  task: Task
}>()

defineEmits<{
  accept: [task: Task]
  continue: [task: Task]
  claim: [task: Task]
  detail: [task: Task]
}>()

const ICON_MAP: Record<string, any> = {
  calendar: Calendar,
  user: User,
  share: Share,
  trophy: Trophy,
  guide: Guide,
  survey: Document,
  invite: Present,
  book: Reading
}

const TYPE_LABEL: Record<string, string> = {
  DAILY: '日常',
  ONCE: '一次性',
  LIMITED: '限时',
  ACHIEVEMENT: '成就',
  CUSTOM: '自定义'
}

const iconComp = computed(() => ICON_MAP[props.task.icon || ''] || Trophy)

const typeLabel = computed(
  () => TYPE_LABEL[props.task.taskType] || props.task.taskType
)

const status = computed(() => props.task.userProgress?.status || 'NONE')

const showProgress = computed(() => {
  const s = status.value
  return (
    s === 'IN_PROGRESS' ||
    s === 'SUBMITTED' ||
    s === 'REWARD_PENDING' ||
    s === 'COMPLETED' ||
    s === 'REWARD_CLAIMED'
  )
})

const progress = computed(() => {
  const up = props.task.userProgress
  return {
    current: up?.currentCount ?? 0,
    target: up?.targetCount ?? props.task.targetCount ?? 1,
    percent: up?.progressPercent
  }
})

const cta = computed(() => {
  const s = status.value
  if (s === 'NONE' || s === 'ASSIGNED') return 'accept'
  if (s === 'IN_PROGRESS' || s === 'SUBMITTED') return 'continue'
  if (s === 'REWARD_PENDING' || s === 'COMPLETED') return 'claim'
  if (s === 'REWARD_CLAIMED') return 'done'
  return 'detail'
})
</script>

<style scoped lang="less">
.task-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  text-align: left;
  height: 100%;
  box-sizing: border-box;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
}

.card-head {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.head-main {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.difficulty {
  flex-shrink: 0;
  letter-spacing: 1px;
}

.star {
  color: var(--el-border-color);
  font-size: 12px;

  &.on {
    color: #f7ba2a;
  }
}

.reward-row,
.progress-row {
  margin-top: 0;
}

.card-foot {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}
</style>
