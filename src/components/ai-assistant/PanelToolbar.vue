<template>
  <AiTooltip
    :content="$t('aiAssistant.dragHint')"
    placement="top"
    :show-after="150"
    :disabled="dragging"
  >
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
            <span class="brand-icon">
              <el-icon :size="15"><AiRobotIcon /></el-icon>
            </span>
            <span class="toolbar-title">{{
              store.activeConversation?.title || $t('aiAssistant.title')
            }}</span>
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
  </AiTooltip>
</template>

<script setup lang="ts">
import {
  Fold,
  Expand,
  Folder,
  Refresh,
  Plus,
  Close
} from '@element-plus/icons-vue'
import { aiAssistantStore } from '@/stores/ai-assistant'
import AiRobotIcon from './AiRobotIcon.vue'
import AiTooltip from './AiTooltip.vue'

withDefaults(defineProps<{ dragging?: boolean }>(), { dragging: false })

defineEmits<{ 'reset-layout': [] }>()

const store = aiAssistantStore()

async function onNewChat() {
  await store.newConversation()
}
</script>

<style scoped lang="less">
@import './ai-variables.less';

// 夜色玻璃头：深夜纵向渐隐，让星域从消息区"透"上来
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
  opacity: 0.28;
  pointer-events: none;

  span {
    width: 24px;
    height: 4px;
    border-radius: @ai-radius-full;
    background: rgba(255, 255, 255, 0.35);
  }
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 0 1 auto;
  max-width: 40%;
}

.toolbar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

// 品牌徽标：主题渐变麦克风 chip
.brand-icon {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: @ai-gradient;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 2px 10px @ai-primary-fog,
    0 0 0 1px rgba(255, 255, 255, 0.14) inset;
}

.toolbar-title {
  font-weight: 600;
  font-size: 15px;
  color: @ai-text-strong;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  margin-left: auto;
}

// 实心玻璃 chip 按钮组：暗色头部上以底色+白发丝线描边立形，hover 以主题色图标唤起
// 选择器带 .el-button 提升特异性：防 EP .el-button.is-text（transparent 底/边/灰字）与
// .el-button.is-circle { width: 32px } 同级且后置的覆盖，导致 chip 样式失效
.el-button.toolbar-btn {
  width: 30px;
  height: 30px;
  color: @ai-text;
  background: @ai-fill-08;
  border: 1px solid rgba(255, 255, 255, 0.1);

  // hover：背景走中性白纱提亮一档（08→12），主题色收敛到图标+发丝描边的小面积。
  // 注意：EP 对 text 按钮的 hover 是 .el-button.is-text:not(.is-disabled):hover
  // { background-color: var(--el-fill-color-light) }（#f6f8fa 亮灰实底，暗玻璃上极刺眼），
  // 特异性 (0,4,0) 压过 .toolbar-btn:hover 的 (0,3,0)——:not(.is-disabled) 必须带上，
  // 补齐到同级再靠本文件后置加载夺回控制权
  &:not(.is-disabled):hover {
    color: @ai-primary-hover;
    background: @ai-fill-12;
    border-color: @ai-primary-tint;
  }

  // 按下：白纱再提一档；EP is-text 的 :active（--el-fill-color 同为亮灰实底）同样需 (0,4,0) 接管
  &:not(.is-disabled):active {
    background: @ai-fill-16;
  }

  // 关闭：同样中性白纱底，红色只保留在图标与发丝描边传递"销毁"语义
  &--close:not(.is-disabled):hover {
    color: #f87171;
    background: @ai-fill-12;
    border-color: rgba(248, 113, 113, 0.3);
  }
}
</style>
