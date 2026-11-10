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

    <!-- 心智测评完成态（PRD 4.3.2：星空主题 + 报告 CTA + 引导位 + 游客注册触点） -->
    <div v-else-if="submitted && isAsmt" class="asmt-h5 fill-complete">
      <div class="star-sky"></div>
      <div class="page max-w-[420px] mx-auto px-4 pb-10 pt-3">
        <section class="text-center mt-10">
          <div class="ok-tick" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12.5 9.5 18 20 7"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <h2 class="serif text-[22px] font-semibold mt-4" style="color: var(--ink)">
            测评已完成！
          </h2>
          <p class="text-[12.5px] mt-2" style="color: var(--mist)">
            答卷已生成 · 报告编号
            <span style="color: var(--gold-1)">{{ resultId || '-' }}</span>
          </p>
          <p v-if="guestPending" class="text-[11.5px] mt-1.5" style="color: var(--faint)">
            游客答卷已暂存 · 免费注册后报告与积分永久保留
          </p>
        </section>

        <button
          class="btn btn-gold w-full h-[52px] text-[15.5px] mt-7"
          @click="goResult"
        >
          查看完整报告
        </button>

        <!-- 完成页引导位 OaFollowGuide(position=complete) -->
        <OaFollowGuide position="complete" />

        <!-- 游客注册 CTA（4.3.2：完成态显式触点，与浮条并存） -->
        <button
          v-if="!isLoggedIn"
          class="btn btn-ghost w-full h-[50px] text-[14px] mt-4"
          @click="regRef?.open()"
        >
          注册保存这份报告 + 领新人积分
        </button>
        <p class="text-[11px] text-center mt-3" style="color: var(--faint)">
          完成态无论是否注册，报告页链接长期有效
        </p>

        <footer class="mt-8">
          <div class="footnote-disclaimer">{{ REPORT_DISCLAIMER }}</div>
          <div
            class="text-center text-[10.5px] mt-2 tracking-[0.14em]"
            style="color: rgba(245, 240, 228, 0.28)"
          >
            POWERED BY DRAWSTARS · 问星
          </div>
        </footer>
      </div>
      <QuickRegisterEntry ref="regRef" trigger="complete" success-text="完成，查看我的报告" />
      <PointsToast />
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
import {
  fillFallback,
  submitResponseFallback,
  isAssessmentMockShare,
  grantPoints
} from '@/api/assessment'
import {
  captureChannelQuery,
  sendEvent,
  trackChannelVisit,
  pushPendingResponseId,
  getSessionSource,
  getSessionRefId
} from '@/utils/assessment-events'
import { REPORT_DISCLAIMER } from '@/config/assessment-registry'
import '@/views/assessment/theme/assessment-h5.less'
import { showPointsToast } from '@/views/assessment/components/points-toast'
import OaFollowGuide from '@/views/assessment/components/OaFollowGuide.vue'
import QuickRegisterEntry from '@/views/assessment/components/QuickRegisterEntry.vue'
import PointsToast from '@/views/assessment/components/PointsToast.vue'
import { isSkipLoginMode } from '@/config/skip-login'
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

/** 心智测评问卷（mock 演示三款 asmt-*）：承接埋点 / 积分 / 星空完成态 */
const isAsmt = computed(() => isAssessmentMockShare(shareCode.value))
const isLoggedIn = computed(
  () => isSkipLoginMode() || (userInfo.getUserId || 0) > 0
)
/** 游客答卷已进入补领池（完成态提示语用） */
const guestPending = ref(false)
const regRef = ref<InstanceType<typeof QuickRegisterEntry> | null>(null)

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
    // 心智测评 mock 兜底（asmt-* 演示三款；真实后端在线时恒 null 走 getFill）
    const data =
      (await fillFallback(shareCode.value)) ||
      (await getFill(shareCode.value, {
        password: password.value || undefined,
        source: source.value || undefined
      }))
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
    const answersPayload = Object.keys(answers).map(qid => ({
      questionId: qid,
      answerData: answers[qid],
      textContent:
        typeof answers[qid]?.value === 'string'
          ? answers[qid].value
          : undefined
    }))
    // 心智测评 mock 兜底（asmt-*）；其余走真实提交接口
    const res =
      (await submitResponseFallback(shareCode.value, {
        answers: Object.keys(answers).map(qid => ({
          questionId: qid,
          answerData: answers[qid]
        })),
        source: source.value
      })) ||
      (await submitResponse(surveyId.value, {
        answers: answersPayload,
        duration,
        source: source.value,
        deviceFingerprint: getDeviceFingerprint(),
        deviceInfo: getDeviceInfo(),
        password: password.value || undefined
      }))
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

    // ---- 心智测评链路（PRD 4.3.2）：E03 上报 + 积分发放 / 游客答卷池 ----
    if (isAsmt.value && resultId.value) {
      const rid = String(resultId.value)
      sendEvent('response_complete', {
        surveyId: surveyId.value,
        surveyResponseId: rid,
        target: 'fill'
      })
      if (isLoggedIn.value) {
        // 场景 A：已登录用户提交即发放 5 积分（服务端幂等，重复不叠加）
        grantPoints({ scenario: 'ASSESSMENT_COMPLETE', responseId: rid })
          .then(g => {
            if (g?.granted && g.points > 0) {
              showPointsToast(`+${g.points} 积分已到账`)
            }
          })
          .catch(() => {})
      } else {
        // 场景 B：游客答卷入池，注册后逐份迁移补领
        pushPendingResponseId(rid)
        guestPending.value = true
      }
    }
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

onMounted(() => {
  // 渠道承接（PRD 4.3.2）：落地即捕获 source/refId，命中渠道则报 E01（会话三元组去重）
  captureChannelQuery(route.query as { source?: string; refId?: string })
  if (getSessionSource()) {
    trackChannelVisit({
      source: getSessionSource(),
      refId: getSessionRefId(),
      target: 'fill'
    })
  }
  loadSurvey()
})
</script>

<style scoped>
/* 心智测评完成态：夜幕铺满填写页滚动容器 */
.fill-complete {
  min-height: 100%;
}
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
