<template>
  <el-tooltip
    :content="
      store.panelOpen ? $t('aiAssistant.fabClose') : $t('aiAssistant.fabOpen')
    "
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
        <el-icon :size="24"><AiRobotIcon /></el-icon>
      </span>
    </div>
  </el-tooltip>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import AiRobotIcon from './AiRobotIcon.vue'
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

// 主题色极光呼吸球：极简夜色光环 + 单色系主题渐变
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
      opacity: 0.6;
      transform: scale(1.18);
    }

    .fab-inner {
      box-shadow:
        0 8px 28px @ai-primary-fog,
        0 0 0 1px rgba(255, 255, 255, 0.28) inset,
        0 0 0 8px @ai-primary-veil;
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

// 夜色中的主题色晕染
.fab-glow {
  position: absolute;
  inset: -10px;
  border-radius: @ai-radius-full;
  background: radial-gradient(
    circle,
    @ai-primary-glow 0%,
    @ai-primary-fog 28%,
    transparent 70%
  );
  opacity: 0.4;
  pointer-events: none;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

// 外圈细描光环（待唤时脉冲扩散）
.fab-ring {
  position: absolute;
  inset: -3px;
  border-radius: @ai-radius-full;
  border: 1.5px solid @ai-primary-fog;
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
  animation: ai-orb-breathe 4.5s ease-in-out infinite;
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
    rgba(255, 255, 255, 0.32) 50%,
    transparent 70%
  );
  background-size: 200% 100%;
  animation: ai-shimmer 3s ease-in-out infinite;
  pointer-events: none;
}
</style>
