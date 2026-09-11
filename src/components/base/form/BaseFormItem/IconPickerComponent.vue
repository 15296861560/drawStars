<template>
  <div class="icon-picker" :class="{ disabled }">
    <div class="icon-picker__row">
      <el-select
        v-model="selectedName"
        class="icon-picker__select"
        filterable
        clearable
        placeholder="下拉选择图标"
        :disabled="disabled"
        @change="onSelectIcon"
        @clear="onClearSelect"
      >
        <el-option
          v-for="name in iconNames"
          :key="name"
          :label="name"
          :value="name"
        >
          <div class="icon-option">
            <el-icon :size="18">
              <component :is="iconsMap[name]" />
            </el-icon>
            <span>{{ name }}</span>
          </div>
        </el-option>
      </el-select>

      <div class="icon-picker__preview">
        <img
          v-if="isUrlValue"
          class="icon-preview-img"
          :src="previewSrc"
          alt="icon"
        />
        <el-icon v-else-if="selectedName && iconsMap[selectedName]" :size="22">
          <component :is="iconsMap[selectedName]" />
        </el-icon>
        <span v-else class="icon-preview-empty">无</span>
      </div>
    </div>

    <div class="icon-picker__upload">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :show-file-list="false"
        :disabled="disabled"
        :limit="1"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
        :on-change="onFileChange"
        :on-exceed="onExceed"
      >
        <el-button :disabled="disabled" :loading="uploading" size="small">
          {{ uploading ? '上传中...' : '上传图标' }}
        </el-button>
      </el-upload>
      <span class="icon-picker__tip">
        支持 png/jpg/svg/webp，不超过 {{ maxSizeLabel }}
      </span>
      <el-button
        v-if="isUrlValue"
        link
        type="danger"
        size="small"
        :disabled="disabled"
        @click="clearUpload"
      >
        清除上传
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import type { UploadFile, UploadInstance, UploadRawFile } from 'element-plus'
import { genFileId } from 'element-plus'
import { useVModels } from '@vueuse/core'
import { showTips } from '@/utils/message/showTips.js'
import { findReq } from '@/assets/js/api'

const props = defineProps<{
  field?: string
  disabled?: boolean
  /** 最大体积（MB），默认 0.2MB = 200KB */
  maxSizeMb?: number
}>()

const emit = defineEmits<{
  (e: 'update:field', value: string): void
}>()

const { field } = useVModels(props, emit)

const iconsMap = ElementPlusIcons as Record<string, any>
const iconNames = Object.keys(iconsMap).sort()

const uploadRef = ref<UploadInstance>()
const uploading = ref(false)
const selectedName = ref('')

const maxSizeMB = computed(() =>
  props.maxSizeMb != null && props.maxSizeMb > 0 ? props.maxSizeMb : 0.2
)
const maxSizeLabel = computed(() => {
  const mb = maxSizeMB.value
  if (mb < 1) return `${Math.round(mb * 1024)}KB`
  return `${mb}MB`
})

const isUrlValue = computed(() => {
  const v = String(field.value || '')
  return (
    v.startsWith('http') ||
    v.startsWith('/') ||
    v.startsWith('data:image') ||
    v.includes('uploadImg')
  )
})

const previewSrc = computed(() => {
  const v = String(field.value || '')
  if (!v) return ''
  if (
    v.startsWith('http') ||
    v.startsWith('data:') ||
    v.startsWith('/uploadImg')
  ) {
    return v
  }
  if (v.startsWith('/')) return v
  return `/uploadImg${v.startsWith('/') ? '' : '/'}${v}`
})

function syncFromField() {
  const v = String(field.value || '')
  if (!v) {
    selectedName.value = ''
    return
  }
  if (isUrlValue.value) {
    selectedName.value = ''
    return
  }
  selectedName.value = iconsMap[v] ? v : ''
}

watch(
  () => field.value,
  () => syncFromField(),
  { immediate: true }
)

function onSelectIcon(name: string) {
  if (!name) {
    field.value = ''
    return
  }
  field.value = name
}

function onClearSelect() {
  if (!isUrlValue.value) {
    field.value = ''
  }
}

function clearUpload() {
  field.value = ''
  selectedName.value = ''
  uploadRef.value?.clearFiles()
}

const onExceed = (files: File[]) => {
  uploadRef.value?.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value?.handleStart(file)
}

async function onFileChange(file: UploadFile) {
  if (!file.raw) return
  const raw = file.raw
  const okType = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/svg+xml',
    'image/webp'
  ].includes(raw.type)
  if (!okType) {
    showTips('error', '仅支持 png、jpg、svg、webp 图片')
    uploadRef.value?.clearFiles()
    return
  }
  const sizeMB = raw.size / 1024 / 1024
  if (sizeMB > maxSizeMB.value) {
    showTips('error', `图标大小不能超过 ${maxSizeLabel.value}`)
    uploadRef.value?.clearFiles()
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', raw)
    formData.append('filename', raw.name)
    formData.append('type', '0')
    const req = findReq('commomController', 'uploadFile')
    const res = await req(formData)
    if (res.status) {
      const url = res.data?.url || ''
      field.value = url.startsWith('/uploadImg')
        ? url
        : `/uploadImg${url.startsWith('/') ? url : `/${url}`}`
      selectedName.value = ''
      showTips('success', '上传成功')
    } else {
      showTips('error', res.msg || '上传失败')
      uploadRef.value?.clearFiles()
    }
  } catch (e: any) {
    showTips('error', e?.message || '上传失败')
    uploadRef.value?.clearFiles()
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped lang="less">
.icon-picker {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &.disabled {
    opacity: 0.7;
  }
}

.icon-picker__row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-picker__select {
  flex: 1;
  min-width: 0;
}

.icon-picker__preview {
  width: 40px;
  height: 40px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--el-fill-color-blank);
  overflow: hidden;
}

.icon-preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.icon-preview-empty {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-picker__upload {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.icon-picker__tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
