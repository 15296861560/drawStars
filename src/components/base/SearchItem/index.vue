<template>
  <div class="search-item mb20 mr20">
    <div class="search-item__label">{{ label || '关键词' }}</div>
    <el-select
      v-if="type === SEARCH_ITEM_TYPE.select"
      v-model="field"
      :placeholder="placeholder || `请选择${label}`"
      v-bind="$attrs"
      class="w-full"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      >
      </el-option>
    </el-select>
    <el-date-picker
      v-else-if="type === SEARCH_ITEM_TYPE.daterange"
      type="daterange"
      format="YYYY-MM-DD"
      value-format="YYYY-MM-DD"
      start-placeholder="开始时间"
      end-placeholder="结束时间"
      v-model="field"
      v-bind="$attrs"
      :disabled="disabled"
      :readonly="readonly"
    />
    <el-input
      v-else
      v-model="field"
      :placeholder="placeholder || `请输入${label}`"
      v-bind="$attrs"
    ></el-input>
  </div>
</template>
<script setup lang="ts">
import { toRefs } from 'vue'
import type { AnyObject } from '@/types/global'
import { useVModels } from '@vueuse/core'

const props = defineProps<{
  field: string | number | boolean | string[] | any
  type?: string
  label?: string
  placeholder?: string
  apiMethod?: Function
  apiParams?: AnyObject
  config?: AnyObject
  options?: Array<AnyObject>
}>()

const emit = defineEmits<{
  (e: 'update:field', value: string | number | boolean | string[] | any): void
}>()

const { type, apiMethod, apiParams, config, options } = toRefs(props)
const { field } = useVModels(props, emit)

const SEARCH_ITEM_TYPE = {
  input: 'input',
  select: 'select'
}
</script>
<style scoped lang="less">
.search-item {
  display: flex;
  &__label {
    display: inline-flex;
    justify-content: flex-end;
    align-items: flex-start;
    flex: 0 0 auto;
    font-size: var(--el-form-label-font-size);
    color: var(--el-text-color-regular);
    height: 32px;
    line-height: 32px;
    padding: 0 12px 0 0;
    box-sizing: border-box;

    min-width: 72px;
  }
}
</style>
