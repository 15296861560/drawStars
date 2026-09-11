<template>
  <div class="im-bubble-wrap" :class="{ self: isSelf }">
    <ImAvatar :src="avatar" :name="senderName" :size="36" />
    <div class="im-bubble-main">
      <div class="im-bubble-meta">
        <span class="im-bubble-name">{{ senderName }}</span>
        <span class="im-bubble-time">{{ timeLabel }}</span>
      </div>
      <div
        class="im-bubble"
        :class="bubbleClass"
        @contextmenu.prevent="onContextmenu"
      >
        <!-- 文本 -->
        <template v-if="msg.msgType === 'TEXT'">
          <span class="im-bubble-text" v-html="renderText(content.text)"></span>
        </template>
        <!-- 图片 -->
        <template v-else-if="msg.msgType === 'IMAGE'">
          <img
            class="im-bubble-img"
            :src="content.url"
            alt=""
            @click="preview(content.url)"
          />
        </template>
        <!-- 系统 -->
        <template v-else-if="msg.msgType === 'SYSTEM'">
          <span class="im-bubble-system">{{ content.text || '系统消息' }}</span>
        </template>
        <!-- 自定义 -->
        <template v-else>
          <span class="im-bubble-text">[自定义消息]</span>
        </template>
      </div>
      <div v-if="msg.status === 'SENDING'" class="im-bubble-status">
        发送中…
      </div>
      <div v-else-if="msg.status === 'DELETED'" class="im-bubble-status failed">
        发送失败
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { ImMessage } from '@/api/im/types'
import { MsgStatus } from '@/api/im/types'

const ImAvatar = defineAsyncComponent(
  () => import('@/components/im/ImAvatar.vue')
)

const props = defineProps<{
  msg: ImMessage
  isSelf: boolean
  senderName?: string
  avatar?: string
}>()

const emit = defineEmits<{
  recall: [msgId: string]
  contextmenu: [msg: ImMessage, x: number, y: number]
}>()

const content = computed(() => (props.msg.content || {}) as Record<string, any>)
const senderName = computed(() => props.senderName || '用户')

const timeLabel = computed(() => {
  const ts = Number(props.msg.serverTime)
  if (!ts) return ''
  const d = new Date(ts > 1e12 ? ts : ts * 1)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
})

const bubbleClass = computed(() => ({
  'is-self': props.isSelf,
  'is-recalled': props.msg.status === MsgStatus.RECALLED,
  'is-system': props.msg.msgType === 'SYSTEM'
}))

function renderText(text: string): string {
  if (!text) return ''
  return escapeHtml(text).replace(/\n/g, '<br/>')
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function preview(url: string) {
  // 简易预览：复用 Element Plus 图片查看器（命令式不可用则新窗口）
  if (url) window.open(url, '_blank')
}

function onContextmenu(e: MouseEvent) {
  if (props.msg.status === MsgStatus.RECALLED) return
  emit('contextmenu', props.msg, e.clientX, e.clientY)
}
</script>

<style scoped lang="less">
.im-bubble-wrap {
  display: flex;
  gap: 10px;
  padding: 6px 16px;
  align-items: flex-start;
  &.self {
    flex-direction: row-reverse;
    .im-bubble-main {
      align-items: flex-end;
    }
    .im-bubble {
      background: @color-success;
      color: @color-text-normal;
    }
  }
}
.im-bubble-main {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}
.im-bubble-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: @color-text-placeholder;
  margin-bottom: 2px;
}
.im-bubble {
  background: @color-bg;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  box-shadow: 0 1px 2px @color-shadow-card;
  &.is-recalled {
    background: transparent;
    box-shadow: none;
    color: @color-text-placeholder;
    font-size: 12px;
  }
  &.is-system {
    background: transparent;
    box-shadow: none;
    color: @color-text-placeholder;
    text-align: center;
  }
}
.im-bubble-text {
  white-space: pre-wrap;
}
.im-bubble-img {
  max-width: 220px;
  max-height: 220px;
  border-radius: 6px;
  cursor: zoom-in;
}
.im-bubble-status {
  font-size: 12px;
  color: @color-text-placeholder;
  margin-top: 2px;
  &.failed {
    color: @color-danger;
  }
}
</style>
