<template>
  <div>
    <div class="gradient-bg"></div>
    <Particles
      id="tsparticles"
      class="canvas-particles login__particles login-particles"
      :particlesInit="particlesInit"
      :options="particles"
    />
    <!-- 登录框 -->
    <el-form :rules="rules" :model="loginForm" v-show="!isRegister">
      <div class="form-container login-form">
        <img class="login-logo" :src="logoIcon" alt="Draw Stars" />
        <h2 class="welcome">{{ $t('welcome') }}</h2>
        <p class="welcome-sub">{{ $t('welcomeSub') }}</p>
        <el-form-item prop="account">
          <el-input
            v-model="loginForm.account"
            :placeholder="$t('placeholder.account')"
            maxlength="20"
          >
            <template #prepend
              ><el-icon><User /></el-icon
            ></template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="loginMode === 'password'" prop="password">
          <el-input
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="$t('placeholder.password')"
            maxlength="20"
          >
            <template #prepend
              ><el-icon><Lock /></el-icon
            ></template>
            <template #suffix>
              <div
                class="login-eye"
                :class="
                  showPassword
                    ? 'drawstars-icon-eye-show'
                    : 'drawstars-icon-eye-hidden'
                "
                @click="showPassword = !showPassword"
              ></div>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item v-if="loginMode === 'captcha'" prop="captcha">
          <el-input
            v-model="loginForm.captcha"
            type="text"
            :placeholder="$t('placeholder.captcha')"
            maxlength="4"
          >
            <template #suffix>
              <span class="btn-captcha" @click="sendCaptcha"
                ><span v-show="retryTime <= 0">{{ $t('btn.getCaptcha') }}</span>
                <span v-show="retryTime > 0" style="cursor: not-allowed">{{
                  $t('btn.sent', [this.retryTime])
                }}</span></span
              >
            </template>
          </el-input>
        </el-form-item>

        <router-link to="/forgetPassword" class="link link__forget-password">
          {{ $t('btn.forgetPassword') }}
        </router-link>

        <el-button type="primary" class="btn-submit mb20" @click="login">{{
          $t('btn.login')
        }}</el-button>

        <div class="switch-row">
          <div>
            <span>{{ $t('noAccount') }}</span>
            <span @click="toRegister" class="link">
              {{ $t('btn.registerNow') }}
            </span>
          </div>

          <div class="link" @click="toPhoneLogin">{{ $t('phoneLogin') }}</div>
        </div>

        <div class="other-login-area">
          <div class="other-login-tip">{{ $t('label.otherLoginMethods') }}</div>
          <div class="other-login-way">
            <a
              :title="$t('label.otherLoginMethods', ['Github'])"
              class="login-github drawstars-icon-gitHub"
              href="https://github.com/login/oauth/authorize?client_id=3d7825405e2dc8bd6f0a&redirect_uri=http://127.0.0.1:8011/loginApi/oauthLogin/github?scope=user&state=1"
            ></a>
          </div>
        </div>
      </div>
    </el-form>

    <!-- 注册账号 -->
    <form class="form-container register-form" v-show="isRegister">
      <img class="login-logo" :src="logoIcon" alt="Draw Stars" />
      <h2 class="welcome">{{ $t('welcome') }}</h2>
      <p class="welcome-sub">{{ $t('welcomeSub') }}</p>

      <div class="input-box mb20">
        <input
          class="input-box__inner"
          type="phone"
          required
          v-model="registerForm.account"
        />
        <span class="input-box__tip">{{ $t('placeholder.account') }}</span>
      </div>
      <div class="input-box mb20">
        <input
          class="input-box__inner"
          type="text"
          required
          v-model="registerForm.nickname"
        />
        <span class="input-box__tip">{{ $t('placeholder.nickname') }}</span>
      </div>
      <div class="input-box mb20">
        <input
          class="input-box__inner"
          type="password"
          required
          v-model="registerForm.password"
          autocomplete="off"
        />
        <span class="input-box__tip">{{ $t('placeholder.password') }}</span>
        <!-- 密码强度验证 -->
        <ul class="validate-list">
          <li v-for="(item, index) in validatePasswordArray" :key="index">
            <el-icon
              ><SuccessFilled class="icon-circle-check" v-show="!item.flag" />
              <CircleCloseFilled class="icon-error" v-show="item.flag"
            /></el-icon>
            <span>{{ item.tip }}</span>
          </li>
        </ul>
      </div>

      <div class="input-box mb20">
        <input
          class="input-box__inner"
          type="password"
          required
          v-model="registerForm.rePassword"
          autocomplete="off"
        />
        <span class="input-box__tip">{{
          $t('placeholder.passwordAgain')
        }}</span>
      </div>

      <el-button
        type="primary"
        class="btn-submit mb20"
        @click="beforeRegister"
        >{{ $t('btn.register') }}</el-button
      >

      <div class="switch-row">
        <span>{{ $t('hasAccount') }}</span>
        <span @click="toLogin" class="link">
          {{ $t('btn.signNow') }}
        </span>
      </div>
    </form>
  </div>
</template>
<script>
import * as _ from 'lodash'
import logoIcon from '@/assets/img/logo.svg'
import { i18nLabelMixin } from '@/views/mixin/i18nLabelMixin'
import { findReq } from '@/assets/js/api'
import { isSkipLoginMode } from '@/config/skip-login'
import { userInfoStore } from '@/stores/user-info'
import { particles } from './particles.js'
import { loadFull } from 'tsparticles'

const LOGIN_MODE = {
  password: 'password', // 密码登录
  passwordFree: 'passwordFree', // 免密登录
  authorize: 'authorize', // 授权登录
  captcha: 'captcha' // 验证码登录
}

const debounceOption = {
  leading: true,
  trailing: false
}
const debounceTime = 1000
export default {
  name: 'Login',
  mixins: [i18nLabelMixin],
  data() {
    return {
      logoIcon,
      particles,
      particlesOptiion: {
        color: '#def5cd', // String	#dedede	粒子颜色
        particleOpacity: 0.7, // Number	0.7	粒子不透明度
        particlesNumber: 100, // Number	80	颗粒数量
        shapeType: 'star', // String	"circle"	可用的形状类型: "circle","edge","triangle", "polygon","star"
        particleSize: 8, // Number	4	单颗粒大小
        linesColor: '#f2f2f2', // String	#dedede	线条颜色
        linesWidth: 1, // Number	1	线宽
        lineLinked: true, // Boolean	true	启用线路
        lineOpacity: 0.4, // Number	0.4	线条不透明度
        linesDistance: 150, // Number	150	线距
        moveSpeed: 3, // Number	3	粒子速度
        hoverEffect: true, // Boolean	true	启用悬停效果
        hoverMode: 'grab', // String	grab	可用的悬停模式: "grab", "repulse", "bubble"
        clickEffect: true, // Boolean	true	启用点击效果
        clickMode: 'push' // String	push	可用的点击模式: "push", "remove", "repulse", "bubble"
      },
      loginForm: {
        account: '',
        password: ''
      },
      registerForm: {
        account: '',
        nickname: '',
        password: '',
        rePassword: ''
      },
      rules: {},
      loginMode: LOGIN_MODE.password,
      showPassword: false,
      userInfo: {},
      isRegister: false,
      retryTime: 0
    }
  },
  computed: {
    validatePasswordArray() {
      let password = this.registerForm.password || ''
      let validateArray = [
        {
          reg: /^.{8,20}$/,
          tip: this.$t('validate.passwordLength'),
          flag: false
        },
        {
          reg: /(?=.*?[A-Z])/,
          tip: this.$t('validate.passwordUppercase'),
          flag: false
        },
        {
          reg: /(?=.*?[a-z])/,
          tip: this.$t('validate.passwordLowercase'),
          flag: false
        },
        {
          reg: /(?=.*\d)/,
          tip: this.$t('validate.passwordNumber'),
          flag: false
        }
      ]

      validateArray.forEach(validate => {
        validate.flag = !validate.reg.test(password)
      })

      return validateArray
    }
  },
  created() {
    this.rules = {
      account: [
        {
          required: true,
          message: this.$t('tip.accountRequired'),
          trigger: 'blur'
        }
      ],
      password: [
        {
          required: true,
          message: this.$t('tip.passwordRequired'),
          trigger: 'blur'
        }
      ]
    }

    this.isLogin()
  },
  methods: {
    login: _.debounce(
      function () {
        if (this.loginMode === LOGIN_MODE.password) {
          this.passwordLogin()
        }
        if (this.loginMode === LOGIN_MODE.captcha) {
          this.loginBySMS()
        }
      },
      debounceTime,
      debounceOption
    ),
    // 密码登录
    async passwordLogin() {
      let params = {
        phone: this.loginForm.account,
        password: this.loginForm.password
      }
      const req = findReq('loginController', 'loginByPassword')
      const res = await req(params)
      if (res.status) {
        this.userInfo = res.data
        this.afterLogin(this.userInfo)
      } else {
        this.$message.error(res.msg)
      }
    },
    // 验证码登录
    async loginBySMS() {
      let params = {
        phone: this.loginForm.account,
        captcha: this.loginForm.captcha
      }
      const req = findReq('loginController', 'loginBySMS')
      const res = await req(params)
      if (res.status) {
        this.userInfo = res.data
        this.afterLogin(this.userInfo)
      } else {
        this.$message.error(res.msg)
      }
    },

    beforeRegister: _.debounce(
      function () {
        try {
          if (!this.registerForm.account.length) {
            throw this.$t('validate.accountEmpty')
          }
          if (!this.registerForm.nickname.length) {
            throw this.$t('validate.nicknameEmpty')
          }
          if (!this.registerForm.password.length) {
            throw this.$t('validate.passwordEmpty')
          }
          if (this.registerForm.password !== this.registerForm.rePassword) {
            throw this.$t('validate.passwordInconsistent')
          }
          let flagIndex = this.validatePasswordArray.findIndex(
            item => item.flag
          )
          if (flagIndex > -1) {
            throw this.$t('validate.passwordStrength')
          }
        } catch (e) {
          this.$message.error(e)
          return
        }

        this.register()
      },
      debounceTime,
      debounceOption
    ),

    async register() {
      let params = {
        phone: this.registerForm.account,
        name: this.registerForm.nickname,
        password: this.registerForm.password
      }
      const req = findReq('loginController', 'registerByPhone')
      const res = await req(params)
      if (res.status) {
        this.userInfo = res.data
        this.$message({
          type: 'success',
          message: this.$t('tip.registerSuccess')
        })
        this.afterLogin(this.userInfo)
      } else {
        this.$message.error(res.msg)
      }
    },
    afterLogin(userInfoData) {
      const userInfo = userInfoStore()

      userInfo.changeUserInfo({
        name: userInfoData.name,
        userId: userInfoData.id,
        phone: userInfoData.phone,
        email: userInfoData.email,
        avatar: userInfoData.avatar,
        accountAlias: userInfoData.accountAlias,
        level: userInfoData.level
      })
      userInfo.updateToken(userInfoData.token)

      import('@/stores/permission').then(({ permissionStore }) => {
        permissionStore()
          .loadPermission()
          .finally(() => {
            this.$router.push({ path: '/home/homepage' })
          })
      })
    },
    toRegister() {
      this.isRegister = true
    },
    toLogin() {
      this.isRegister = false
    },
    toPhoneLogin() {
      this.loginMode = LOGIN_MODE.captcha
    },
    // 离开表单
    leaveForm(e) {
      console.log('leave')
      console.log(e)
    },
    // 进入表单
    enterForm(e) {
      console.log('in')
      console.log(e)
    },
    async particlesInit(engine) {
      await loadFull(engine)
    },
    // 判断是否已登录
    async isLogin() {
      if (isSkipLoginMode()) {
        return
      }
      const searchParams = new URLSearchParams(window.location.search)
      const accessToken = searchParams.get('accessToken')
      const user = userInfoStore()
      const token =
        user.getToken?.value != null ? user.getToken.value : user.getToken
      // 退出登录后无凭证，无需探测会话（避免 verifyLogin 返回 fail 弹错）
      if (!accessToken && !token) {
        return
      }
      const verifyLogin = findReq('loginController', 'verifyLogin')
      const res = await verifyLogin()
      if (!res.status) {
        return
      }
      if (!res.data?.id) {
        return
      }
      this.afterLogin(res.data)
    },

    // 发送验证码
    async sendCaptcha() {
      if (this.retryTime > 0) {
        return
      }
      const params = {
        type: 'login',
        account: this.loginForm.account
      }
      const req = findReq('loginController', 'getCaptcha')
      const res = await req(params)
      if (res.status) {
        this.$message({
          type: 'success',
          message: this.$t('tip.sendSuccess')
        })
        this.retryTime = 2 * 60
        const retryTimer = setInterval(() => {
          if (this.retryTime > 0) {
            this.retryTime--
          } else {
            clearInterval(retryTimer)
          }
        }, 1000)
      } else {
        this.$message.error(res.msg)
      }
    }
  }
}
</script>
<style lang="less" scoped>
@keyframes bg-gradients {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
.gradient-bg {
  width: 150vw;
  height: 150vw;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-image: linear-gradient(135deg, #66b1ff, #def5cd);
  animation: bg-gradients 60s;
  animation-iteration-count: infinite;
  z-index: 1;
}
.canvas-particles {
  width: 100vw;
  height: 100vw;
  position: absolute;
  z-index: 2;
}
// 玻璃卡片：磨砂底直接落在表单容器上（原独立 .form-bg 背景层已合并，
// 避免背景层用固定高度与内容脱节，注册表单内容溢出面板）
.form-container {
  width: 30vw;
  min-width: 400px;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 2.5rem;
  border-radius: @ds-radius-lg;
  background: fade(@color-morandi-10, 50%);
  backdrop-filter: blur(18px) saturate(1.4);
  border: 1px solid fade(@color-morandi-10, 60%);
  box-shadow: @ds-shadow-lg;
  z-index: 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all @ds-duration-base @ds-ease-out;
  .login-logo {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    margin-bottom: 16px;
    box-shadow: @ds-shadow-md;
  }

  .welcome {
    margin: 0 0 4px;
    font-size: @ds-font-xxl;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: @color-text-normal;
  }

  .welcome-sub {
    margin: 0 0 12px;
    font-size: @ds-font-sm;
    color: @color-text-secondary;
    letter-spacing: 0.01em;
  }

  // Element Plus 输入框统一风格：白底、清晰描边、焦点靛蓝光圈
  :deep(.el-input) {
    --el-input-height: 40px;
  }

  :deep(.el-input__wrapper) {
    border-radius: @ds-radius-md;
    background-color: @color-bg;
    box-shadow: 0 0 0 1px @color-liner-border inset;
    transition: box-shadow @ds-duration-fast @ds-ease-out;

    &:hover {
      box-shadow: 0 0 0 1px @color-border-hover inset;
    }

    &.is-focus {
      box-shadow:
        0 0 0 1px @ds-primary inset,
        0 0 0 3px @ds-primary-light inset;
    }
  }

  // 前置图标脱离灰底，仅随所属输入框聚焦点亮
  :deep(.el-input-group__prepend) {
    background-color: transparent;
    box-shadow: none;
    padding: 0 6px 0 2px;
    color: @color-icon-placeholder;

    .el-icon {
      font-size: 18px;
      transition: color @ds-duration-fast @ds-ease-out;
    }
  }

  :deep(.el-input:focus-within) .el-input-group__prepend .el-icon {
    color: @ds-primary;
  }

  .login-eye {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
  }

  .btn-captcha {
    cursor: pointer;
    border-left: solid 1px fade(@ds-primary, 20%);
    font-size: @ds-font-xs;
    padding-left: 12px;
  }

  .switch-row {
    display: flex;
    width: 100%;
    white-space: nowrap;
    justify-content: space-between;
  }

  .link {
    cursor: pointer;
    text-decoration: none;
    color: @color-text-selected;
    &:hover {
      color: @color-text-hover;
    }
    &:active {
      color: @color-text-active;
    }
  }

  .link__forget-password {
    width: 100%;
    text-align: right;
    margin: 1rem 0rem;
  }

  .btn-submit {
    width: 100%;
    height: 44px;
    border-radius: @ds-radius-md;
    font-size: @ds-font-lg;
    font-weight: 600;
    transition:
      transform @ds-duration-fast @ds-ease-out,
      box-shadow @ds-duration-fast @ds-ease-out;

    &:hover {
      transform: translateY(-1px);
      box-shadow: @ds-shadow-md;
    }

    &:active {
      transform: translateY(0);
    }
  }

  :deep(.el-form-item__error) {
    left: unset;
    right: 0;
  }
}

.input-box {
  position: relative;
  width: 100%;
  .input-box__inner {
    width: 100%;
    height: 40px;
    padding: 0 14px;
    border: 1px solid @color-liner-border;
    background: @color-bg;
    border-radius: @ds-radius-md;
    outline: none;
    font-size: @ds-font-md;
    color: @color-text-normal;
    transition:
      border-color @ds-duration-fast @ds-ease-out,
      box-shadow @ds-duration-fast @ds-ease-out;
    &:valid,
    &:focus {
      border-color: @ds-primary;
      box-shadow: 0 0 0 3px @ds-primary-light;
      & ~ .input-box__tip {
        color: @ds-primary;
        transform: translateY(-0.9rem) scale(0.7);
        padding: 0 4px;
        background: @color-bg;
        border-radius: @ds-radius-sm;
        letter-spacing: 0.1rem;
      }
    }
    &:focus {
      & ~ .validate-list {
        display: block;
      }
    }
  }
  .input-box__tip {
    position: absolute;
    left: 14px;
    top: 0;
    height: 40px;
    display: flex;
    align-items: center;
    color: @color-text-placeholder;
    pointer-events: none;
    font-size: @ds-font-md;
    transition: all @ds-duration-base @ds-ease-out;
  }
}

.validate-list {
  display: none;
  position: absolute;
  top: 120%;
  z-index: 11;
  text-align: left;
  width: 100%;
  font-size: @ds-font-sm;
  color: @color-text-secondary;
  background-color: @color-bg;
  padding: 12px 16px;
  border-radius: @ds-radius-md;
  box-shadow: @ds-shadow-lg;
  border: 1px solid fade(@color-liner-border, 60%);
  line-height: 2rem;
}

.icon-error {
  color: @color-danger;
  margin-right: 4px;
}
.icon-circle-check {
  color: @color-success;
  margin-right: 4px;
}
.other-login-area {
  display: flex;
  flex-direction: column;
  .other-login-tip {
    position: relative;
    margin: 1rem;
    color: @color-icon-placeholder;
    &:before {
      content: '';
      position: absolute;
      height: 2px;
      width: 6rem;
      background-color: @color-icon-placeholder;
      top: 50%;
      transform: translate(-130%, -50%);
    }
    &:after {
      content: '';
      position: absolute;
      height: 2px;
      width: 6rem;
      background-color: @color-icon-placeholder;
      top: 50%;
      transform: translate(30%, -50%);
    }
  }
  .other-login-way {
    display: flex;
    align-items: center;
    justify-content: space-around;
    .login-github {
      color: @color-text-normal;
      text-decoration: unset;
      transition: color @ds-duration-fast @ds-ease-out;

      &:hover {
        color: @ds-primary-hover;
      }
    }
  }
}

.el-form-item {
  width: 100%;
}
</style>
<i18n>
{
  "zh": {
     "welcome":"欢迎来到绘星!",
     "welcomeSub":"记录灵感，绘出你的星空",
     "noAccount":"没有账号？",
     "hasAccount":"已有账号，",
     "phoneLogin":"手机号登录",
     "label":{
         "otherLoginMethods":"其他登录方式",
         "oauthLoginTitile":"使用{0}账户登录"
     },
     "placeholder":{
         "account":"请输入手机号",
         "nickname":"请输入显示昵称",
         "captcha":"请输入验证码",
         "password":"请输入密码",
         "passwordAgain":"再次输入密码"
     },
     "btn":{
         "forgetPassword":"忘记密码?",
         "getCaptcha":"获取验证码",
         "sent":"已发送({0}s)",
         "register":"注册",
         "registerNow":"立即注册",
         "login":"登录",
         "signNow":"立即登录",
         "loginOrRegister":"登录/注册"
     },
     "tip":{
       "accountRequired":"账号不能为空",
       "passwordRequired":"密码不能为空",
       "sendSuccess":"发送成功",
       "registerSuccess":"注册成功"
     },
     "validate":{
      "passwordStrength":"密码强度太弱",
      "accountEmpty":"账号不能为空",
      "nicknameEmpty":"昵称不能为空",
      "passwordEmpty":"密码不能为空",
      "passwordInconsistent":"两次密码输入不一致",
      "passwordLength":"至少8个字符",
      "passwordUppercase":"至少一个大写字母(A-Z)",
      "passwordLowercase":"至少一个小写字母(a-z)",
      "passwordNumber":"至少一个数字(0-9)"
     }
  },
  "en": {
    "welcome":"Welcome to draw starts!",
    "welcomeSub":"Capture ideas, paint your starry sky",
    "noAccount":"No account?",
    "hasAccount":"Existing account,",
    "phoneLogin":"Login with phone",
    "label":{
         "otherLoginMethods":"Other Login Methods",
         "oauthLoginTitile":"Login using {0} account"
     },
     "placeholder":{
         "account":"Please enter your mobile number",
         "nickname":"Please enter the display nickname",
         "captcha":"Please enter the captcha",
         "password":"Please input a password",
         "passwordAgain":"Enter password again"
     },
     "btn":{
         "forgetPassword":"Forget Password?",
         "getCaptcha":"Get Code",
         "sent":"Sent({0}s)",
         "register":"Register",
         "registerNow":"Register Now",
         "login":"Login",
         "signNow":"sign in now",
         "loginOrRegister":"Login/Register"
     },
     "tip":{
       "accountRequired":"Account number cannot be empty",
       "passwordRequired":"Password cannot be empty",
       "sendSuccess":"Successfully sent",
       "registerSuccess":"register Successful"
     },
     "validate":{
      "passwordStrength":"Password strength is too weak",
      "accountEmpty":"The account number cannot be empty",
      "nicknameEmpty":"Nickname cannot be empty",
      "passwordEmpty":"Password cannot be empty",
      "passwordInconsistent":"The two passwords entered are inconsistent",
      "passwordLength":"At least 8 characters",
      "passwordUppercase":"At least one uppercase letter (A-Z)",
      "passwordLowercase":"At least one lowercase letter (a-z)",
      "passwordNumber":"At least one digit (0-9)"
     }

  }

}
</i18n>
