<template>
  <div class="rich-text-editor" :class="{ 'is-disabled': disabled }">
    <span :id="uploadFormatsId" class="ql-formats">
      <button
        type="button"
        class="ql-upload drawstars-icon-word-monochrome dodgerblue"
        @click="uploadFile(false)"
      ></button>
      <button
        type="button"
        class="ql-upload drawstars-icon-word-monochrome"
        @click="uploadFile(true)"
      ></button>
    </span>

    <input
      v-show="false"
      type="file"
      :id="docxColorId"
      accept=".docx"
      @change="handleFileChange($event)"
    />
    <input
      v-show="false"
      type="file"
      :id="docxFileId"
      accept=".docx"
      @change="handleFileChange($event, true)"
    />
    <div class="editor-container" :id="editorId" ref="editorRef"></div>
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef, onMounted, watch, nextTick } from 'vue'
import Quill from 'quill'
import { useVModels } from '@vueuse/core'
import 'quill/dist/quill.snow.css'
import { findReq } from '@/assets/js/api'

const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const editorId = `quill-editor-${uid}`
const uploadFormatsId = `ql-upload-formats-${uid}`
const docxColorId = `docx-color-${uid}`
const docxFileId = `docx-file-${uid}`

const props = defineProps<{
  field?: string | number | boolean | string[] | any
  valueModel?: string
  disabled?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:valueModel', value: string): void
}>()

const { valueModel } = useVModels(props, emit)

const quill = ref<InstanceType<typeof Quill> | null>(null)
const editorRef = shallowRef<HTMLElement>()
const syncingFromOutside = ref(false)

const isEffectivelyEmpty = (html: string) => {
  const plain = String(html || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, '')
    .trim()
  return !plain
}

const syncBlankClass = (html: string) => {
  const root = quill.value?.root as HTMLElement | undefined
  if (!root) return
  if (isEffectivelyEmpty(html)) {
    root.classList.add('ql-blank')
  } else {
    root.classList.remove('ql-blank')
  }
}

const setEditorHtml = (html: string) => {
  if (!quill.value) return
  const next = html || ''
  syncingFromOutside.value = true
  try {
    // Quill 1.3：convert 接收 html 字符串；避免直接改 innerHTML 导致占位符残留
    const delta = quill.value.clipboard.convert(next)
    quill.value.setContents(delta, 'silent')
    // 部分内容写入后仍可能残留空白态 class，手动同步
    syncBlankClass(next)
  } finally {
    syncingFromOutside.value = false
  }
}

const uploadFile = (isMonochrome = false) => {
  if (props.disabled) return
  const input = document.getElementById(
    isMonochrome ? docxFileId : docxColorId
  ) as HTMLInputElement
  input?.click()
}

const handleFileChange = async (e: Event, isMonochrome = false) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const formData = new FormData()
    formData.append('docxFile', file)

    const req = findReq(
      'converController',
      isMonochrome ? 'convertMammoth' : 'convertQuill'
    )
    const res = await req(formData)
    if (res.status) {
      valueModel.value = res.data.html
      setEditorHtml(res.data.html)
    }
    target.value = ''
  }
}

const updateValueModel = (value: string) => {
  if (!quill.value) return
  const next = value || ''
  const current = quill.value.root.innerHTML
  if (current === next) {
    syncBlankClass(next)
    return
  }
  setEditorHtml(next)
}

const textChange = (value: string) => {
  if (syncingFromOutside.value) return
  valueModel.value = value
  syncBlankClass(value)
}

const editorConfig = {
  debug: false,
  modules: {
    toolbar: props.disabled
      ? false
      : [
          [
            'bold',
            'italic',
            'underline',
            'strike',
            'clean',
            'link',
            'image',
            'video'
          ],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ header: 1 }, { header: 2 }],
          [{ script: 'sub' }, { script: 'super' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ size: ['small', false, 'large', 'huge'] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ color: [] }, { background: [] }],
          [{ font: [] }],
          [{ align: [] }]
        ]
  },
  placeholder: props.disabled ? '' : props.placeholder || '请输入...',
  theme: 'snow',
  readOnly: !!props.disabled
}

const initQuill = () => {
  if (!editorRef.value) return
  quill.value = new Quill(editorRef.value, editorConfig)

  if (!props.disabled) {
    const toolbar = quill.value.getModule('toolbar')
    const qlUploadEL = document.getElementById(uploadFormatsId)
    if (qlUploadEL && toolbar?.container) {
      qlUploadEL.remove()
      toolbar.container.appendChild(qlUploadEL)
    }
  } else {
    const qlUploadEL = document.getElementById(uploadFormatsId)
    qlUploadEL?.remove()
  }

  quill.value.on('text-change', () => {
    if (!quill.value) return
    textChange(quill.value.root.innerHTML)
  })

  quill.value.enable(!props.disabled)
  if (valueModel.value) {
    setEditorHtml(valueModel.value)
  } else {
    syncBlankClass('')
  }
}

watch(
  () => props.disabled,
  disabled => {
    quill.value?.enable(!disabled)
    // 查看态强制隐藏占位符
    if (disabled && quill.value) {
      syncBlankClass(quill.value.root.innerHTML)
    }
  }
)

watch(
  () => valueModel.value,
  async val => {
    await nextTick()
    updateValueModel(val || '')
  }
)

onMounted(() => {
  initQuill()
})

onBeforeUnmount(() => {
  quill.value = null
})

defineExpose({
  editorRef,
  editorConfig,
  updateValueModel
})
</script>
<style lang="less" scoped>
.rich-text-editor {
  width: 100%;
}

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

/* 有内容或禁用/查看态时，隐藏 Quill 占位符，避免与正文重叠 */
.rich-text-editor.is-disabled {
  :deep(.ql-toolbar) {
    display: none;
  }

  :deep(.ql-editor.ql-blank::before) {
    display: none !important;
    content: none !important;
  }
}

:deep(.ql-editor:not(.ql-blank)::before) {
  display: none !important;
  content: none !important;
}
</style>
