<template>
  <!-- 底部浮条：游客可见（PRD 4.3.5；已登录/注册完成后自动隐藏） -->
  <div
    v-if="showFloat && !isLoggedIn && !done"
    class="float-bar reg-float"
  >
    <p class="txt">
      <span class="gold-slash">✦</span>
      {{ floatText || defaultFloatText }}
    </p>
    <button
      class="btn-gold reg-bar-btn"
      aria-label="快捷注册"
      @click="open()"
    >
      立即注册
    </button>
  </div>

  <!-- 弹层遮罩 -->
  <div
    class="sheet-mask"
    :class="{ open }"
    @click="close()"
  ></div>

  <!-- 注册 Sheet -->
  <div
    class="sheet reg-sheet"
    :class="{ open }"
    role="dialog"
    aria-modal="true"
    aria-label="快捷注册"
  >
    <div class="sheet-grabber"></div>

    <!-- 表单态 -->
    <div v-if="!done" class="reg-form">
      <p class="reg-title serif">{{ ctx.title }}</p>
      <p class="reg-hint">{{ ctx.hint }}</p>

      <div class="field">
        <span class="prefix">+86</span>
        <input
          v-model="phone"
          type="tel"
          maxlength="11"
          inputmode="numeric"
          placeholder="请输入手机号"
        />
      </div>

      <div class="field">
        <span class="prefix">✉</span>
        <input
          v-model="captcha"
          type="tel"
          maxlength="6"
          inputmode="numeric"
          placeholder="短信验证码"
          @keyup.enter="submit()"
        />
        <button
          class="count-btn"
          :disabled="countdown > 0 || sending"
          @click="sendCaptcha()"
        >
          {{ countBtnText }}
        </button>
      </div>

      <div class="field">
        <span class="prefix">✎</span>
        <input
          v-model="nickname"
          maxlength="12"
          placeholder="昵称（选填，报告可与积分账户同名）"
        />
      </div>

      <p v-if="errorText" class="reg-error" role="alert">{{ errorText }}</p>

      <button
        class="btn-gold reg-submit"
        :disabled="submitting"
        @click="submit()"
      >
        {{ submitting ? '正在注册…' : ctx.submitText }}
      </button>

      <p class="reg-note">
        未注册手机号将自动创建账号 · 注册即视为同意
        <span class="policy-link">《用户协议》《隐私政策》</span>
        · 新注册用户均需人工复核后才能使用网站完整功能
      </p>
    </div>

    <!-- 成功态 -->
    <div v-else class="reg-done">
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
      <p class="done-main">{{ doneMainText }}</p>
      <p v-if="claimCount > 0" class="done-sub">
        已为你迁移 {{ claimCount }} 份历史测评答卷 · 补发
        {{ claimPoints }} 积分
      </p>
      <p class="done-sub">
        共发放 +{{ grantedPoints }} 积分 · 已自动登录，进入「我的 - 积分」可查
      </p>
      <button class="btn-gold reg-submit" @click="close()">
        {{ successText || '好的' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 游客快捷注册（PRD 4.3.5 / 原型 float-bar + sheet）
 * - 浮条 + 底部弹层二合一，position 决定 E04/E05 埋点位与文案风格
 * - 打开即报 E04 register_show；注册成功报 E05 register_success（带 isNewUser）
 * - quickRegisterAssessment：注册即登录 + REGISTER_WELCOME 20 分 + 游客答卷池逐份迁移补发
 * - 成功后登录态接管（changeUserInfo + updateToken），页面通过 @registered 感知刷新
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import loginApi from '@/assets/js/api/loginController/loginApi'
import {
  quickRegisterAssessment,
  ASSESSMENT_USE_MOCK
} from '@/api/assessment'
import {
  sendEvent,
  getSessionSource,
  getSessionRefId,
  getPendingResponseIds,
  clearPendingResponseIds
} from '@/utils/assessment-events'
import { userInfoStore } from '@/stores/user-info'
import { permissionStore } from '@/stores/permission'
import { isSkipLoginMode } from '@/config/skip-login'
import { showPointsToastQueue } from './points-toast'

const props = withDefaults(
  defineProps<{
    /** E04/E05 埋点位与弹层文案风格：result=报告页 complete=完成页 plaza=广场页 */
    trigger: 'result' | 'complete' | 'plaza'
    /** 是否显示底部浮条（默认：result/complete 显示，plaza 由页面按钮径直调 open()） */
    showFloat?: boolean
    /** 浮条文案（缺省按 trigger 取默认语） */
    floatText?: string
    /** 提交按钮文案（缺省按 trigger 取默认语） */
    submitText?: string
    /** 注册成功按钮文案 */
    successText?: string
    /** 挂载后自动打开（演示/特写页用） */
    autoOpen?: boolean
  }>(),
  {
    showFloat: undefined,
    floatText: '',
    submitText: '',
    successText: '',
    autoOpen: false
  }
)

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'close'): void
  (e: 'registered', payload: { grantedPoints: number; claimCount: number }): void
}>()

const userInfo = userInfoStore()

// 浮条显隐：plaza 默认关（页面自行放按钮），其余默认开
const showFloat = computed(() =>
  props.showFloat === undefined ? props.trigger !== 'plaza' : props.showFloat
)

const isLoggedIn = computed(
  () => isSkipLoginMode() || (userInfo.getUserId || 0) > 0
)

const defaultFloatText = computed(() => {
  if (props.trigger === 'complete') return '注册保存报告 · 新用户再领 20 积分'
  if (props.trigger === 'plaza') return '注册领取新人积分'
  return '注册保存这份报告 · 新用户 +20 积分'
})

const ctx = computed(() => {
  if (props.trigger === 'plaza') {
    return {
      title: '登录问星',
      hint: '注册即登录 · 历史答卷与积分自动归属你的账号',
      submitText: props.submitText || '注册 / 登录'
    }
  }
  return {
    title: '注册保存报告',
    hint: '30 秒完成注册，答卷与积分自动归入你的账户',
    submitText: props.submitText || '领 +20 积分 · 注册保存报告'
  }
})

const open = ref(false)
const phone = ref('')
const captcha = ref('')
const nickname = ref('')
const sending = ref(false)
const submitting = ref(false)
const countdown = ref(0)
const errorText = ref('')
const done = ref(false)
const grantedPoints = ref(0)
const claimCount = ref(0)
const claimPoints = ref(0)
const isNew = ref(true)
let countTimer: number | undefined

const countBtnText = computed(() => {
  if (countdown.value > 0) return `${countdown.value}s 后重发`
  return sending.value ? '发送中…' : '获取验证码'
})

const doneMainText = computed(() =>
  isNew.value ? '注册成功 · 新人 +20 积分已到账' : '欢迎回来 · 已为你登录账号'
)

function openSheet() {
  open.value = true
  errorText.value = ''
  emit('open')
  // E04 register_show
  sendEvent('register_show', { position: props.trigger })
}

function close() {
  open.value = false
  emit('close')
}

defineExpose({ open: openSheet, close })

async function sendCaptcha() {
  if (!/^1\d{10}$/.test(phone.value)) {
    errorText.value = '请输入正确的 11 位手机号'
    return
  }
  errorText.value = ''
  sending.value = true
  try {
    if (ASSESSMENT_USE_MOCK) {
      // 演示模式：本地静默「发送」，验证码任意 4-6 位数字均可
      await new Promise(r => window.setTimeout(r, 300))
    } else {
      const res = await loginApi.getCaptcha({
        type: 'login',
        account: phone.value
      })
      if (!res || !res.status) {
        errorText.value = res?.msg || '验证码发送失败，请稍后重试'
        return
      }
    }
    // PRD 4.3.5：60s 内不可重发
    countdown.value = 60
    countTimer = window.setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0) {
        window.clearInterval(countTimer)
        countdown.value = 0
      }
    }, 1000)
  } finally {
    sending.value = false
  }
}

async function submit() {
  if (submitting.value) return
  if (!/^1\d{10}$/.test(phone.value)) {
    errorText.value = '请输入正确的 11 位手机号'
    return
  }
  if (!/^\d{4,6}$/.test(captcha.value)) {
    errorText.value = '请输入短信验证码'
    return
  }
  errorText.value = ''
  submitting.value = true
  try {
    const pendingIds = getPendingResponseIds()
    const res = await quickRegisterAssessment({
      phone: phone.value,
      captcha: captcha.value,
      nickname: nickname.value || undefined,
      pointsScenario: 'REGISTER_WELCOME',
      source: getSessionSource(),
      refId: getSessionRefId(),
      responseId: pendingIds[0],
      responseIds: pendingIds
    })
    if (!res || !res.token) {
      errorText.value = (res as any)?.msg || '注册失败，请稍后重试'
      return
    }

    // 登录态接管（对齐 login afterLogin 范式，仅写会话不跳路由）
    isNew.value = res.isNewUser !== false
    const u = res.user || { id: 0, name: nickname.value || '问星用户', phone: phone.value }
    try {
      userInfo.changeUserInfo({
        name: u.name,
        userId: u.id,
        phone: (u as any).phone || phone.value
      })
      userInfo.updateToken(res.token)
    } catch (_e) {
      // 登录态写入失败不影响注册主流程（积分已在服务端记账）
    }
    try {
      permissionStore().loadPermission()
    } catch (_e) {
      // 游客注册不阻塞页面，权限闲时再拉
    }

    clearPendingResponseIds()
    grantedPoints.value = res.grantedPoints ?? 0
    const detail = res.pointsDetail ?? []
    claimCount.value = Math.max(0, detail.length - (isNew.value ? 1 : 0))
    claimPoints.value = detail
      .slice(isNew.value ? 1 : 0)
      .reduce((a, b) => a + b, 0)

    // E05 register_success
    sendEvent('register_success', {
      position: props.trigger,
      isNewUser: isNew.value
    })

    // 飘分序列：+20 → （若有）补发
    const toasts: Array<{ text: string; delay?: number }> = []
    if (isNew.value) toasts.push({ text: '+20 积分已到账' })
    if (claimPoints.value > 0) {
      toasts.push({
        text: `历史答卷 ×${claimCount.value} · +${claimPoints.value} 积分已补发`,
        delay: 1500
      })
    }
    if (toasts.length) showPointsToastQueue(toasts)

    done.value = true
    emit('registered', {
      grantedPoints: grantedPoints.value,
      claimCount: claimCount.value
    })
  } catch (e: any) {
    errorText.value = e?.message || '注册失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (props.autoOpen) {
    window.setTimeout(() => openSheet(), 220)
  }
})

onBeforeUnmount(() => {
  if (countTimer) window.clearInterval(countTimer)
})
</script>

<style scoped>
.reg-bar-btn {
  width: 96px;
  height: 36px;
  font-size: 12.5px;
  flex: none;
}
.reg-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 4px;
}
.reg-hint {
  font-size: 11.5px;
  color: var(--faint);
  margin-bottom: 18px;
}
.reg-form .field {
  margin-bottom: 10px;
}
.reg-error {
  font-size: 11.5px;
  color: var(--coral);
  margin: 2px 0 8px;
}
.reg-submit {
  margin-top: 6px;
}
.reg-note {
  margin-top: 12px;
  font-size: 10.5px;
  line-height: 1.7;
  text-align: left;
  color: var(--mist);
}
.policy-link {
  color: var(--gold-1);
}
.reg-done {
  padding: 14px 4px 6px;
  text-align: center;
}
.done-main {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  margin: 10px 0 4px;
}
.done-sub {
  font-size: 11.5px;
  line-height: 1.7;
  color: var(--mist);
}
</style>
