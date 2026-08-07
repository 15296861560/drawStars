<template>
  <Teleport to="body">
    <AiAssistantFab />
    <AiAssistantPanel ref="panelComponentRef" />
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AiAssistantFab from './AiAssistantFab.vue'
import AiAssistantPanel from './AiAssistantPanel.vue'

const panelComponentRef = ref<InstanceType<typeof AiAssistantPanel> | null>(
  null
)
</script>

<style lang="less">
@import './ai-popper.global.less';
</style>
