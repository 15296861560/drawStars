<template>
  <div class="fakeqr" aria-hidden="true" v-html="svg"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * 二维码占位组件：公众号 qr_code_url 未配置时的兜底展示，
 * 视觉密度与真码一致（原型 pages 的 drawFakeQR 移植），seed 决定模块图案。
 */
const props = withDefaults(defineProps<{ seed?: number }>(), { seed: 202611 })

function seededRng(seed: number) {
  let s = (seed >>> 0) || 1
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const svg = computed(() => {
  const n = 21
  const rng = seededRng(props.seed)
  let cells = ''
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const corner =
        (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)
      if (!corner && rng() > 0.52) {
        cells += `M${x} ${y}h1v1h-1z`
      } else if (corner) {
        const inRing =
          x === 0 ||
          y === 0 ||
          x === 6 ||
          y === 6 ||
          x === n - 1 ||
          y === 6 ||
          x === n - 7 ||
          y === 0 ||
          (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
          (x >= n - 5 && x <= n - 3 && y >= 2 && y <= 4) ||
          (x >= 2 && x <= 4 && y >= n - 5 && y <= n - 3)
        if (inRing) cells += `M${x} ${y}h1v1h-1z`
      }
    }
  }
  return `<svg viewBox="0 0 ${n} ${n}" fill="currentColor" shape-rendering="crispEdges"><path d="${cells}"/></svg>`
})
</script>
