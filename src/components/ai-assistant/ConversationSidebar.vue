<template>
  <aside class="ai-sidebar" :class="{ collapsed: store.sidebarCollapsed }">
    <div class="ai-sidebar-inner" v-show="!store.sidebarCollapsed">
      <div class="sidebar-header">
        <span class="sidebar-title">{{ $t('aiAssistant.title') }}</span>
      </div>
      <template v-if="store.groupExpanded">
        <div v-for="key in groupKeys" :key="key" class="ai-conv-group">
          <div
            v-if="store.groupedConversations[key]?.length"
            class="group-label"
          >
            {{ $t(`aiAssistant.group.${key}`) }}
          </div>
          <div
            v-for="conv in store.groupedConversations[key]"
            :key="conv.id"
            class="conv-item"
            :class="{ active: conv.id === store.activeConversationId }"
            @click="onSelect(conv.id)"
          >
            <el-icon class="conv-icon"><ChatLineRound /></el-icon>
            <div class="conv-text">
              <div class="conv-title">{{ conv.title }}</div>
              <div class="conv-preview">{{ conv.preview }}</div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div
          v-for="conv in store.conversations"
          :key="conv.id"
          class="conv-item"
          :class="{ active: conv.id === store.activeConversationId }"
          @click="onSelect(conv.id)"
        >
          <el-icon class="conv-icon"><ChatLineRound /></el-icon>
          <div class="conv-text">
            <div class="conv-title">{{ conv.title }}</div>
            <div class="conv-preview">{{ conv.preview }}</div>
          </div>
        </div>
      </template>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ChatLineRound } from '@element-plus/icons-vue'
import { aiAssistantStore } from '@/stores/ai-assistant'

const store = aiAssistantStore()
const groupKeys = ['today', 'yesterday', 'earlier'] as const

function onSelect(id: string) {
  if (store.activeConversationId === id || store.loading) return
  store.selectConversation(id)
}
</script>

<style scoped lang="less">
@import './ai-variables.less';

.ai-sidebar {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid @ai-border;
  background: @ai-bg-sidebar;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &.collapsed {
    width: 0;
    border-right: none;
  }
}

.ai-sidebar-inner {
  height: 100%;
  overflow-y: auto;
  padding: 10px 8px 12px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: @ai-radius-full;
  }
}

.sidebar-header {
  padding: 6px 10px 12px;
}

.sidebar-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: @ai-text-muted;
}

.group-label {
  font-size: 11px;
  font-weight: 500;
  color: @ai-text-muted;
  padding: 12px 10px 6px;
}

.conv-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: @ai-radius-md;
  cursor: pointer;
  margin-bottom: 2px;
  border: none;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  &.active {
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);

    .conv-icon {
      color: @ai-primary;
    }

    .conv-title {
      color: @ai-text;
      font-weight: 600;
    }
  }
}

.conv-icon {
  flex-shrink: 0;
  margin-top: 1px;
  font-size: 16px;
  color: @ai-text-muted;
  transition: color 0.15s;
}

.conv-text {
  min-width: 0;
  flex: 1;
}

.conv-title {
  font-size: 13px;
  font-weight: 600;
  color: @ai-text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conv-preview {
  font-size: 11px;
  color: @ai-text-muted;
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.35;
}
</style>
