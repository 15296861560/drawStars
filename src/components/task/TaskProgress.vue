<template>
  <div class="task-progress">
    <el-progress
      :percentage="displayPercent"
      :stroke-width="8"
      :status="displayPercent >= 100 ? 'success' : undefined"
    />
    <div class="progress-meta">
      <span>{{ current }} / {{ target }}</span>
      <span>{{ displayPercent }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    current: number
    target: number
    percent?: number
  }>(),
  {
    current: 0,
    target: 1,
    percent: undefined
  }
)

const displayPercent = computed(() => {
  if (typeof props.percent === 'number' && !Number.isNaN(props.percent)) {
    return Math.min(100, Math.max(0, Math.round(props.percent)))
  }
  const t = Math.max(props.target || 1, 1)
  return Math.min(100, Math.max(0, Math.round((props.current / t) * 100)))
})
</script>

<style scoped lang="less">
.task-progress {
  width: 100%;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
