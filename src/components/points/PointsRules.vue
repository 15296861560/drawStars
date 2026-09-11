<template>
  <el-dialog
    v-model="visible"
    title="积分规则"
    width="700px"
    class="points-rules-dialog"
    :close-on-click-modal="false"
  >
    <!-- 等级权益 -->
    <div class="section">
      <h3 class="section-title">会员等级权益</h3>
      <div class="level-cards">
        <div
          v-for="level in allLevels"
          :key="level.level"
          class="level-card"
          :class="{ active: level.level === currentLevel?.level }"
        >
          <div class="level-header">
            <span class="level-name">{{ level.name }}</span>
            <span class="level-points">{{ level.requiredPoints }}积分</span>
          </div>
          <div class="level-benefits">
            <el-tag
              v-for="(value, key) in level.benefits"
              :key="key"
              size="small"
              type="success"
            >
              {{ formatBenefit(key as string, value) }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 积分获取规则 -->
    <div class="section">
      <h3 class="section-title">如何获得积分</h3>
      <el-table :data="earnRules" style="width: 100%">
        <el-table-column label="方式" prop="name" width="120" />
        <el-table-column label="规则">
          <template #default="{ row }">
            {{ formatRule(row) }}
          </template>
        </el-table-column>
        <el-table-column label="上限" width="120">
          <template #default="{ row }">
            <span v-if="row.dailyLimit > 0">每日{{ row.dailyLimit }}次</span>
            <span v-else-if="row.monthlyLimit > 0"
              >每月{{ row.monthlyLimit }}次</span
            >
            <span v-else>无限制</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 积分使用说明 -->
    <div class="section">
      <h3 class="section-title">积分使用说明</h3>
      <div class="usage-info">
        <p>• 积分可在下单时抵扣现金，<strong>100积分 = 1元</strong></p>
        <p>• 单笔订单最多可抵扣订单金额的 <strong>50%</strong></p>
        <p>• 积分有效期为 <strong>365天</strong>，请及时使用</p>
        <p>• 积分不可转让、不可提现</p>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePointsLevel, usePointsRules } from '@/composables/usePoints'
import type { PointsRule } from '@/types/points'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const { currentLevel, allLevels } = usePointsLevel()
const { rules } = usePointsRules()

const earnRules = computed(() =>
  rules.value.filter(r => r.enabled && r.source !== 'PURCHASE')
)

function formatRule(rule: PointsRule): string {
  switch (rule.calcMethod) {
    case 'FIXED':
      return `每次获得 ${rule.pointsValue} 积分`
    case 'RATIO':
      return `按消费金额 ${rule.pointsValue * 100}% 获得积分`
    case 'FORMULA':
      return rule.description
    default:
      return rule.description
  }
}

function formatBenefit(key: string, value: any): string {
  const benefitMap: Record<string, string> = {
    discount: `${(1 - value) * 100}% 折扣`,
    freeShipping: '免邮',
    priorityService: '优先客服',
    exclusiveEvents: '专属活动'
  }
  return benefitMap[key] || `${key}: ${value}`
}
</script>

<style scoped lang="less">
.section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 12px;
    color: #303133;
  }
}

.level-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;

  .level-card {
    padding: 12px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    transition: all 0.3s;

    &.active {
      border-color: var(--el-color-primary);
      background: #ecf5ff;
    }

    .level-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .level-name {
        font-weight: bold;
        color: #303133;
      }

      .level-points {
        font-size: 12px;
        color: #909399;
      }
    }

    .level-benefits {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
  }
}

.usage-info {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;

  p {
    margin: 8px 0;
    color: #606266;
    line-height: 1.6;

    strong {
      color: var(--el-color-primary);
    }
  }
}
</style>

<style lang="less">
.points-rules-dialog {
  .el-dialog__title {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.4;
  }
}
</style>
