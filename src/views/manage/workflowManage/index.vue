<template>
  <div class="workflow-manage">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="流程概览" name="overview" />
      <el-tab-pane label="流程列表" name="list" />
      <el-tab-pane label="执行历史" name="history" />
      <el-tab-pane label="模板市场" name="templates" />
      <el-tab-pane label="工具管理" name="tools" />
      <el-tab-pane label="分类管理" name="categories" />
      <el-tab-pane label="告警规则" name="alerts" />
    </el-tabs>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tabFromPath = () => {
  const p = route.path
  // 设计器/执行详情不在 tab 列表中，按来源 tab 高亮
  if (p.includes('/designer')) return 'list'
  if (p.includes('/execution')) return 'history'
  if (p.includes('/categories')) return 'categories'
  if (p.includes('/alerts')) return 'alerts'
  if (p.includes('/templates')) return 'templates'
  if (p.includes('/tools')) return 'tools'
  if (p.includes('/history')) return 'history'
  if (p.includes('/list')) return 'list'
  return 'overview'
}

const activeTab = ref(tabFromPath())

watch(
  () => route.path,
  () => {
    activeTab.value = tabFromPath()
  }
)

const handleTabClick = (tab: { paneName: string | number }) => {
  const name = tab.paneName
  router.push(`/home/manageHomePage/workflow/${name}`)
}
</script>

<style scoped lang="less">
.workflow-manage {
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
