<template>
  <div class="im-conv-list">
    <div class="im-conv-search">
      <el-input
        v-model="keyword"
        placeholder="搜索会话"
        :prefix-icon="Search"
        clearable
        size="small"
      />
    </div>
    <el-scrollbar class="im-conv-scroll">
      <ImListRow
        v-for="conv in filtered"
        :key="conv.id"
        :name="conv.title || conv.bizId || '会话'"
        :badge="conv.unreadCount || 0"
        :active="conv.id === activeId"
        :online="false"
        @click="onSelect(conv)"
      >
        <template #sub>
          <span v-if="conv.isMuted" class="im-conv-mute">🔇</span>
          <span v-if="draft(conv.id)" class="im-conv-draft">{{ draft(conv.id) }}</span>
        </template>
        <template #tag>
          <span v-if="conv.isPinned" class="im-conv-pin">📌</span>
        </template>
      </ImListRow>
      <el-empty v-if="!filtered.length" description="暂无会话" :image-size="60" />
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { defineAsyncComponent } from 'vue'
import { imConversationStore } from '@/stores/im/im-conversation'
import type { ImConversation } from '@/api/im/types'

const ImListRow = defineAsyncComponent(() => import('@/components/im/ImListRow.vue'))

const store = imConversationStore()

const keyword = ref('')
const activeId = computed(() => store.activeId)
const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return store.sortedList
  return store.sortedList.filter(c => (c.title || c.bizId || '').toLowerCase().includes(kw))
})

function draft(id: string): string {
  return store.draftMap[id] || ''
}

function onSelect(conv: ImConversation) {
  store.setActive(conv.id)
}

defineExpose({ refresh: () => store.fetchList() })
</script>

<style scoped lang="less">
.im-conv-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: @color-bg;
}
.im-conv-search {
  padding: 8px;
}
.im-conv-scroll {
  flex: 1;
}
.im-conv-pin {
  font-size: 12px;
}
.im-conv-draft {
  color: @color-danger;
  &::before {
    content: '草稿：';
  }
}
</style>
