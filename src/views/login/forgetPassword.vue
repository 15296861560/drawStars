<template>
  <div class="forget-password">
    <div class="card">
      <h2>{{ $t('title') }}</h2>
      <el-form label-width="6rem">
        <el-form-item :label="$t('account')">
          <el-input v-model="account" :placeholder="$t('accountPh')" />
        </el-form-item>
        <el-form-item :label="$t('captcha')">
          <div class="row">
            <el-input v-model="captcha" />
            <el-button :disabled="cd > 0 || !account" @click="send">
              {{ cd > 0 ? cd + 's' : $t('send') }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item :label="$t('newPassword')">
          <el-input v-model="newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item :label="$t('confirm')">
          <el-input v-model="confirmPassword" type="password" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">{{
            $t('submit')
          }}</el-button>
          <el-button @click="$router.push('/login')">{{
            $t('back')
          }}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { i18nLabelMixin } from '@/views/mixin/i18nLabelMixin'
import { findReq } from '@/assets/js/api'

const getCaptcha = findReq('loginController', 'getCaptcha')
const resetPassword = findReq('loginController', 'resetPassword')

export default {
  mixins: [i18nLabelMixin],
  data() {
    return {
      account: '',
      captcha: '',
      newPassword: '',
      confirmPassword: '',
      cd: 0,
      timer: null
    }
  },
  beforeUnmount() {
    clearInterval(this.timer)
  },
  methods: {
    async send() {
      const res = await getCaptcha({ account: this.account, type: 'resetPwd' })
      if (res.status) {
        this.cd = 60
        clearInterval(this.timer)
        this.timer = setInterval(() => {
          this.cd -= 1
          if (this.cd <= 0) clearInterval(this.timer)
        }, 1000)
        if (res.data && res.data.captcha) {
          this.$message.success(this.$t('devCode') + res.data.captcha)
        } else {
          this.$message.success(this.$t('sent'))
        }
      } else {
        this.$message.error(res.msg || this.$t('fail'))
      }
    },
    async submit() {
      if (this.newPassword !== this.confirmPassword) {
        this.$message.error(this.$t('mismatch'))
        return
      }
      const res = await resetPassword({
        account: this.account,
        captcha: this.captcha,
        newPassword: this.newPassword
      })
      if (res.status) {
        this.$message.success(this.$t('ok'))
        this.$router.push('/login')
      } else {
        this.$message.error(res.msg || this.$t('fail'))
      }
    }
  }
}
</script>
<style lang="less" scoped>
.forget-password {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #f5f7fa, #e8eef5);
  .card {
    width: 26rem;
    padding: 2rem;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  }
  h2 {
    margin: 0 0 1.5rem;
    text-align: center;
  }
  .row {
    display: flex;
    gap: 8px;
    width: 100%;
  }
}
</style>
<i18n>
{
  "en": {
    "title": "Reset Password",
    "account": "Account",
    "accountPh": "Phone or email",
    "captcha": "Captcha",
    "newPassword": "New password",
    "confirm": "Confirm",
    "send": "Send code",
    "submit": "Reset",
    "back": "Back to login",
    "sent": "Code sent",
    "devCode": "Dev code: ",
    "ok": "Password reset",
    "fail": "Failed",
    "mismatch": "Passwords do not match"
  },
  "zh": {
    "title": "忘记密码",
    "account": "账号",
    "accountPh": "手机号或邮箱",
    "captcha": "验证码",
    "newPassword": "新密码",
    "confirm": "确认密码",
    "send": "发送验证码",
    "submit": "重置密码",
    "back": "返回登录",
    "sent": "验证码已发送",
    "devCode": "开发验证码：",
    "ok": "密码已重置",
    "fail": "操作失败",
    "mismatch": "两次密码不一致"
  }
}
</i18n>
