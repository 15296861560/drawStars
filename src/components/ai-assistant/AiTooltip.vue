<template>
  <el-tooltip
    :content="content"
    :placement="placement"
    :show-after="showAfter"
    :hide-after="hideAfter"
    :disabled="disabled"
    teleported
    append-to="body"
    popper-class="ai-assistant-popper"
    v-bind="$attrs"
  >
    <span class="ai-tooltip-trigger" @click.stop @mousedown.stop>
      <slot />
    </span>
  </el-tooltip>
</template>

<script setup lang="ts">
import type { Placement } from 'element-plus'

withDefaults(
  defineProps<{
    content?: string
    placement?: Placement
    showAfter?: number
    hideAfter?: number
    disabled?: boolean
  }>(),
  {
    placement: 'top',
    showAfter: 350,
    hideAfter: 80
  }
)
</script>
