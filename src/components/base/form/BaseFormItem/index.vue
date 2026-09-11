<template>
  <div class="w-full">
    <el-input-number
      v-if="isNumber"
      v-model="field"
      v-bind="mergedAttrs"
      controls-position="right"
      :readonly="readonly"
      :disabled="disabled"
    />

    <el-input
      v-else-if="isTextarea"
      v-model="field"
      v-bind="mergedAttrs"
      :autosize="{ minRows: 2 }"
      type="textarea"
      :readonly="readonly"
      :disabled="disabled"
    />

    <el-select
      v-else-if="isSelect"
      v-bind="mergedAttrs"
      v-model="field"
      class="w-full"
      :disabled="disabled"
    >
      <el-option
        v-for="(item, index) in options"
        :key="item[config?.valueKey] || index"
        :label="item[config?.labelKey] || item?.label"
        :value="item[config?.valueKey] || item?.value"
      />
    </el-select>

    <el-cascader
      v-else-if="isSelectCascade"
      v-model="field"
      v-bind="mergedAttrs"
      :disabled="disabled"
      :readonly="readonly"
    />

    <el-date-picker
      v-else-if="isDate"
      v-model="field"
      v-bind="mergedAttrs"
      :disabled="disabled"
      :readonly="readonly"
    />

    <el-radio-group
      v-else-if="isRadio"
      v-model="field"
      v-bind="mergedAttrs"
      :disabled="disabled"
      :readonly="readonly"
    >
      <el-radio
        v-for="(item, index) in options"
        :key="item[config?.valueKey] || index"
        :label="item[config?.labelKey] || item?.label"
        :value="item[config?.valueKey] || item?.value"
      >
        {{ item[config?.labelKey] || item?.label }}
      </el-radio>
    </el-radio-group>

    <el-checkbox-group
      v-else-if="isCheckBox"
      v-model="field"
      v-bind="mergedAttrs"
      :disabled="disabled"
      :readonly="readonly"
    >
      <el-checkbox
        v-for="(item, index) in options"
        :key="item[config?.valueKey] || index"
        :label="item[config?.labelKey] || item?.label"
        :value="item[config?.valueKey] || item?.value"
      />
    </el-checkbox-group>

    <el-switch
      v-else-if="isSwitch"
      v-model="field"
      v-bind="mergedAttrs"
      :disabled="disabled"
    />

    <icon-picker-component
      v-else-if="isIcon"
      v-model:field="field"
      :disabled="disabled"
      :max-size-mb="attrs?.maxSizeMB"
    />

    <single-img-component
      v-else-if="isImg"
      v-model:field="field"
      :disabled="disabled"
    />
    <upload-component
      v-else-if="isUpload"
      v-model:value-model="field"
      v-bind="attrs || {}"
      :disabled="disabled"
    />

    <location-component
      v-else-if="isLocationPoint"
      v-model:value-model="field"
      :field="{}"
      :disabled="disabled"
    />
    <custom-location-component
      v-else-if="isLocation"
      v-model:value-model="field"
      :field="{}"
      :disabled="disabled"
    />
    <rich-text-viewer
      v-else-if="isRichText && disabled"
      :html="field"
      bordered
      max-height="35vh"
      min-height="180px"
    />
    <rich-text-editor-component
      ref="richText"
      v-else-if="isRichText"
      v-model:value-model="field"
      :field="{}"
      :disabled="disabled"
    />

    <el-input
      v-else
      v-model="field"
      v-bind="mergedAttrs"
      :readonly="readonly"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 通用表单元素组件
 * */
import {
  computed,
  onMounted,
  toRefs,
  defineAsyncComponent,
  ref,
  watch,
  useAttrs
} from 'vue'
import type { AnyObject } from '@/types/global'
import { useVModels } from '@vueuse/core'
import { showTips } from '@/utils/message/showTips.js'
import { ComponentType } from '@/types/base'

const singleImgComponent = defineAsyncComponent(
  () => import('./singleImgComponent.vue')
)

const locationComponent = defineAsyncComponent(
  () => import('./locationComponent.vue')
)

const CustomLocationComponent = defineAsyncComponent(
  () => import('./CustomLocationComponent.vue')
)

const RichTextEditorComponent = defineAsyncComponent(
  () => import('./RichTextEditorComponentQuill.vue')
)

const RichTextViewer = defineAsyncComponent(
  () => import('../RichTextViewer.vue')
)

const UploadComponent = defineAsyncComponent(
  () => import('./UploadComponent.vue')
)

const IconPickerComponent = defineAsyncComponent(
  () => import('./IconPickerComponent.vue')
)

const props = defineProps<{
  field: string | number | boolean | string[] | any
  type?: string
  apiMethod?: Function
  apiParams?: AnyObject
  config?: AnyObject
  disabled?: boolean
  readonly?: boolean
  options?: Array<AnyObject>
  attrs?: AnyObject
}>()

const emit = defineEmits<{
  (e: 'update:field', value: string | number | boolean | string[] | any): void
}>()

const fallthroughAttrs = useAttrs()
const {
  type,
  apiMethod,
  apiParams,
  config,
  disabled,
  readonly,
  options,
  attrs
} = toRefs(props)
const { field } = useVModels(props, emit)

const mergedAttrs = computed(() => ({
  ...(fallthroughAttrs || {}),
  ...(attrs?.value || {})
}))

const isNumber = computed(() => type?.value === ComponentType.inputNumber)
const isTextarea = computed(() => type?.value === ComponentType.textarea)
const isSelect = computed(() => type?.value === ComponentType.select)
const isSelectCascade = computed(() => type?.value === ComponentType.cascade)
const isDate = computed(() => type?.value === ComponentType.date)
const isRadio = computed(() => type?.value === ComponentType.radio)
const isCheckBox = computed(() => type?.value === ComponentType.checkbox)
const isSwitch = computed(() => type?.value === ComponentType.switch)
const isIcon = computed(() => type?.value === ComponentType.icon)
const isImg = computed(() => type?.value === ComponentType.img)
const isUpload = computed(() => type?.value === ComponentType.upload)
const isLocation = computed(() => type?.value === ComponentType.location)
const isLocationPoint = computed(
  () => type?.value === ComponentType.locationPoint
)
const isRichText = computed(() => type?.value === ComponentType.richText)

const requestOptions = async () => {
  if (apiMethod?.value) {
    const res = await apiMethod.value(apiParams?.value)
    if (res.status) {
      options!.value = res.data || []
    } else {
      showTips('error', res.msg)
    }
  }
}

const richText = ref()
watch(
  () => field.value,
  val => {
    if (!isRichText.value || !richText.value) return
    const current = richText.value.editorRef?.innerHTML
    if (val !== current) {
      richText.value.updateValueModel(val || '')
    }
  }
)

defineExpose({
  options
})
onMounted(() => {
  requestOptions()
})
</script>
