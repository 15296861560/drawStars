<template>
  <div>
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      multiple
      :auto-upload="false"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :before-remove="beforeRemove"
      :limit="uploadLimit"
      :on-exceed="handleExceed"
      :on-change="handleChange"
      :accept="accept"
      :disabled="props.disabled"
      :list-type="isOnlyPic ? 'picture-card' : 'enum'"
      :class="{
        'hide-upload': isOnlyPic && fileList.length,
      }"
    >
      <el-button
        :disabled="props.disabled"
        type="primary"
        :loading="uploading"
        >{{ uploading ? "上传中" : "点击上传" }}</el-button
      >
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, computed, watchEffect } from "vue";
import type { AnyObject } from "@/types/global";
import { useVModels } from "@vueuse/core";
import { ElMessage, ElMessageBox, genFileId } from "element-plus";
import type { UploadProps, UploadUserFile, UploadRawFile } from "element-plus";
import { Delete, Upload, Plus, ZoomIn } from "@element-plus/icons-vue";
import { findReq } from "@/assets/js/api";

const props = defineProps<{
  field: AnyObject;
  valueModel?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:valueModel", value: string): void;
}>();

const { valueModel } = useVModels(props, emit);
const { field } = toRefs(props);

const uploadRef = ref();
const fileList = ref<UploadUserFile[]>([]);
const fileDataList = ref<any[]>([]);
const uploading = ref(false);

const initModelValue = () => {
  fileDataList.value = JSON.parse(valueModel.value || "[]");
  fileList.value = fileDataList.value?.map((file: AnyObject) => {
    file.url = file.filePath;
    file.name = file.fileName;
    return file;
  });
};
initModelValue();

watchEffect(() => {
  valueModel.value = JSON.stringify(fileDataList.value);
});

// 文件类型
const FILE_TYPE = {
  // 文档
  doc: 0,
  // 图片
  picture: 1,
  // 视频
  video: 2,
  // 压缩包
  zip: 3,
};
// 文件类型
const UPLOAD_FILE_TYPE = {
  // 图片
  picture: "0",
  // 音频
  audio: "1",
  // 视频
  video: "2",
  // 文档
  doc: "3",
  // 安装包
  zip: "4",
  // 其他
  other: "5",
};

const ACCEPT_TYPE = {
  picture: ".jpg,.jpeg,.png",
  doc: ".doc,.docx,.xls,.xlsx,.pdf,.zip,.rar",
  video: ".video,.mp4,.avi,.mov,.wmv,.flv,.mkv,.webm,.3gp,.ogg,.webm",
  zip: ".zip,.rar",
};

const fileType = computed(() => field.value?.controlCongfig?.fileType || []);
const isOnlyPic = computed(
  () =>
    fileType.value?.length === 1 && fileType.value?.includes(FILE_TYPE.picture),
);

const limitSize = computed(() => field.value?.controlCongfig?.size || 10);

const accept = computed(() => {
  const strArr: string[] = [];
  if (fileType.value?.includes(FILE_TYPE.doc)) {
    strArr.push(ACCEPT_TYPE.doc);
  }
  if (fileType.value?.includes(FILE_TYPE.picture)) {
    strArr.push(ACCEPT_TYPE.picture);
  }
  if (fileType.value?.includes(FILE_TYPE.video)) {
    strArr.push(ACCEPT_TYPE.video);
  }
  if (fileType.value?.includes(FILE_TYPE.zip)) {
    strArr.push(ACCEPT_TYPE.zip);
  }

  return strArr.join(",");
});

const uploadLimit = computed(() => {
  return field.value?.controlCongfig?.num || 1;
});

const handleRemove: UploadProps["onRemove"] = (file: AnyObject) => {
  const index = fileDataList.value?.findIndex((data) => data.id === file.id);

  fileDataList.value?.splice(index, 1);

  fileList.value = fileDataList.value?.map((file: AnyObject) => {
    file.url = file.filePath;
    file.name = file.fileName;
    return file;
  });
};

const handlePreview: UploadProps["onPreview"] = (uploadFile) => {
  window.open(uploadFile.url, "_blank");
};

const handleExceed: UploadProps["onExceed"] = (files) => {
  if (uploadLimit.value !== 1) {
    ElMessage.warning(`最多上传${uploadLimit.value}个文件`);
  } else {
    uploadRef.value!.clearFiles();
    const file = files[0] as UploadRawFile;
    file.uid = genFileId();
    uploadRef.value!.handleStart(file);
  }
};

const handleReUpload = () => {
  uploadRef.value?.$el
    ?.getElementsByClassName("el-upload__input")?.[0]
    ?.click();
};

const beforeRemove: UploadProps["beforeRemove"] = (uploadFile) => {
  return ElMessageBox.confirm(`确认要删除 ${uploadFile.name} 文件吗?`).then(
    () => true,
    () => false,
  );
};

const handleChange: UploadProps["onChange"] = async (file: AnyObject) => {
  try {
    const fileSuffix = file.name.substring(file.name.lastIndexOf(".") + 1);

    if (accept.value.indexOf(fileSuffix) === -1) {
      ElMessage.warning(`只允许上传${accept.value}格式的文件`);
      return false;
    }

    let type = "";
    if (ACCEPT_TYPE.picture.indexOf(fileSuffix) > -1) {
      type = UPLOAD_FILE_TYPE.picture;
    } else if (ACCEPT_TYPE.doc.indexOf(fileSuffix) > -1) {
      type = ["zip", "rar"].includes(fileSuffix)
        ? UPLOAD_FILE_TYPE.other
        : UPLOAD_FILE_TYPE.doc;
    } else if (ACCEPT_TYPE.video.indexOf(fileSuffix) > -1) {
      type = UPLOAD_FILE_TYPE.video;
    }

    const fileSize = (file.size || 0) / 1024 / 1024;

    if (fileSize > limitSize.value) {
      ElMessage.warning(`上传附件文件大小不能大于${limitSize.value}M`);
      fileList.value = [];
      return false;
    }

    let formData = new FormData();
    formData.append("file", file.raw as Blob);
    formData.append("filename", file.name);
    formData.append("type", type);
    uploading.value = true;

    const req = findReq("commomController", "uploadFile");
    const res = await req(formData);
    if (res.status) {
      if (uploadLimit.value === 1) {
        fileDataList.value = [
          {
            filePath: res.data.url,
            fileName: res.data.name,
          },
        ];
      } else {
        fileDataList.value?.push({
          filePath: res.data.url,
          fileName: res.data.name,
        });
      }
      file.url = res.data.url;
    }
    uploading.value = false;
  } catch (e) {
    uploading.value = false;
  }
};

defineExpose({ initModelValue });
</script>
<style scoped lang="less">
:deep(.el-upload) {
  width: 400px;
  display: flex;
  justify-content: start;
}
</style>
