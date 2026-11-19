<script setup lang="ts">
import { ref, watch } from 'vue'
import AiAssistantFab from './AiAssistantFab.vue'
import AiAssistantPanel from './AiAssistantPanel.vue'
import { aiAssistantStore } from '@/stores/ai-assistant'

const panelComponentRef = ref<InstanceType<typeof AiAssistantPanel> | null>(
  null
)

// 面板结构重（双栏会话、消息流、工具栏、搜索…），而 Host 常驻每个页面。
// 若面板随 Host 一起挂载（内部仅 v-show 开合），则所有页面始终背着
// 一整棵隐藏 DOM 的初始渲染与后续 patch 成本。
// 改为首次打开后才挂载，此后保留 DOM 让 v-show 平滑开合、状态不丢。
const hasOpened = ref(false)
watch(
  () => aiAssistantStore().panelOpen,
  open => {
    if (open) hasOpened.value = true
  }
)
</script>

<template>
  <Teleport to="body">
    <AiAssistantFab />
    <AiAssistantPanel v-if="hasOpened" ref="panelComponentRef" />
  </Teleport>
</template>

<style lang="less">
@import './ai-popper.global.less';
</style>
