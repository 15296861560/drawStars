<template>
  <div class="editor-container">
    <Toolbar
      class="editor-toolbar"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      class="editor-content"
      v-model="modelValue"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
    />
  </div>
</template>
<script setup lang="ts">
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { onBeforeUnmount, ref, shallowRef, onMounted, watch } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import type { AnyObject } from "@/types/global";
import { useVModels } from "@vueuse/core";

const props = defineProps<{
  field: string | number | boolean | string[] | any;
  valueModel?: string;
  disabled?: boolean;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: "update:valueModel", value: string): void;
}>();

const { valueModel } = useVModels(props, emit);

const editorRef = shallowRef();

const modelValue = ref(props.valueModel);
watch(
  () => modelValue.value,
  (newVal) => {
    valueModel.value = newVal;
  },
);

onMounted(() => {});

const toolbarConfig = {};
const editorConfig = {
  placeholder: props.placeholder || "请输入...",
  readOnly: props.disabled ?? false,
};

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

const handleCreated = (editor) => {
  editorRef.value = editor;
};

const EDITOR_MODE = {
  default: "default",
  simple: "simple",
};

defineExpose({
  editorRef,
  mode: EDITOR_MODE.default,
  toolbarConfig,
  editorConfig,
  handleCreated,
  modelValue,
});
</script>
<style lang="less" scoped>
.editor-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  .editor-toolbar {
    border-bottom: 1px solid #ccc;
  }
  .editor-content {
    min-height: 35vh;
    overflow-y: hidden;
  }
}
</style>
