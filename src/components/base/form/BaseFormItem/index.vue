<template>
  <div class="w-full">
    <el-input-number
      v-if="isNumber"
      v-model="field"
      v-bind="$attrs"
      controls-position="right"
      :readonly="readonly"
      :disabled="disabled"
    />

    <el-input
      v-else-if="isTextarea"
      v-model="field"
      v-bind="$attrs"
      :autosize="{ minRows: 1 }"
      type="textarea"
      :readonly="readonly"
      :disabled="disabled"
    />

    <el-select
      v-else-if="isSelect"
      v-bind="$attrs"
      v-model="field"
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
      v-bind="$attrs"
      :disabled="disabled"
      :readonly="readonly"
    />

    <el-date-picker
      v-else-if="isDate"
      v-model="field"
      v-bind="$attrs"
      :disabled="disabled"
      :readonly="readonly"
    />

    <el-radio-group
      v-else-if="isRadio"
      v-model="field"
      v-bind="$attrs"
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
      v-bind="$attrs"
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

    <single-img-component
      v-else-if="isImg"
      v-model:field="field"
      :disabled="disabled"
    />

    <location-component
      v-else-if="isLocationPoint"
      v-model:value-model="field"
      :disabled="disabled"
    />
    <custom-location-component
      v-else-if="isLocation"
      v-model:value-model="field"
      :disabled="disabled"
    />
    <rich-text-editor-component
      ref="richText"
      v-else-if="isRichText"
      v-model:value-model="field"
      :disabled="disabled"
    />

    <el-input
      v-else
      v-model="field"
      v-bind="$attrs"
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
  ref,
  defineAsyncComponent,
  watch,
} from "vue";
import type { AnyObject } from "@/types/global";
import { useVModels } from "@vueuse/core";
import { showTips } from "@/utils/message/showTips.js";
import { ComponentType } from "@/types/base";

const singleImgComponent = defineAsyncComponent(
  () => import("./singleImgComponent.vue"),
);

const locationComponent = defineAsyncComponent(
  () => import("./locationComponent.vue"),
);

const CustomLocationComponent = defineAsyncComponent(
  () => import("./CustomLocationComponent.vue"),
);

const RichTextEditorComponent = defineAsyncComponent(
  () => import("./RichTextEditorComponent.vue"),
);

const props = defineProps<{
  field: string | number | boolean | string[] | any;
  type?: string;
  apiMethod?: Function;
  apiParams?: AnyObject;
  config?: AnyObject;
  disabled?: boolean;
  readonly?: boolean;
  options?: Array<AnyObject>;
}>();

const emit = defineEmits<{
  (e: "update:field", value: string | number | boolean | string[] | any): void;
}>();

const { type, apiMethod, apiParams, config, disabled, readonly, options } =
  toRefs(props);
const { field } = useVModels(props, emit);

const isInput = computed(() => type?.value === ComponentType.input);
const isNumber = computed(() => type?.value === ComponentType.inputNumber);
const isTextarea = computed(() => type?.value === ComponentType.textarea);
const isSelect = computed(() => type?.value === ComponentType.select);
const isSelectCascade = computed(() => type?.value === ComponentType.cascade);
const isDate = computed(() => type?.value === ComponentType.date);
const isRadio = computed(() => type?.value === ComponentType.radio);
const isCheckBox = computed(() => type?.value === ComponentType.checkbox);
const isImg = computed(() => type?.value === ComponentType.img);
const isLocationPoint = computed(
  () => type?.value === ComponentType.locationPoint,
);
const isLocation = computed(() => type?.value === ComponentType.location);
const isRichText = computed(() => type?.value === ComponentType.richText);

const requestOptions = async () => {
  if (apiMethod?.value) {
    const res = await apiMethod.value(apiParams?.value);
    if (res.status) {
      options!.value = res.data || [];
    } else {
      showTips("error", res.msg);
    }
  }
};

const richText = ref();
window.richText = richText;
watch(
  () => field.value,
  () => {
    if (isRichText.value && richText.value) {
      richText.value.modelValue = field.value;
    }
  },
);

defineExpose({
  options,
});
onMounted(() => {
  requestOptions();
});
</script>
