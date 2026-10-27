<template>
  <footer class="ai-chat-input">
    <div v-if="hints.length" class="hint-chips">
      <span class="hint-label">{{ $t('aiAssistant.tryHint') }}</span>
      <el-tag
        v-for="h in hints"
        :key="h"
        size="small"
        class="hint-tag"
        round
        effect="plain"
        @click="applyHint(h)"
      >
        {{ h }}
      </el-tag>
    </div>
    <div class="input-card">
      <div class="input-row">
        <el-input
          ref="inputRef"
          v-model="text"
          type="textarea"
          :rows="1"
          :autosize="{ minRows: 1, maxRows: 6 }"
          :placeholder="$t('aiAssistant.inputPlaceholder')"
          resize="none"
          class="input-textarea"
          @keydown="onKeydown"
        />
        <div class="input-actions">
          <AiTooltip
            v-if="canVoice"
            :content="$t('aiAssistant.voiceInput')"
            placement="top"
          >
            <el-button
              class="tool-btn"
              circle
              :class="{ 'is-recording': speech.listening.value }"
              @click="toggleVoice"
            >
              <el-icon><Microphone /></el-icon>
            </el-button>
          </AiTooltip>
          <input
            ref="fileInputRef"
            type="file"
            class="ai-file-input-hidden"
            @change="onFileChange"
          />
          <AiTooltip :content="$t('aiAssistant.uploadFile')" placement="top">
            <el-button class="tool-btn" circle @click="openFilePicker">
              <el-icon><Paperclip /></el-icon>
            </el-button>
          </AiTooltip>
          <el-button
            class="send-btn"
            circle
            type="primary"
            :loading="store.sending"
            :disabled="!canSend"
            @click="submit"
          >
            <!-- sending 时隐藏纸飞机，让 EP 内建 spinner 独占按钮，避免两图标并排挤压 -->
            <el-icon v-if="!store.sending"><Promotion /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
    <p v-if="speech.interimText.value" class="interim">
      <span class="interim-dot" />
      {{ $t('aiAssistant.listening') }}: {{ speech.interimText.value }}
    </p>
    <p v-else class="input-hint">{{ $t('aiAssistant.inputHint') }}</p>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Microphone, Paperclip, Promotion } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { aiAssistantStore } from '@/stores/ai-assistant'
import { permissionStore } from '@/stores/permission'
import { AI_PERM } from '@/config/ai-assistant-perms'
import {
  useSpeechRecognition,
  AiVoiceError
} from '@/composables/useSpeechRecognition'
import { isAiMockMode } from '@/api/ai-assistant'
import { listCapabilityHints } from '@/services/ai-assistant/reply-engine'
import { DATA_QUERY_HINTS } from '@/services/ai-assistant/data-query'
import { trackEvent } from '@/plugins/tracker'
import AiTooltip from './AiTooltip.vue'

const { t } = useI18n()
const store = aiAssistantStore()
const permission = permissionStore()
const speech = useSpeechRecognition()
const text = ref('')
const inputRef = ref<{
  focus: () => void
  textarea?: HTMLTextAreaElement
} | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
// 无 query 权限时不展示问数快捷入口（PRD 6.2）
const hints = computed(() => {
  const base = listCapabilityHints()
  return permission.hasPermission(AI_PERM.query)
    ? [...DATA_QUERY_HINTS, ...base]
    : base
})
// F01：无 voice 权限或浏览器不支持语音识别时隐藏麦克风入口（Mock 演示模式除外，PRD 4.1.3 / 6.2）
const canVoice = computed(
  () =>
    permission.hasPermission(AI_PERM.voice) &&
    (speech.supported.value || isAiMockMode())
)

const canSend = computed(() => text.value.trim().length > 0 && !store.sending)

function focus() {
  inputRef.value?.focus?.()
}

function applyHint(h: string) {
  text.value = h
  focus()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  }
}

async function submit() {
  const content = text.value.trim()
  if (!content || store.sending) return
  text.value = ''
  await store.sendUserMessage(content)
  focus()
}

async function toggleVoice() {
  if (speech.listening.value) {
    speech.stop()
    return
  }
  try {
    trackEvent('ai_voice_start')
    const transcript = await speech.start()
    trackEvent('ai_voice_success')
    if (transcript) {
      text.value = transcript
      await store.sendUserMessage(transcript, { type: 'voice' })
    }
  } catch (err) {
    // 用户主动取消（再次点击麦克风）静默处理（PRD 4.1.3）
    const code = err instanceof AiVoiceError ? err.code : 'ASR_NETWORK'
    if (code === 'VOICE_ABORTED') return
    trackEvent('ai_voice_fail', { code })
    // 语音错误用消息流内提示，避免全屏 toast 打断对话（PRD 4.1.3）
    store.pushSystemNotice(t(`aiAssistant.voiceErrors.${code}`), 'voice-notice')
  }
}

function openFilePicker() {
  fileInputRef.value?.click()
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const raw = input.files?.[0]
  input.value = ''
  if (!raw || store.sending) return
  try {
    await store.sendUserMessage(raw.name, { file: raw })
  } catch {
    ElMessage({
      type: 'warning',
      message: t('aiAssistant.uploadFailed'),
      customClass: 'ai-assistant-message'
    })
  }
  focus()
}

defineExpose({ focus })
</script>

<style scoped lang="less">
@import './ai-variables.less';

// 录音脉冲 keyframes 来自 token 共享版（ai-rec-pulse，主题色）

.ai-chat-input {
  flex-shrink: 0;
  padding: 12px 16px 14px;
  background: @ai-bg-chat;
  border-top: 1px solid @ai-border;
}

.hint-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  .hint-label {
    font-size: 12px;
    color: @ai-text-muted;
    margin-right: 2px;
  }

  // el-tag plain 暗色化：覆写组件级 CSS 变量
  .hint-tag {
    --el-tag-bg-color: @ai-fill-06;
    --el-tag-border-color: @ai-border;
    --el-tag-text-color: @ai-night-text;
    cursor: pointer;
    font-size: 12px;
    padding: 0 12px;
    height: 28px;
    transition: all 0.2s;

    &:hover {
      --el-tag-bg-color: @ai-primary-veil;
      --el-tag-border-color: @ai-primary-tint;
      --el-tag-text-color: @ai-primary-hover;
    }
  }
}

// 夜玻璃输入卡：悬浮主题描边，聚焦主题色光圈
.input-card {
  background: @ai-bg-input;
  backdrop-filter: blur(12px);
  border: none;
  border-radius: @ai-radius-xl;
  padding: 6px 8px 6px 16px;
  box-shadow: @ai-shadow-input;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow:
      0 0 0 1px @ai-primary-tint,
      0 10px 26px rgba(6, 8, 20, 0.35);
  }

  &:focus-within {
    box-shadow:
      0 0 0 1px @ai-primary-tint,
      0 0 0 4px @ai-primary-veil,
      0 10px 26px rgba(6, 8, 20, 0.35);
  }
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 4px;
}

.input-textarea {
  flex: 1;
  min-width: 0;

  :deep(.el-textarea__inner) {
    border: none;
    box-shadow: none !important;
    padding: 8px 0;
    font-size: 14px;
    line-height: 1.5;
    background: transparent;
    color: @ai-text;
    resize: none;

    &::placeholder {
      color: @ai-text-muted;
    }
  }
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  // 显式按内容测宽，杜绝容器宽度跟随已收缩内容自洽
  width: max-content;
  flex-shrink: 0;
  padding-bottom: 2px;
}

// 选择器带 .el-button 提升特异性：
// 否则 width 会被 Element Plus 的 .el-button.is-circle { width: 32px } 同级且后置的规则压回 32
.el-button.tool-btn {
  width: 34px;
  height: 34px;
  border: none;
  // 正常态与 hover 配色互换：常态用原 hover 配色（微白玻璃底 + 亮图标）
  color: @ai-text;
  background: @ai-fill-06;
  // 宁可溢出也不被压扁：圆形按钮必须保持正圆
  flex-shrink: 0;
  // hover 手感对齐发送按钮：缩放 + 透明度过渡
  transition:
    transform 0.15s ease,
    opacity 0.15s ease,
    background-color 0.15s ease,
    color 0.15s ease;

  // hover：中性白纱提亮一档（06→12）替代 EP 纯白实底——暗色玻璃上明度差过大会刺眼；
  // 图标保持亮档维持可读对比，缩放手感与发送按钮一致
  &:hover {
    color: @ai-text;
    background: @ai-fill-12;
    transform: scale(1.06);
    opacity: 0.95;
  }

  // 录音态：主题色渐变 + 脉冲光环（弃红色）
  &.is-recording {
    color: #fff !important;
    background: @ai-gradient !important;
    animation: ai-rec-pulse 1.2s ease-in-out infinite;
  }
}

// 发送：主题渐变球 + 主题色辉光 + 白色内发丝线
// 同 tool-btn：带 .el-button 防 EP .el-button.is-circle 的 width 覆盖
.el-button.send-btn {
  width: 36px;
  height: 36px;
  background: @ai-gradient !important;
  border: none;
  flex-shrink: 0;
  box-shadow:
    0 4px 14px @ai-primary-fog,
    0 0 0 1px rgba(255, 255, 255, 0.12) inset;
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;

  &:hover:not(:disabled) {
    transform: scale(1.06);
    opacity: 0.95;
  }

  &:disabled {
    background: @ai-fill-12 !important;
    color: @ai-night-text;
    opacity: 0.6;
    box-shadow: none;
  }

  // 发送中：保持渐变球 + 白色 spinner 独占，不给 disabled 灰底
  // 特异性靠 .is-loading（0,3,0）压过 :disabled（0,2,1）不叠加灰化样式
  &.is-loading {
    background: @ai-gradient !important;
    color: #fff;
    opacity: 1;
    box-shadow:
      0 4px 14px @ai-primary-fog,
      0 0 0 1px rgba(255, 255, 255, 0.12) inset;

    // EP 的 `.el-button [class*=el-icon]+span { margin-left: 6px }` 会给
    // spinner 后面空置的 slot 容器 span 加 6px 外边距，把 spinner 挤得偏左
    // 3px；loading 态归零间距，保证 spinner 在圆钮正中
    :deep(span) {
      margin: 0;
    }
  }
}

// 临时听写胶囊：夜色薄玻璃 + 主题色描边
.interim {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: @ai-night-text;
  margin: 10px 4px 0;
  padding: 8px 14px;
  background: @ai-fill-06;
  border-radius: @ai-radius-full;
  border: 1px solid @ai-primary-tint;
  box-shadow: 0 2px 8px rgba(6, 8, 20, 0.25);
}

.interim-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: @ai-primary-hover;
  --ai-rec-spread: 5px;
  animation: ai-rec-pulse 1s ease infinite;
  flex-shrink: 0;
}

.input-hint {
  margin: 8px 4px 0;
  font-size: 11px;
  color: @ai-text-muted;
  text-align: center;
}

.ai-file-input-hidden {
  display: none;
}
</style>
