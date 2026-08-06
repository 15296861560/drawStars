<template>
  <div
    class="survey-player"
    :class="{ 'is-h5': isH5, 'is-preview': mode === 'preview' }"
    :style="themeStyle"
  >
    <div v-if="mode === 'preview'" class="preview-banner">
      <span>{{ previewHint || '预览模式（不提交真实答卷）' }}</span>
      <slot name="banner-extra" />
    </div>

    <div class="player-shell">
      <header class="player-header">
        <h1 class="player-title">{{ survey?.title || '未命名问卷' }}</h1>
        <p v-if="survey?.description" class="player-desc">
          {{ survey.description }}
        </p>
        <el-progress
          v-if="showProgress"
          class="player-progress"
          :percentage="progress"
          :stroke-width="isH5 ? 8 : 6"
          :color="primaryColor"
        />
        <div
          v-if="displayMode === 'multi' && totalPages > 1"
          class="player-page-tip"
        >
          第 {{ pageIndex }} / {{ totalPages }} 页
        </div>
      </header>

      <main class="player-body">
        <QuestionRenderer
          v-for="q in pageQuestions"
          :key="String(q.id ?? q._key)"
          :question="q"
          :index="globalIndex(q)"
          :show-number="showQuestionNumber"
          :visible="isVisible(q)"
          :force-required="isRequired(q)"
          :error="mergedErrors[String(q.id ?? q._key)] || ''"
          :model-value="answers[String(q.id ?? q._key)]"
          @update:model-value="v => onAnswer(String(q.id ?? q._key), v)"
        />
        <el-empty
          v-if="!pageQuestions.length"
          description="当前页暂无题目"
          :image-size="72"
        />
      </main>

      <footer class="player-footer">
        <el-button
          v-if="displayMode === 'multi' && pageIndex > 1"
          class="footer-btn"
          @click="prevPage"
        >
          {{ survey?.themeConfig?.prevText || '上一页' }}
        </el-button>
        <el-button
          v-if="mode === 'fill'"
          class="footer-btn"
          @click="emit('save-draft')"
        >
          暂存
        </el-button>
        <el-button
          v-if="displayMode === 'multi' && pageIndex < totalPages"
          class="footer-btn footer-primary"
          type="primary"
          @click="nextPage"
        >
          {{ survey?.themeConfig?.nextText || '下一页' }}
        </el-button>
        <el-button
          v-else
          class="footer-btn footer-primary"
          type="primary"
          :loading="submitting"
          @click="onSubmit"
        >
          {{
            mode === 'preview'
              ? '模拟提交校验'
              : survey?.themeConfig?.submitText || '提交'
          }}
        </el-button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { LogicRule, Question, Survey } from '@/types/survey'
import { evaluateLogic, groupByPage } from '../utils/logic'
import { getQuestionType } from '../types'
import QuestionRenderer from './QuestionRenderer.vue'

const props = withDefaults(
  defineProps<{
    survey: Survey | null
    questions: Question[]
    logicRules?: LogicRule[]
    answers: Record<string, any>
    errors?: Record<string, string>
    mode?: 'fill' | 'preview'
    previewHint?: string
    submitting?: boolean
  }>(),
  {
    logicRules: () => [],
    errors: () => ({}),
    mode: 'fill',
    previewHint: '',
    submitting: false
  }
)

const emit = defineEmits<{
  'update:answers': [Record<string, any>]
  'update:errors': [Record<string, string>]
  submit: []
  'save-draft': []
}>()

const pageIndex = ref(1)
const isH5 = ref(false)
const localErrors = reactive<Record<string, string>>({})

const mergedErrors = computed(() => ({
  ...props.errors,
  ...localErrors
}))

function onAnswer(key: string, value: any) {
  // 就地更新，兼容父级 reactive / ref
  props.answers[key] = value
  emit('update:answers', props.answers)
  if (localErrors[key]) delete localErrors[key]
}

function syncViewport() {
  // 仅按视口宽度判断，避免 PC 触摸屏/模拟器 UA 误判成 H5 锁死滚动
  isH5.value = typeof window !== 'undefined' && window.innerWidth <= 768
}

onMounted(() => {
  syncViewport()
  window.addEventListener('resize', syncViewport)
})
onUnmounted(() => {
  window.removeEventListener('resize', syncViewport)
})

const primaryColor = computed(
  () => props.survey?.themeConfig?.primaryColor || '#409eff'
)
const themeStyle = computed(() => {
  const theme = props.survey?.themeConfig || {}
  return {
    '--survey-primary': theme.primaryColor || '#409eff',
    '--survey-bg': theme.backgroundColor || '#f5f7fb',
    '--survey-card': '#ffffff'
  } as Record<string, string>
})

const showProgress = computed(
  () => props.survey?.themeConfig?.showProgress !== false
)
const showQuestionNumber = computed(
  () => props.survey?.themeConfig?.showQuestionNumber !== false
)
const displayMode = computed(
  () => props.survey?.settings?.displayMode || 'multi'
)
const pageMap = computed(() => groupByPage(props.questions || []))
const totalPages = computed(() =>
  Math.max(1, ...Array.from(pageMap.value.keys()), 1)
)
const pageQuestions = computed(() => {
  if (displayMode.value === 'single') return props.questions || []
  return pageMap.value.get(pageIndex.value) || []
})

const logicRuntime = computed(() =>
  evaluateLogic(props.questions || [], props.logicRules || [], props.answers)
)

function isVisible(q: Question) {
  return logicRuntime.value.visibleMap[String(q.id ?? q._key)] !== false
}
function isRequired(q: Question) {
  return !!logicRuntime.value.requiredMap[String(q.id ?? q._key)]
}
function globalIndex(q: Question) {
  return (
    (props.questions || []).findIndex(
      x => (x.id ?? x._key) === (q.id ?? q._key)
    ) + 1
  )
}

const progress = computed(() => {
  const visible = (props.questions || []).filter(isVisible)
  if (!visible.length) return 0
  const filled = visible.filter(q => {
    const a = props.answers[String(q.id ?? q._key)]
    const v = a?.value ?? a
    return !(
      v === undefined ||
      v === null ||
      v === '' ||
      (Array.isArray(v) && !v.length)
    )
  })
  return Math.round((filled.length / visible.length) * 100)
})

function setError(key: string, msg: string | null) {
  if (msg) localErrors[key] = msg
  else delete localErrors[key]
}

function validateList(list: Question[]) {
  let ok = true
  for (const q of list) {
    if (!isVisible(q)) continue
    const key = String(q.id ?? q._key)
    const def = getQuestionType(q.type)
    const err =
      def?.validate(props.answers[key], {
        ...q,
        required: isRequired(q)
      }) || null
    setError(key, err)
    if (err) ok = false
  }
  return ok
}

function prevPage() {
  pageIndex.value = Math.max(1, pageIndex.value - 1)
}
function nextPage() {
  if (!validateList(pageQuestions.value)) {
    ElMessage.warning('请完善当前页必填项')
    return
  }
  const jump = logicRuntime.value.jumpPage
  if (jump && jump > pageIndex.value) {
    pageIndex.value = jump
    return
  }
  pageIndex.value = Math.min(totalPages.value, pageIndex.value + 1)
}

function onSubmit() {
  const all =
    displayMode.value === 'single'
      ? props.questions || []
      : props.questions || []
  // always validate all visible on final submit
  if (!validateList(pageQuestions.value) || !validateList(all)) {
    ElMessage.warning('请完善必填项')
    return
  }
  emit('submit')
}

watch(
  () => props.questions,
  () => {
    pageIndex.value = 1
  }
)

defineExpose({
  pageIndex,
  validateAll: () => validateList(props.questions || []),
  isH5
})
</script>

<style scoped>
.survey-player {
  --survey-primary: #409eff;
  --survey-bg: #f5f7fb;
  --survey-card: #fff;
  min-height: 100%;
  background: var(--survey-bg);
  color: #303133;
}

.preview-banner {
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #fff7e6;
  border-bottom: 1px solid #ffe58f;
  font-size: 13px;
  color: #8a6116;
  flex-shrink: 0;
}

.player-shell {
  width: min(800px, 100%);
  margin: 0 auto;
  padding: 24px 16px 40px;
  box-sizing: border-box;
}

.player-header {
  margin-bottom: 16px;
  flex-shrink: 0;
}
.player-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.35;
  word-break: break-word;
}
.player-desc {
  margin: 0 0 14px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}
.player-progress {
  margin-top: 4px;
}
.player-page-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.player-body {
  background: var(--survey-card);
  border-radius: 12px;
  padding: 8px 20px 4px;
  box-shadow: 0 2px 12px rgba(31, 45, 61, 0.06);
}

.player-footer {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
  flex-shrink: 0;
}

.footer-btn {
  min-width: 96px;
}
.footer-primary {
  --el-button-bg-color: var(--survey-primary);
  --el-button-border-color: var(--survey-primary);
  --el-button-hover-bg-color: var(--survey-primary);
  --el-button-hover-border-color: var(--survey-primary);
}

/* PC：整页可滚动，不锁死 overflow */
.survey-player:not(.is-h5) {
  overflow: visible;
  height: auto;
  max-height: none;
}
.survey-player:not(.is-h5) .player-shell {
  overflow: visible;
  display: block;
  height: auto;
}
.survey-player:not(.is-h5) .player-body {
  overflow: visible;
  flex: none;
  min-height: auto;
}

/* H5：整页固定高度，头/底固定，仅填写区滚动 */
.survey-player.is-h5 {
  height: 100%;
  max-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.survey-player.is-h5 .preview-banner {
  flex-wrap: wrap;
}
.survey-player.is-h5 .player-shell {
  flex: 1;
  min-height: 0;
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.survey-player.is-h5 .player-header {
  margin: 0;
  padding: 12px 12px 10px;
  background: var(--survey-bg);
  border-bottom: 1px solid #ebeef5;
}
.survey-player.is-h5 .player-title {
  font-size: 18px;
  margin-bottom: 6px;
}
.survey-player.is-h5 .player-desc {
  margin-bottom: 10px;
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.survey-player.is-h5 .player-body {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  border-radius: 0;
  padding: 8px 12px 16px;
  box-shadow: none;
  border: none;
  background: var(--survey-card);
}
.survey-player.is-h5 .player-footer {
  margin: 0;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #ebeef5;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04);
  justify-content: stretch;
  gap: 8px;
}
.survey-player.is-h5 .footer-btn {
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .survey-player {
    height: 100%;
    max-height: 100dvh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .survey-player .player-shell {
    flex: 1;
    min-height: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .survey-player .player-header {
    margin: 0;
    padding: 12px 12px 10px;
    border-bottom: 1px solid #ebeef5;
  }
  .survey-player .player-title {
    font-size: 18px;
  }
  .survey-player .player-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    border-radius: 0;
    padding: 8px 12px 16px;
    box-shadow: none;
  }
  .survey-player .player-footer {
    margin: 0;
    padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
    background: #fff;
    border-top: 1px solid #ebeef5;
    justify-content: stretch;
  }
  .survey-player .footer-btn {
    flex: 1;
    min-width: 0;
  }
}
</style>
