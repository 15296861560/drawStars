<template>
  <div class="metrics-table">
    <div class="header">
      <div class="title">{{ title }}</div>
      <div class="metric">{{ metricLabel || '访问' }}</div>
    </div>
    <div v-if="!rows.length" class="empty">暂无数据</div>
    <div v-else class="body">
      <div v-for="(row, idx) in rows" :key="idx" class="row">
        <div class="bar" :style="{ width: `${Math.min(100, row.z || 0)}%` }"></div>
        <div class="label" :title="row.x || row.name">{{ displayLabel(row) }}</div>
        <div class="value">{{ row.y ?? row.value ?? 0 }}</div>
        <div class="percent">{{ formatPercent(row.z) }}%</div>
      </div>
    </div>
    <div
      v-if="showMore && rows.length >= (limit || 10)"
      class="more"
      @click="$emit('more')"
    >
      更多
      <span class="arrow">→</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  metricLabel?: string
  rows: Array<{ x?: string; name?: string; y?: number; value?: number; z?: number }>
  limit?: number
  showMore?: boolean
  labelMap?: Record<string, string>
}>()

defineEmits<{ (e: 'more'): void }>()

function displayLabel(row: { x?: string; name?: string }) {
  const raw = row.x || row.name || 'Unknown'
  return props.labelMap?.[raw] || raw
}

function formatPercent(z?: number) {
  if (z == null) return 0
  return Number.isInteger(z) ? z : Math.round(z)
}
</script>

<style scoped lang="less">
.metrics-table {
  height: 100%;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  color: var(--umami-gray900, #2c2c2c);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 40px;
}

.title {
  display: flex;
  font-weight: 600;
  font-size: 16px;
}

.metric {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  width: 100px;
}

.body {
  position: relative;
  flex: 1;
  overflow: auto;
}

.row {
  position: relative;
  height: 30px;
  line-height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  overflow: hidden;
}

.bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 30px;
  opacity: 0.1;
  background: var(--umami-primary, #2680eb);
  z-index: 0;
  transition: width 0.4s ease;
}

.label {
  position: relative;
  z-index: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  flex: 2;
  padding-right: 8px;
}

.value {
  position: relative;
  z-index: 1;
  width: 50px;
  text-align: right;
  margin-right: 10px;
  font-weight: 600;
  cursor: default;
}

.percent {
  position: relative;
  z-index: 1;
  width: 50px;
  color: var(--umami-gray600, #8e8e8e);
  border-left: 1px solid var(--umami-gray600, #8e8e8e);
  padding-left: 10px;
}

.empty {
  color: var(--umami-gray500, #b3b3b3);
  padding: 40px 0;
  text-align: center;
  font-size: 14px;
}

.more {
  margin-top: 12px;
  color: var(--umami-primary, #2680eb);
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;

  &:hover {
    color: var(--umami-primary-dark, #0d66d0);
  }

  .arrow {
    font-size: 12px;
  }
}
</style>
