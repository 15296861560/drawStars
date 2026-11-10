<template>
  <div class="asmt-h5">
    <div class="star-sky"></div>

    <div class="page max-w-[420px] mx-auto px-4 pb-8 pt-3">
      <!-- 状态栏 -->
      <div class="flex items-center justify-between text-[12px]" style="color: var(--mist)">
        <span class="font-semibold" style="color: var(--ink)">{{ clock }}</span>
        <span class="flex items-center gap-1.5 text-[11px]">
          <svg width="34" height="11" viewBox="0 0 34 11" fill="none"><rect x="0" y="6" width="4" height="5" rx="1" fill="rgba(245,240,228,.75)"/><rect x="6" y="4" width="4" height="7" rx="1" fill="rgba(245,240,228,.75)"/><rect x="12" y="2" width="4" height="9" rx="1" fill="rgba(245,240,228,.75)"/><rect x="18" y="0" width="4" height="11" rx="1" fill="rgba(245,240,228,.38)"/><rect x="25" y="0.8" width="7.5" height="9.4" rx="2.4" stroke="rgba(245,240,228,.55)"/><rect x="26.6" y="2.4" width="4.2" height="6.2" rx="1.2" fill="rgba(246,223,162,.95)"/></svg>
        </span>
      </div>

      <!-- 品牌头图 + 游客右上门口（PRD 4.3.1：常驻「登录/注册」，弹层不跳走） -->
      <header class="topbar mt-5">
        <div class="brand-lockup">
          <div class="brand-mark">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M12 1.6c.5 5.6 4.8 9.9 10.4 10.4-5.6.5-9.9 4.8-10.4 10.4C11.5 16.8 7.2 12.5 1.6 12 7.2 11.5 11.5 7.2 12 1.6Z" fill="url(#plazaStarG)"/><defs><linearGradient id="plazaStarG" x1="12" y1="1.6" x2="12" y2="22.4"><stop stop-color="#f6dfa2"/><stop offset="1" stop-color="#c1903c"/></linearGradient></defs></svg>
          </div>
          <div>
            <div class="serif text-[21px] font-semibold leading-none" style="color: var(--gold-1)">问星</div>
            <div class="text-[10.5px] tracking-[0.32em] mt-1" style="color: var(--faint)">心 智 测 评</div>
          </div>
        </div>
        <button
          v-if="!isLoggedIn"
          class="btn btn-ghost h-9 px-4 text-[12.5px]"
          @click="regRef?.open()"
        >
          登录 / 注册
        </button>
      </header>

      <!-- Slogan 区 -->
      <section class="mt-6 text-center">
        <h1 class="serif text-[27px] leading-relaxed font-semibold" style="color: var(--ink)">
          问星辰，问内心<span style="color: var(--gold-1)">。</span>
        </h1>
        <p class="text-[12.5px] mt-2 leading-relaxed" style="color: var(--mist)">
          以周易星象之名的轻量心智测评<br />免登录直测，六分钟照见此刻的自己
        </p>
        <div class="flex justify-center gap-2 mt-4">
          <span class="chip chip-gold">✦ 三款首发</span>
          <span class="chip">免登录直测</span>
          <span class="chip">报告即生成</span>
        </div>
      </section>

      <!-- 类型 Tabs（PRD 4.3.1：类型枚举） -->
      <nav class="tabs mt-6">
        <button
          v-for="t in tabs"
          :key="t.key"
          class="tab"
          :class="{ active: activeTab === t.key }"
          @click="switchTab(t.key)"
        >
          {{ t.label }}
        </button>
      </nav>

      <!-- 卡片流 -->
      <main class="mt-4 pb-16">
        <a
          v-for="card in cards"
          :key="card.id"
          href="javascript:;"
          class="assess-card block"
          @click.prevent="enter(card)"
        >
          <div class="card-cover" :class="coverClass(card)">
            <span v-if="badgeText(card)" class="tag-badge" :class="badgeClass(card)">{{ badgeText(card) }}</span>
            <!-- 封面装饰（原型按类型内嵌 svg） -->
            <div
              v-if="coverArt(card)"
              class="cover-art"
              v-html="coverArt(card)"
            ></div>
            <div class="serif absolute bottom-2 left-4 text-[13px]" :style="{ color: coverNoteColor(card) }">
              {{ coverNote(card) }}
            </div>
          </div>
          <div class="p-[18px]">
            <div class="flex items-center justify-between gap-3">
              <h3 class="serif text-[17.5px] font-semibold" style="color: var(--ink)">{{ card.title }}</h3>
              <span class="text-[12px] shrink-0" style="color: var(--gold-1)">进入测评 →</span>
            </div>
            <p class="text-[12.5px] mt-1.5 leading-relaxed" style="color: var(--mist)">
              {{ card.subtitle || coverSubtitle(card) }}
            </p>
            <div class="flex gap-2 mt-3">
              <span class="chip">{{ card.questionNum }} 题</span>
              <span class="chip">{{ card.durationDesc || '~2 分钟' }}</span>
              <span v-for="t in plainTags(card)" :key="t" class="chip">{{ t }}</span>
            </div>
          </div>
        </a>

        <p
          v-if="!loading && cards.length"
          class="text-center text-[11.5px] pt-1"
          style="color: var(--faint)"
        >
          — 已加载全部 {{ cardsTotal }} 款上架测评{{ activeTab === 'all' ? '' : '（当前筛选）' }} —
        </p>
        <p
          v-if="!loading && !cards.length"
          class="text-center text-[12px] pt-4"
          style="color: var(--faint)"
        >
          该类型暂无上架测评，看看「全部」吧
        </p>
      </main>

      <!-- 关于公众号（PRD 6.3：底部「关于公众号」入口） -->
      <section class="glass glass-gold mt-5 p-4">
        <div class="flex items-center gap-4">
          <div class="qr-wrap plaza-qr shrink-0">
            <img v-if="guide?.qrCodeUrl" :src="guide.qrCodeUrl" alt="公众号二维码" />
            <FakeQr v-else :seed="31" />
          </div>
          <div class="flex-1">
            <div class="text-[14.5px] font-semibold" style="color: var(--ink)">
              {{ guide?.officialName || '易道心智' }}
            </div>
            <p class="text-[12px] mt-1 leading-relaxed" style="color: var(--mist)">
              每晚一篇周易与心智模型长文<br />关注后可第一时间获取测评上新提醒
            </p>
          </div>
          <div class="text-[11px] text-center shrink-0" style="color: var(--faint)">
            长按识别<br />关注
          </div>
        </div>
      </section>

      <!-- 页脚 -->
      <footer class="mt-6">
        <div class="footnote-disclaimer">{{ REPORT_DISCLAIMER }}</div>
        <div class="text-center text-[10.5px] mt-2 tracking-[0.14em]" style="color: rgba(245, 240, 228, 0.28)">
          POWERED BY DRAWSTARS · 问星
        </div>
      </footer>
    </div>

    <!-- 游客快捷注册浮层（浮条默认隐藏，由右上按钮触发）+ 积分飘字 -->
    <QuickRegisterEntry ref="regRef" trigger="plaza" success-text="完成，继续逛广场" />
    <PointsToast />
  </div>
</template>

<script setup lang="ts">
/**
 * 问星广场（PRD 4.3.1 / 原型 plaza.html）
 * - 公开落地页：承接渠道链接 query（captureChannelQuery → E01 channel_visit）
 * - 类型枚举 Tabs + 卡片流（角标 = tags 首位 HOT / NEW / 限免）
 * - 卡片点击报 E02 plaza_click，跳 /survey/fill/{shareCode}
 */
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import '@/views/assessment/theme/assessment-h5.less'
import { plazaList, getGuideConfig } from '@/api/assessment'
import {
  ASSESSMENT_TYPE_REGISTRY,
  REPORT_DISCLAIMER
} from '@/config/assessment-registry'
import type { GuideConfig, PlazaCard } from '@/types/assessment'
import {
  captureChannelQuery,
  sendEvent,
  trackChannelVisit,
  getSessionSource,
  getSessionRefId
} from '@/utils/assessment-events'
import { userInfoStore } from '@/stores/user-info'
import { isSkipLoginMode } from '@/config/skip-login'
import PointsToast from '@/views/assessment/components/PointsToast.vue'
import FakeQr from '@/views/assessment/components/FakeQr.vue'
import QuickRegisterEntry from '@/views/assessment/components/QuickRegisterEntry.vue'

const route = useRoute()
const router = useRouter()
const userInfo = userInfoStore()

// ---- 状态栏时钟（HH:MM） ----
const clock = new Date().toTimeString().slice(0, 5)

/** v1.0 类型枚举 Tabs（对齐原型「全部/周易原型/情绪能量/每日打卡」） */
const tabs = [
  { key: 'all', label: '全部' },
  { key: 'archetype', label: '周易原型' },
  { key: 'emotion', label: '情绪能量' },
  { key: 'quick_daily', label: '每日打卡' }
] as const

const activeTab = ref<'all' | 'archetype' | 'emotion' | 'quick_daily'>('all')
const cards = ref<PlazaCard[]>([])
const cardsTotal = ref(0)
const loading = ref(true)
const guide = ref<GuideConfig | null>(null)
const regRef = ref<InstanceType<typeof QuickRegisterEntry> | null>(null)

const isLoggedIn = computed(() => isSkipLoginMode() || (userInfo.getUserId || 0) > 0)

// ---- 卡片渲染辅助：类型库封面 / 角标 / 标签 ----
const COVER_ART: Record<string, string> = {
  archetype: `<svg viewBox="0 0 375 132" preserveAspectRatio="none">
    <circle cx="308" cy="30" r="52" fill="rgba(246,223,162,.08)"/>
    <circle cx="308" cy="30" r="30" fill="rgba(246,223,162,.10)"/>
    <path d="M250 96 L278 62 L296 84 L330 44 L358 72" stroke="rgba(246,223,162,.4)" stroke-width="1" fill="none"/>
    <circle cx="250" cy="96" r="2.4" fill="#f6dfa2"/><circle cx="278" cy="62" r="2" fill="#f6dfa2"/><circle cx="296" cy="84" r="2.6" fill="#f6dfa2"/><circle cx="330" cy="44" r="2" fill="#f6dfa2"/><circle cx="358" cy="72" r="2.2" fill="#f6dfa2"/>
    <text x="188" y="76" text-anchor="middle" style="font-family:var(--font-serif);font-size:56px;fill:#f6dfa2;opacity:.92">☰</text>
    <text x="60" y="52" style="font-family:var(--font-serif);font-size:13px;fill:rgba(246,223,162,.55)">乾 · 天行健</text>
  </svg>`,
  emotion: `<svg viewBox="0 0 375 132" preserveAspectRatio="none">
    <path d="M0 92 Q 47 62 94 92 T 188 92 T 282 92 T 375 92" stroke="rgba(111,215,192,.55)" stroke-width="1.4" fill="none"/>
    <path d="M0 108 Q 47 82 94 108 T 188 108 T 282 108 T 375 108" stroke="rgba(111,215,192,.3)" stroke-width="1.2" fill="none"/>
    <circle cx="300" cy="52" r="24" fill="rgba(111,215,192,.14)"/>
    <circle cx="300" cy="52" r="10" fill="rgba(246,223,162,.8)"/>
    <text x="60" y="56" style="font-family:var(--font-serif);font-size:13px;fill:rgba(111,215,192,.65)">平静 · 喜悦 · 焦虑 · 倦怠</text>
  </svg>`,
  quick_daily: `<svg viewBox="0 0 375 132" preserveAspectRatio="none">
    <circle cx="188" cy="150" r="86" fill="rgba(255,157,128,.20)"/>
    <circle cx="292" cy="36" r="2.4" fill="#ffe9c9"/><circle cx="318" cy="66" r="1.8" fill="#ffe9c9"/><circle cx="66" cy="40" r="2" fill="#ffe9c9"/>
    <path d="M188 96 l3.4 8.6 9 3.4 -9 3.4 -3.4 8.6 -3.4 -8.6 -9 -3.4 9 -3.4 Z" fill="#ffe9c9" opacity=".9"/>
    <text x="66" y="52" style="font-family:var(--font-serif);font-size:13px;fill:rgba(255,233,201,.7)">今日能量档 · 高能量</text>
  </svg>`
}
const COVER_NOTE: Record<string, { text: string; color: string }> = {
  archetype: { text: '八象取型 · 三十题立判', color: 'rgba(246,223,162,.7)' },
  emotion: { text: '四维扫描此刻能量场', color: 'rgba(111,215,192,.75)' },
  quick_daily: { text: '一分钟，抽一支签', color: 'rgba(255,233,201,.8)' }
}

function typeOf(card: PlazaCard) {
  return ASSESSMENT_TYPE_REGISTRY[card.typeKey]
}

function coverClass(card: PlazaCard) {
  return typeOf(card)?.coverClass || 'cover-archetype'
}

function coverArt(card: PlazaCard) {
  return COVER_ART[card.typeKey] || ''
}

function coverNote(card: PlazaCard) {
  return COVER_NOTE[card.typeKey]?.text || typeOf(card)?.defaultSubtitle || ''
}

function coverNoteColor(card: PlazaCard) {
  return COVER_NOTE[card.typeKey]?.color || 'rgba(246,223,162,.7)'
}

function coverSubtitle(card: PlazaCard) {
  return typeOf(card)?.defaultSubtitle || ''
}

/** tags 首位角标：HOT / NEW / 限免（PRD 5.2 tags 约定） */
function tagList(card: PlazaCard) {
  return String(card.tags || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

function badgeText(card: PlazaCard) {
  const first = tagList(card)[0]
  return ['HOT', 'NEW', '限免'].includes(first) ? first : ''
}

function badgeClass(card: PlazaCard) {
  const first = badgeText(card)
  if (first === 'NEW') return 'new'
  if (first === '限免') return 'free'
  return ''
}

/** 角标之外的普通标签 chips */
function plainTags(card: PlazaCard) {
  const list = tagList(card)
  return badgeText(card) ? list.slice(1) : list
}

// ---- 数据加载 ----
async function loadCards() {
  loading.value = true
  try {
    const res = await plazaList({ typeKey: activeTab.value === 'all' ? undefined : activeTab.value })
    cards.value = res.list || []
    cardsTotal.value = res.total ?? cards.value.length
  } catch (_e) {
    cards.value = []
    cardsTotal.value = 0
  } finally {
    loading.value = false
  }
}

function switchTab(key: 'all' | 'archetype' | 'emotion' | 'quick_daily') {
  if (activeTab.value === key) return
  activeTab.value = key
  void loadCards()
}

/** 卡片点击：E02 plaza_click → 跳填写页（带上渠道参数） */
function enter(card: PlazaCard) {
  sendEvent('plaza_click', {
    surveyId: card.surveyId,
    target: 'plaza'
  })
  const query: Record<string, string> = {}
  const s = getSessionSource()
  const r = getSessionRefId()
  if (s) query.source = s
  if (r) query.refId = r
  router.push({ path: `/survey/fill/${card.shareCode}`, query })
}

// ---- 引导配置（关于公众号卡） ----
async function loadGuide() {
  guide.value = await getGuideConfig().catch(() => null)
}

onMounted(() => {
  // E01 渠道曝光：落地即捕获 source/refId（会话内三元组去重）
  captureChannelQuery(route.query as { source?: string; refId?: string })
  if (getSessionSource()) {
    trackChannelVisit({ source: getSessionSource(), refId: getSessionRefId(), target: 'plaza' })
  }
  void loadCards()
  void loadGuide()
})
</script>

<style lang="less" scoped>
/* 封面装饰画布：占满 card-cover 且不拦截点击 */
.cover-art {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.cover-art svg {
  width: 100%;
  height: 100%;
}
/* 关于公众号卡：二维码缩至 84px（原型 !w-[84px] 等价覆写） */
.plaza-qr {
  width: 84px;
  height: 84px;
}
.plaza-qr img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
</style>
