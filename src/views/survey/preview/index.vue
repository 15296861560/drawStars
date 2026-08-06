<template>
  <div class="survey-preview-page" v-loading="loading">
    <SurveyPlayer
      v-if="survey"
      mode="preview"
      :preview-hint="previewHint"
      :survey="survey"
      :questions="questions"
      :logic-rules="logicRules"
      :answers="answers"
      @submit="mockSubmit"
    >
      <template #banner-extra>
        <el-button :icon="Back" size="small" @click="$router.back()"
          >返回编辑</el-button
        >
      </template>
    </SurveyPlayer>
    <el-empty v-else-if="!loading" description="暂无预览内容" />
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Back } from '@element-plus/icons-vue'
import type { LogicRule, Question, Survey } from '@/types/survey'
import { getSurveyDetail } from '@/api/survey'
import { evaluateLogic } from '../utils/logic'
import { getQuestionType } from '../types'
import { getSurveyPreviewSnapshot } from '../utils/previewSnapshot'
import SurveyPlayer from '../components/SurveyPlayer.vue'

const route = useRoute()
const loading = ref(false)
const fromEditorDraft = ref(false)
const survey = ref<Survey | null>(null)
const questions = ref<Question[]>([])
const logicRules = ref<LogicRule[]>([])
const answers = reactive<Record<string, any>>({})

const previewHint = computed(() =>
  fromEditorDraft.value
    ? '预览模式：当前编辑内容（含未保存改动，不提交真实答卷）'
    : '预览模式：已保存版本（不提交真实答卷）'
)

function isVisible(q: Question) {
  const runtime = evaluateLogic(questions.value, logicRules.value, answers)
  return runtime.visibleMap[String(q.id ?? q._key)] !== false
}
function isRequired(q: Question) {
  const runtime = evaluateLogic(questions.value, logicRules.value, answers)
  return !!runtime.requiredMap[String(q.id ?? q._key)]
}

async function load() {
  loading.value = true
  try {
    const id = String(route.params.id)
    const snapshot = getSurveyPreviewSnapshot(id)
    if (snapshot) {
      fromEditorDraft.value = true
      survey.value = {
        id: snapshot.surveyId,
        ...snapshot.survey
      } as Survey
      questions.value = (snapshot.questions || []).map(q => ({
        ...q,
        config: {
          ...(q.config || {}),
          options: (q as any).options || q.config?.options || []
        }
      }))
      logicRules.value = snapshot.logicRules || []
      return
    }
    fromEditorDraft.value = false
    const data = await getSurveyDetail(id)
    survey.value = data
    questions.value = (data.questions || []).map(q => ({
      ...q,
      config: {
        ...(q.config || {}),
        options: (q as any).options || q.config?.options || []
      }
    }))
    logicRules.value = data.logicRules || []
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function mockSubmit() {
  for (const q of questions.value) {
    if (!isVisible(q)) continue
    const key = String(q.id ?? q._key)
    const err = getQuestionType(q.type)?.validate(answers[key], {
      ...q,
      required: isRequired(q)
    })
    if (err) {
      ElMessage.warning(err)
      return
    }
  }
  ElMessage.success('校验通过（预览模式未真正提交）')
}

onMounted(load)
onActivated(load)
</script>

<style scoped>
.survey-preview-page {
  min-height: 100%;
  background: #f5f7fb;
}
/* 管理端预览：保证 PC 在主内容区可滚动 */
@media (min-width: 769px) {
  .survey-preview-page {
    overflow: visible;
  }
}
@media (max-width: 768px) {
  .survey-preview-page {
    height: calc(100vh - 120px);
    max-height: calc(100dvh - 120px);
    overflow: hidden;
  }
  .survey-preview-page :deep(.survey-player) {
    height: 100%;
    max-height: 100%;
  }
}
</style>
