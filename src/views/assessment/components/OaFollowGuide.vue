<template>
  <section
    v-if="cfg && cfg.guideEnabled"
    ref="rootEl"
    class="glass glass-gold oa-guide"
    aria-label="公众号关注引导"
    @click="onGuideClick"
  >
    <div class="g-head">
      <span class="chip chip-gold">公众号</span>
      <span class="serif g-title">{{ title }}</span>
    </div>
    <p class="g-desc">{{ desc }}</p>
    <div class="qr-block">
      <img
        v-if="cfg.qrCodeUrl"
        class="qr-img"
        :src="cfg.qrCodeUrl"
        alt="公众号二维码"
      />
      <FakeQr v-else :seed="qrSeed" />
      <p class="qr-tip">长按识别二维码 · 关注「{{ cfg.officialName }}」</p>
      <p v-if="cfg.accountType === 0" class="qr-sub">
        当前为个人未认证订阅号，如扫码无响应，长按保存二维码图片后识别即可
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 公众号关注引导位（PRD 4.4.1 / 原型 result·complete·poster 引导位）
 * - 拉取 assessment_oa_config（getGuideConfig 自带 5min 缓存 + 超时静默降级为文案默认值）
 * - guide_enabled 结束时整卡不渲染（不产生引导空窗）
 * - IntersectionObserver 可见即报 E06 guide_show，点击二维码区报 E07 guide_click
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { getGuideConfig } from '@/api/assessment'
import { sendEvent } from '@/utils/assessment-events'
import type { GuideConfig } from '@/types/assessment'
import FakeQr from './FakeQr.vue'

const props = withDefaults(
  defineProps<{
    /** 引导位所在页面：result=报告页 complete=完成页 poster=海报页（决定差异化文案与 E06 position 值） */
    position: 'result' | 'complete' | 'poster'
    /** 覆盖引导配置（页面已有配置时避免重复拉取） */
    config?: GuideConfig | null
    /** 结果名（PRD 4.4.1：result 引导标题含「{结果名}」槽位，如「想要「乾天型」的完整星图？」） */
    resultName?: string
  }>(),
  { config: null }
)

const cfg = ref<GuideConfig | null>(props.config ?? null)
const rootEl = ref<HTMLElement | null>(null)
const exposed = ref(false)
let observer: IntersectionObserver | null = null

// FakeQr seed：按公众号原始 ID 稳定散列，视觉不闪烁
const qrSeed = computed(() => {
  const id = cfg.value?.wechatId || 'asmt'
  let s = 7
  for (const ch of id) s = (s * 31 + ch.charCodeAt(0)) >>> 0
  return s
})

/** 「{结果名}」槽位替换（4.4.1 配置文案可含槽位；无结果名时降级为「你」） */
function slot(text: string) {
  return (text || '').replaceAll('{结果名}', props.resultName || '你')
}

const title = computed(() => {
  const c = cfg.value
  if (!c) return ''
  if (props.position === 'complete') return slot(c.completeTitle)
  if (props.position === 'poster') return slot(c.completeTitle)
  return slot(c.resultTitle)
})

const desc = computed(() => {
  const c = cfg.value
  if (!c) return ''
  if (props.position === 'complete') return slot(c.completeDesc)
  if (props.position === 'poster') return slot(c.posterShareText)
  return slot(c.resultDesc)
})

onMounted(async () => {
  if (!cfg.value) {
    cfg.value = await getGuideConfig()
  }
  if (!cfg.value?.guideEnabled) return
  // E06 guide_show：进入视口即曝光一次（含滑动曝光场景）
  observer = new IntersectionObserver(
    entries => {
      if (entries.some(e => e.isIntersecting) && !exposed.value) {
        exposed.value = true
        sendEvent('guide_show', { position: props.position })
        observer?.disconnect()
      }
    },
    { threshold: 0.45 }
  )
  if (rootEl.value) observer.observe(rootEl.value)
})

onBeforeUnmount(() => observer?.disconnect())

function onGuideClick() {
  // E07 guide_click：长按识别/点击引导卡均计入
  sendEvent('guide_click', { position: props.position })
}
</script>

<style scoped>
.oa-guide {
  padding: 22px 20px 18px;
  text-align: center;
  cursor: pointer;
}
.g-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 8px;
}
.g-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--gold-1);
  letter-spacing: 0.02em;
}
.g-desc {
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--mist);
  margin-bottom: 14px;
}
.qr-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.qr-block :deep(.fakeqr),
.qr-img {
  width: 132px;
  height: 132px;
  padding: 8px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f5f0e4, #efe6cf);
  color: #191636;
  box-shadow: 0 10px 26px rgba(4, 3, 18, 0.5);
}
.qr-tip {
  font-size: 11px;
  color: var(--ink);
  margin-top: 8px;
}
.qr-sub {
  font-size: 10.5px;
  line-height: 1.6;
  color: var(--faint);
}
</style>
