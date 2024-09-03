<template>
  <div style="width: fit-content">
    <el-upload
      class="uploader"
      v-model:file-list="imgFileList"
      ref="imgUploadRef"
      :auto-upload="false"
      :limit="1"
      :on-change="imgOnChange"
      :before-upload="beforeUpload"
      :on-exceed="handleExceed"
      :disabled="disabled"
      accept="image/jpg, image/jpeg, image/png, image/PNG"
      list-type="picture-card"
      v-bind="$attrs"
    >
      <el-icon class="uploader-icon">
        <Plus />
      </el-icon>

      <template #file="{ file }">
        <div>
          <img
            class="el-upload-list__item-thumbnail"
            :src="file.url"
            :alt="file.name"
          />
          <span class="el-upload-list__item-actions">
            <span
              class="el-upload-list__item-preview"
              @click="handlePictureCardPreview(file)"
            >
              <el-icon><zoom-in /></el-icon>
            </span>
            <span
              v-if="!disabled"
              class="el-upload-list__item-delete"
              @click="handleDownload(file)"
            >
              <el-icon><Download /></el-icon>
            </span>
            <span
              v-if="!disabled"
              class="el-upload-list__item-delete"
              @click="handleRemove(file)"
            >
              <el-icon><Delete /></el-icon>
            </span>
          </span>
        </div>
      </template>
    </el-upload>

    <el-dialog class="center-flex" v-model="dialogImgVisible">
      <img :src="dialogImgUrl" alt="预览图片" />
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { onMounted, toRefs, ref } from "vue";
import type { AnyObject } from "@/types/global";
import { useVModels } from "@vueuse/core";
import { showTips } from "@/utils/message/showTips.js";
import { findReq } from "@/assets/js/api";
import { Delete, Download, Plus, ZoomIn } from "@element-plus/icons-vue";
import { genFileId } from "element-plus";
import type {
  UploadFile,
  UploadInstance,
  UploadProps,
  UploadRawFile,
} from "element-plus";

const props = defineProps<{
  field: string | number | boolean | string[] | any;
  disabled?: boolean;
}>();

const { disabled } = toRefs(props);

const emit = defineEmits<{
  (e: "update:field", value: string | number | boolean | string[] | any): void;
}>();

const { field } = useVModels(props, emit);

const imgUploadRef = ref<UploadInstance>();
const dialogImgUrl = ref("");
const dialogImgVisible = ref(false);
const imgFileList = ref<Array<AnyObject>>([]);

const initFileList = () => {
  if (field.value) {
    imgFileList.value = [
      {
        name: field.value?.replace("/uploadImg/", ""),
        url: field.value,
      },
    ];
  }
};

const imgOnChange = async (file: AnyObject) => {
  let formData = new FormData();
  formData.append("file", file.raw);
  formData.append("filename", file.name);
  const req = findReq("commomController", "uploadFile");
  const res = await req(formData);
  if (res.status) {
    field.value = `/uploadImg${res.data?.url}`;
  }
};

const beforeUpload = async (file: AnyObject) => {
  const isImgFile =
    file.type === "image/jpeg" ||
    file.type === "image/svg+xml" ||
    file.type === "image/png";

  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImgFile) {
    showTips("error", "只能上传是 jpg、svg和png 格式图片!");
  }
  if (!isLt2M) {
    showTips("error", "上传头像图片大小不能超过 2MB!");
  }
  return isImgFile && isLt2M;
};

const handleExceed: UploadProps["onExceed"] = (files) => {
  imgUploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  imgUploadRef.value!.handleStart(file);
};

const handleRemove = (file: UploadFile) => {
  imgUploadRef.value!.clearFiles();
  field.value = "";
};

const handlePictureCardPreview = (file: UploadFile) => {
  dialogImgUrl.value = file.url!;
  dialogImgVisible.value = true;
};

const handleDownload = async (file: UploadFile) => {
  const req = findReq("commomController", "downloadFile");
  const res = await req({
    filename: field.value?.replace("/uploadImg/", ""),
  });
  if (res.status) {
    showTips("success", "下载成功");
  }
};

onMounted(() => {
  initFileList();
});
</script>
<style scoped lang="less">
.uploader {
  display: flex;

  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    &:hover {
      border-color: #409eff;
    }
  }
  .uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 40px;
    height: 40px;
    line-height: 40px;
    text-align: center;
  }
}
</style>
