<template>
  <div class="search-item mb20 mr20">
    <div class="search-item__label">{{ label || '用户' }}</div>
    <div class="search-item__control">
      <el-select
        v-model="fieldModel"
        filterable
        clearable
        :filter-method="filterMethod"
        :loading="loading"
        :placeholder="placeholder || `请选择${label || '用户'}`"
        :disabled="disabled"
        class="search-item__field"
        v-bind="$attrs"
        @visible-change="onVisibleChange"
      >
        <el-option
          v-for="item in options"
          :key="item.id"
          :label="item.label"
          :value="resolveOptionValue(item)"
        />
      </el-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useUserSelectOptions } from '@/composables/useUserSelectOptions'

const props = withDefaults(
  defineProps<{
    field?: string | number | null
    label?: string
    placeholder?: string
    disabled?: boolean
    /** 绑定值：displayName=日志操作用户名；id=用户ID */
    valueKey?: 'displayName' | 'id'
  }>(),
  {
    field: '',
    valueKey: 'displayName'
  }
)

const emit = defineEmits<{
  (e: 'update:field', value: string | number | ''): void
}>()

const { options, loading, ensureLoaded, filterMethod } = useUserSelectOptions()

const fieldModel = computed({
  get: () => props.field ?? '',
  set: val => emit('update:field', val === undefined || val === null ? '' : val)
})

function resolveOptionValue(item: {
  id: number | string
  displayName: string
}) {
  return props.valueKey === 'id' ? item.id : item.displayName
}

function onVisibleChange(visible: boolean) {
  if (visible) void ensureLoaded()
}

onMounted(() => {
  void ensureLoaded()
})
</script>

<style scoped lang="less">
.search-item {
  display: flex;
  align-items: center;
  min-width: 0;

  &__label {
    display: inline-flex;
    justify-content: flex-end;
    align-items: center;
    flex: 0 0 auto;
    font-size: 16px;
    color: var(--el-text-color-regular);
    height: 32px;
    line-height: 32px;
    padding: 0 8px 0 0;
    box-sizing: border-box;
    white-space: nowrap;
  }

  &__control {
    flex: 1;
    min-width: 0;
    width: 100%;
  }

  &__field {
    width: 100%;
  }

  :deep(.el-select),
  :deep(.el-input) {
    width: 100%;
  }

  :deep(.el-select) {
    min-width: 160px;
  }
}
</style>
