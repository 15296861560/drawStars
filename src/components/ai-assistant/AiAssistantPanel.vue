<template>
  <Transition name="ai-panel">
    <div
      v-show="store.panelOpen"
      ref="panelRef"
      class="ai-assistant-panel"
      :style="panelStyle"
    >
      <PanelToolbar :dragging="drag.isDragging.value" @reset-layout="resetLayout" />
      <div class="ai-panel-body">
        <ConversationSidebar />
        <div class="ai-panel-main">
          <MessageList />
          <ChatInput ref="chatInputRef" />
        </div>
      </div>
      <AiTooltip
        :content="$t('aiAssistant.resize')"
        placement="top-end"
        :disabled="resize.isResizing.value"
      >
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
import { ttsSupported } from '@/composables/useTts'
import { trackEvent } from '@/plugins/tracker'

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

/** TTS 引擎不可用一次性埋点（每次前端会话仅上报一次，PRD 附录 B） */
let ttsUnavailableTracked = false
function ensureTtsUnavailableTracked() {
  if (ttsUnavailableTracked) return
  ttsUnavailableTracked = true
  if (!ttsSupported()) trackEvent('module_open_ai_tts_unavailable')
}

watch(
  () => store.panelOpen,
  open => {
    if (open) {
      applyLayoutFromStore()
      if (!store.conversations.length) store.loadConversations()
      ensureTtsUnavailableTracked()
    }
  }
)

watch(
  size,
  () => {
    clampPanelToViewport()
  },
  { deep: true }
)

defineExpose({ resetLayout, panelRef, focusInput })
</script>

<style scoped lang="less">
@import './ai-variables.less';

// 夜色玻璃容器：深夜幕布底 + 顶部主题色极光晕染 + 双层星域
.ai-assistant-panel {
  position: fixed;
  z-index: @ai-z-panel;
  display: flex;
  flex-direction: column;
  background:
    // 顶缘一抹主题色极光（随主题变化）
    radial-gradient(140% 90% at 80% -12%, @ai-primary-veil 0%, transparent 62%),
    @ai-bg-panel;
  border-radius: @ai-radius-xl;
  box-shadow: @ai-shadow-panel;
  overflow: hidden;
  min-width: 400px;
  min-height: 360px;
  backdrop-filter: blur(24px) saturate(1.35);
  -webkit-backdrop-filter: blur(24px) saturate(1.35);

  // 星域 A/B 两层：错相位闪烁，垫在内容之下
  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  &::before {
    .ai-starfield-a();
    animation: ai-star-twinkle 5s ease-in-out infinite;
  }

  &::after {
    .ai-starfield-b();
    animation: ai-star-twinkle 7.5s ease-in-out 2.5s infinite;
  }

  // 内容层压在星域之上
  &:deep(.ai-panel-toolbar) {
    position: relative;
    z-index: 2;
    // 表头外层是 AiTooltip 的 inline-flex 触发层（块化为行向 flex），
    // header 会按内容收缩；铺满宽度才能恢复整条头部的渐变背景与把手居中
    width: 100%;
  }
}

.ai-panel-body {
  position: relative;
  z-index: 1;
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
    border-right: 2px solid @ai-primary-fog;
    border-bottom: 2px solid @ai-primary-fog;
    border-bottom-right-radius: @ai-radius-md;
    transition: border-color 0.2s;
  }

  &:hover .resize-grip {
    border-color: @ai-primary-hover;
  }
}

.ai-panel-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}
.ai-panel-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.22s ease;
}
.ai-panel-enter-from,
.ai-panel-leave-to {
  opacity: 0;
  transform: scale(0.94) translateY(16px);
}
</style>
