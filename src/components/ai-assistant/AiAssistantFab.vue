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
      <span class="fab-ring" aria-hidden="true" />
      <span class="fab-inner">
        <el-icon :size="22"><ChatDotRound /></el-icon>
      </span>
      <span class="fab-label">{{ $t('aiAssistant.fabLabel') }}</span>
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
  width: 58px;
  height: 58px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:active {
    cursor: grabbing;
  }

  &:hover {
    transform: scale(1.06);
    .fab-inner {
      box-shadow: 0 10px 28px rgba(64, 158, 255, 0.5);
    }
  }

  &.active {
    .fab-inner {
      background: linear-gradient(135deg, @ai-primary-dark, @ai-primary);
      transform: rotate(-8deg) scale(0.96);
    }
    .fab-ring {
      opacity: 0;
    }
    &.pulse .fab-ring {
      animation: none;
    }
  }

  &.pulse .fab-ring {
    animation: ai-fab-pulse 2.2s ease-out infinite;
  }
}

.fab-ring {
  position: absolute;
  inset: -4px;
  border-radius: @ai-radius-full;
  border: 2px solid fade(@ai-primary, 35%);
  opacity: 0.7;
  pointer-events: none;
}

.fab-inner {
  position: relative;
  z-index: 1;
  width: 52px;
  height: 52px;
  border-radius: @ai-radius-full;
  background: @ai-gradient;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: @ai-shadow-fab;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease;
}

.fab-label {
  position: absolute;
  bottom: -18px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: @ai-primary-dark;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
  line-height: 1;
  pointer-events: none;
}

@keyframes ai-fab-pulse {
  0% {
    transform: scale(1);
    opacity: 0.75;
  }
  70% {
    transform: scale(1.35);
    opacity: 0;
  }
  100% {
    transform: scale(1.35);
    opacity: 0;
  }
}
</style>
