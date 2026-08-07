<template>
  <div class="task-manage">
    <router-view />
  </div>
</template>

<script setup></script>

<style scoped lang="less">
.task-manage {
  padding: 16px 4px 24px;
  text-align: left;

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
</style>
