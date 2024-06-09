<!--
 * @Author: “lgy lgy-lgy@qq.com
 * @Date: 2024-03-25 23:36:46
 * @LastEditors: “lgy lgy-lgy@qq.com
 * @LastEditTime: 2024-06-09 22:01:36
 * @FilePath: \drawStars-Vue3\src\components\base\form\BaseFonrmItem.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="w-full">
    <template v-if="tableViewMode">
      <span v-if="isSelect || isRadio || isCheckBox">{{
        options?.find((o) => o[config?.valueKey || "value"] === field)?.[
          config?.labelKey || "label"
        ]
      }}</span>

      <img v-else-if="isImg" :src="field" class="min-w-12" />

      <span v-else>{{ field }}</span>
    </template>

    <template v-else>
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

      <div v-else-if="isImg" :show-file-list="false">
        <el-upload
          class="uploader"
          v-model:file-list="imgFileList"
          ref="imgUploadRef"
          :auto-upload="false"
          :limit="1"
          :on-change="imgOnChange"
          :before-upload="beforeUpload"
          :on-exceed="handleExceed"
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

      <el-input
        v-else
        v-model="field"
        v-bind="$attrs"
        :readonly="readonly"
        :disabled="disabled"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * 通用表单元素组件
 * */
import { computed, onMounted, toRefs, ref } from "vue";
import type { AnyObject } from "@/types/global";
import { useVModels } from "@vueuse/core";
import { showTips } from "@/utils/message/showTips.js";
import { uploadFile, downloadFile } from "@/assets/js/api/commomController/commomApi.js";

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
  type?: string;
  apiMethod?: Function;
  apiParams?: AnyObject;
  config?: AnyObject;
  disabled?: boolean;
  readonly?: boolean;
  tableViewMode?: boolean;
  options?: Array<AnyObject>;
}>();

const emit = defineEmits<{
  (e: "update:field", value: string | number | boolean | string[] | any): void;
}>();

const {
  type,
  apiMethod,
  apiParams,
  config,
  disabled,
  readonly,
  options,
  tableViewMode,
} = toRefs(props);
const { field } = useVModels(props, emit);

const isInput = computed(() => type?.value === "input");
const isNumber = computed(() => type?.value === "input-number");
const isTextarea = computed(() => type?.value === "textarea");
const isSelect = computed(() => type?.value === "select");
const isSelectCascade = computed(() => type?.value === "cascade");
const isDate = computed(() => type?.value === "date");
const isRadio = computed(() => type?.value === "radio");
const isCheckBox = computed(() => type?.value === "checkbox");
const isImg = computed(() => type?.value === "img");

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

const imgUploadRef = ref<UploadInstance>();
const dialogImgUrl = ref("");
const dialogImgVisible = ref(false);
const imgFileList = ref<Array<AnyObject>>([]);

const initFileList = () => {
  setTimeout(() => {
    imgFileList.value = [
      {
        name: field.value?.replace("/uploadImg/", ""),
        url: field.value,
      },
    ];
  }, 100);
};

const imgOnChange = async (file: AnyObject) => {
  let formData = new FormData();
  formData.append("file", file.raw);
  formData.append("filename", file.name);
  const result = await uploadFile(formData);
  if (result.status) {
    field.value = `/uploadImg${result.data?.url}`;
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
  const res = await downloadFile({ filename: field.value?.replace("/uploadImg/", "") });
  console.log("downLoad", res);
  if (res.status) {
    showTips("success", "下载成功");
  }
};

defineExpose({
  options,
});
onMounted(() => {
  requestOptions();
  initFileList();
});
</script>

<style scoped lang="less">
.uploader {
  display: flex;
  ::v-deep {
    .el-upload {
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
}
</style>
