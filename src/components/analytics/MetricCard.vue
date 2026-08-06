<template>
  <div class="metric-card" @click="$emit('click')">
    <div class="label">{{ label }}</div>
    <div class="body">
      <div class="value">{{ displayValue }}</div>
      <div
        v-if="change != null && !Number.isNaN(Number(change))"
        class="change"
        :class="changeClass"
      >
        <span class="arrow">{{ arrow }}</span>
        <span>{{ changeText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: number | string
  /** 环比绝对值变化 */
  change?: number
  /** 上期值，用于计算百分比变化；有则优先显示 % */
  previous?: number
  format?: 'number' | 'percent' | 'time'
  reverseColors?: boolean
}>()

defineEmits<{ (e: 'click'): void }>()

function formatNumber(n: number) {
  const abs = Math.abs(n)
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2).replace(/\.?0+$/, '')}m`
  if (abs >= 1e3) return `${(n / 1e3).toFixed(2).replace(/\.?0+$/, '')}k`
  if (Number.isInteger(n)) return String(n)
  return String(Math.round(n * 10) / 10)
}

function formatTime(seconds: number) {
  const s = Math.max(0, Math.round(seconds || 0))
  const m = Math.floor(s / 60)
  const r = s % 60
  if (m <= 0) return `${r}s`
  return `${m}m ${r}s`
}

const displayValue = computed(() => {
  const n = Number(props.value) || 0
  if (props.format === 'percent') return `${Math.round(n)}%`
  if (props.format === 'time') return formatTime(n)
  return formatNumber(n)
})

const percentChange = computed(() => {
  const change = Number(props.change) || 0
  if (props.previous != null && props.previous !== 0) {
    return (change / Math.abs(Number(props.previous))) * 100
  }
  if (props.format === 'percent') return change
  return change
})

const changeText = computed(() => {
  if (props.previous != null || props.format === 'percent') {
    return `${Math.abs(Math.round(percentChange.value))}%`
  }
  if (props.format === 'time') {
    return formatTime(Math.abs(Number(props.change) || 0))
  }
  return formatNumber(Math.abs(Number(props.change) || 0))
})

const arrow = computed(() => {
  const n =
    props.previous != null || props.format === 'percent'
      ? percentChange.value
      : Number(props.change) || 0
  if (n === 0) return '–'
  return n > 0 ? '↑' : '↓'
})

const changeClass = computed(() => {
  const n =
    props.previous != null || props.format === 'percent'
      ? percentChange.value
      : Number(props.change) || 0
  if (n === 0) return 'flat'
  const up = n > 0
  // 跳出率上升为坏
  if (props.reverseColors) return up ? 'bad' : 'good'
  return up ? 'good' : 'bad'
})
</script>

<style scoped lang="less">
.metric-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: 96px;
  padding: 12px 14px;
  cursor: pointer;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  background: #fff;
  box-sizing: border-box;
  text-align: center;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    border-color: #cacaca;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  }
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: #4b4b4b;
  white-space: nowrap;
  line-height: 1.2;
}

.body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  line-height: 1;
}

.value {
  font-size: 28px;
  line-height: 1.1;
  font-weight: 700;
  white-space: nowrap;
  color: #2c2c2c;
  letter-spacing: -0.02em;
}

.change {
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 4px;

  .arrow {
    font-size: 11px;
    line-height: 1;
  }

  &.good {
    color: #268e6c;
    background: rgba(38, 142, 108, 0.1);
  }
  &.bad {
    color: #d7373f;
    background: rgba(215, 55, 63, 0.1);
  }
  &.flat {
    color: #b3b3b3;
    background: #f5f5f5;
  }
}
</style>
