<template>
  <section class="filter-bar">
    <slot />
    <div class="filter-bar__actions">
      <el-button
        type="primary"
        :icon="Search"
        :loading="searching"
        @click="emit('search')"
        >{{ searchTextValue }}</el-button
      >
      <el-button
        text
        class="filter-bar__reset"
        :icon="RefreshLeft"
        @click="emit('reset')"
        >{{ resetTextValue }}</el-button
      >
      <slot name="actions" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Search, RefreshLeft } from '@element-plus/icons-vue'
import i18n from '@/lang/index.js'

const $t = i18n.global.t

const props = withDefaults(
  defineProps<{
    searching?: boolean
    searchText?: string
    resetText?: string
  }>(),
  {
    searching: false,
    searchText: '',
    resetText: ''
  }
)

const emit = defineEmits<{
  (e: 'search'): void
  (e: 'reset'): void
}>()

// 文案默认走全局 i18n，允许单页覆盖
const searchTextValue = computed(() => props.searchText || $t('btn.search'))
const resetTextValue = computed(() => props.resetText || $t('btn.reset'))
</script>

<style scoped lang="less">
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 14px 16px;
  background: @color-gray-scale-1;
  border: 1px solid @color-border-dialog;
  border-radius: @ds-radius-lg;
  box-shadow: @ds-shadow-sm;

  &__actions {
    display: flex;
    align-items: center;
    margin-left: auto;
  }

  &__reset {
    --el-button-text-color: @color-text-secondary;
    --el-button-hover-text-color: @ds-primary;
    --el-button-hover-bg-color: @color-fill-hover;
  }

  // 通用字段组件 SearchItem：间距由容器统一接管，并给出一致的宽度节奏
  :deep(.search-item) {
    flex: 1 1 220px;
    max-width: 320px;
    margin: 0;
  }

  // 分段控件在筛选卡内的统一配色
  :deep(.el-segmented) {
    --el-segmented-bg-color: @color-gray-scale-3;
    --el-segmented-item-selected-bg-color: @ds-primary-light;
    --el-segmented-item-selected-color: @ds-primary;
  }
}
</style>
