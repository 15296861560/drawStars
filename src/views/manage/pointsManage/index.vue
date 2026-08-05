<template>
  <div class="points-manage">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="概览" name="overview" />
      <el-tab-pane label="新增积分" name="adjust" />
      <el-tab-pane label="规则配置" name="rules" />
      <el-tab-pane label="等级配置" name="levels" />
    </el-tabs>
    <router-view />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tabFromPath = () => {
  const p = route.path
  if (p.includes('/rules')) return 'rules'
  if (p.includes('/levels')) return 'levels'
  if (p.includes('/adjust')) return 'adjust'
  return 'overview'
}

const activeTab = ref(tabFromPath())

watch(
  () => route.path,
  () => {
    activeTab.value = tabFromPath()
  }
)

const handleTabClick = tab => {
  const name = tab.paneName
  router.push(`/home/manageHomePage/points/${name}`)
}
</script>

<style scoped lang="less">
.points-manage {
  padding: 16px 4px 24px;
  text-align: left;

  /* 默认卡片内边距；需要贴边时用 class="card-body-flush" */
  :deep(.el-card__body) {
    padding: 16px 20px;
  }

  :deep(.el-card.card-body-flush > .el-card__body) {
    padding: 0;
  }
}

:deep(.page-title),
:deep(.page-toolbar) {
  text-align: left;
}

:deep(.el-tabs__header) {
  margin-bottom: 16px;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0;
  margin: 0;
}

:deep(.el-tabs__item) {
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
}

:deep(.el-tabs__active-bar) {
  height: 3px;
}
</style>
