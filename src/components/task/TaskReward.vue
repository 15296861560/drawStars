<template>
  <div class="task-reward">
    <el-tag
      v-for="(item, idx) in chips"
      :key="idx"
      :type="item.tagType"
      size="small"
      effect="plain"
      class="reward-chip"
    >
      {{ item.label }}
    </el-tag>
    <span v-if="!chips.length" class="empty">暂无奖励</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RewardConfig, RewardItem, RewardType } from '@/types/task'

const props = defineProps<{
  rewardConfig?: RewardConfig | null
}>()

const TYPE_LABEL: Record<RewardType, string> = {
  POINTS: '积分',
  PHYSICAL: '实物',
  COUPON: '优惠券',
  ITEM: '道具',
  BADGE: '徽章',
  TITLE: '称号',
  EXP: '经验',
  LOTTERY: '抽奖'
}

const TYPE_TAG: Partial<Record<RewardType, string>> = {
  POINTS: 'warning',
  PHYSICAL: 'danger',
  COUPON: 'success',
  ITEM: '',
  BADGE: 'info',
  TITLE: 'warning',
  EXP: 'success',
  LOTTERY: 'danger'
}

function formatItem(item: RewardItem) {
  if (item.description) return item.description
  const base = TYPE_LABEL[item.type] || item.type
  const amount = item.config?.amount
  const name = item.config?.name || item.config?.itemName || item.config?.title
  if (amount != null) return `${base} +${amount}`
  if (name) return `${base}: ${name}`
  return base
}

const chips = computed(() => {
  const list = props.rewardConfig?.rewards || []
  return list.map(item => ({
    label: formatItem(item),
    tagType: (TYPE_TAG[item.type] || 'info') as any
  }))
})
</script>

<style scoped lang="less">
.task-reward {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.reward-chip {
  margin: 0;
}

.empty {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
</style>
