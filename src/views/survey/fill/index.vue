<template>
  <div
    class="survey-fill-page"
    :class="{
      'is-player-mode':
        !!survey && !submitted && !(needPassword && !passwordPassed)
    }"
    v-loading="loading"
  >
    <div v-if="needPassword && !passwordPassed" class="password-gate">
      <el-card class="gate-card">
        <h3>请输入访问密码</h3>
        <el-input
          v-model="password"
          type="password"
          show-password
          placeholder="访问密码"
          @keyup.enter="loadSurvey"
        />
        <el-button type="primary" class="mt12" @click="loadSurvey"
          >进入问卷</el-button
        >
      </el-card>
    </div>

    <template v-else-if="submitted">
      <div class="result-wrap">
        <el-result icon="success" title="提交成功" :sub-title="thankYou">
          <template #extra>
            <el-button
              v-if="resultId && scoringEnabled"
              type="primary"
              @click="goResult"
            >
              查看成绩
            </el-button>
          </template>
        </el-result>
      </div>
    </template>

    <SurveyPlayer
      v-else-if="survey"
      mode="fill"
      :survey="survey"
      :questions="questions"
      :logic-rules="logicRules"
      :answers="answers"
      :submitting="submitting"
      @save-draft="saveDraftLocal"
      @submit="submit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { LogicRule, Question, Survey } from '@/types/survey'
import {
  getFill,
  submitResponse,
  saveDraft,
  getDraft,
  getFillDraft
} from '@/api/survey'
import { getDeviceFingerprint, getDeviceInfo } from '../utils/fingerprint'
import { saveLocalDraft, loadLocalDraft, clearLocalDraft } from '../utils/draft'
import SurveyPlayer from '../components/SurveyPlayer.vue'
import { userInfoStore } from '@/stores/user-info'

const route = useRoute()
const router = useRouter()
const userInfo = userInfoStore()

const loading = ref(false)
const submitting = ref(false)
const survey = ref<Survey | null>(null)
const questions = ref<Question[]>([])
const logicRules = ref<LogicRule[]>([])
const answers = reactive<Record<string, any>>({})
const needPassword = ref(false)
const passwordPassed = ref(false)
const password = ref('')
const submitted = ref(false)
const resultId = ref<number | string>('')
const scoringEnabled = ref(false)
const startAt = Date.now()
const surveyId = ref<number | string>('')
const shareCode = computed(() => String(route.params.shareCode || ''))
const source = computed(() => String(route.query.source || ''))
const pageIndexForDraft = ref(1)

const thankYou = computed(
  () =>
    survey.value?.themeConfig?.thankYouText ||
    survey.value?.themeConfig?.thankYouMessage ||
    '感谢您的填写！'
)

function normalizeDraftAnswers(
  raw?:
    | Record<string, any>
    | Array<{ questionId: number | string; answerData: any }>
): Record<string, any> {
  if (!raw) return {}
  if (Array.isArray(raw)) {
    const map: Record<string, any> = {}
    raw.forEach(item => {
      if (item?.questionId != null)
        map[String(item.questionId)] = item.answerData
    })
    return map
  }
  return raw
}

function resolveToken(): string {
  const t: any = userInfo.getToken
  if (typeof t === 'string') return t
  if (t && typeof t === 'object' && 'value' in t) return String(t.value || '')
  return t ? String(t) : ''
}

async function loadSurvey() {
  loading.value = true
  try {
    const data = await getFill(shareCode.value, {
      password: password.value || undefined,
      source: source.value || undefined
    })
    needPassword.value = !!data.needPassword
    passwordPassed.value = !!data.passwordPassed || !data.needPassword
    if (needPassword.value && !passwordPassed.value) return

    survey.value = data.survey
    if (!data.survey?.id) {
      ElMessage.error('问卷数据异常，请稍后重试')
      return
    }
    surveyId.value = data.survey.id
    questions.value = data.questions || data.survey.questions || []
    logicRules.value = data.logicRules || data.survey.logicRules || []
    scoringEnabled.value = !!data.survey.scoringEnabled

    const localDraft = loadLocalDraft(shareCode.value)
    if (localDraft?.answers) {
      Object.assign(answers, localDraft.answers)
      if (localDraft.pageIndex) pageIndexForDraft.value = localDraft.pageIndex
    }

    const token = resolveToken()
    if (token) {
      try {
        const serverDraft =
          (await getFillDraft(shareCode.value).catch(() => null)) ||
          (surveyId.value
            ? await getDraft(surveyId.value).catch(() => null)
            : null)
        if (serverDraft) {
          const merged = normalizeDraftAnswers(serverDraft.answers)
          if (Object.keys(merged).length) Object.assign(answers, merged)
          if (serverDraft.pageIndex)
            pageIndexForDraft.value = serverDraft.pageIndex
        }
      } catch (_e) {
        /* keep local draft */
      }
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '加载问卷失败')
  } finally {
    loading.value = false
  }
}

function saveDraftLocal() {
  saveLocalDraft(shareCode.value, {
    answers: { ...answers },
    pageIndex: pageIndexForDraft.value,
    surveyId: surveyId.value
  })
  if (userInfo.getUserId || resolveToken()) {
    const payload = {
      answers: Object.keys(answers).map(qid => ({
        questionId: qid,
        answerData: answers[qid]
      })),
      deviceFingerprint: getDeviceFingerprint(),
      deviceInfo: getDeviceInfo(),
      source: source.value
    }
    saveDraft(surveyId.value, payload).catch(() => {})
  }
  ElMessage.success('已暂存（本地保留7天）')
}

async function submit() {
  submitting.value = true
  try {
    const duration = Math.round((Date.now() - startAt) / 1000)
    const res = await submitResponse(surveyId.value, {
      answers: Object.keys(answers).map(qid => ({
        questionId: qid,
        answerData: answers[qid],
        textContent:
          typeof answers[qid]?.value === 'string'
            ? answers[qid].value
            : undefined
      })),
      duration,
      source: source.value,
      deviceFingerprint: getDeviceFingerprint(),
      deviceInfo: getDeviceInfo(),
      password: password.value || undefined
    })
    if (res?.status === false) {
      ElMessage.error(res.msg || '提交失败')
      return
    }
    clearLocalDraft(shareCode.value)
    submitted.value = true
    resultId.value = res?.data?.id || res?.data?.responseId || res?.id
    const redirect =
      survey.value?.themeConfig?.thankYouLink ||
      survey.value?.themeConfig?.thankYouRedirect
    if (scoringEnabled.value && resultId.value) {
      // stay for button
    } else if (redirect) {
      window.location.href = redirect
    }
    ElMessage.success('提交成功')
  } catch (e: any) {
    ElMessage.error(e?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

function goResult() {
  router.push(`/survey/result/${resultId.value}`)
}

watch(
  answers,
  () => {
    if (!shareCode.value || submitted.value) return
    saveLocalDraft(shareCode.value, {
      answers: { ...answers },
      pageIndex: pageIndexForDraft.value,
      surveyId: surveyId.value
    })
  },
  { deep: true }
)

onMounted(loadSurvey)
</script>

<style scoped>
/* 全局 body 为 overflow:hidden，填写页需自建滚动容器 */
.survey-fill-page {
  height: 100vh;
  height: 100dvh;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  background: #f5f7fb;
  box-sizing: border-box;
}
/* H5 填写态：由 SurveyPlayer 内部滚动，外层不再滚 */
@media (max-width: 768px) {
  .survey-fill-page.is-player-mode {
    overflow: hidden;
  }
  .survey-fill-page.is-player-mode :deep(.survey-player) {
    height: 100%;
  }
}
.password-gate {
  display: flex;
  justify-content: center;
  padding: 80px 16px 40px;
}
.gate-card {
  width: min(360px, 100%);
}
.mt12 {
  margin-top: 12px;
  width: 100%;
}
.result-wrap {
  max-width: 640px;
  margin: 0 auto;
  padding: 40px 16px;
}
</style>
