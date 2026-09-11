<template>
  <div class="points-overview">
    <div class="page-toolbar">
      <div class="page-title">
        <h3>积分概览</h3>
        <p>查看核心指标，快速进入规则、等级与积分发放</p>
      </div>
      <div class="page-actions">
        <el-button
          v-permission="'system:points:operate'"
          type="primary"
          @click="go('adjust')"
          >给用户新增积分</el-button
        >
        <el-button @click="reload">刷新</el-button>
      </div>
    </div>

    <el-row :gutter="16" class="kpi-row" v-loading="loading">
      <el-col :xs="12" :sm="6" v-for="item in kpiList" :key="item.key">
        <div
          class="kpi-card"
          :class="{ clickable: !!item.to }"
          @click="item.to && go(item.to)"
        >
          <div class="kpi-label">{{ item.label }}</div>
          <div class="kpi-value">{{ item.value }}</div>
          <div class="kpi-footer">{{ item.footer }}</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="panel-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="panel-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">积分规则</span>
              <el-button type="primary" link @click="go('rules')"
                >规则配置</el-button
              >
            </div>
          </template>
          <el-table
            :data="previewRules"
            v-loading="loading"
            size="small"
            class="panel-table"
            empty-text="暂无规则"
          >
            <el-table-column
              prop="name"
              label="名称"
              min-width="100"
              show-overflow-tooltip
            />
            <el-table-column
              prop="code"
              label="编码"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
                  {{ row.enabled ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="panel-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">会员等级</span>
              <el-button type="primary" link @click="go('levels')"
                >等级配置</el-button
              >
            </div>
          </template>
          <el-table
            :data="previewLevels"
            v-loading="loading"
            size="small"
            class="panel-table"
            empty-text="暂无等级"
          >
            <el-table-column
              prop="level"
              label="等级"
              width="70"
              align="center"
            />
            <el-table-column
              prop="name"
              label="名称"
              min-width="100"
              show-overflow-tooltip
            />
            <el-table-column
              prop="requiredPoints"
              label="所需积分"
              width="100"
              align="right"
            />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  usePointsAccount,
  usePointsLevel,
  usePointsRules
} from '@/composables/usePoints'
import { pointsStore } from '@/stores/points'
import { userInfoStore } from '@/stores/user-info'

const router = useRouter()
const userStore = userInfoStore()
const store = pointsStore()
const loading = ref(false)
const { availablePoints, levelName } = usePointsAccount()
const { rules } = usePointsRules()
const { allLevels } = usePointsLevel()

const enabledRules = computed(() => rules.value.filter(r => r.enabled))
const previewRules = computed(() => rules.value.slice(0, 5))
const previewLevels = computed(() => allLevels.value.slice(0, 5))

const kpiList = computed(() => [
  {
    key: 'points',
    label: '可用积分',
    value: availablePoints.value ?? 0,
    footer: '当前登录账户',
    to: ''
  },
  {
    key: 'level',
    label: '当前等级',
    value: levelName.value || '-',
    footer: '会员等级状态',
    to: 'levels'
  },
  {
    key: 'rules',
    label: '启用规则',
    value: enabledRules.value.length,
    footer: '去配置规则 →',
    to: 'rules'
  },
  {
    key: 'levels',
    label: '等级档位',
    value: allLevels.value.length,
    footer: '去配置等级 →',
    to: 'levels'
  }
])

function go(name: string) {
  router.push(`/home/manageHomePage/points/${name}`)
}

async function reload() {
  loading.value = true
  try {
    await store.init(Number(userStore.getUserId) || 1)
  } finally {
    loading.value = false
  }
}

onMounted(reload)
</script>

<style scoped lang="less">
.points-overview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  text-align: left;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1.4;
  }

  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
  }
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.kpi-row {
  :deep(.el-col) {
    display: flex;
    margin-bottom: 0;
  }
}

.kpi-card {
  width: 100%;
  min-height: 112px;
  box-sizing: border-box;
  padding: 16px 18px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &.clickable {
    cursor: pointer;

    &:hover {
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
  }
}

.kpi-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.2;
}

.kpi-value {
  margin: 10px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.2;
  word-break: break-all;
}

.kpi-footer {
  min-height: 18px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  line-height: 1.4;
}

.kpi-card.clickable .kpi-footer {
  color: var(--el-color-primary);
}

.panel-row {
  :deep(.el-col) {
    display: flex;
    margin-bottom: 0;

    @media (max-width: 991px) {
      &:not(:last-child) {
        margin-bottom: 16px;
      }
    }
  }
}

.panel-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 8px;

  :deep(.el-card__header) {
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  :deep(.el-card__body) {
    flex: 1;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.panel-table {
  flex: 1;

  :deep(.el-table__inner-wrapper::before) {
    display: none;
  }

  :deep(.el-table__empty-block) {
    min-height: 220px;
  }

  :deep(.el-table__body-wrapper) {
    min-height: 220px;
  }
}
</style>
