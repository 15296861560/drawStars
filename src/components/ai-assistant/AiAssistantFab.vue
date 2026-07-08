<template>
  <el-tooltip
    :content="store.panelOpen ? $t('aiAssistant.fabClose') : $t('aiAssistant.fabOpen')"
    placement="left"
    :show-after="500"
    :disabled="suppressTooltip"
    teleported
    append-to="body"
    popper-class="ai-assistant-popper"
  >
    <div
      ref="fabRef"
      class="ai-assistant-fab"
      :class="{ active: store.panelOpen, pulse: !store.panelOpen }"
      :style="fabStyle"
      @click="onClick"
    >
      <span class="fab-glow" aria-hidden="true" />
      <span class="fab-ring" aria-hidden="true" />
      <span class="fab-inner">
        <span class="fab-shimmer" aria-hidden="true" />
        <el-icon :size="22"><ChatDotRound /></el-icon>
      </span>
    </div>
  </el-tooltip>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ChatDotRound } from '@element-plus/icons-vue'
import { aiAssistantStore } from '@/stores/ai-assistant'
import { useBoundaryDrag } from '@/composables/useBoundaryDrag'

const store = aiAssistantStore()
const fabRef = ref<HTMLElement | null>(null)
const suppressTooltip = ref(false)
const FAB_SIZE = 58
const MARGIN = 20

const position = ref({ x: 0, y: 0 })
const size = ref({ width: FAB_SIZE, height: FAB_SIZE })

function resolveFabPosition() {
  const p = store.fabPosition
  if (p.x >= 0 && p.y >= 0) {
    position.value = { x: p.x, y: p.y }
    return
  }
  position.value = {
    x: window.innerWidth - FAB_SIZE - MARGIN,
    y: window.innerHeight - FAB_SIZE - MARGIN
  }
}

const fabStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`
}))

const drag = useBoundaryDrag({
  targetRef: fabRef,
  position,
  size,
  boundary: () => ({
    left: MARGIN,
    top: MARGIN,
    width: window.innerWidth - MARGIN * 2,
    height: window.innerHeight - MARGIN * 2
  }),
  onDragEnd: () => store.setFabPosition({ ...position.value })
})

function onFabPointerDown() {
  suppressTooltip.value = true
}

function onFabPointerUp() {
  window.setTimeout(() => {
    suppressTooltip.value = false
  }, 400)
}

function onClick() {
  if (drag.hasMoved()) return
  store.togglePanel()
}

onMounted(() => {
  resolveFabPosition()
  nextTick(() => {
    drag.bind()
    const el = fabRef.value
    el?.addEventListener('mousedown', onFabPointerDown)
    el?.addEventListener('mouseup', onFabPointerUp)
  })
})

onBeforeUnmount(() => {
  const el = fabRef.value
  el?.removeEventListener('mousedown', onFabPointerDown)
  el?.removeEventListener('mouseup', onFabPointerUp)
})
</script>

<style scoped lang="less">
@import './ai-variables.less';

.ai-assistant-fab {
  position: fixed;
  z-index: @ai-z-fab;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:active {
    cursor: grabbing;
  }

  &:hover {
    transform: scale(1.08);

    .fab-glow {
      opacity: 0.55;
      transform: scale(1.15);
    }

    .fab-inner {
      box-shadow:
        0 8px 28px rgba(99, 102, 241, 0.45),
        0 0 0 1px rgba(255, 255, 255, 0.25) inset;
    }
  }

  &.active {
    .fab-inner {
      animation: none;
      transform: scale(0.94);
    }

    .fab-glow,
    .fab-ring {
      opacity: 0;
    }
  }

  &.pulse .fab-ring {
    animation: ai-fab-pulse 2.4s ease-out infinite;
  }
}

.fab-glow {
  position: absolute;
  inset: -8px;
  border-radius: @ai-radius-full;
  background: radial-gradient(circle, fade(@ai-accent, 40%) 0%, transparent 70%);
  opacity: 0.35;
  pointer-events: none;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fab-ring {
  position: absolute;
  inset: -3px;
  border-radius: @ai-radius-full;
  border: 1.5px solid fade(@ai-accent-soft, 45%);
  opacity: 0.6;
  pointer-events: none;
}

.fab-inner {
  position: relative;
  z-index: 1;
  width: 52px;
  height: 52px;
  border-radius: @ai-radius-full;
  background: @ai-gradient-orb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: @ai-shadow-fab;
  overflow: hidden;
  animation: ai-orb-glow 4s ease-in-out infinite;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.fab-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 30%,
    rgba(255, 255, 255, 0.35) 50%,
    transparent 70%
  );
  background-size: 200% 100%;
  animation: ai-shimmer 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes ai-fab-pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  70% {
    transform: scale(1.4);
    opacity: 0;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}
</style>
