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
      <span class="typing-dots">
        <span /><span /><span />
      </span>
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

const hasStreamOutput = computed(
  () => Boolean(store.streamContent || store.streamThinking)
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

.ai-message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px;
  min-height: 0;
  scroll-behavior: smooth;
  background-color: @ai-bg-chat;
  background-image: radial-gradient(
      circle at 1px 1px,
      fade(@ai-primary, 6%) 1px,
      transparent 0
    ),
    radial-gradient(
      circle at 100% 100%,
      fade(@ai-primary, 4%) 0,
      transparent 42%
    );
  background-size:
    20px 20px,
    100% 100%;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: fade(@ai-text-muted, 40%);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: fade(@ai-primary, 45%);
  }
}

.ai-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 24px;
  text-align: center;

  .empty-icon {
    width: 72px;
    height: 72px;
    border-radius: @ai-radius-full;
    background: @ai-gradient-soft;
    color: @ai-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
    border: 1px dashed fade(@ai-primary, 30%);
  }

  .empty-title {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 600;
    color: @ai-text;
  }

  .empty-desc {
    margin: 0;
    font-size: 13px;
    color: @ai-text-muted;
    line-height: 1.5;
    max-width: 260px;
  }
}

.ai-typing {
  display: flex;
  align-items: center;
  gap: 10px;
  color: @ai-text-secondary;
  font-size: 13px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: @ai-radius-md;
  border: 1px solid @ai-border;
  width: fit-content;
  margin-bottom: 8px;
}

.typing-dots {
  display: flex;
  gap: 4px;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: @ai-primary;
    animation: ai-typing-bounce 1.2s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.15s;
    }
    &:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
}

@keyframes ai-typing-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-5px);
    opacity: 1;
  }
}
</style>
