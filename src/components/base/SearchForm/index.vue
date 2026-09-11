<template>
  <el-form v-show="visible" :model="model" class="search-form" @submit.prevent>
    <el-form-item
      v-for="item in items"
      :key="item.field"
      :label="item.label"
      class="search-form__item"
      :class="item.itemClass"
    >
      <el-select
        v-if="item.type === 'select'"
        v-model="model[item.field]"
        :placeholder="item.placeholder || `请选择${item.label || ''}`"
        clearable
        :style="controlStyle(item)"
        v-bind="item.attrs"
      >
        <el-option
          v-for="opt in item.options || []"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <el-date-picker
        v-else-if="item.type === 'daterange'"
        v-model="model[item.field]"
        type="daterange"
        value-format="YYYY-MM-DD"
        :start-placeholder="item.startPlaceholder || '开始日期'"
        :end-placeholder="item.endPlaceholder || '结束日期'"
        :style="controlStyle(item, 280)"
        v-bind="item.attrs"
      />
      <el-input
        v-else
        v-model="model[item.field]"
        :placeholder="item.placeholder || `请输入${item.label || ''}`"
        clearable
        :style="controlStyle(item)"
        v-bind="item.attrs"
        @keyup.enter="emit('search')"
      />
    </el-form-item>

    <el-form-item class="search-form__actions">
      <slot name="actions">
        <el-button type="primary" :icon="Search" @click="emit('search')">
          {{ searchText }}
        </el-button>
        <el-button :icon="Refresh" @click="emit('reset')">
          {{ resetText }}
        </el-button>
      </slot>
      <slot name="extra" />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { Search, Refresh } from '@element-plus/icons-vue'

defineProps({
  model: {
    type: Object,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  visible: {
    type: Boolean,
    default: true
  },
  searchText: {
    type: String,
    default: '搜索'
  },
  resetText: {
    type: String,
    default: '重置'
  }
})

const emit = defineEmits(['search', 'reset'])

const controlStyle = (item, fallback = 200) => ({
  width: `${item.width || fallback}px`
})
</script>

<style scoped lang="less">
.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 16px;
  margin-bottom: 8px;

  :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 12px;
  }

  &__item {
    flex: 0 0 auto;
  }

  &__actions {
    flex: 1 1 auto;
    margin-left: auto !important;
    display: flex;
    justify-content: flex-end;

    :deep(.el-form-item__content) {
      justify-content: flex-end;
      margin-left: 0 !important;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
}
</style>
