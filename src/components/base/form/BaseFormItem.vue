<!--
 * @Author: “lgy lgy-lgy@qq.com
 * @Date: 2024-03-25 23:36:46
 * @LastEditors: “lgy lgy-lgy@qq.com
 * @LastEditTime: 2024-04-05 22:46:12
 * @FilePath: \drawStars-Vue3\src\components\base\form\BaseFonrmItem.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
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
      :readonly="readonly"
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
import { computed, onMounted, reactive, toRefs, watch } from "vue";
import type { AnyObject } from "@/types/global";
import { useVModels } from "@vueuse/core";
import { showTips } from "@/utils/message/showTips.js";

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

const { type, apiMethod, apiParams, config, disabled, readonly, options } = toRefs(props);
const { field } = useVModels(props, emit);
watch(field, (newVal) => {
  console.log("newVal", newVal);
});

const isInput = computed(() => type?.value === "input");
const isNumber = computed(() => type?.value === "input-number");
const isTextarea = computed(() => type?.value === "textarea");
const isSelect = computed(() => type?.value === "select");
const isSelectCascade = computed(() => type?.value === "cascade");
const isDate = computed(() => type?.value === "date");
const isRadio = computed(() => type?.value === "radio");
const isCheckBox = computed(() => type?.value === "checkbox");

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

defineExpose({
  options,
});
onMounted(() => {
  requestOptions();
});
</script>

<style scoped lang="scss"></style>
