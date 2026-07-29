<template>
  <div class="log-manage">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="登录日志" name="login"></el-tab-pane>
      <el-tab-pane label="操作日志" name="operation"></el-tab-pane>
      <el-tab-pane label="业务日志" name="business"></el-tab-pane>
      <el-tab-pane label="数据统计" name="statistics"></el-tab-pane>
    </el-tabs>

    <router-view></router-view>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('login')

const handleTabClick = tab => {
  router.push(`/home/manageHomePage/logs/${tab.paneName}`)
}
</script>

<style scoped>
.log-manage {
  padding: 20px;
}

/* 修复tabs激活状态样式 */
:deep(.el-tabs__nav-wrap) {
  padding: 0;
  margin: 0;
}

:deep(.el-tabs__nav) {
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
