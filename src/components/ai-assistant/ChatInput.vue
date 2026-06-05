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
      <el-input
        ref="inputRef"
        v-model="text"
        type="textarea"
        :rows="2"
        :placeholder="$t('aiAssistant.inputPlaceholder')"
        resize="none"
        class="input-textarea"
        @keydown="onKeydown"
      />
      <div class="input-toolbar">
        <div class="toolbar-left">
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
          <el-upload
            :show-file-list="false"
            :auto-upload="false"
            :on-change="onFileChange"
          >
            <AiTooltip :content="$t('aiAssistant.uploadFile')" placement="top">
              <el-button class="tool-btn" circle>
                <el-icon><Paperclip /></el-icon>
              </el-button>
            </AiTooltip>
          </el-upload>
        </div>
        <el-button
          class="send-btn"
          type="primary"
          round
          :loading="store.sending"
          :disabled="!canSend"
          @click="submit"
        >
          <el-icon class="send-icon"><Promotion /></el-icon>
          {{ $t('aiAssistant.send') }}
        </el-button>
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
import type { UploadFile } from 'element-plus'
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
const inputRef = ref<{ focus: () => void; textarea?: HTMLTextAreaElement } | null>(null)
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

async function onFileChange(uploadFile: UploadFile) {
  const raw = uploadFile.raw
  if (!raw) return
  await store.sendUserMessage(raw.name, { file: raw })
  focus()
}

defineExpose({ focus })
</script>

<style scoped lang="less">
@import './ai-variables.less';

.ai-chat-input {
  flex-shrink: 0;
  padding: 12px 14px 10px;
  background: linear-gradient(180deg, transparent 0%, @ai-bg-sidebar 100%);
  border-top: 1px solid @ai-border;
}

.hint-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;

  .hint-label {
    font-size: 11px;
    color: @ai-text-muted;
    margin-right: 2px;
  }

  .hint-tag {
    cursor: pointer;
    border-color: fade(@ai-primary, 25%);
    color: @ai-primary-dark;
    transition: all 0.2s;

    &:hover {
      background: fade(@ai-primary, 10%);
      border-color: @ai-primary;
      color: @ai-primary;
    }
  }
}

.input-card {
  background: #fff;
  border: 1px solid @ai-border-strong;
  border-radius: @ai-radius-md;
  padding: 10px 12px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:focus-within {
    border-color: fade(@ai-primary, 45%);
    box-shadow: 0 0 0 3px fade(@ai-primary, 12%);
  }
}

.input-textarea {
  :deep(.el-textarea__inner) {
    border: none;
    box-shadow: none !important;
    padding: 0;
    font-size: 14px;
    line-height: 1.5;
    background: transparent;
    color: @ai-text;

    &::placeholder {
      color: @ai-text-muted;
    }
  }
}

.input-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid @ai-border;
}

.toolbar-left {
  display: flex;
  gap: 4px;
}

.tool-btn {
  color: @ai-text-secondary;
  border: none;

  &:hover {
    color: @ai-primary;
    background: fade(@ai-primary, 8%);
  }

  &.is-recording {
    color: #fff !important;
    background: linear-gradient(135deg, #f56c6c, #e85d5d) !important;
    animation: ai-rec-pulse 1.2s ease-in-out infinite;
  }
}

@keyframes ai-rec-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(245, 108, 108, 0);
  }
}

.send-btn {
  padding: 8px 18px;
  background: @ai-gradient !important;
  border: none;
  font-weight: 500;
  box-shadow: 0 2px 10px rgba(64, 158, 255, 0.35);

  &:hover:not(:disabled) {
    opacity: 0.92;
  }

  &:disabled {
    opacity: 0.5;
    box-shadow: none;
  }

  .send-icon {
    margin-right: 4px;
  }
}

.interim {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: @ai-primary-dark;
  margin: 8px 4px 0;
  padding: 6px 10px;
  background: fade(@ai-primary, 8%);
  border-radius: @ai-radius-sm;
}

.interim-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f56c6c;
  animation: ai-rec-pulse 1s ease infinite;
}

.input-hint {
  margin: 6px 4px 0;
  font-size: 11px;
  color: @ai-text-muted;
  text-align: right;
}
</style>
