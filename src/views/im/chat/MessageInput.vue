<template>
  <div class="im-input-wrap">
    <div class="im-input-toolbar">
      <el-button text @click="toggleEmoji">😊</el-button>
      <el-upload
        :show-file-list="false"
        :before-upload="onUpload"
        accept="image/*"
      >
        <el-button text>🖼</el-button>
      </el-upload>
      <span v-if="muted" class="im-input-muted">已禁言</span>
    </div>

    <div v-if="showEmoji" class="im-input-emoji">
      <span v-for="e in emojis" :key="e" class="im-input-emoji-item" @click="insertEmoji(e)">{{ e }}</span>
    </div>

    <div class="im-input-row">
      <el-input
        v-model="text"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 5 }"
        :placeholder="muted ? '当前会话已被禁言' : '输入消息，Enter 发送，Shift+Enter 换行'"
        :disabled="muted"
        resize="none"
        @keydown.enter.exact.prevent="onSend"
      />
      <el-button type="primary" :disabled="muted || !text.trim()" :loading="sending" @click="onSend">发送</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  muted?: boolean
  sending?: boolean
}>()

const emit = defineEmits<{
  send: [text: string]
  image: [file: File]
}>()

const text = ref('')
const showEmoji = ref(false)
const sending = ref(false)
const emojis = ['😀', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '👍', '👌', '🙏', '💪', '🎉', '❤️', '🔥', '⭐']

function toggleEmoji() {
  showEmoji.value = !showEmoji.value
}

function insertEmoji(e: string) {
  text.value += e
}

async function onSend() {
  const t = text.value.trim()
  if (!t || props.muted) return
  sending.value = true
  try {
    emit('send', t)
    text.value = ''
  } finally {
    sending.value = false
  }
}

function onUpload(file: File) {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('仅支持图片')
    return false
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片不能超过 10MB')
    return false
  }
  emit('image', file)
  return false
}
</script>

<style scoped lang="less">
.im-input-wrap {
  border-top: 1px solid @color-bg-divider;
  background: @color-base-bg;
  padding: 8px 12px;
}
.im-input-toolbar {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-bottom: 6px;
}
.im-input-muted {
  color: @color-danger;
  font-size: 12px;
}
.im-input-emoji {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
  background: @color-bg;
  border: 1px solid @color-bg-divider;
  border-radius: 6px;
  margin-bottom: 6px;
  max-width: 360px;
}
.im-input-emoji-item {
  cursor: pointer;
  font-size: 20px;
  &:hover {
    background: @color-fill-hover;
    border-radius: 4px;
  }
}
.im-input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  :deep(.el-textarea__inner) {
    font-family: inherit;
  }
}
</style>
