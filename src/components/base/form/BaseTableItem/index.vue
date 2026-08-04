<template>
  <div class="base-table-item">
    <el-switch
      v-if="type === TABLE_ITEM_TYPE.switch"
      v-model="fieldModel"
      :active-value="activeValue ?? 1"
      :inactive-value="inactiveValue ?? 0"
      :disabled="!!disabled"
      @change="onSwitchChange"
    />

    <span v-else-if="type === TABLE_ITEM_TYPE.select">{{
      options?.find(o => o[config?.valueKey || 'value'] === field)?.[
        config?.labelKey || 'label'
      ]
    }}</span>

    <img
      v-else-if="type === TABLE_ITEM_TYPE.img"
      :src="field"
      class="max-w-12"
    />

    <el-link
      v-else-if="type === TABLE_ITEM_TYPE.link"
      :href="field"
      type="primary"
      >{{ field }}</el-link
    >

    <span v-else>{{ field }}</span>
  </div>
</template>
<script setup lang="ts">
import { computed, toRefs } from 'vue'
import type { AnyObject } from '@/types/global'

const TABLE_ITEM_TYPE = {
  text: 'text',
  img: 'img',
  link: 'link',
  select: 'select',
  tag: 'tag',
  switch: 'switch'
}

const props = defineProps<{
  field: string | number | boolean | string[] | any
  row?: AnyObject
  type?: string
  apiMethod?: Function
  apiParams?: AnyObject
  config?: AnyObject
  disabled?: boolean
  readonly?: boolean
  tableViewMode?: boolean
  options?: Array<AnyObject>
  activeValue?: string | number | boolean
  inactiveValue?: string | number | boolean
}>()

const emit = defineEmits<{
  (e: 'update:field', value: any): void
  (e: 'change', value: any): void
}>()

const { type, config, disabled, options } = toRefs(props)

const fieldModel = computed({
  get: () => props.field,
  set: val => emit('update:field', val)
})

const onSwitchChange = (val: string | number | boolean) => {
  emit('change', val)
}
</script>
