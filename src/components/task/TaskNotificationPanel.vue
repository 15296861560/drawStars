<template>
  <el-drawer
    :model-value="modelValue"
    title="任务通知"
    size="400px"
    destroy-on-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-loading="loading" class="notification-panel">
      <div
        v-for="item in store.notifications"
        :key="item.id"
        class="notify-item"
        :class="{ unread: !item.read }"
        @click="markRead(item)"
      >
        <div class="notify-title">
          <span>{{ item.title }}</span>
          <el-tag v-if="!item.read" size="small" type="danger">未读</el-tag>
        </div>
        <div class="notify-content">{{ item.content }}</div>
        <div class="notify-time">{{ formatTime(item.createdAt) }}</div>
      </div>
      <el-empty
        v-if="!loading && !store.notifications.length"
        description="暂无通知"
      />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { taskStore } from '@/stores/task'
import type { TaskNotification } from '@/types/task'

const props = defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [val: boolean]
}>()

const store = taskStore()
const loading = ref(false)

function formatTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('zh-CN')
}

async function load() {
  loading.value = true
  try {
    await store.loadNotifications()
  } catch (e: any) {
    ElMessage.error(e?.message || '加载通知失败')
  } finally {
    loading.value = false
  }
}

async function markRead(item: TaskNotification) {
  if (item.read) return
  try {
    await store.readNotification(item.id)
  } catch (e: any) {
    ElMessage.error(e?.message || '标记失败')
  }
}

watch(
  () => props.modelValue,
  open => {
    if (open) load()
  }
)
</script>

<style scoped lang="less">
.notification-panel {
  min-height: 200px;
}

.notify-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--el-fill-color-light);
  }

  &.unread {
    .notify-title span {
      font-weight: 600;
    }
  }
}

.notify-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 14px;
}

.notify-content {
  margin-top: 6px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.notify-time {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
</style>
