<template>
  <header
    class="ai-panel-toolbar"
    @mousedown.stop
    @dblclick="$emit('reset-layout')"
  >
    <div class="toolbar-drag-hint" aria-hidden="true">
      <span /><span /><span />
    </div>
    <div class="toolbar-left">
      <AiTooltip :content="$t('aiAssistant.toggleSidebar')" placement="bottom">
        <el-button
          class="toolbar-btn"
          text
          circle
          @click="store.sidebarCollapsed = !store.sidebarCollapsed"
        >
          <el-icon><Fold v-if="!store.sidebarCollapsed" /><Expand v-else /></el-icon>
        </el-button>
      </AiTooltip>
      <div class="toolbar-brand">
        <span class="brand-icon">
          <el-icon><MagicStick /></el-icon>
        </span>
        <span class="toolbar-title">{{ store.activeConversation?.title || $t('aiAssistant.title') }}</span>
      </div>
    </div>
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
      <AiTooltip :content="$t('aiAssistant.resetPosition')" placement="bottom">
        <el-button class="toolbar-btn" text circle @click="$emit('reset-layout')">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </AiTooltip>
      <AiTooltip :content="$t('aiAssistant.newChat')" placement="bottom">
        <el-button class="toolbar-btn toolbar-btn--primary" circle @click="onNewChat">
          <el-icon><Plus /></el-icon>
        </el-button>
      </AiTooltip>
      <AiTooltip :content="$t('aiAssistant.close')" placement="bottom">
        <el-button class="toolbar-btn toolbar-btn--close" text circle @click="store.closePanel()">
          <el-icon><Close /></el-icon>
        </el-button>
      </AiTooltip>
    </div>
    <span class="toolbar-hint">{{ $t('aiAssistant.dragHint') }}</span>
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
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px 8px;
  border-bottom: 1px solid @ai-border;
  cursor: move;
  user-select: none;
  flex-shrink: 0;
  background: @ai-gradient-soft;
  position: relative;
}

.toolbar-drag-hint {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 3px;
  opacity: 0.35;
  pointer-events: none;

  span {
    width: 20px;
    height: 3px;
    border-radius: 2px;
    background: @ai-text-muted;
  }
}

.toolbar-hint {
  position: absolute;
  bottom: 2px;
  right: 12px;
  font-size: 10px;
  color: @ai-text-muted;
  pointer-events: none;
  opacity: 0.85;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.toolbar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.brand-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: @ai-radius-sm;
  background: @ai-gradient;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.35);
}

.toolbar-title {
  font-weight: 600;
  font-size: 14px;
  color: @ai-text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

  &--primary {
    background: @ai-gradient !important;
    color: #fff !important;
    border: none;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.35);

    &:hover {
      opacity: 0.92;
      color: #fff !important;
    }
  }

  &--close:hover {
    color: #f56c6c;
    background: fade(#f56c6c, 8%);
  }
}
</style>
