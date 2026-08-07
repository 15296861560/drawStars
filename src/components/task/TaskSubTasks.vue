<template>
  <div class="task-subtasks">
    <div
      v-for="item in items"
      :key="item.id"
      class="subtask-row"
      :class="{ done: isDone(item.id) }"
    >
      <div class="subtask-main">
        <el-icon v-if="isDone(item.id)" class="done-icon" :size="16">
          <CircleCheck />
        </el-icon>
        <span class="subtask-title">{{ item.title }}</span>
        <el-tag v-if="isDone(item.id)" size="small" type="success"
          >已完成</el-tag
        >
      </div>
      <el-button
        v-if="!isDone(item.id) && canComplete"
        type="primary"
        link
        :loading="loadingId === item.id"
        @click="$emit('complete', item.id)"
      >
        完成
      </el-button>
    </div>
    <el-empty v-if="!items.length" description="暂无子任务" :image-size="48" />
  </div>
</template>

<script setup lang="ts">
import { CircleCheck } from '@element-plus/icons-vue'
import type { TaskSubTask } from '@/types/task'

const props = defineProps<{
  items: TaskSubTask[]
  completedIds?: number[]
  canComplete?: boolean
  loadingId?: number | null
}>()

defineEmits<{
  complete: [subTaskId: number]
}>()

function isDone(id: number) {
  return (props.completedIds || []).includes(id)
}
</script>

<style scoped lang="less">
.task-subtasks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subtask-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-fill-color-blank);

  &.done {
    opacity: 0.85;
    background: var(--el-color-success-light-9);
    border-color: var(--el-color-success-light-7);
  }
}

.subtask-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.done-icon {
  color: var(--el-color-success);
  flex-shrink: 0;
}

.subtask-title {
  font-size: 13px;
  word-break: break-word;
}
</style>
