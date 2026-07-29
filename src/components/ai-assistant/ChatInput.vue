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
          <AiTooltip :content="$t('aiAssistant.voiceInput')" placement="top">
            <el-button
              class="tool-btn"
              circle
              :class="{ 'is-recording': speech.listening.value }"
              :loading="speech.listening.value"
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
            <el-icon><Promotion /></el-icon>
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
import { useSpeechRecognition } from '@/composables/useSpeechRecognition'
import { listCapabilityHints } from '@/services/ai-assistant/reply-engine'
import AiTooltip from './AiTooltip.vue'

const { t } = useI18n()
const store = aiAssistantStore()
const speech = useSpeechRecognition()
const text = ref('')
const inputRef = ref<{
  focus: () => void
  textarea?: HTMLTextAreaElement
} | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const hints = listCapabilityHints()

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
    const transcript = await speech.start()
    if (transcript) {
      text.value = transcript
      await store.sendUserMessage(transcript, { type: 'voice' })
    }
  } catch {
    ElMessage({
      type: 'warning',
      message: t('aiAssistant.voiceFailed'),
      customClass: 'ai-assistant-message'
    })
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

  .hint-tag {
    cursor: pointer;
    border: 1px solid @ai-border-strong;
    background: @ai-bg-input;
    color: @ai-text;
    font-size: 12px;
    padding: 0 12px;
    height: 28px;
    transition: all 0.2s;

    &:hover {
      background: #fff;
      border-color: fade(@ai-primary, 40%);
      color: @ai-primary-dark;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
  }
}

.input-card {
  background: @ai-bg-input;
  border: none;
  border-radius: @ai-radius-xl;
  padding: 6px 8px 6px 16px;
  box-shadow: @ai-shadow-input;
  transition: box-shadow 0.2s;

  &:focus-within {
    box-shadow:
      0 0 0 1px fade(@ai-primary, 30%),
      0 4px 20px rgba(64, 158, 255, 0.12);
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
  flex-shrink: 0;
  padding-bottom: 2px;
}

.tool-btn {
  color: @ai-text-secondary;
  border: none;
  width: 34px;
  height: 34px;

  &:hover {
    color: @ai-text;
    background: rgba(0, 0, 0, 0.05);
  }

  &.is-recording {
    color: #fff !important;
    background: linear-gradient(135deg, #ef4444, #dc2626) !important;
    animation: ai-rec-pulse 1.2s ease-in-out infinite;
  }
}

@keyframes ai-rec-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
  }
}

.send-btn {
  width: 36px;
  height: 36px;
  background: @ai-gradient !important;
  border: none;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;

  &:hover:not(:disabled) {
    transform: scale(1.06);
    opacity: 0.95;
  }

  &:disabled {
    opacity: 0.35;
    box-shadow: none;
    background: @ai-text-muted !important;
  }
}

.interim {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: @ai-primary-dark;
  margin: 10px 4px 0;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: @ai-radius-full;
  border: 1px solid fade(@ai-primary, 20%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.interim-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
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
