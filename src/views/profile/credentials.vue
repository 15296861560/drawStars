<template>
  <div class="credentials pc-page">
    <!-- list view -->
    <div v-if="view === 'list'" class="settings-list">
      <h2 class="settings-title">{{ $t('account.title') }}</h2>

      <div class="setting-row">
        <span class="setting-label letter-space">{{
          $t('password.label')
        }}</span>
        <div class="setting-right">
          <span class="setting-value">{{ $t('password.hint') }}</span>
          <button
            type="button"
            class="setting-action"
            @click="openView('password')"
          >
            {{ $t('btn.setPassword') }}
          </button>
        </div>
      </div>

      <div class="setting-row">
        <span class="setting-label letter-space">{{ $t('phone.label') }}</span>
        <div class="setting-right">
          <span class="setting-value">{{ maskedPhone }}</span>
          <button
            type="button"
            class="setting-action"
            @click="openView('phone')"
          >
            {{ phone ? $t('btn.modifyPhone') : $t('btn.bindPhone') }}
          </button>
        </div>
      </div>

      <div class="setting-row">
        <span class="setting-label letter-space">{{ $t('email.label') }}</span>
        <div class="setting-right">
          <span class="setting-value">{{ maskedEmail }}</span>
          <button
            type="button"
            class="setting-action"
            @click="openView('email')"
          >
            {{ email ? $t('btn.modifyEmail') : $t('btn.bindEmail') }}
          </button>
        </div>
      </div>

      <div class="setting-row">
        <span class="setting-label">{{ $t('prefs.smsLogin') }}</span>
        <div class="setting-right">
          <el-switch v-model="smsLoginEnabled" @change="savePrefs" />
        </div>
      </div>

      <div class="setting-row setting-row--last">
        <span class="setting-label">{{ $t('prefs.oauthLogin') }}</span>
        <div class="setting-right">
          <el-switch v-model="oauthLoginEnabled" @change="savePrefs" />
        </div>
      </div>
    </div>

    <!-- phone edit flow -->
    <div v-else-if="view === 'phone'" class="verify-flow">
      <div class="verify-crumb">
        <button type="button" class="crumb-link" @click="backToList">
          {{ $t('account.title') }}
        </button>
        <span class="crumb-sep"> / </span>
        <span>{{ phone ? $t('phone.settings') : $t('phone.bindTitle') }}</span>
      </div>

      <div class="verify-main">
        <template v-if="phoneStep === 1 && phone">
          <p class="verify-lead">
            {{ $t('phone.sendTip') }}
            <span class="verify-strong">{{ maskedPhone }}</span>
          </p>
          <p class="verify-sub">{{ $t('phone.sendHelp') }}</p>

          <div class="verify-field">
            <span class="verify-field-label">{{
              $t('phone.fillCaptcha')
            }}</span>
            <el-input
              v-model="oldPhoneCaptcha"
              class="verify-input"
              :placeholder="$t('phone.captchaPh')"
            >
              <template #append>
                <button
                  type="button"
                  class="btn-captcha"
                  :disabled="oldPhoneCd > 0"
                  @click="sendCaptcha(phone, 'changePhone', 'oldPhone')"
                >
                  {{
                    oldPhoneCd > 0 ? oldPhoneCd + 's' : $t('btn.getSmsCaptcha')
                  }}
                </button>
              </template>
            </el-input>
          </div>

          <el-button
            class="verify-next"
            type="primary"
            :disabled="!oldPhoneCaptcha"
            @click="phoneStep = 2"
          >
            {{ $t('btn.next') }}
          </el-button>
        </template>

        <template v-else>
          <p class="verify-lead">{{ $t('phone.bindLead') }}</p>
          <p class="verify-sub">{{ $t('phone.bindHelp') }}</p>

          <div class="verify-field">
            <span class="verify-field-label">{{
              $t('phone.newPhoneLabel')
            }}</span>
            <el-input
              v-model="newPhone"
              class="verify-input"
              clearable
              :placeholder="$t('phone.newPhonePh')"
            />
          </div>
          <div class="verify-field">
            <span class="verify-field-label">{{
              $t('phone.fillCaptcha')
            }}</span>
            <el-input
              v-model="newPhoneCaptcha"
              class="verify-input"
              :placeholder="$t('phone.captchaPh')"
            >
              <template #append>
                <button
                  type="button"
                  class="btn-captcha"
                  :disabled="!newPhone || newPhoneCd > 0"
                  @click="sendCaptcha(newPhone, 'bindPhone', 'newPhone')"
                >
                  {{
                    newPhoneCd > 0 ? newPhoneCd + 's' : $t('btn.getSmsCaptcha')
                  }}
                </button>
              </template>
            </el-input>
          </div>

          <el-button
            class="verify-next"
            type="primary"
            :disabled="!newPhone || !newPhoneCaptcha"
            @click="submitPhone"
          >
            {{ $t('btn.confirm') }}
          </el-button>
        </template>

        <button type="button" class="verify-footer-link" @click="backToList">
          {{ $t('btn.backList') }}
        </button>
      </div>
    </div>

    <!-- email edit flow -->
    <div v-else-if="view === 'email'" class="verify-flow">
      <div class="verify-crumb">
        <button type="button" class="crumb-link" @click="backToList">
          {{ $t('account.title') }}
        </button>
        <span class="crumb-sep"> / </span>
        <span>{{ email ? $t('email.settings') : $t('email.bindTitle') }}</span>
      </div>

      <div class="verify-main">
        <template v-if="emailStep === 1 && email">
          <p class="verify-lead">
            {{ $t('email.sendTip') }}
            <span class="verify-strong">{{ maskedEmail }}</span>
          </p>
          <p class="verify-sub">{{ $t('email.sendHelp') }}</p>

          <div class="verify-field">
            <span class="verify-field-label">{{
              $t('email.fillCaptcha')
            }}</span>
            <el-input
              v-model="oldEmailCaptcha"
              class="verify-input"
              :placeholder="$t('email.captchaPh')"
            >
              <template #append>
                <button
                  type="button"
                  class="btn-captcha"
                  :disabled="oldEmailCd > 0"
                  @click="sendCaptcha(email, 'changeEmail', 'oldEmail')"
                >
                  {{
                    oldEmailCd > 0
                      ? oldEmailCd + 's'
                      : $t('btn.getEmailCaptcha')
                  }}
                </button>
              </template>
            </el-input>
          </div>

          <el-button
            class="verify-next"
            type="primary"
            :disabled="!oldEmailCaptcha"
            @click="emailStep = 2"
          >
            {{ $t('btn.next') }}
          </el-button>
        </template>

        <template v-else>
          <p class="verify-lead">{{ $t('email.bindLead') }}</p>
          <p class="verify-sub">{{ $t('email.bindHelp') }}</p>

          <div class="verify-field">
            <span class="verify-field-label">{{
              $t('email.newEmailLabel')
            }}</span>
            <el-input
              v-model="newEmail"
              class="verify-input"
              clearable
              :placeholder="$t('email.newEmailPh')"
            />
          </div>
          <div class="verify-field">
            <span class="verify-field-label">{{
              $t('email.fillCaptcha')
            }}</span>
            <el-input
              v-model="newEmailCaptcha"
              class="verify-input"
              :placeholder="$t('email.captchaPh')"
            >
              <template #append>
                <button
                  type="button"
                  class="btn-captcha"
                  :disabled="!newEmail || newEmailCd > 0"
                  @click="sendCaptcha(newEmail, 'bindEmail', 'newEmail')"
                >
                  {{
                    newEmailCd > 0
                      ? newEmailCd + 's'
                      : $t('btn.getEmailCaptcha')
                  }}
                </button>
              </template>
            </el-input>
          </div>

          <el-button
            class="verify-next"
            type="primary"
            :disabled="!newEmail || !newEmailCaptcha"
            @click="submitEmail"
          >
            {{ $t('btn.confirm') }}
          </el-button>
        </template>

        <button type="button" class="verify-footer-link" @click="backToList">
          {{ $t('btn.backList') }}
        </button>
      </div>
    </div>

    <!-- password edit flow -->
    <div v-else-if="view === 'password'" class="verify-flow">
      <div class="verify-crumb">
        <button type="button" class="crumb-link" @click="backToList">
          {{ $t('account.title') }}
        </button>
        <span class="crumb-sep"> / </span>
        <span>{{ $t('password.settings') }}</span>
      </div>

      <div class="verify-main">
        <p class="verify-lead">{{ $t('password.lead') }}</p>
        <p class="verify-sub">{{ $t('password.help') }}</p>

        <div class="verify-field">
          <span class="verify-field-label">{{ $t('password.old') }}</span>
          <el-input
            v-model="oldPassword"
            type="password"
            show-password
            class="verify-input"
            :placeholder="$t('password.oldPh')"
          />
        </div>
        <div class="verify-field">
          <span class="verify-field-label">{{ $t('password.new') }}</span>
          <el-input
            v-model="newPassword"
            type="password"
            show-password
            class="verify-input"
            :placeholder="$t('password.newPh')"
          />
        </div>
        <div class="verify-field">
          <span class="verify-field-label">{{ $t('password.confirm') }}</span>
          <el-input
            v-model="confirmPassword"
            type="password"
            show-password
            class="verify-input"
            :placeholder="$t('password.confirmPh')"
          />
        </div>

        <el-button
          class="verify-next"
          type="primary"
          :disabled="!oldPassword || !newPassword || !confirmPassword"
          @click="submitPassword"
        >
          {{ $t('btn.confirm') }}
        </el-button>

        <button
          type="button"
          class="verify-footer-link"
          @click="$router.push('/forgetPassword')"
        >
          {{ $t('btn.forgetPassword') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { i18nLabelMixin } from '@/views/mixin/i18nLabelMixin'
import { findReq } from '@/assets/js/api'
import { userInfoStore } from '@/stores/user-info'

const userInfo = userInfoStore()
const queryUserInfo = findReq('profileController', 'queryUserInfo')
const getCaptcha = findReq('profileController', 'getCaptcha')
const changePhone = findReq('profileController', 'changePhone')
const changeEmail = findReq('profileController', 'changeEmail')
const changePassword = findReq('profileController', 'changePassword')
const updateLoginPrefs = findReq('profileController', 'updateLoginPrefs')

function maskPhone(phone) {
  if (!phone) return ''
  const s = String(phone)
  if (s.length < 7) return s
  return s.slice(0, 3) + '****' + s.slice(-4)
}

function maskEmail(email) {
  if (!email) return ''
  const s = String(email)
  const at = s.indexOf('@')
  if (at <= 0) return s
  const name = s.slice(0, at)
  const domain = s.slice(at)
  if (name.length <= 2) return name[0] + '***' + domain
  return name.slice(0, 2) + '***' + domain
}

export default {
  mixins: [i18nLabelMixin],
  data() {
    return {
      view: 'list',
      phone: '',
      email: '',
      phoneStep: 1,
      emailStep: 1,
      oldPhoneCaptcha: '',
      newPhone: '',
      newPhoneCaptcha: '',
      oldEmailCaptcha: '',
      newEmail: '',
      newEmailCaptcha: '',
      oldPhoneCd: 0,
      newPhoneCd: 0,
      oldEmailCd: 0,
      newEmailCd: 0,
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      smsLoginEnabled: true,
      oauthLoginEnabled: true,
      timers: {}
    }
  },
  computed: {
    maskedPhone() {
      return this.phone ? maskPhone(this.phone) : this.$t('common.unbound')
    },
    maskedEmail() {
      return this.email ? maskEmail(this.email) : this.$t('common.unbound')
    }
  },
  created() {
    this.load()
  },
  beforeUnmount() {
    Object.values(this.timers).forEach(clearInterval)
  },
  methods: {
    async load() {
      const res = await queryUserInfo(userInfo.getUserId)
      const data = (res && res.data) || res
      if (!data || !data.id) return
      this.phone = data.phone || ''
      this.email = data.email || ''
      this.smsLoginEnabled = data.smsLoginEnabled !== false
      this.oauthLoginEnabled = data.oauthLoginEnabled !== false
      userInfo.changeUserInfo({
        phone: this.phone,
        email: this.email,
        name: data.name,
        userId: data.id,
        avatar: data.avatar,
        accountAlias: data.accountAlias,
        level: data.level
      })
    },
    openView(name) {
      this.view = name
      if (name === 'phone') {
        this.phoneStep = this.phone ? 1 : 2
        this.oldPhoneCaptcha = ''
        this.newPhone = ''
        this.newPhoneCaptcha = ''
      }
      if (name === 'email') {
        this.emailStep = this.email ? 1 : 2
        this.oldEmailCaptcha = ''
        this.newEmail = ''
        this.newEmailCaptcha = ''
      }
      if (name === 'password') {
        this.oldPassword = ''
        this.newPassword = ''
        this.confirmPassword = ''
      }
    },
    backToList() {
      this.view = 'list'
    },
    startCd(key) {
      this[key] = 60
      clearInterval(this.timers[key])
      this.timers[key] = setInterval(() => {
        this[key] -= 1
        if (this[key] <= 0) clearInterval(this.timers[key])
      }, 1000)
    },
    async sendCaptcha(account, type, cdKey) {
      const res = await getCaptcha({ account, type })
      if (res.status) {
        this.startCd(cdKey + 'Cd')
        if (res.data && res.data.captcha) {
          this.$message.success(this.$t('tip.captchaDev') + res.data.captcha)
        } else {
          this.$message.success(this.$t('tip.captchaSent'))
        }
      } else {
        this.$message.error(res.msg || this.$t('tip.fail'))
      }
    },
    async submitPhone() {
      const res = await changePhone({
        id: userInfo.getUserId,
        phone: this.newPhone,
        oldCaptcha: this.oldPhoneCaptcha,
        newCaptcha: this.newPhoneCaptcha
      })
      if (res.status) {
        this.$message.success(this.$t('tip.ok'))
        this.backToList()
        await this.load()
      } else {
        this.$message.error(res.msg || this.$t('tip.fail'))
      }
    },
    async submitEmail() {
      const res = await changeEmail({
        id: userInfo.getUserId,
        email: this.newEmail,
        oldCaptcha: this.oldEmailCaptcha,
        newCaptcha: this.newEmailCaptcha
      })
      if (res.status) {
        this.$message.success(this.$t('tip.ok'))
        this.backToList()
        await this.load()
      } else {
        this.$message.error(res.msg || this.$t('tip.fail'))
      }
    },
    async submitPassword() {
      if (this.newPassword !== this.confirmPassword) {
        this.$message.error(this.$t('tip.pwdMismatch'))
        return
      }
      const res = await changePassword({
        id: userInfo.getUserId,
        password: this.oldPassword,
        newPassword: this.newPassword
      })
      if (res.status) {
        this.$message.success(this.$t('tip.ok'))
        this.backToList()
      } else {
        this.$message.error(res.msg || this.$t('tip.fail'))
      }
    },
    async savePrefs() {
      const res = await updateLoginPrefs({
        id: userInfo.getUserId,
        smsLoginEnabled: this.smsLoginEnabled,
        oauthLoginEnabled: this.oauthLoginEnabled
      })
      if (res.status) this.$message.success(this.$t('tip.ok'))
      else this.$message.error(res.msg || this.$t('tip.fail'))
    }
  }
}
</script>

<style lang="less" scoped>
.settings-title {
  margin: 0 0 0.5rem;
  padding: 0.25rem 0 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: @color-text-normal;
  line-height: 1.4;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  min-height: 3.5rem;
  padding: 1rem 0;
  border-bottom: 1px solid @color-bg-divider;

  &--last {
    border-bottom: none;
  }
}

.setting-label {
  flex: 0 0 6rem;
  color: @color-text-normal;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: nowrap;
}

.letter-space {
  letter-spacing: 0.5em;
  margin-right: -0.5em;
}

.setting-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.25rem;
  min-width: 0;
}

.setting-value {
  color: @color-text-secondary;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.setting-action {
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: @color-primary;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: @color-text-hover;
  }
}

.verify-flow {
  min-height: 28rem;
}

.verify-crumb {
  color: @color-text-placeholder;
  font-size: 0.8125rem;
  line-height: 1.5;
  margin-bottom: 3rem;
  white-space: nowrap;
}

.crumb-link {
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: @color-text-placeholder;
  cursor: pointer;
  font-size: inherit;

  &:hover {
    color: @color-primary;
  }
}

.crumb-sep {
  margin: 0 0.15rem;
}

.verify-main {
  width: 26rem;
  margin: 0 auto;
  text-align: center;
}

.verify-lead {
  margin: 0;
  color: @color-text-normal;
  font-size: 0.9375rem;
  line-height: 1.6;
  white-space: nowrap;
}

.verify-strong {
  font-weight: 600;
  margin-left: 0.25rem;
}

.verify-sub {
  margin: 0.5rem 0 2rem;
  color: @color-text-placeholder;
  font-size: 0.8125rem;
  line-height: 1.5;
}

.verify-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  text-align: left;
}

.verify-field-label {
  flex-shrink: 0;
  width: 5.5rem;
  text-align: right;
  color: @color-text-secondary;
  font-size: 0.875rem;
  white-space: nowrap;
}

.verify-input {
  flex: 1;
  width: 100%;

  :deep(.el-input-group__append) {
    padding: 0;
    background: @color-bg;
  }
}

.btn-captcha {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 7.5rem;
  height: 100%;
  margin: 0;
  padding: 0 0.75rem;
  border: none;
  background: transparent;
  color: @color-primary;
  font-size: 0.8125rem;
  white-space: nowrap;
  cursor: pointer;

  &:hover:not(:disabled) {
    color: @color-text-hover;
  }

  &:disabled {
    color: @color-text-disabled;
    cursor: not-allowed;
  }
}

.verify-next {
  width: 100%;
  max-width: 20.5rem;
  margin-top: 0.5rem;
  height: 2.5rem;
}

.verify-footer-link {
  display: block;
  margin: 1.75rem auto 0;
  padding: 0;
  border: none;
  background: transparent;
  color: @color-primary;
  font-size: 0.875rem;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: @color-text-hover;
  }
}
</style>

<i18n>
{
  "en": {
    "account": { "title": "Account Settings" },
    "common": { "unbound": "Not bound" },
    "phone": {
      "label": "Phone",
      "settings": "Phone Settings",
      "bindTitle": "Bind Phone",
      "sendTip": "Code will be sent to",
      "sendHelp": "If you do not receive the code, check SMS blocking.",
      "fillCaptcha": "Captcha:",
      "captchaPh": "Enter captcha",
      "bindLead": "Bind a new phone number",
      "bindHelp": "Enter the new phone and captcha to continue.",
      "newPhoneLabel": "Phone:",
      "newPhonePh": "Enter new phone"
    },
    "email": {
      "label": "Email",
      "settings": "Email Settings",
      "bindTitle": "Bind Email",
      "sendTip": "Code will be sent to",
      "sendHelp": "If you do not receive the code, check spam folder.",
      "fillCaptcha": "Captcha:",
      "captchaPh": "Enter captcha",
      "bindLead": "Bind a new email",
      "bindHelp": "Enter the new email and captcha to continue.",
      "newEmailLabel": "Email:",
      "newEmailPh": "Enter new email"
    },
    "password": {
      "label": "Password",
      "hint": "Please set or change password regularly",
      "settings": "Password Settings",
      "lead": "Change login password",
      "help": "Use a strong password with letters and numbers.",
      "old": "Old:",
      "new": "New:",
      "confirm": "Confirm:",
      "oldPh": "Current password",
      "newPh": "New password",
      "confirmPh": "Confirm password"
    },
    "prefs": {
      "smsLogin": "SMS login",
      "oauthLogin": "OAuth login"
    },
    "btn": {
      "setPassword": "Set password",
      "modifyPhone": "Change phone",
      "bindPhone": "Bind phone",
      "modifyEmail": "Change email",
      "bindEmail": "Bind email",
      "getSmsCaptcha": "Get SMS code",
      "getEmailCaptcha": "Get email code",
      "next": "Next",
      "confirm": "Confirm",
      "backList": "Back",
      "forgetPassword": "Forgot password?"
    },
    "tip": {
      "ok": "Success",
      "fail": "Failed",
      "captchaSent": "Code sent",
      "captchaDev": "Dev code: ",
      "pwdMismatch": "Passwords do not match"
    }
  },
  "zh": {
    "account": { "title": "账号设置" },
    "common": { "unbound": "未绑定" },
    "phone": {
      "label": "手机",
      "settings": "手机设置",
      "bindTitle": "绑定手机",
      "sendTip": "验证码将发送到手机",
      "sendHelp": "如果长时间未收到验证码，请检查是否将运营商拉黑",
      "fillCaptcha": "填写验证码：",
      "captchaPh": "请输入验证码",
      "bindLead": "绑定新的手机号码",
      "bindHelp": "请输入新手机号并完成验证码校验",
      "newPhoneLabel": "新手机号：",
      "newPhonePh": "请输入新手机号"
    },
    "email": {
      "label": "邮箱",
      "settings": "邮箱设置",
      "bindTitle": "绑定邮箱",
      "sendTip": "验证码将发送到邮箱",
      "sendHelp": "如果长时间未收到验证码，请检查垃圾邮件箱",
      "fillCaptcha": "填写验证码：",
      "captchaPh": "请输入验证码",
      "bindLead": "绑定新的邮箱",
      "bindHelp": "请输入新邮箱并完成验证码校验",
      "newEmailLabel": "新邮箱：",
      "newEmailPh": "请输入新邮箱"
    },
    "password": {
      "label": "密码",
      "hint": "存在风险，请定期修改密码",
      "settings": "密码设置",
      "lead": "修改登录密码",
      "help": "建议使用字母、数字组合的强密码",
      "old": "当前密码：",
      "new": "新密码：",
      "confirm": "确认密码：",
      "oldPh": "请输入当前密码",
      "newPh": "请输入新密码",
      "confirmPh": "请再次输入新密码"
    },
    "prefs": {
      "smsLogin": "短信登录",
      "oauthLogin": "快捷登录"
    },
    "btn": {
      "setPassword": "设置密码",
      "modifyPhone": "修改手机",
      "bindPhone": "绑定手机",
      "modifyEmail": "修改邮箱",
      "bindEmail": "绑定邮箱",
      "getSmsCaptcha": "获取短信验证码",
      "getEmailCaptcha": "获取邮箱验证码",
      "next": "下一步",
      "confirm": "确认",
      "backList": "返回账号设置",
      "forgetPassword": "忘记密码？"
    },
    "tip": {
      "ok": "操作成功",
      "fail": "操作失败",
      "captchaSent": "验证码已发送",
      "captchaDev": "开发验证码：",
      "pwdMismatch": "两次新密码不一致"
    }
  }
}
</i18n>
