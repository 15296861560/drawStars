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
      matchedOption?.[config?.labelKey || 'label']
    }}</span>

    <el-tag
      v-else-if="type === TABLE_ITEM_TYPE.tag"
      size="small"
      :type="tagType"
      disable-transitions
    >
      {{ tagLabel }}
    </el-tag>

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

const matchedOption = computed(() => {
  const list = options?.value
  if (!list?.length) return undefined
  const valueKey = config?.value?.valueKey || 'value'
  return list.find(o => String(o[valueKey]) === String(props.field))
})

const tagLabel = computed(() => {
  const labelKey = config?.value?.labelKey || 'label'
  if (matchedOption.value?.[labelKey] != null) {
    return String(matchedOption.value[labelKey])
  }
  if (props.field === '' || props.field == null) return '-'
  return String(props.field)
})

const tagType = computed(() => {
  const fromOption = matchedOption.value?.type
  if (fromOption) return fromOption
  const map = config?.value?.tagTypeMap as Record<string, string> | undefined
  if (map && props.field != null && map[String(props.field)]) {
    return map[String(props.field)]
  }
  return 'info'
})

const onSwitchChange = (val: string | number | boolean) => {
  emit('change', val)
}
</script>

<style scoped lang="less">
/* 行内展示，避免树形表格中块级 div 把展开箭头与文字拆成两行 */
.base-table-item {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  vertical-align: middle;
  line-height: 1.5;
}
</style>
