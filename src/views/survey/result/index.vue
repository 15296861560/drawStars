<template>
  <!-- 问星星空报告（PRD 4.3.3：测评报告页增强，getAssessmentReport 命中即渲染） -->
  <div v-if="asmtReport" class="asmt-h5 report-h5">
    <div class="star-sky"></div>
    <div class="page max-w-[420px] mx-auto px-4 pb-10 pt-3">
      <!-- 状态栏 -->
      <div class="flex items-center justify-between text-[12px]" style="color: var(--mist)">
        <span class="font-semibold" style="color: var(--ink)">{{ clock }}</span>
        <span class="flex items-center gap-1.5 text-[11px]">
          <svg width="34" height="11" viewBox="0 0 34 11" fill="none"><rect x="0" y="6" width="4" height="5" rx="1" fill="rgba(245,240,228,.75)"/><rect x="6" y="4" width="4" height="7" rx="1" fill="rgba(245,240,228,.75)"/><rect x="12" y="2" width="4" height="9" rx="1" fill="rgba(245,240,228,.75)"/><rect x="18" y="0" width="4" height="11" rx="1" fill="rgba(245,240,228,.38)"/><rect x="25" y="0.8" width="7.5" height="9.4" rx="2.4" stroke="rgba(245,240,228,.55)"/><rect x="26.6" y="2.4" width="4.2" height="6.2" rx="1.2" fill="rgba(246,223,162,.95)"/></svg>
        </span>
      </div>

      <!-- 顶栏 -->
      <header class="flex items-center gap-3 mt-3">
        <button
          class="btn btn-ghost h-9 px-4 text-[12.5px]"
          @click="router.back()"
        >
          ← 返回
        </button>
        <div class="flex-1 text-center min-w-0">
          <div class="serif text-[15.5px] font-semibold truncate" style="color: var(--ink)">
            {{ asmtReport.infoTitle }} · 测评报告
          </div>
          <div class="text-[11px] text-center" style="color: var(--faint)">
            NO. {{ asmtReport.responseNo || responseId }}
          </div>
        </div>
        <span class="chip shrink-0" :class="isLoggedIn ? 'chip-jade' : 'chip-gold'">
          {{ isLoggedIn ? '已归档' : '游客报告' }}
        </span>
      </header>

      <!-- ① 结果头：大卦象水印 + 类型判定 -->
      <section class="report-hero relative mt-6 pt-5 text-center overflow-hidden">
        <div class="hero-mark serif" aria-hidden="true">{{ heroMark }}</div>
        <h2 class="text-[12.5px] tracking-[0.08em]" style="color: var(--mist)">{{ heroTagline }}</h2>
        <div class="serif font-bold mt-2 hero-main">{{ heroMain }}</div>
        <p v-if="heroSub" class="serif text-[13.5px] mt-2.5 leading-relaxed hero-sub">{{ heroSub }}</p>
      </section>

      <!-- ② 分数区：环形分 + 等级徽记 -->
      <section class="glass p-5 mt-4">
        <div class="flex items-center gap-5">
          <div class="score-ring relative shrink-0">
            <svg width="108" height="108" viewBox="0 0 108 108" fill="none">
              <circle cx="54" cy="54" r="48" stroke="rgba(245,240,228,0.08)" stroke-width="9" />
              <circle
                cx="54" cy="54" r="48" stroke="url(#asmtRingG)" stroke-width="9"
                stroke-linecap="round"
                :stroke-dasharray="`${(ringPct / 100) * ringC} ${ringC}`"
                transform="rotate(-90 54 54)"
              />
              <defs>
                <linearGradient id="asmtRingG" x1="0" y1="0" x2="1" y2="1">
                  <stop stop-color="#f6dfa2" /><stop offset="1" stop-color="#c1903c" />
                </linearGradient>
              </defs>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="serif text-[30px] font-bold" style="color: var(--gold-1)">{{ ringPct }}<span class="text-[15px]">%</span></span>
              <span class="text-[10.5px] tracking-[0.14em]" style="color: var(--faint)">{{ ringLabel }}</span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <span class="badge-grade" :style="badgeStyle">{{ asmtReport.gradeLabel }}</span>
            <p class="text-[14.5px] font-semibold mt-2.5" style="color: var(--ink)">{{ scoreLead }}</p>
            <p class="text-[12px] mt-1.5 leading-relaxed" style="color: var(--mist)">{{ scoreSub }}</p>
          </div>
        </div>
      </section>

      <!-- ③ 维度区：八象分布（M1 八维 / M2 四维） -->
      <section v-if="(asmtReport.dimensions?.length || 0) > 1" class="glass p-5 mt-4">
        <div class="section-title">你的星辰分布</div>
        <div class="mt-4 space-y-5">
          <div
            v-for="(d, i) in asmtReport.dimensions"
            :key="d.key"
            class="dimrow"
            :class="{ top: i === 0 }"
          >
            <div class="trigram serif">{{ d.symbol || '✦' }}</div>
            <div class="dim-name">{{ d.name }}</div>
            <div class="dim-rail">
              <div class="dim-fill" :style="{ width: dimsReady ? `${d.percent}%` : '0%' }"></div>
            </div>
            <div class="dim-val">{{ d.score }}/{{ d.max }}</div>
          </div>
        </div>
      </section>

      <!-- ④ 解读区：类型正文 + 明亮面/盲区（M1）+ 校准建议 -->
      <section class="mt-6">
        <div class="section-title">解读 · {{ heroMain }}</div>
        <p
          v-for="(para, i) in summaryParas"
          :key="i"
          class="serif text-[14px] mt-4 leading-[2]"
          :style="{ color: i === 0 ? 'var(--ink)' : 'var(--mist)' }"
        >
          {{ para }}
        </p>

        <div v-if="asmtReport.brightSide?.length || asmtReport.blindSide?.length" class="grid grid-cols-2 gap-3 mt-5">
          <div v-if="asmtReport.brightSide?.length" class="glass p-3.5 rounded-[16px]">
            <span class="chip chip-gold">✦ 明亮面</span>
            <ul class="mt-2.5 space-y-1.5">
              <li
                v-for="b in asmtReport.brightSide"
                :key="b"
                class="text-[12px] leading-relaxed flex gap-1.5"
                style="color: var(--ink)"
              >
                <span style="color: var(--gold-2)">✦</span>{{ b }}
              </li>
            </ul>
          </div>
          <div v-if="asmtReport.blindSide?.length" class="glass p-3.5 rounded-[16px]">
            <span class="chip chip-coral">✧ 盲区</span>
            <ul class="mt-2.5 space-y-1.5">
              <li
                v-for="b in asmtReport.blindSide"
                :key="b"
                class="text-[12px] leading-relaxed flex gap-1.5"
                style="color: var(--ink)"
              >
                <span style="color: var(--coral)">✧</span>{{ b }}
              </li>
            </ul>
          </div>
        </div>

        <p
          v-if="asmtReport.adviceText"
          class="serif text-[13px] mt-5 leading-relaxed text-left"
          style="color: var(--jade)"
        >
          ☯ 校准建议 —— {{ asmtReport.adviceText }}
        </p>
        <hr class="hairline-x mt-6" />
        <p class="text-[11px] mt-3 leading-relaxed" style="color: var(--faint)">
          {{ REPORT_DISCLAIMER }}
        </p>
      </section>

      <!-- ⑤ 行动区 -->
      <section class="mt-5 space-y-3">
        <button class="btn btn-gold w-full h-[50px] text-[14.5px]" @click="goPoster">
          ✦ 生成分享海报
        </button>
        <div class="grid grid-cols-2 gap-3">
          <button class="btn btn-ghost h-[46px] text-[13px]" @click="router.replace('/assessment/list')">
            换个测评试试
          </button>
          <button class="btn btn-ghost h-[46px] text-[13px]" @click="downloadReport">
            下载报告证书
          </button>
        </div>
      </section>

      <!-- ⑥ 引导位（4.4.1 result 位：标题含结果名槽位） -->
      <div class="mt-6">
        <OaFollowGuide position="result" :result-name="asmtReport.gradeLabel || ''" />
      </div>

      <footer class="mt-4">
        <div class="footnote-disclaimer">本报告由问星生成，内容仅供自我探索参考</div>
        <div class="text-center text-[10.5px] mt-2 tracking-[0.14em]" style="color: rgba(245, 240, 228, 0.28)">
          POWERED BY DRAWSTARS · 问星
        </div>
      </footer>
    </div>
    <QuickRegisterEntry trigger="result" success-text="完成，回到我的报告" />
    <PointsToast />
  </div>

  <div v-else class="survey-result" v-loading="loading">
    <el-card v-if="scoring">
      <div class="score-hero">
        <div class="score-num">{{ scoring.totalScore }}</div>
        <div class="score-max">/ {{ scoring.maxScore }}</div>
      </div>
      <div class="grade-row">
        <el-tag v-if="scoring.gradeLabel" size="large" type="success">{{
          scoring.gradeLabel
        }}</el-tag>
        <el-tag
          v-if="scoring.isPassed != null"
          size="large"
          :type="scoring.isPassed ? 'success' : 'danger'"
          >{{ scoring.isPassed ? '通过' : '未通过' }}</el-tag
        >
        <span v-if="scoring.rank">排名：第 {{ scoring.rank }} 名</span>
      </div>

      <el-divider />
      <h4>答题明细</h4>
      <el-table :data="scoring.detail || []" size="small" border>
        <el-table-column prop="questionId" label="题目ID" width="100" />
        <el-table-column label="得分" width="120">
          <template #default="{ row }"
            >{{ row.score }} / {{ row.max }}</template
          >
        </el-table-column>
        <el-table-column label="结果" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isCorrect ? 'success' : 'info'" size="small">
              {{ row.isCorrect ? '正确' : '—' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="备注" />
      </el-table>

      <div class="cert-area">
        <canvas ref="certRef" width="720" height="420" class="cert-canvas" />
        <el-button type="primary" @click="downloadCert">下载证书</el-button>
      </div>
    </el-card>
    <el-empty v-else-if="!loading" description="暂无成绩数据" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { ScoringResult, Survey } from '@/types/survey'
import { getResult } from '@/api/survey'
import { getAssessmentReport } from '@/api/assessment'
import { sendEvent } from '@/utils/assessment-events'
import { REPORT_DISCLAIMER } from '@/config/assessment-registry'
import type { AssessmentReport } from '@/types/assessment'
import { userInfoStore } from '@/stores/user-info'
import { isSkipLoginMode } from '@/config/skip-login'
import '@/views/assessment/theme/assessment-h5.less'
import OaFollowGuide from '@/views/assessment/components/OaFollowGuide.vue'
import QuickRegisterEntry from '@/views/assessment/components/QuickRegisterEntry.vue'
import PointsToast from '@/views/assessment/components/PointsToast.vue'

const route = useRoute()
const router = useRouter()
const userInfo = userInfoStore()
const loading = ref(false)
const scoring = ref<ScoringResult | null>(null)
const survey = ref<Survey | null>(null)
const certRef = ref<HTMLCanvasElement | null>(null)

// ---------- 问星报告（PRD 4.3.3 星空报告页） ----------
const clock = new Date().toTimeString().slice(0, 5)
const asmtReport = ref<AssessmentReport | null>(null)
const dimsReady = ref(false)
const isLoggedIn = computed(
  () => isSkipLoginMode() || (userInfo.getUserId || 0) > 0
)

const heroMark = computed(
  () =>
    asmtReport.value?.topDimension?.symbol ||
    asmtReport.value?.dimensions?.[0]?.symbol ||
    '✦'
)
const heroTagline = computed(() => {
  const k = asmtReport.value?.typeKey
  if (k === 'archetype') return '你的周易心智原型是'
  if (k === 'quick_daily') return '你今日的能量档位是'
  return '你的情绪能量画像是'
})
const heroMain = computed(
  () => asmtReport.value?.gradeLabel || asmtReport.value?.resultTitle || ''
)
const heroSub = computed(() => {
  const r = asmtReport.value
  const t = r?.resultTitle || ''
  return t && t !== heroMain.value ? t : ''
})

const ringC = 2 * Math.PI * 48
const ringPct = computed(() => {
  const r = asmtReport.value
  if (!r) return 0
  const d = r.topDimension || r.dimensions?.[0]
  if (d) return Math.round(d.percent || (d.max ? (d.score / d.max) * 100 : 0))
  if (r.maxScore) return Math.round(((r.totalScore || 0) / r.maxScore) * 100)
  return 0
})
const ringLabel = computed(() => {
  const k = asmtReport.value?.typeKey
  if (k === 'archetype') return '原型契合度'
  if (k === 'quick_daily') return '今日能量指数'
  return '总体能量'
})
const badgeStyle = computed(() => {
  const c = asmtReport.value?.gradeColor
  return c ? { color: c, borderColor: c } : undefined
})
const scoreLead = computed(() => {
  const r = asmtReport.value
  if (!r) return ''
  const top = r.topDimension?.name || r.gradeLabel || ''
  return `顶点在「${top}」 · ${r.judgeModel === 'M1' ? '八象取型' : '能量定位'}`
})
const scoreSub = computed(() => {
  const s = asmtReport.value?.summaryText || ''
  const first = s.split('\n')[0] || ''
  return first.length > 46 ? `${first.slice(0, 46)}…` : first
})
const summaryParas = computed(() =>
  (asmtReport.value?.summaryText || '')
    .split('\n')
    .map(t => t.trim())
    .filter(Boolean)
)

/** E08 share_click → 海报页（PRD 4.3.4） */
function goPoster() {
  const rid = String(route.params.responseId)
  sendEvent('share_click', { surveyResponseId: rid, target: 'result' })
  router.push(`/assessment/poster/${rid}`)
}

function downloadReport() {
  ElMessage.info('完整证书编写中，可先「生成分享海报」保存报告图片')
}

async function load() {
  loading.value = true
  try {
    const res = await getResult(String(route.params.responseId), {
      shareCode: (route.query.shareCode as string) || undefined
    })
    scoring.value = res.scoring || null
    survey.value = res.survey || null
    await nextTick()
    drawCert()
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function drawCert() {
  const canvas = certRef.value
  if (!canvas || !scoring.value) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#faf6ef'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#c9a227'
  ctx.lineWidth = 6
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32)
  ctx.fillStyle = '#333'
  ctx.font = 'bold 36px serif'
  ctx.textAlign = 'center'
  ctx.fillText('成绩证书', canvas.width / 2, 90)
  ctx.font = '20px sans-serif'
  ctx.fillText(survey.value?.title || '问卷测评', canvas.width / 2, 150)
  ctx.font = 'bold 48px sans-serif'
  ctx.fillStyle = '#1a5fb4'
  ctx.fillText(
    `${scoring.value.totalScore} / ${scoring.value.maxScore}`,
    canvas.width / 2,
    230
  )
  ctx.fillStyle = '#333'
  ctx.font = '22px sans-serif'
  ctx.fillText(scoring.value.gradeLabel || '', canvas.width / 2, 280)
  ctx.font = '14px sans-serif'
  ctx.fillText(
    `编号：R${route.params.responseId}-${Date.now().toString(36)}`,
    canvas.width / 2,
    340
  )
}

function downloadCert() {
  const canvas = certRef.value
  if (!canvas) return
  drawCert()
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = `certificate-${route.params.responseId}.png`
  a.click()
}

onMounted(async () => {
  // 测评答卷优先走问星报告；未命中（普通问卷/无 Mock 记录）回落成绩页
  try {
    const rep = await getAssessmentReport(String(route.params.responseId))
    if (rep) {
      asmtReport.value = rep
      // 等待首帧后触发维度条/圆环动画
      setTimeout(() => {
        dimsReady.value = true
      }, 150)
      return
    }
  } catch (_e) {
    // ignore：回落普通成绩页
  }
  load()
})
</script>

<style scoped>
.survey-result {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px 16px;
}
.score-hero {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin: 12px 0;
}
.score-num {
  font-size: 56px;
  font-weight: 700;
  color: #1a5fb4;
}
.score-max {
  font-size: 24px;
  color: #909399;
}
.grade-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}
.cert-area {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.cert-canvas {
  max-width: 100%;
  border: 1px solid #eee;
  border-radius: 4px;
}

/* ---------- 问星星空报告（原型 result.html 专有样式） ---------- */
.report-h5 {
  min-height: 100vh;
}
.report-hero {
  position: relative;
}
.hero-mark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -54%);
  font-size: 188px;
  line-height: 1;
  color: rgba(246, 223, 162, 0.06);
  pointer-events: none;
  user-select: none;
}
.hero-main {
  font-size: 44px;
  line-height: 1.18;
  color: var(--gold-1);
  position: relative;
  text-shadow: 0 10px 34px rgba(246, 223, 162, 0.22);
}
.hero-sub {
  color: var(--mist);
  position: relative;
}
</style>
