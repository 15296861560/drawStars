<template>
  <header
    class="ai-panel-toolbar"
    @mousedown.stop
    @dblclick="$emit('reset-layout')"
  >
    <div class="toolbar-drag-hint" aria-hidden="true">
      <span /><span /><span />
    </div>
    <div class="toolbar-row">
      <div class="toolbar-left">
        <AiTooltip
          :content="$t('aiAssistant.toggleSidebar')"
          placement="bottom"
        >
          <el-button
            class="toolbar-btn"
            text
            circle
            @click="store.sidebarCollapsed = !store.sidebarCollapsed"
          >
            <el-icon
              ><Fold v-if="!store.sidebarCollapsed" /><Expand v-else
            /></el-icon>
          </el-button>
        </AiTooltip>
        <div class="toolbar-brand">
          <span class="toolbar-title">{{
            store.activeConversation?.title || $t('aiAssistant.title')
          }}</span>
        </div>
      </div>
      <span class="toolbar-hint">{{ $t('aiAssistant.dragHint') }}</span>
      <div class="toolbar-actions" @mousedown.stop>
        <AiTooltip :content="$t('aiAssistant.toggleGroup')" placement="bottom">
          <el-button
            class="toolbar-btn"
            text
            circle
            @click="store.groupExpanded = !store.groupExpanded"
          >
            <el-icon><Folder /></el-icon>
          </el-button>
        </AiTooltip>
        <AiTooltip
          :content="$t('aiAssistant.resetPosition')"
          placement="bottom"
        >
          <el-button
            class="toolbar-btn"
            text
            circle
            @click="$emit('reset-layout')"
          >
            <el-icon><Refresh /></el-icon>
          </el-button>
        </AiTooltip>
        <AiTooltip :content="$t('aiAssistant.newChat')" placement="bottom">
          <el-button class="toolbar-btn" text circle @click="onNewChat">
            <el-icon><Plus /></el-icon>
          </el-button>
        </AiTooltip>
        <AiTooltip :content="$t('aiAssistant.close')" placement="bottom">
          <el-button
            class="toolbar-btn toolbar-btn--close"
            text
            circle
            @click="store.closePanel()"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </AiTooltip>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import {
  Fold,
  Expand,
  Folder,
  Refresh,
  Plus,
  Close,
  MagicStick
} from '@element-plus/icons-vue'
import { aiAssistantStore } from '@/stores/ai-assistant'
import AiTooltip from './AiTooltip.vue'

defineEmits<{ 'reset-layout': [] }>()

const store = aiAssistantStore()

async function onNewChat() {
  await store.newConversation()
}
</script>

<style scoped lang="less">
@import './ai-variables.less';

.ai-panel-toolbar {
  display: flex;
  flex-direction: column;
  padding: 12px 14px 10px;
  border-bottom: 1px solid @ai-border;
  cursor: move;
  user-select: none;
  flex-shrink: 0;
  background: @ai-gradient-header;
  position: relative;
}

.toolbar-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.toolbar-drag-hint {
  position: absolute;
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  opacity: 0.3;
  pointer-events: none;

  span {
    width: 24px;
    height: 4px;
    border-radius: @ai-radius-full;
    background: @ai-text-muted;
  }
}

.toolbar-hint {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: 10px;
  color: @ai-text-muted;
  pointer-events: none;
  opacity: 0.85;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 4px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 0 1 auto;
  max-width: 38%;
}

.toolbar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.brand-icon {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: @ai-radius-sm;
  background: @ai-gradient;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.3);
}

.toolbar-title {
  font-weight: 600;
  font-size: 15px;
  color: @ai-text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.toolbar-btn {
  color: @ai-text-secondary;

  &:hover {
    color: @ai-primary;
    background: fade(@ai-primary, 8%);
  }

  &--close:hover {
    color: #f56c6c;
    background: fade(#f56c6c, 8%);
  }
}
</style>
