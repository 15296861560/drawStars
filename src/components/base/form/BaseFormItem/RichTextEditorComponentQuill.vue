<template>
  <span id="ql-upload-formats" class="ql-formats">
    <button
      class="ql-upload drawstars-icon-word-monochrome dodgerblue"
      @click="uploadFile(false)"
    ></button>
    <button
      class="ql-upload drawstars-icon-word-monochrome"
      @click="uploadFile(true)"
    ></button>
  </span>

  <input
    v-show="false"
    type="file"
    id="docx-color"
    accept=".docx"
    @change="handleFileChange($event)"
  />
  <input
    v-show="false"
    type="file"
    id="docx-file"
    accept=".docx"
    @change="handleFileChange($event, true)"
  />
  <div class="editor-container" id="editor" ref="editorRef"></div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef, onMounted, watch } from "vue";
import Quill from "quill";
import type { AnyObject } from "@/types/global";
import { useVModels } from "@vueuse/core";
import "quill/dist/quill.snow.css";
import { findReq } from "@/assets/js/api";

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

const quill = ref();
const editorRef = shallowRef();

const uploadFile = (isMonochrome = false) => {
  event.preventDefault(); // 阻止默认行为
  event.stopPropagation(); // 阻止事件冒泡
  const input = document.getElementById(
    isMonochrome ? "docx-file" : "docx-color",
  ) as HTMLInputElement;
  input?.click();
};

const handleFileChange = async (e, isMonochrome = false) => {
  const file = e.target.files[0];
  if (file) {
    const formData = new FormData();
    formData.append("docxFile", file);

    const req = findReq(
      "converController",
      isMonochrome ? "convertMammoth" : "convertQuill",
    );
    const res = await req(formData);
    if (res.status) {
      valueModel.value = res.data.html;
      editorRef.value.innerHTML = res.data.html;
    }
    e.target.value = "";
  }
};

const modelValue = ref(props.valueModel);
watch(
  () => modelValue.value,
  (newVal) => {
    valueModel.value = newVal;
    quill.value.root.innerHTML = newVal;
  },
);

const updateValueModel = (value: string) => {
  quill.value.root.innerHTML = value;
};

const textChange = (value: string) => {
  valueModel.value = value;
};

const initQuill = () => {
  quill.value = new Quill(editorRef.value, editorConfig);

  const toolbar = quill.value.getModule("toolbar");
  const qlUploadEL = document.getElementById("ql-upload-formats");
  if (qlUploadEL) {
    qlUploadEL.remove();
    toolbar.container.appendChild(qlUploadEL);
  }

  quill.value.on("text-change", (delta, oldDelta, source) => {
    const html = quill.value.root.innerHTML;
    textChange(html);
  });
};

onMounted(() => {
  initQuill();

  quill.value.root.innerHTML = valueModel.value;
});

const toolbarConfig = {};
const editorConfig = {
  debug: false,
  modules: {
    toolbar: [
      [
        "bold",
        "italic",
        "underline",
        "strike",
        "clean",
        "link",
        "image",
        "video",
      ], // 加粗 斜体 下划线 删除线 引用  代码块 清除文本格式 链接、图片、视频
      [{ list: "ordered" }, { list: "bullet" }], // 有序、无序列表-----[{ list: 'ordered' }, { list: 'bullet' }]
      [{ header: 1 }, { header: 2 }],
      [{ script: "sub" }, { script: "super" }], // 上标/下标-----[{ script: 'sub' }, { script: 'super' }]
      [{ indent: "-1" }, { indent: "+1" }],
      [{ size: ["small", false, "large", "huge"] }], // 配置字号
      [{ header: [1, 2, 3, 4, 5, 6, false] }], // 标题-----[{ header: [1, 2, 3, 4, 5, 6, false] }]
      [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色-----[{ color: [] }, { background: [] }]
      [{ font: [] }], //显示字体选择
      [{ align: [] }], // 对齐方式-----
    ],
  },
  placeholder: "请输入...",
  theme: "snow",
};

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {});

defineExpose({
  editorRef,
  toolbarConfig,
  editorConfig,
  updateValueModel,
});
</script>
<style lang="less" scoped>
.editor-container {
  height: 35vh;
  overflow: auto;
}

.ql-formats {
  .ql-upload {
    width: 48px;
    height: 24px;
    padding: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dodgerblue {
    color: dodgerblue;
  }
}
</style>
