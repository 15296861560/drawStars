<template>
  <Transition name="ai-panel">
    <div
      v-show="store.panelOpen"
      ref="panelRef"
      class="ai-assistant-panel"
      :style="panelStyle"
    >
      <PanelToolbar @reset-layout="resetLayout" />
      <div class="ai-panel-body">
        <ConversationSidebar />
        <div class="ai-panel-main">
          <MessageList />
          <ChatInput ref="chatInputRef" />
        </div>
      </div>
      <AiTooltip :content="$t('aiAssistant.resize')" placement="top-end">
        <div class="ai-resize-handle" @mousedown="resize.onDown">
          <span class="resize-grip" />
        </div>
      </AiTooltip>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { aiAssistantStore } from '@/stores/ai-assistant'
import { useBoundaryDrag } from '@/composables/useBoundaryDrag'
import { useBoundaryResize } from '@/composables/useBoundaryResize'
import { useAiAssistantInteraction } from '@/composables/useAiAssistantInteraction'
import PanelToolbar from './PanelToolbar.vue'
import ConversationSidebar from './ConversationSidebar.vue'
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'
import AiTooltip from './AiTooltip.vue'

const store = aiAssistantStore()
const panelRef = ref<HTMLElement | null>(null)
const toolbarRef = ref<HTMLElement | null>(null)
const chatInputRef = ref<InstanceType<typeof ChatInput> | null>(null)

const position = ref({ x: 0, y: 0 })
const size = ref({
  width: store.panelLayout.width,
  height: store.panelLayout.height
})

const MARGIN = 8
const HEADER_RESERVE = 56

function resolveDefaultPosition() {
  const w = size.value.width
  const h = size.value.height
  const fab = store.fabPosition
  const fabX = fab.x >= 0 ? fab.x : window.innerWidth - 72
  const fabY = fab.y >= 0 ? fab.y : window.innerHeight - 72
  let x = fabX - w - 16
  let y = fabY - h + 48
  if (x < MARGIN) x = MARGIN
  if (y < MARGIN + HEADER_RESERVE) y = MARGIN + HEADER_RESERVE
  if (x + w > window.innerWidth - MARGIN) {
    x = window.innerWidth - w - MARGIN
  }
  if (y + h > window.innerHeight - MARGIN) {
    y = window.innerHeight - h - MARGIN
  }
  return { x, y }
}

function clampPanelToViewport() {
  const maxX = window.innerWidth - size.value.width - MARGIN
  const maxY = window.innerHeight - size.value.height - MARGIN
  const minY = MARGIN + HEADER_RESERVE
  position.value = {
    x: Math.min(Math.max(MARGIN, position.value.x), Math.max(MARGIN, maxX)),
    y: Math.min(Math.max(minY, position.value.y), Math.max(minY, maxY))
  }
  persistLayout()
}

function applyLayoutFromStore() {
  const layout = store.panelLayout
  size.value = { width: layout.width, height: layout.height }
  if (layout.x >= 0 && layout.y >= 0) {
    position.value = { x: layout.x, y: layout.y }
  } else {
    position.value = resolveDefaultPosition()
  }
  clampPanelToViewport()
}

function persistLayout() {
  store.setPanelLayout({
    x: position.value.x,
    y: position.value.y,
    width: size.value.width,
    height: size.value.height
  })
}

const panelStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  width: `${size.value.width}px`,
  height: `${size.value.height}px`
}))

const drag = useBoundaryDrag({
  targetRef: panelRef,
  handleRef: toolbarRef,
  position,
  size,
  boundary: () => ({
    left: MARGIN,
    top: MARGIN + HEADER_RESERVE,
    width: window.innerWidth - MARGIN * 2,
    height: window.innerHeight - MARGIN * 2
  }),
  onDragEnd: persistLayout
})

const resize = useBoundaryResize({
  position,
  size,
  minWidth: 400,
  minHeight: 360,
  maxWidth: () => window.innerWidth - position.value.x - MARGIN,
  maxHeight: () => window.innerHeight - position.value.y - MARGIN,
  onResizeEnd: persistLayout
})

function resetLayout() {
  store.resetPanelLayout()
  applyLayoutFromStore()
  persistLayout()
}

function focusInput() {
  chatInputRef.value?.focus?.()
}

useAiAssistantInteraction(panelRef, {
  focusInput,
  clampPanel: clampPanelToViewport
})

onMounted(() => {
  applyLayoutFromStore()
  nextTick(() => {
    toolbarRef.value = panelRef.value?.querySelector(
      '.ai-panel-toolbar'
    ) as HTMLElement | null
    drag.bind()
  })
})

watch(
  () => store.panelOpen,
  open => {
    if (open) {
      applyLayoutFromStore()
      if (!store.conversations.length) store.loadConversations()
    }
  }
)

watch(size, () => {
  clampPanelToViewport()
}, { deep: true })

defineExpose({ resetLayout, panelRef, focusInput })
</script>

<style scoped lang="less">
@import './ai-variables.less';

.ai-assistant-panel {
  position: fixed;
  z-index: @ai-z-panel;
  display: flex;
  flex-direction: column;
  background: @ai-bg-panel;
  border-radius: @ai-radius-lg;
  box-shadow: @ai-shadow-panel;
  overflow: hidden;
  min-width: 400px;
  min-height: 360px;
  backdrop-filter: blur(12px);
}

.ai-panel-body {
  display: flex;
  flex: 1;
  min-height: 0;
  background: @ai-bg-chat;
}

.ai-panel-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: @ai-bg-chat;
}

.ai-resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 22px;
  height: 22px;
  cursor: se-resize;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 3px;
  z-index: 2;

  .resize-grip {
    width: 10px;
    height: 10px;
    border-right: 2px solid fade(@ai-primary, 50%);
    border-bottom: 2px solid fade(@ai-primary, 50%);
    border-bottom-right-radius: @ai-radius-md;
    transition: border-color 0.2s;
  }

  &:hover .resize-grip {
    border-color: @ai-primary;
  }
}

.ai-panel-enter-active {
  transition:
    opacity 0.22s ease,
    transform 0.28s cubic-bezier(0.34, 1.2, 0.64, 1);
}
.ai-panel-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.2s ease;
}
.ai-panel-enter-from,
.ai-panel-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(12px);
}
</style>
