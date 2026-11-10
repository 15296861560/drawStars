<template>
  <!-- 分享海报页（PRD 4.3.4：Canvas 750×1200 合成单图 + 双码 + E09/积分） -->
  <div class="asmt-h5 poster-h5">
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
        <button class="btn btn-ghost h-9 px-4 text-[12.5px]" @click="goBack">← 返回</button>
        <div class="flex-1 text-center min-w-0">
          <div class="serif text-[15.5px] font-semibold truncate" style="color: var(--ink)">分享海报</div>
          <div class="text-[11px]" style="color: var(--faint)">{{ dateText }} · NO. {{ posterNo }}</div>
        </div>
        <span class="chip chip-gold shrink-0 scale-90 text-[10.5px]">生成 +5</span>
      </header>

      <!-- 海报预览：Canvas 750×1200 直接缩放展示（与保存图完全一致） -->
      <div class="poster-box mt-6" v-show="ready">
        <canvas ref="canvasRef" class="poster-canvas" width="750" height="1200"></canvas>
      </div>
      <div v-if="!ready" class="poster-box poster-holder mt-6">
        <span class="serif text-[13px] tracking-[0.2em]" style="color: var(--faint)">星 图 合 成 中 …</span>
      </div>

      <!-- 操作提示（4.8 幂等说明） -->
      <div class="text-center text-[10.5px] leading-relaxed mt-4" style="color: var(--faint)">
        ✦ 微信内长按海报可保存或转发 ✦<br>
        首次生成海报 +5 积分，同一报告重复生成不重复发放
      </div>

      <!-- 行动区 -->
      <div class="mt-4 space-y-3">
        <button class="btn btn-gold w-full h-[52px] text-[15px]" @click="savePoster">保存长图</button>
        <div class="flex gap-3">
          <button class="btn btn-ghost flex-1 h-[46px] text-[13.5px]" @click="shareDemo">分享给朋友</button>
          <button class="btn btn-ghost flex-1 h-[46px] text-[13.5px]" @click="goBack">返回报告</button>
        </div>
      </div>

      <!-- 引导位（4.4.1 poster 位：desc 用 poster_share_text） -->
      <div class="mt-6">
        <OaFollowGuide position="poster" />
      </div>

      <footer class="mt-7">
        <div class="text-center text-[10.5px] tracking-[0.14em]" style="color: rgba(245, 240, 228, 0.28)">
          POWERED BY DRAWSTARS · 问星
        </div>
      </footer>
    </div>

    <PointsToast />
  </div>
</template>

<script setup lang="ts">
/**
 * 分享海报页（PRD 4.3.4）
 * - 前端原生 Canvas 750×1200 合成（夜幕 + 鎏金边框 + 星点 + 结果 + 分享语 + 双码）
 * - 双码：左=再测一次（本地 renderQrDataUrl，链带 source=share&refId） 右=公众号二维码
 *   guide_enabled=false 时仍可生成，仅去掉公众号码（核心价值是拉新测评）
 * - 合成完成上报 E09 poster_create；已登录用户直调 grant ASSESSMENT_POSTER +5（场景 A'）
 */
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAssessmentReport, getGuideConfig, grantPoints } from '@/api/assessment'
import { sendEvent, getSessionId } from '@/utils/assessment-events'
import {
  ASSESSMENT_TYPE_REGISTRY,
  OA_GUIDE_DEFAULTS
} from '@/config/assessment-registry'
import type { AssessmentReport, GuideConfig } from '@/types/assessment'
import { renderQrDataUrl } from '@/views/assessment/components/render-qr'
import { showPointsToast } from '@/views/assessment/components/points-toast'
import OaFollowGuide from '@/views/assessment/components/OaFollowGuide.vue'
import PointsToast from '@/views/assessment/components/PointsToast.vue'
import { userInfoStore } from '@/stores/user-info'
import { isSkipLoginMode } from '@/config/skip-login'
import '@/views/assessment/theme/assessment-h5.less'

const route = useRoute()
const router = useRouter()
const userInfo = userInfoStore()

const clock = new Date().toTimeString().slice(0, 5)
const responseId = String(route.params.responseId)
const ready = ref(false)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const report = ref<AssessmentReport | null>(null)
const guide = ref<GuideConfig | null>(null)

const isLoggedIn = computed(
  () => isSkipLoginMode() || (userInfo.getUserId || 0) > 0
)

const typeDef = computed(
  () => ASSESSMENT_TYPE_REGISTRY[report.value?.typeKey || ''] || null
)
const heroMark = computed(() => {
  const r = report.value
  return (
    r?.topDimension?.symbol ||
    r?.dimensions?.[0]?.symbol ||
    typeDef.value?.icon ||
    '✦'
  )
})
const heroMain = computed(
  () => report.value?.gradeLabel || report.value?.resultTitle || ''
)
const typeLabel = computed(() => {
  const k = report.value?.typeKey
  if (k === 'archetype') return '周 易 心 智 原 型'
  if (k === 'quick_daily') return '今 日 能 量 签'
  return '情 绪 能 量 画 像'
})
const nowText = (() => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
})()
const dateText = computed(
  () => (report.value?.completedAt || '').slice(0, 10).replaceAll('-', '.') || nowText
)
const posterNo = computed(
  () => report.value?.responseNo || `R-${responseId.slice(-5).toUpperCase()}`
)

const FONT_SERIF = 'Georgia, "Times New Roman", "PingFang SC", "Microsoft YaHei", serif'
const C = {
  gold1: '#f6dfa2',
  gold2: '#e9c87e',
  ink: '#f5f0e4',
  mist: '#a8a3b8',
  faint: 'rgba(245,240,228,0.45)',
  dim: 'rgba(245,240,228,0.32)',
  night: '#191636'
}

onMounted(async () => {
  try {
    const rep = await getAssessmentReport(responseId)
    if (!rep) throw new Error('empty')
    report.value = rep
  } catch (_e) {
    ElMessage.error('报告不存在或已失效')
    router.replace(`/survey/result/${responseId}`)
    return
  }
  try {
    guide.value = await getGuideConfig()
  } catch (_e) {
    guide.value = null
  }
  await buildPoster()
})

/** 返回报告页 */
function goBack() {
  if (window.history.length > 1) router.back()
  else router.replace(`/survey/result/${responseId}`)
}

/** 保存长图：非微信直接下载，微信内引导长按保存（4.3.4 保存/转发） */
function savePoster() {
  const canvas = canvasRef.value
  if (!canvas) return
  if (/MicroMessenger/i.test(navigator.userAgent)) {
    ElMessage.success('长按海报图片即可保存或转发')
    return
  }
  try {
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `问星测评海报-${posterNo.value}.png`
    a.click()
    ElMessage.success('海报已保存到本地')
  } catch (_e) {
    ElMessage.error('保存失败，请长按海报保存')
  }
}

function shareDemo() {
  // E08 share_click：海报页分享按钮点击（与报告页同口径，target 区分位）
  sendEvent('share_click', {
    surveyId: report.value?.surveyId,
    surveyResponseId: responseId,
    target: 'poster'
  })
  // v1.0 不接 JS-SDK，分享走微信原生长按转发（P2 预留）
  ElMessage.info('长按海报图片即可转发给朋友（演示）')
}

// ===== 海报合成 =====

async function buildPoster() {
  const r = report.value
  if (!r) return
  await nextTick()

  // 链接二维码内容（source=share 归因；游客 refId 用 sessionId，PRD 4.3.4）
  const uid = userInfo.getUserId || 0
  const refId = uid > 0 ? `u${uid}` : getSessionId()
  const target = r.shareCode
    ? `/survey/fill/${r.shareCode}`
    : (guide.value?.plazaPath || OA_GUIDE_DEFAULTS.plazaPath)
  const linkUrl = `${location.origin}${target}?source=share&refId=${encodeURIComponent(refId)}`
  const linkQr = await renderQrDataUrl(linkUrl, { size: 380 })
  let oaImg: HTMLImageElement | null = null
  if (guide.value?.guideEnabled && guide.value.qrCodeUrl) {
    oaImg = await loadImage(guide.value.qrCodeUrl, true) // 跨域码失败由占位纹路兜底
  }
  const linkImg = linkQr ? await loadImage(linkQr, false) : null

  drawPoster(linkImg, oaImg)
  ready.value = true

  // E09 poster_create：合成完成上报（fire-and-forget，兼海报积分幂等依据 4.8.2）
  sendEvent('poster_create', {
    surveyId: r.surveyId,
    surveyResponseId: responseId,
    target: 'poster'
  })
  // 场景 A'：已登录用户生成海报 → 直调 grant +5（fire-and-forget）
  if (isLoggedIn.value) {
    grantPoints({ scenario: 'ASSESSMENT_POSTER', responseId })
      .then(g => {
        if (g?.granted && g.points > 0) {
          setTimeout(() => showPointsToast(`+${g.points} 问星积分已到账`), 300)
        }
      })
      .catch(() => {})
  }
}

function loadImage(src: string, cors: boolean): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image()
    if (cors) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function drawPoster(
  linkImg: HTMLImageElement | null,
  oaImg: HTMLImageElement | null
) {
  const r = report.value!
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 1) 夜幕渐变
  const bg = ctx.createLinearGradient(140, 0, 320, 1200)
  bg.addColorStop(0, '#181540')
  bg.addColorStop(0.48, '#0f0d26')
  bg.addColorStop(1, '#221c4e')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 750, 1200)

  // 2) 光晕：右上紫 / 左中金
  let halo = ctx.createRadialGradient(660, -40, 0, 660, -40, 440)
  halo.addColorStop(0, 'rgba(160,140,240,0.30)')
  halo.addColorStop(1, 'rgba(160,140,240,0)')
  ctx.fillStyle = halo
  ctx.fillRect(0, 0, 750, 620)
  halo = ctx.createRadialGradient(-50, 560, 0, -50, 560, 400)
  halo.addColorStop(0, 'rgba(233,200,126,0.13)')
  halo.addColorStop(1, 'rgba(233,200,126,0)')
  ctx.fillStyle = halo
  ctx.fillRect(0, 300, 560, 900)

  // 3) 星点（伪随机固定种子，可复现）
  starDots(ctx)

  // 4) 鎏金双描边
  ctx.strokeStyle = 'rgba(246,223,162,0.42)'
  ctx.lineWidth = 2
  roundRect(ctx, 10, 10, 730, 1180, 26)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(246,223,162,0.16)'
  ctx.lineWidth = 1
  roundRect(ctx, 22, 22, 706, 1156, 18)
  ctx.stroke()

  // 5) 品牌头
  ctx.fillStyle = 'rgba(233,200,126,0.10)'
  roundRect(ctx, 52, 58, 64, 64, 20)
  ctx.fill()
  ctx.strokeStyle = 'rgba(233,200,126,0.35)'
  ctx.lineWidth = 1.5
  roundRect(ctx, 52, 58, 64, 64, 20)
  ctx.stroke()
  ctx.fillStyle = C.gold1
  ctx.font = `31px ${FONT_SERIF}`
  ctx.textAlign = 'center'
  ctx.fillText('✦', 84, 103)
  ctx.textAlign = 'left'
  ctx.fillStyle = C.ink
  ctx.font = `bold 44px ${FONT_SERIF}`
  ctx.fillText('问星', 136, 96)
  ctx.fillStyle = C.gold2
  ctx.font = '15px sans-serif'
  ctx.fillText('心 智 测 评', 138, 120)
  ctx.textAlign = 'right'
  ctx.fillStyle = C.faint
  ctx.font = '20px sans-serif'
  ctx.fillText(dateText.value, 700, 86)
  ctx.font = '18px sans-serif'
  ctx.fillText(`NO. ${posterNo.value}`, 700, 112)

  // 6) 大符水印（居中压底）
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(246,223,162,0.05)'
  ctx.font = `400px ${FONT_SERIF}`
  ctx.fillText(heroMark.value, 375, 730)

  // 7) 主结果区
  ctx.fillStyle = C.gold2
  ctx.font = '24px sans-serif'
  ctx.fillText(typeLabel.value, 375, 268)

  ctx.save()
  ctx.shadowColor = 'rgba(246,223,162,0.45)'
  ctx.shadowBlur = 60
  ctx.fillStyle = C.gold1
  ctx.font = `bold ${fitFont(ctx, heroMain.value, `bold 110px ${FONT_SERIF}`, 620)}px ${FONT_SERIF}`
  ctx.fillText(heroMain.value, 375, 420)
  ctx.restore()

  const heroSub = r.resultTitle && r.resultTitle !== heroMain.value ? r.resultTitle : ''
  if (heroSub) {
    ctx.fillStyle = C.mist
    ctx.font = `24px ${FONT_SERIF}`
    ctx.fillText(heroSub, 375, 468)
  }
  // 印证语：summaryText 首段（最多两行）
  const quote = (r.summaryText || '').split('\n')[0].trim()
  if (quote) {
    ctx.fillStyle = C.mist
    ctx.font = `italic 22px ${FONT_SERIF}`
    const quoteLines = wrapLines(ctx, quote, 600, 2)
    quoteLines.forEach((t, i) => ctx.fillText(t, 375, 528 + i * 38))
  }

  // 8) 分隔符 ✦
  ctx.strokeStyle = 'rgba(233,200,126,0.4)'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(240, 606); ctx.lineTo(330, 606); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(420, 606); ctx.lineTo(510, 606); ctx.stroke()
  ctx.fillStyle = C.gold2
  ctx.font = '22px sans-serif'
  ctx.fillText('✦', 375, 613)

  // 9) 数据行：契合度 + 前三维度
  const pct = Math.round(
    r.topDimension?.percent ||
      (r.maxScore ? ((r.totalScore || 0) / r.maxScore) * 100 : 0)
  )
  const pctLabel =
    r.typeKey === 'archetype'
      ? '原型契合度'
      : r.typeKey === 'quick_daily'
        ? '今日能量指数'
        : '总体能量'
  const dims = (r.dimensions || []).slice(0, 3)
  const segs: Array<{ t: string; c?: string }> = []
  if (pct > 0) {
    segs.push({ t: `${pctLabel} ` }, { t: `${pct}%`, c: C.gold1 })
  }
  dims.forEach((d, i) => {
    segs.push({ t: `   ${d.symbol || ''} ${d.name} ` })
    segs.push({ t: String(d.score), c: i === 0 ? C.gold1 : C.mist })
  })
  if (segs.length) {
    ctx.font = '21px sans-serif'
    ctx.fillStyle = C.faint
    drawRichRow(ctx, 668, segs, 0)
  }

  // 10) 分享语卡（poster_share_text 可配置，槽位替换 {结果名}）
  const shareTxt = (
    guide.value?.posterShareText || OA_GUIDE_DEFAULTS.posterShareText
  ).replaceAll('{结果名}', heroMain.value || '你')
  let cardLines: string[] = []
  let shareSize = 24
  for (; shareSize >= 17; shareSize -= 2) {
    ctx.font = `${shareSize}px ${FONT_SERIF}`
    cardLines = wrapLines(ctx, shareTxt, 556, 2)
    // 末行未被截断即无需继续缩字号
    if (cardLines.length < 2 || !cardLines[cardLines.length - 1].endsWith('…')) break
  }
  const boxH = cardLines.length * (shareSize + 18) + 30
  ctx.fillStyle = 'rgba(233,200,126,0.07)'
  roundRect(ctx, 58, 700, 634, boxH, 22)
  ctx.fill()
  ctx.strokeStyle = 'rgba(246,223,162,0.32)'
  ctx.lineWidth = 1.5
  roundRect(ctx, 58, 700, 634, boxH, 22)
  ctx.stroke()
  ctx.fillStyle = C.mist
  ctx.font = `${shareSize}px ${FONT_SERIF}`
  cardLines.forEach((t, i) =>
    ctx.fillText(t, 375, 700 + 26 + shareSize + i * (shareSize + 18))
  )
  const shareBottom = 700 + boxH

  // 11) 双码区：左·再测一次（本地码） 右·公众号（guide_enabled=false 时省略）
  const qrTop = shareBottom + 54
  const qrSize = 160
  // 左码：白圆角盒 + 本地链接码
  drawQrChip(ctx, 70, qrTop, qrSize, linkImg)
  ctx.fillStyle = C.mist
  ctx.font = '20px sans-serif'
  ctx.fillText('再测一次 · 问星', 70 + qrSize / 2, qrTop + qrSize + 38)

  const showOa = guide.value?.guideEnabled !== false
  if (showOa) {
    drawQrChip(ctx, 520, qrTop, qrSize, oaImg)
    ctx.fillStyle = C.gold1
    ctx.font = '20px sans-serif'
    ctx.fillText(`关注「${guide.value?.officialName || OA_GUIDE_DEFAULTS.officialName}」`, 520 + qrSize / 2, qrTop + qrSize + 38)
  }
  // 中间提示
  const tips = showOa
    ? ['长 按 识 别', '✧', '分 享 给 朋 友']
    : ['长 按 识 别', '✧', '再 测 一 次']
  ctx.fillStyle = C.gold2
  ctx.font = '17px sans-serif'
  ctx.fillText(tips[0], 375, qrTop + 44)
  ctx.font = '24px sans-serif'
  ctx.fillText(tips[1], 375, qrTop + 84)
  ctx.font = '17px sans-serif'
  ctx.fillText(tips[2], 375, qrTop + 124)

  // 12) 品牌落款
  ctx.fillStyle = C.dim
  ctx.font = '16px sans-serif'
  ctx.fillText('P O W E R E D   B Y   D R A W S T A R S', 375, 1156)
}

/** 二维码芯片：米白底 + 码图（无码图画点阵占位示意） */
function drawQrChip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  img: HTMLImageElement | null
) {
  const g = ctx.createLinearGradient(x, y, x + size, y + size)
  g.addColorStop(0, '#f5f0e4')
  g.addColorStop(1, '#efe6cf')
  ctx.fillStyle = g
  roundRect(ctx, x, y, size, size, 18)
  ctx.fill()
  ctx.strokeStyle = 'rgba(246,223,162,0.25)'
  ctx.lineWidth = 1
  roundRect(ctx, x, y, size, size, 18)
  ctx.stroke()
  const pad = 8
  if (img) {
    ctx.drawImage(img, x + pad, y + pad, size - pad * 2, size - pad * 2)
    return
  }
  // 占位点阵：三定位眼（外环+实心）+ 伪随机噪声，仅示意扫码不可用
  let s = 5201314
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
  const n = 11
  const cell = (size - pad * 2) / n
  ctx.fillStyle = C.night
  const eyes: Array<[number, number]> = [
    [0, 0],
    [0, n - 3],
    [n - 3, 0]
  ]
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const eye = eyes.find(([a, b]) => i >= a && i < a + 3 && j >= b && j < b + 3)
      let fill: boolean
      if (eye) {
        const di = i - eye[0]
        const dj = j - eye[1]
        fill = di === 0 || di === 2 || dj === 0 || dj === 2 || (di === 1 && dj === 1)
      } else {
        fill = rnd() > 0.52
      }
      if (fill) {
        ctx.fillRect(x + pad + i * cell, y + pad + j * cell, cell - 1.2, cell - 1.2)
      }
    }
  }
}

/** 星点（伪随机固定种子） */
function starDots(ctx: CanvasRenderingContext2D) {
  let s = 20261109
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
  const palette = ['#ffffff', '#f6dfa2', '#c8d2ff']
  for (let i = 0; i < 46; i++) {
    const x = 26 + rnd() * 698
    const y = 26 + rnd() * 1148
    const radius = 0.9 + rnd() * 1.5
    ctx.globalAlpha = 0.22 + rnd() * 0.6
    ctx.fillStyle = palette[Math.floor(rnd() * palette.length)]
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** 按最大宽度自适应字号（标题过长降字号） */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  startFont: string,
  maxW: number
): number {
  const m = /(\d+)(?=px)/.exec(startFont)
  const base = m ? Number(m[1]) : 100
  ctx.font = startFont
  if (ctx.measureText(text).width <= maxW) return base
  let s = base
  while (s > 30 && ctx.measureText(text).width > maxW) {
    s -= 4
    ctx.font = startFont.replace(`${base}px`, `${s}px`)
  }
  return s
}

/** 单行富文本段居中绘制 */
function drawRichRow(
  ctx: CanvasRenderingContext2D,
  y: number,
  segs: Array<{ t: string; c?: string }>,
  gap: number
) {
  const widths = segs.map(s => ctx.measureText(s.t).width)
  const total =
    widths.reduce((a, b) => a + b, 0) + gap * (segs.length - 1)
  let x = 375 - total / 2
  ctx.textAlign = 'left'
  segs.forEach((s, i) => {
    ctx.fillStyle = s.c || C.faint
    ctx.fillText(s.t, x, y)
    x += widths[i] + gap
  })
  ctx.textAlign = 'center'
}

/** 逐字断行（超出行数末行截断加省略号） */
function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  maxLines: number
): string[] {
  const lines: string[] = []
  let cur = ''
  for (const ch of text) {
    if (cur && ctx.measureText(cur + ch).width > maxW) {
      lines.push(cur)
      cur = ''
      if (lines.length === maxLines) break
    }
    cur += ch
  }
  if (lines.length === maxLines) {
    let last = lines[maxLines - 1]
    while (last.length > 1 && ctx.measureText(last + '…').width > maxW) {
      last = last.slice(0, -1)
    }
    lines[maxLines - 1] = last + '…'
  } else if (cur) {
    lines.push(cur)
  }
  return lines
}
</script>

<style scoped>
.poster-h5 {
  min-height: 100vh;
}
.poster-box {
  position: relative;
  border-radius: 26px;
  overflow: hidden;
  border: 1px solid rgba(246, 223, 162, 0.42);
  background: linear-gradient(168deg, #181540 0%, #0f0d26 48%, #221c4e 100%);
  box-shadow:
    0 0 0 6px rgba(233, 200, 126, 0.07),
    0 34px 80px rgba(4, 3, 14, 0.85);
}
.poster-canvas {
  display: block;
  width: 100%;
  height: auto;
}
.poster-holder {
  aspect-ratio: 25 / 40;
  display: grid;
  place-items: center;
}
</style>
