<template>
  <div ref="listRef" class="ai-message-list" v-loading="store.loading">
    <div v-if="!store.loading && !store.messages.length" class="ai-empty">
      <div class="empty-icon">
        <el-icon :size="40"><ChatDotRound /></el-icon>
      </div>
      <p class="empty-title">{{ $t('aiAssistant.emptyTitle') }}</p>
      <p class="empty-desc">{{ $t('aiAssistant.emptyDesc') }}</p>
    </div>
    <MessageBubble
      v-for="msg in store.messages"
      :key="msg.id"
      :message="msg"
      :streaming="isStreamingMessage(msg.id)"
    />
    <div v-if="showGlobalTyping" class="ai-typing">
      <span class="typing-dots"> <span /><span /><span /> </span>
      {{ $t('aiAssistant.thinking') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ChatDotRound } from '@element-plus/icons-vue'
import { aiAssistantStore } from '@/stores/ai-assistant'
import MessageBubble from './MessageBubble.vue'

const store = aiAssistantStore()
const listRef = ref<HTMLElement | null>(null)

const hasStreamOutput = computed(() =>
  Boolean(store.streamContent || store.streamThinking)
)

const showGlobalTyping = computed(
  () => store.sending && !hasStreamOutput.value && !store.streaming
)

function isStreamingMessage(id: string) {
  return store.streaming && id.startsWith('stream-')
}

function scrollBottom() {
  nextTick(() => {
    const el = listRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

watch(
  () => [
    store.messages.length,
    store.sending,
    store.streamContent,
    store.streamThinking
  ],
  () => scrollBottom()
)

watch(
  () => store.activeConversationId,
  () => scrollBottom()
)
</script>

<style scoped lang="less">
@import './ai-variables.less';

// 消息流：透明底让面板星域透出，滚动条走夜色 token
.ai-message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px 20px 12px;
  min-height: 0;
  scroll-behavior: smooth;
  background: @ai-bg-chat;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: @ai-scrollbar-thumb;
    border-radius: @ai-radius-full;

    &:hover {
      background: @ai-scrollbar-thumb-hover;
    }
  }
}

.ai-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  padding: 32px 24px;
  text-align: center;

  .empty-icon {
    width: 64px;
    height: 64px;
    border-radius: @ai-radius-full;
    background: @ai-gradient;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    // 主题色光晕（40% 主题色），随主题呼吸
    box-shadow: 0 8px 24px @ai-primary-fog;
  }

  .empty-title {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 600;
    color: @ai-text;
    letter-spacing: -0.02em;
  }

  .empty-desc {
    margin: 0;
    font-size: 14px;
    color: @ai-text-muted;
    line-height: 1.6;
    max-width: 280px;
  }
}

// 等待卡片：夜色薄玻璃
.ai-typing {
  display: flex;
  align-items: center;
  gap: 10px;
  color: @ai-text-secondary;
  font-size: 13px;
  padding: 12px 16px;
  background: @ai-fill-04;
  border-radius: @ai-radius-md;
  border: 1px solid @ai-border;
  width: fit-content;
  margin-bottom: 8px;
  margin-left: 44px;
}

.typing-dots {
  display: flex;
  gap: 4px;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    // 亮变体在夜色底上更醒目
    background: @ai-primary-hover;
    animation: ai-typing-bounce 1.2s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.15s;
    }
    &:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
}
</style>
