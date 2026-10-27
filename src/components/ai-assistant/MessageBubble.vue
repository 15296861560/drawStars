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
      <img
        v-if="message.role === 'user' && showUserAvatar"
        class="avatar-img"
        :src="userAvatar"
        alt=""
        @error="avatarLoadError = true"
      />
      <el-icon v-else :size="18">
        <UserFilled v-if="message.role === 'user'" />
        <AiRobotIcon v-else />
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

      <div v-if="showWaiting" class="ai-msg-waiting">
        <span class="typing-dots"> <span /><span /><span /> </span>
        {{ $t('aiAssistant.thinking') }}
      </div>

      <div v-else-if="message.type === 'text'" class="ai-msg-text">
        {{ message.content }}
      </div>

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
          <span class="duration"
            >{{ voicePayload?.durationSec?.toFixed(1) ?? 0 }}″</span
          >
        </div>
        <p class="transcript">
          {{ voicePayload?.transcript || message.content }}
        </p>
      </div>

      <div v-else-if="message.type === 'file'" class="ai-msg-file">
        <div class="file-icon-wrap" :class="`tone-${fileVisual.tone}`">
          <el-icon :size="22">
            <component :is="fileVisual.icon" />
          </el-icon>
        </div>
        <div class="file-info">
          <div class="name">{{ filePayload?.name || message.content }}</div>
          <div class="meta">
            <span class="file-ext">{{ fileExtLabel }}</span>
            <span v-if="filePayload?.size" class="file-size">{{
              formatSize(filePayload.size)
            }}</span>
          </div>
        </div>
      </div>

      <div
        v-else-if="message.type === 'table'"
        class="ai-msg-card ai-msg-table"
      >
        <p v-if="message.content" class="card-caption">{{ message.content }}</p>
        <!-- 单列单条：单值问数（如「本月发放积分总数」）以指标卡突出数值 -->
        <div v-if="isSingleMetric && metricCell" class="metric-card">
          <p class="metric-label">{{ metricCell.label }}</p>
          <p class="metric-value">{{ metricCell.value }}</p>
        </div>
        <el-table
          v-else
          :data="tablePayload?.rows || []"
          size="small"
          stripe
          class="inner-table"
        >
          <el-table-column
            v-for="col in tablePayload?.columns || []"
            :key="col.prop"
            :prop="col.prop"
            :label="col.label"
            min-width="80"
          />
        </el-table>
      </div>

      <div
        v-else-if="message.type === 'chart'"
        class="ai-msg-card ai-msg-chart"
      >
        <p v-if="message.content" class="card-caption">{{ message.content }}</p>
        <div
          ref="chartRef"
          class="chart-box"
          :style="{ height: chartHeight + 'px' }"
        />
      </div>

      <div class="ai-msg-time" :class="{ 'has-tools': canSpeak }">
        <span>{{ formatTime(message.createdAt) }}</span>
        <div
          v-if="canSpeak"
          class="ai-msg-tools"
          :class="{ 'is-playing': speaking }"
        >
          <AiTooltip
            :content="
              speaking ? $t('aiAssistant.ttsStop') : $t('aiAssistant.ttsPlay')
            "
            placement="top"
          >
            <button type="button" class="tts-btn" @click="toggleSpeak">
              <el-icon>
                <Mute v-if="speaking" />
                <Headset v-else />
              </el-icon>
            </button>
          </AiTooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  UserFilled,
  Microphone,
  Cpu,
  ArrowDown,
  Headset,
  Mute
} from '@element-plus/icons-vue'
import { resolveFileVisual } from './file-icon'
import AiTooltip from './AiTooltip.vue'
import AiRobotIcon from './AiRobotIcon.vue'
import type {
  AiChartPayload,
  AiFilePayload,
  AiMessage,
  AiTablePayload,
  AiThinkingPayload,
  AiVoicePayload
} from '@/types/ai-assistant'
import { aiAssistantStore } from '@/stores/ai-assistant'
import { userInfoStore } from '@/stores/user-info'
import { useTts } from '@/composables/useTts'

const props = defineProps<{
  message: AiMessage
  streaming?: boolean
}>()

const store = aiAssistantStore()
const thinkingExpanded = ref(true)

// 用户气泡头像：优先登录态真实头像，缺失或加载失败回退默认人形图标
const userStore = userInfoStore()
const userAvatar = computed(() => userStore.getAvatar)
const avatarLoadError = ref(false)
const showUserAvatar = computed(
  () => !!userAvatar.value && !avatarLoadError.value
)
watch(userAvatar, () => {
  avatarLoadError.value = false
})

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

const voicePayload = computed(
  () => props.message.payload as AiVoicePayload | undefined
)
const filePayload = computed(
  () => props.message.payload as AiFilePayload | undefined
)
const fileVisual = computed(() =>
  resolveFileVisual(filePayload.value?.name, filePayload.value?.mimeType)
)
const fileExtLabel = computed(() => fileVisual.value.ext.toUpperCase())
const tablePayload = computed(
  () => props.message.payload as AiTablePayload | undefined
)
// 单列单条即单值问数：1×1 表格只是壳，改走指标卡渲染（保持消息结构不变）
const isSingleMetric = computed(
  () =>
    (tablePayload.value?.columns?.length ?? 0) === 1 &&
    (tablePayload.value?.rows?.length ?? 0) === 1
)
// 指标卡数据：label 用列名，value 取数值千分位化（非数值保持原文，缺失以 — 兜底）
const metricCell = computed(() => {
  if (!isSingleMetric.value || !tablePayload.value) return null
  const col = tablePayload.value.columns[0]
  const raw = tablePayload.value.rows[0]?.[col.prop]
  const value =
    typeof raw === 'number' && Number.isFinite(raw)
      ? raw.toLocaleString('zh-CN')
      : String(raw ?? '—')
  return { label: col.label, value }
})
const chartPayload = computed(
  () => props.message.payload as AiChartPayload | undefined
)
const chartHeight = computed(() => chartPayload.value?.height ?? 200)

// F03：assistant 文本类气泡的语音播报工具条（引擎不可用时隐藏，PRD 4.3.1）
const tts = useTts()
const canSpeak = computed(
  () =>
    props.message.role === 'assistant' &&
    (props.message.type === 'text' || props.message.type === 'rich') &&
    !!props.message.content &&
    tts.supported
)
const speaking = computed(() => tts.playingId.value === props.message.id)

function toggleSpeak() {
  if (speaking.value) {
    tts.stop(props.message.id)
  } else {
    tts.speak(props.message.id, props.message.content)
  }
}

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
  if (
    props.message.type !== 'chart' ||
    !chartRef.value ||
    !chartPayload.value?.option
  )
    return
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

// 动画 keyframes（ai-msg-in / ai-shimmer / ai-rec-pulse / ai-typing-bounce /
// ai-cursor-blink / ai-voice-wave / ai-eq-bounce）均来自 token 共享版

.ai-msg-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: ai-msg-in 0.35s cubic-bezier(0.16, 1, 0.3, 1);

  &.is-user {
    flex-direction: row-reverse;

    .ai-msg-body {
      align-items: flex-end;
      background: @ai-user-bubble;
      border: none;
      border-radius: @ai-radius-md @ai-radius-md 4px @ai-radius-md;
      box-shadow: 0 2px 8px rgba(6, 8, 20, 0.35);
    }

    .ai-msg-text,
    .ai-msg-rich {
      color: @ai-user-text;
    }

    .ai-msg-voice .voice-bar {
      background: rgba(255, 255, 255, 0.18);
      color: #fff;
    }

    .ai-msg-voice .wave {
      background: rgba(255, 255, 255, 0.85);
    }

    .ai-msg-voice .transcript {
      color: rgba(255, 255, 255, 0.85);
    }

    .ai-msg-time {
      text-align: right;
      color: rgba(255, 255, 255, 0.72);
    }

    // 用户气泡常驻头像：与 AI 侧一致的顶部光学对齐
    .ai-msg-avatar {
      margin-top: 2px;
    }

    .ai-msg-file {
      .file-icon-wrap {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
      }

      .name {
        color: #fff;
      }

      .meta {
        color: rgba(255, 255, 255, 0.78);
      }

      .file-ext {
        background: rgba(255, 255, 255, 0.18);
        color: #fff;
      }
    }
  }

  &.is-assistant {
    .ai-msg-body {
      background: @ai-assistant-bubble;
      border: none;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06);
    }

    .ai-msg-avatar {
      margin-top: 2px;
    }
  }
}

.ai-msg-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: @ai-radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &.avatar-user {
    background: @ai-gradient-orb;
    color: #fff;
  }

  &.avatar-ai {
    background: @ai-gradient;
    color: #fff;
    box-shadow: 0 2px 8px @ai-primary-fog;
  }
}

// 登录态真实头像：圆形铺满，cover 防拉伸变形
.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
  display: block;
}

.ai-msg-body {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: @ai-radius-md;
  text-align: left;
}

// 思考过程：夜色薄卡，激活时主题色流光扫过
.ai-msg-thinking {
  margin-bottom: 12px;
  border-radius: @ai-radius-md;
  border: 1px solid @ai-border;
  background: @ai-fill-04;
  overflow: hidden;

  &.is-live {
    border-color: @ai-primary-tint;
    background: linear-gradient(
      90deg,
      @ai-primary-veil 0%,
      @ai-primary-soft 50%,
      @ai-primary-veil 100%
    );
    background-size: 200% 100%;
    animation: ai-shimmer 2.5s ease-in-out infinite;

    // 查询/思考中：CPU 图标持续旋转，与流光背景、live-dot 共同表达进行中
    .thinking-icon {
      animation: ai-think-spin 1.6s linear infinite;
    }
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
    color: @ai-primary-hover;
  }

  .thinking-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: @ai-primary-hover;
    --ai-rec-spread: 5px;
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
    color: @ai-night-text;
    background: @ai-fill-06;
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

.ai-msg-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.65;
  font-size: 14px;
  color: @ai-text;
  letter-spacing: -0.01em;
}

.ai-msg-rich {
  font-size: 14px;
  line-height: 1.7;
  color: @ai-text;
  letter-spacing: -0.01em;

  // 打字机光标：紧跟最新文字的行尾。流式内容是块级 HTML（p/ul/pre...），
  // 容器 ::after 会被末尾块级元素顶到下一行独占，因此光标优先内嵌进
  // 「最后一个块级元素」内部；仅当容器无元素子级（纯文本节点）时才由
  // 容器 ::after 兜底
  &.is-streaming {
    &::after,
    :deep(
        > :is(p, h1, h2, h3, h4, h5, h6, div, blockquote, pre):last-child
      )::after,
    :deep(> :is(ul, ol):last-child > li:last-child)::after {
      content: '';
      display: inline-block;
      width: 2px;
      height: 1em;
      margin-left: 2px;
      vertical-align: text-bottom;
      background: @ai-primary-hover;
      animation: ai-cursor-blink 0.9s step-end infinite;
    }

    // 容器有元素子级时隐藏容器尾光标，避免与内部光标重复出现
    &:has(> *)::after {
      content: none;
    }
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
    background: @ai-night-deep;
    padding: 10px 12px;
    border-radius: @ai-radius-sm;
    overflow-x: auto;
    border: 1px solid @ai-border;
    font-size: 12px;
  }
  :deep(code) {
    background: @ai-primary-veil;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    color: @ai-primary-hover;
  }
}

// 语音卡：14% 主题色薄雾 + 亮变体波形
.ai-msg-voice {
  .voice-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: @ai-primary-soft;
    border-radius: @ai-radius-full;
    color: @ai-primary-hover;
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
    background: @ai-primary-hover;
    border-radius: 2px;
    animation: ai-voice-wave 0.8s ease-in-out infinite;

    &:nth-child(1) {
      animation-delay: 0s;
      height: 6px;
    }
    &:nth-child(2) {
      animation-delay: 0.1s;
      height: 10px;
    }
    &:nth-child(3) {
      animation-delay: 0.2s;
      height: 14px;
    }
    &:nth-child(4) {
      animation-delay: 0.15s;
      height: 8px;
    }
    &:nth-child(5) {
      animation-delay: 0.25s;
      height: 12px;
    }
  }

  .transcript {
    width: 100%;
    margin: 8px 0 0;
    font-size: 13px;
    color: @ai-text-secondary;
    line-height: 1.45;
  }
}

.ai-msg-file {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
  min-width: 180px;
  max-width: 100%;

  .file-icon-wrap {
    flex-shrink: 0;
    width: 42px;
    height: 42px;
    border-radius: @ai-radius-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background 0.2s,
      color 0.2s;

    // 字面 hex 的 fade 合法；字色统一提亮一档保证夜底可读
    &.tone-image {
      background: fade(#10b981, 16%);
      color: #34d399;
    }
    &.tone-video {
      background: fade(#8b5cf6, 16%);
      color: #a78bfa;
    }
    &.tone-audio {
      background: fade(#f59e0b, 16%);
      color: #fbbf24;
    }
    &.tone-pdf {
      background: fade(#ef4444, 16%);
      color: #f87171;
    }
    &.tone-word {
      background: fade(#2563eb, 16%);
      color: #60a5fa;
    }
    &.tone-excel {
      background: fade(#16a34a, 16%);
      color: #4ade80;
    }
    &.tone-ppt {
      background: fade(#ea580c, 16%);
      color: #fb923c;
    }
    &.tone-archive {
      background: fade(#78716c, 16%);
      color: #a8a29e;
    }
    &.tone-code {
      background: fade(#6366f1, 16%);
      color: #818cf8;
    }
    &.tone-text {
      background: @ai-fill-06;
      color: @ai-night-text;
    }
    &.tone-default {
      background: @ai-primary-soft;
      color: @ai-primary-hover;
    }
  }

  .file-info {
    min-width: 0;
    flex: 1;
  }

  .name {
    font-weight: 600;
    font-size: 13px;
    color: @ai-text;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: @ai-text-muted;
    margin-top: 4px;
  }

  .file-ext {
    display: inline-flex;
    align-items: center;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    background: @ai-fill-08;
    color: @ai-night-text;
    line-height: 1.4;
  }

  .file-size {
    line-height: 1.4;
  }
}

.ai-msg-card {
  .card-caption {
    margin: 0 0 10px;
    font-size: 13px;
    color: @ai-text-secondary;
    /* 答案自述与超 200 行提示分行显示（PRD 4.6） */
    white-space: pre-line;
  }

  .inner-table {
    border-radius: @ai-radius-sm;
    overflow: hidden;
  }

  // 单值指标卡：小号标签 + 大号主题色数值，主题色轻纱底与思考卡区分层级
  .metric-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 14px;
    border: 1px solid @ai-border;
    border-radius: @ai-radius-sm;
    background: @ai-primary-veil;
  }

  .metric-label {
    margin: 0;
    font-size: 12px;
    color: @ai-text-secondary;
  }

  .metric-value {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.25;
    color: @ai-primary-hover;
    font-variant-numeric: tabular-nums;
    // 超长统计值（长别名/字符串）兜底换行，不撑破气泡
    overflow-wrap: anywhere;
  }
}

// el-table 暗色玻璃：局部覆写组件 CSS 变量（透明底 + 白叠层表头/斑马纹）
:deep(.inner-table.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: @ai-fill-06;
  --el-table-header-text-color: @ai-night-text;
  --el-table-border-color: @ai-border;
  --el-table-text-color: @ai-text;
  --el-table-row-hover-bg-color: @ai-fill-04;
  --el-fill-color-lighter: @ai-fill-04;
}

.chart-box {
  width: 100%;
  min-width: 240px;
  border-radius: @ai-radius-sm;
  background: @ai-fill-04;
}

// 播报按钮并入时间行（时间后在后跟按钮，减少整块占位）
.ai-msg-tools {
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s;

  &.is-playing {
    opacity: 1;
  }

  .tts-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: none;
    border-radius: @ai-radius-sm;
    background: transparent;
    color: @ai-night-text;
    cursor: pointer;
    transition:
      background 0.2s,
      color 0.2s;

    &:hover {
      background: @ai-primary-veil;
      color: @ai-primary-hover;
    }

    // 播报中：藏图标，双伪元素柱组成迷你均衡器（错拍起伏）
    &.is-playing {
      gap: 2px;
      color: @ai-primary-hover;

      :deep(.el-icon) {
        display: none;
      }

      &::before,
      &::after {
        content: '';
        width: 3px;
        height: 12px;
        border-radius: 2px;
        background: currentColor;
      }

      &::before {
        animation: ai-eq-bounce 0.9s ease-in-out infinite;
      }

      &::after {
        animation: ai-eq-bounce 0.9s ease-in-out 0.45s infinite;
      }
    }
  }
}

/* 气泡 hover 时显示播报工具条；播报中的气泡常显 */
.ai-msg-row.is-assistant:hover .ai-msg-tools {
  opacity: 1;
}

.ai-msg-time {
  margin-top: 6px;
  font-size: 11px;
  color: @ai-text-muted;

  // 有播报按钮时单行 flex 布局，按钮紧随时间文字
  &.has-tools {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}
</style>
