<template>
  <div
    class="ai-msg-row"
    :class="{
      'is-user': message.role === 'user',
      'is-assistant': message.role === 'assistant'
    }"
  >
    <div
      class="ai-msg-avatar"
      :class="message.role === 'user' ? 'avatar-user' : 'avatar-ai'"
    >
      <el-icon :size="18">
        <UserFilled v-if="message.role === 'user'" />
        <Service v-else />
      </el-icon>
    </div>
    <div class="ai-msg-body">
      <div
        v-if="thinkingText && message.role === 'assistant'"
        class="ai-msg-thinking"
        :class="{ 'is-live': streaming && thinkingActive }"
      >
        <button
          type="button"
          class="thinking-toggle"
          @click="thinkingExpanded = !thinkingExpanded"
        >
          <el-icon class="thinking-icon"><Cpu /></el-icon>
          <span>{{ $t('aiAssistant.thinkingProcess') }}</span>
          <span v-if="streaming && thinkingActive" class="thinking-live-dot" />
          <el-icon class="chevron" :class="{ expanded: thinkingExpanded }">
            <ArrowDown />
          </el-icon>
        </button>
        <div v-show="thinkingExpanded" class="thinking-content">
          <pre>{{ thinkingText }}</pre>
        </div>
      </div>

      <div
        v-if="showWaiting"
        class="ai-msg-waiting"
      >
        <span class="typing-dots">
          <span /><span /><span />
        </span>
        {{ $t('aiAssistant.thinking') }}
      </div>

      <div v-else-if="message.type === 'text'" class="ai-msg-text">{{ message.content }}</div>

      <div
        v-else-if="message.type === 'rich' && message.content"
        class="ai-msg-rich"
        :class="{ 'is-streaming': streaming }"
        v-html="message.content"
      />

      <div v-else-if="message.type === 'voice'" class="ai-msg-voice">
        <div class="voice-bar">
          <el-icon><Microphone /></el-icon>
          <span class="voice-waves">
            <span class="wave" v-for="i in 5" :key="i" />
          </span>
          <span class="duration">{{ voicePayload?.durationSec?.toFixed(1) ?? 0 }}″</span>
        </div>
        <p class="transcript">{{ voicePayload?.transcript || message.content }}</p>
      </div>

      <div v-else-if="message.type === 'file'" class="ai-msg-file">
        <div class="file-icon-wrap">
          <el-icon><Document /></el-icon>
        </div>
        <div class="file-info">
          <div class="name">{{ filePayload?.name }}</div>
          <div class="meta">{{ formatSize(filePayload?.size) }}</div>
        </div>
      </div>

      <div v-else-if="message.type === 'table'" class="ai-msg-card ai-msg-table">
        <p v-if="message.content" class="card-caption">{{ message.content }}</p>
        <el-table :data="tablePayload?.rows || []" size="small" stripe class="inner-table">
          <el-table-column
            v-for="col in tablePayload?.columns || []"
            :key="col.prop"
            :prop="col.prop"
            :label="col.label"
            min-width="80"
          />
        </el-table>
      </div>

      <div v-else-if="message.type === 'chart'" class="ai-msg-card ai-msg-chart">
        <p v-if="message.content" class="card-caption">{{ message.content }}</p>
        <div ref="chartRef" class="chart-box" :style="{ height: chartHeight + 'px' }" />
      </div>

      <div class="ai-msg-time">{{ formatTime(message.createdAt) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  UserFilled,
  Service,
  Microphone,
  Document,
  Cpu,
  ArrowDown
} from '@element-plus/icons-vue'
import type {
  AiChartPayload,
  AiFilePayload,
  AiMessage,
  AiTablePayload,
  AiThinkingPayload,
  AiVoicePayload
} from '@/types/ai-assistant'
import { aiAssistantStore } from '@/stores/ai-assistant'

const props = defineProps<{
  message: AiMessage
  streaming?: boolean
}>()

const store = aiAssistantStore()
const thinkingExpanded = ref(true)

const chartRef = ref<HTMLElement | null>(null)
let chartInst: echarts.ECharts | null = null

const thinkingText = computed(() => {
  const payload = props.message.payload as AiThinkingPayload | undefined
  return payload?.thinking?.trim() || ''
})

const thinkingActive = computed(
  () => props.streaming && store.thinkingActive && !store.streamContent
)

const showWaiting = computed(
  () =>
    props.streaming &&
    props.message.role === 'assistant' &&
    !props.message.content &&
    !thinkingText.value
)

const voicePayload = computed(() => props.message.payload as AiVoicePayload | undefined)
const filePayload = computed(() => props.message.payload as AiFilePayload | undefined)
const tablePayload = computed(() => props.message.payload as AiTablePayload | undefined)
const chartPayload = computed(() => props.message.payload as AiChartPayload | undefined)
const chartHeight = computed(() => chartPayload.value?.height ?? 200)

function formatSize(size?: number) {
  if (!size) return ''
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function initChart() {
  if (props.message.type !== 'chart' || !chartRef.value || !chartPayload.value?.option) return
  chartInst?.dispose()
  chartInst = echarts.init(chartRef.value)
  chartInst.setOption(chartPayload.value.option as echarts.EChartsOption)
}

onMounted(() => {
  nextTick(initChart)
})

watch(
  () => props.message.id,
  () => nextTick(initChart)
)

onBeforeUnmount(() => {
  chartInst?.dispose()
  chartInst = null
})
</script>

<style scoped lang="less">
@import './ai-variables.less';

.ai-msg-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  animation: ai-msg-in 0.3s ease;

  &.is-user {
    flex-direction: row-reverse;

    .ai-msg-body {
      align-items: flex-end;
      background: @ai-user-bubble;
      border: 1px solid fade(@ai-primary, 18%);
      border-bottom-right-radius: 4px;
    }

    .ai-msg-time {
      text-align: right;
    }
  }

  &.is-assistant .ai-msg-body {
    background: @ai-assistant-bubble;
    border: 1px solid @ai-border;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
  }
}

@keyframes ai-msg-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-msg-avatar {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: @ai-radius-full;
  display: flex;
  align-items: center;
  justify-content: center;

  &.avatar-user {
    background: linear-gradient(135deg, #94bfff, @ai-primary);
    color: #fff;
  }

  &.avatar-ai {
    background: @ai-gradient-soft;
    color: @ai-primary;
    border: 1px solid fade(@ai-primary, 25%);
  }
}

.ai-msg-body {
  max-width: 88%;
  padding: 11px 14px;
  border-radius: @ai-radius-md;
  text-align: left;
}

.ai-msg-thinking {
  margin-bottom: 10px;
  border-radius: @ai-radius-sm;
  border: 1px dashed fade(@ai-primary, 22%);
  background: fade(@ai-primary, 5%);
  overflow: hidden;

  &.is-live .thinking-toggle {
    color: @ai-primary-dark;
  }
}

.thinking-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: @ai-text-secondary;
  cursor: pointer;
  text-align: left;

  .thinking-icon {
    color: @ai-primary;
  }

  .thinking-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: @ai-primary;
    animation: ai-rec-pulse 1s ease infinite;
  }

  .chevron {
    margin-left: auto;
    transition: transform 0.2s;

    &.expanded {
      transform: rotate(180deg);
    }
  }
}

.thinking-content {
  padding: 0 10px 10px;

  pre {
    margin: 0;
    padding: 10px 12px;
    max-height: 200px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 12px;
    line-height: 1.55;
    color: @ai-text-secondary;
    background: rgba(255, 255, 255, 0.75);
    border-radius: @ai-radius-sm;
    border: 1px solid @ai-border;
    font-family: inherit;
  }
}

.ai-msg-waiting {
  display: flex;
  align-items: center;
  gap: 8px;
  color: @ai-text-secondary;
  font-size: 13px;
  min-height: 24px;
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

@keyframes ai-rec-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 fade(@ai-primary, 40%);
  }
  50% {
    box-shadow: 0 0 0 5px fade(@ai-primary, 0%);
  }
}

@keyframes ai-cursor-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.ai-msg-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.55;
  font-size: 13px;
  color: @ai-text;
}

.ai-msg-rich {
  font-size: 13px;
  line-height: 1.6;
  color: @ai-text;

  &.is-streaming::after {
    content: '';
    display: inline-block;
    width: 2px;
    height: 1em;
    margin-left: 2px;
    vertical-align: text-bottom;
    background: @ai-primary;
    animation: ai-cursor-blink 0.9s step-end infinite;
  }

  :deep(p) {
    margin: 0 0 8px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  :deep(ul) {
    margin: 6px 0;
    padding-left: 18px;
  }
  :deep(pre) {
    background: #f3f6fb;
    padding: 10px 12px;
    border-radius: @ai-radius-sm;
    overflow-x: auto;
    border: 1px solid @ai-border;
    font-size: 12px;
  }
  :deep(code) {
    background: #eef2f7;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    color: @ai-primary-dark;
  }
}

.ai-msg-voice {
  .voice-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: fade(@ai-primary, 8%);
    border-radius: @ai-radius-full;
    color: @ai-primary-dark;
    font-size: 13px;
  }

  .voice-waves {
    display: flex;
    align-items: center;
    gap: 3px;
    height: 14px;
  }

  .wave {
    display: inline-block;
    width: 3px;
    height: 10px;
    background: @ai-primary;
    border-radius: 2px;
    animation: ai-voice-wave 0.8s ease-in-out infinite;

    &:nth-child(1) { animation-delay: 0s; height: 6px; }
    &:nth-child(2) { animation-delay: 0.1s; height: 10px; }
    &:nth-child(3) { animation-delay: 0.2s; height: 14px; }
    &:nth-child(4) { animation-delay: 0.15s; height: 8px; }
    &:nth-child(5) { animation-delay: 0.25s; height: 12px; }
  }

  .transcript {
    width: 100%;
    margin: 8px 0 0;
    font-size: 13px;
    color: @ai-text-secondary;
    line-height: 1.45;
  }
}

@keyframes ai-voice-wave {
  0%,
  100% {
    transform: scaleY(0.6);
    opacity: 0.6;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

.ai-msg-file {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;

  .file-icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: @ai-radius-sm;
    background: fade(@ai-primary, 10%);
    color: @ai-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }

  .name {
    font-weight: 600;
    font-size: 13px;
    color: @ai-text;
  }

  .meta {
    font-size: 12px;
    color: @ai-text-muted;
    margin-top: 2px;
  }
}

.ai-msg-card {
  .card-caption {
    margin: 0 0 10px;
    font-size: 13px;
    color: @ai-text-secondary;
  }

  .inner-table {
    border-radius: @ai-radius-sm;
    overflow: hidden;
  }
}

.chart-box {
  width: 100%;
  min-width: 240px;
  border-radius: @ai-radius-sm;
  background: #fafbfd;
}

.ai-msg-time {
  margin-top: 8px;
  font-size: 11px;
  color: @ai-text-muted;
}
</style>
