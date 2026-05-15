<template>
  <div v-if="layout.tagsView" class="layout-tags">
    <router-link
      v-for="tag in layout.visitedViews"
      :key="tag.fullPath"
      v-slot="{ href, isActive }"
      :to="tag.fullPath"
      custom
    >
      <a
        :href="href"
        class="tag-item"
        :class="{ active: isActive }"
        @click.prevent="go(tag.fullPath)"
        @contextmenu.prevent="close(tag.fullPath)"
      >
        <el-icon v-if="layout.tagsIcon" class="tag-ico"><Menu /></el-icon>
        <span>{{ tag.title }}</span>
        <el-icon class="tag-close" @click.stop="close(tag.fullPath)"><Close /></el-icon>
      </a>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { Menu, Close } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { layoutSettingsStore } from "@/stores/layout-settings";

const layout = layoutSettingsStore();
const router = useRouter();

function close(fullPath: string) {
  layout.removeVisitedView(fullPath);
}

function go(fullPath: string) {
  router.push(fullPath);
}
</script>

<style scoped lang="less">
.layout-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 6px 12px 0;
  background: #fff;
  border-bottom: 1px solid var(--el-border-color-lighter);
  min-height: 36px;
}
.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 3px;
  border: 1px solid var(--el-border-color);
  color: var(--el-text-color-regular);
  text-decoration: none;
  cursor: pointer;
  &.active {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }
  .tag-ico {
    font-size: 14px;
  }
  .tag-close {
    font-size: 12px;
    margin-left: 2px;
    opacity: 0.65;
    &:hover {
      opacity: 1;
      color: var(--el-color-danger);
    }
  }
}
</style>
