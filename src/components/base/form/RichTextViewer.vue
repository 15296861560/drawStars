<!--
 * @Description: 富文本只读展示（与 Quill Snow 编辑器视觉一致）
 -->
<template>
  <div
    class="rich-text-viewer ql-snow"
    :class="{ 'is-bordered': bordered }"
    :style="wrapperStyle"
  >
    <div v-if="html" class="ql-editor" v-html="html"></div>
    <div v-else class="ql-editor rich-text-viewer__empty">
      {{ emptyText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import 'quill/dist/quill.snow.css'

const props = withDefaults(
  defineProps<{
    /** 已清洗的 HTML 或纯文本转义后的 HTML */
    html?: string
    emptyText?: string
    /** 是否显示边框（接近编辑器容器） */
    bordered?: boolean
    /** 最大高度，超出滚动 */
    maxHeight?: string | number
    minHeight?: string | number
  }>(),
  {
    html: '',
    emptyText: '（无内容）',
    bordered: true,
    maxHeight: '68vh',
    minHeight: '200px'
  }
)

const toCssSize = (val?: string | number) => {
  if (val == null || val === '') return undefined
  return typeof val === 'number' ? `${val}px` : val
}

const wrapperStyle = computed(() => ({
  maxHeight: toCssSize(props.maxHeight),
  minHeight: toCssSize(props.minHeight)
}))
</script>

<style lang="less" scoped>
.rich-text-viewer {
  width: 100%;
  box-sizing: border-box;
  overflow: auto;
  background: #fff;

  &.is-bordered {
    border: 1px solid #ccc;
    border-radius: 0;
  }

  :deep(.ql-editor) {
    /* 覆盖 Quill 默认 height:100%，按内容撑开并由外层滚动 */
    height: auto;
    min-height: 120px;
    overflow: visible;
    padding: 12px 15px;
    line-height: 1.42;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 13px;
    white-space: normal;
    word-break: break-word;

    img {
      max-width: 100%;
      height: auto;
    }

    a {
      color: #06c;
    }
  }

  .rich-text-viewer__empty {
    color: rgba(0, 0, 0, 0.45);
  }
}
</style>
