<template>
  <div class="im-msglist-wrap" ref="wrapRef">
    <VirtualList
      ref="vlistRef"
      :items="items"
      :item-height="64"
      :buffer="8"
      height="100%"
      item-key="msgId"
      @reach-bottom="onReachBottom"
    >
      <template #default="{ item }">
        <MessageBubble
          :msg="item"
          :is-self="String(item.senderId) === selfUid"
          :sender-name="senderName(item)"
          @contextmenu="onContextmenu"
        />
      </template>
    </VirtualList>
    <div v-if="loading" class="im-msglist-loading">加载中…</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import VirtualList from '@/components/base/VirtualList/index.vue'
import MessageBubble from './MessageBubble.vue'
import type { ImMessage } from '@/api/im/types'
import { userInfoStore } from '@/stores/user-info'

const props = defineProps<{
  items: ImMessage[]
  loading?: boolean
}>()

const emit = defineEmits<{
  loadMore: []
  contextmenu: [msg: ImMessage, x: number, y: number]
}>()

const vlistRef = ref<InstanceType<typeof VirtualList> | null>(null)
const wrapRef = ref<HTMLElement | null>(null)

function selfUid(): string {
  try {
    return String(userInfoStore().getUserId.value || '0')
  } catch {
    return '0'
  }
}

function senderName(msg: ImMessage): string {
  if (String(msg.senderId) === selfUid()) return '我'
  return msg.senderId ? `用户${msg.senderId.slice(-4)}` : '用户'
}

function onReachBottom() {
  // 滚动到底部（消息列表以最新在底）
}

function onContextmenu(msg: ImMessage, x: number, y: number) {
  emit('contextmenu', msg, x, y)
}

/** 新消息追加后滚动到底部 */
watch(
  () => props.items.length,
  async () => {
    await nextTick()
    vlistRef.value?.scrollToIndex(props.items.length - 1)
  }
)
</script>

<style scoped lang="less">
.im-msglist-wrap {
  position: relative;
  height: 100%;
  overflow: hidden;
}
.im-msglist-loading {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: @color-text-placeholder;
  background: fade(@color-bg, 80%);
  padding: 2px 10px;
  border-radius: 10px;
}
</style>
