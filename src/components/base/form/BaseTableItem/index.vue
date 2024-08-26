<template>
  <div>
    <span v-if="type === TABLE_ITEM_TYPE.select">{{
      options?.find((o) => o[config?.valueKey || "value"] === field)?.[
        config?.labelKey || "label"
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
import { computed, onMounted, toRefs, ref, defineAsyncComponent } from "vue";
import type { AnyObject } from "@/types/global";

const TABLE_ITEM_TYPE = {
  text: "text",
  img: "img",
  link: "link",
  select: "select",
  tag: "tag",
};

const props = defineProps<{
  field: string | number | boolean | string[] | any;
  type?: string;
  apiMethod?: Function;
  apiParams?: AnyObject;
  config?: AnyObject;
  disabled?: boolean;
  readonly?: boolean;
  tableViewMode?: boolean;
  options?: Array<AnyObject>;
}>();

const { type, apiMethod, apiParams, config, disabled, readonly, options } =
  toRefs(props);
</script>
