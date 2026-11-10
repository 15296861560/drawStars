<template>
  <div class="toast-points" :class="{ show: state.visible }" aria-live="polite">
    <span class="coin">✦</span>
    <span class="msg">{{ state.text }}</span>
  </div>
</template>

<script setup lang="ts">
import { pointsToastState as state } from './points-toast'
</script>
