<template>
  <div>
    <div class="gradient-bg"></div>
    <Particles
      id="tsparticles"
      class="canvas-particles login__particles login-particles"
      :particlesInit="particlesInit"
      :options="particles"
    />
    <div class="form-bg" :class="isRegister ? 'register-form-bg' : 'login-form-bg'"></div>
    <!-- 登录框 -->
    <el-form :rules="rules" :model="loginForm" v-show="!isRegister">
      <div class="form-container login-form">
        <h2 class="welcome">{{ $t("welcome") }}</h2>
        <el-form-item prop="account" style="width: 100%">
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
        <el-form-item prop="password" style="width: 100%">
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
                  showPassword ? 'drawstars-icon-eye-show' : 'drawstars-icon-eye-hidden'
                "
                @click="showPassword = !showPassword"
              ></div>
            </template>
          </el-input>
        </el-form-item>

        <router-link to="/forgetPassword" class="link link__forget-password">
          {{ $t("btn.forgetPassword") }}
        </router-link>

        <el-button type="primary" class="btn-submit mb20" @click="login">{{
          $t("btn.login")
        }}</el-button>

        <div class="switch-row">
          <span>{{ $t("noAccount") }}</span>
          <span @click="toRegister" class="link">
            {{ $t("btn.registerNow") }}
          </span>
        </div>
      </div>
    </el-form>

    <!-- 注册账号 -->
    <form class="form-container register-form" v-show="isRegister">
      <h2 class="welcome">{{ $t("welcome") }}</h2>

      <div class="input-box mb20">
        <input
          class="input-box__inner"
          type="phone"
          required
          v-model="registerForm.account"
        />
        <span class="input-box__tip">{{ $t("placeholder.account") }}</span>
      </div>
      <div class="input-box mb20">
        <input
          class="input-box__inner"
          type="text"
          required
          v-model="registerForm.nickname"
        />
        <span class="input-box__tip">{{ $t("placeholder.nickname") }}</span>
      </div>
      <div class="input-box mb20">
        <input
          class="input-box__inner"
          type="password"
          required
          v-model="registerForm.password"
          autocomplete="off"
        />
        <span class="input-box__tip">{{ $t("placeholder.password") }}</span>
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
        <span class="input-box__tip">{{ $t("placeholder.passwordAgain") }}</span>
      </div>

      <el-button type="primary" class="btn-submit mb20" @click="beforeRegister">{{
        $t("btn.register")
      }}</el-button>

      <div class="switch-row">
        <span>{{ $t("hasAccount") }}</span>
        <span @click="toLogin" class="link">
          {{ $t("btn.signNow") }}
        </span>
      </div>
    </form>
  </div>
</template>
<script>
import * as _ from "lodash";
import { i18nLabelMixin } from "@/views/mixin/i18nLabelMixin";
import {
  loginByPassword,
  registerByPhone,
} from "@/assets/js/api/loginController/loginApi.js";
import { userInfoStore } from "@/stores/user-info";
import { particles } from "./particles.js";
import { loadFull } from "tsparticles";

const LOGIN_MODE = {
  password: "password", //密码登录
  passwordFree: "passwordFree", //免密登录
  authorize: "authorize", //授权登录
};

const debounceOption = {
  leading: true,
  trailing: false,
};
const debounceTime = 1000;
export default {
  name: "Login",
  mixins: [i18nLabelMixin],
  data() {
    return {
      particles,
      particlesOptiion: {
        color: "#def5cd", //String	#dedede	粒子颜色
        particleOpacity: 0.7, //Number	0.7	粒子不透明度
        particlesNumber: 100, //Number	80	颗粒数量
        shapeType: "star", //String	"circle"	可用的形状类型: "circle","edge","triangle", "polygon","star"
        particleSize: 8, //Number	4	单颗粒大小
        linesColor: "#f2f2f2", //String	#dedede	线条颜色
        linesWidth: 1, //Number	1	线宽
        lineLinked: true, //Boolean	true	启用线路
        lineOpacity: 0.4, //Number	0.4	线条不透明度
        linesDistance: 150, //Number	150	线距
        moveSpeed: 3, //Number	3	粒子速度
        hoverEffect: true, //Boolean	true	启用悬停效果
        hoverMode: "grab", //String	grab	可用的悬停模式: "grab", "repulse", "bubble"
        clickEffect: true, //Boolean	true	启用点击效果
        clickMode: "push", //String	push	可用的点击模式: "push", "remove", "repulse", "bubble"
      },
      loginForm: {
        account: "",
        password: "",
      },
      registerForm: {
        account: "",
        nickname: "",
        password: "",
        rePassword: "",
      },
      rules: {},
      loginMode: LOGIN_MODE.password,
      showPassword: false,
      userInfo: {},
      isRegister: false,
    };
  },
  computed: {
    validatePasswordArray() {
      let password = this.registerForm.password || "";
      let validateArray = [
        {
          reg: /^.{8,20}$/,
          tip: this.$t("validate.passwordLength"),
          flag: false,
        },
        {
          reg: /(?=.*?[A-Z])/,
          tip: this.$t("validate.passwordUppercase"),
          flag: false,
        },
        {
          reg: /(?=.*?[a-z])/,
          tip: this.$t("validate.passwordLowercase"),
          flag: false,
        },
        {
          reg: /(?=.*\d)/,
          tip: this.$t("validate.passwordNumber"),
          flag: false,
        },
      ];

      validateArray.forEach((validate) => {
        validate.flag = !validate.reg.test(password);
      });

      return validateArray;
    },
  },
  created() {
    this.rules = {
      account: [
        { required: true, message: this.$t("tip.accountRequired"), trigger: "blur" },
      ],
      password: [
        { required: true, message: this.$t("tip.passwordRequired"), trigger: "blur" },
      ],
    };
  },
  methods: {
    login: _.debounce(
      function () {
        if (this.loginMode === LOGIN_MODE.password) {
          this.passwordLogin();
        }
      },
      debounceTime,
      debounceOption
    ),
    // 密码登录
    async passwordLogin() {
      let params = {
        phone: this.loginForm.account,
        password: this.loginForm.password,
      };
      let res = await loginByPassword(params);
      if (res.status) {
        this.userInfo = res.data;
        this.afterLogin(this.userInfo);
      } else {
        this.$message.error(res.msg);
      }
    },

    beforeRegister: _.debounce(
      function () {
        try {
          if (!this.registerForm.account.length) {
            throw this.$t("validate.accountEmpty");
          }
          if (!this.registerForm.nickname.length) {
            throw this.$t("validate.nicknameEmpty");
          }
          if (!this.registerForm.password.length) {
            throw this.$t("validate.passwordEmpty");
          }
          if (this.registerForm.password !== this.registerForm.rePassword) {
            throw this.$t("validate.passwordInconsistent");
          }
          let flagIndex = this.validatePasswordArray.findIndex((item) => item.flag);
          if (flagIndex > -1) {
            throw this.$t("validate.passwordStrength");
          }
        } catch (e) {
          this.$message.error(e);
          return;
        }

        this.register();
      },
      debounceTime,
      debounceOption
    ),

    async register() {
      let params = {
        phone: this.registerForm.account,
        name: this.registerForm.nickname,
        password: this.registerForm.password,
      };
      let res = await registerByPhone(params);
      if (res.status) {
        this.userInfo = res.data;
        this.$message({
          type: "success",
          message: this.$t("tip.registerSuccess"),
        });
        this.afterLogin(this.userInfo);
      } else {
        this.$message.error(res.msg);
      }
    },
    afterLogin(userInfoData) {
      const userInfo = userInfoStore();

      userInfo.changeUserInfo({
        name: userInfoData.name,
        userId: userInfoData.id,
        phone: userInfoData.phone,
      });
      userInfo.updateToken(userInfoData.token);

      this.$router.push({
        path: "/home/homepage",
      });
    },
    toRegister() {
      this.isRegister = true;
    },
    toLogin() {
      this.isRegister = false;
    },
    // 离开表单
    leaveForm(e) {
      console.log("leave");
      console.log(e);
    },
    // 进入表单
    enterForm(e) {
      console.log("in");
      console.log(e);
    },
    async particlesInit(engine) {
      await loadFull(engine);
    },
  },
};
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
.form-bg {
  width: 30vw;
  height: 50vh;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 4px;
  background: @color-morandi-10;
  filter: blur(4px);
  opacity: 0.5;
  z-index: 3;
  transition: all ease 0.3s;
}

.login-form-bg {
  height: 40vh;
}
.register-form-bg {
  height: 50vh;
}

.login-form {
  width: 30vw;
  height: 40vh;
}
.register-form {
  width: 30vw;
  height: 50vh;
}

.form-container {
  background-color: transparent;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 4px;
  padding: 2rem;
  z-index: 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  transition: all ease 0.3s;
  .welcome {
    font-size: 1.5em;
    font-weight: bold;
  }

  .login-eye {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
  }

  .switch-row {
    display: flex;
    width: 100%;
    white-space: nowrap;
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
  }

  deep(.el-form-item__error) {
    left: unset;
    right: 0;
  }
}

.input-box {
  position: relative;
  width: 100%;
  .input-box__inner {
    width: 100%;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.5);
    background: none;
    border-radius: 4px;
    outline: none;
    font-size: 1rem;
    transition: 0.5s;
    &:valid,
    &:focus {
      border: 1px solid #50c9c3;
      & ~ .input-box__tip {
        color: #50c9c3;
        transform: translateY(-0.9rem) scale(0.7); /* 变换位置 */
        padding: 0.5rem;
        background: #fffaf4;
        border-radius: 4px;
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
    left: 0;
    top: 0;
    color: #939496;
    padding: 1rem;
    pointer-events: none;
    font-size: 1rem;
    transition: all ease 0.5s;
  }
}

.validate-list {
  display: none;
  position: absolute;
  top: 120%;
  z-index: 11;
  text-align: left;
  width: 100%;
  font-size: 1.2rem;
  background-color: white;
  padding: 1rem;
  border-radius: 4px;
  box-shadow: #cfd5d6 10px 10px 10px;
  line-height: 2rem;
}

.icon-error {
  color: #f44234;
  margin-right: 4px;
}
.icon-circle-check {
  color: #6fc362;
  margin-right: 4px;
}
</style>
<i18n>
{
  "zh": {
     "welcome":"欢迎来到绘星!",
     "noAccount":"没有账号？",
     "hasAccount":"已有账号，",
     "placeholder":{
         "account":"请输入手机号",
         "nickname":"请输入显示昵称",
         "password":"请输入密码",
         "passwordAgain":"再次输入密码"
     },
     "btn":{
         "forgetPassword":"忘记密码?",
         "register":"注册",
         "registerNow":"立即注册",
         "login":"登录",
         "signNow":"立即登录",
         "loginOrRegister":"登录/注册"
     },
     "tip":{
       "accountRequired":"账号不能为空",
       "passwordRequired":"密码不能为空",
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
    "noAccount":"No account?",
    "hasAccount":"Existing account,",
     "placeholder":{
         "account":"Please enter your mobile number",
         "nickname":"Please enter the display nickname",
         "password":"Please input a password",
         "passwordAgain":"Enter password again"
     },
     "btn":{
         "forgetPassword":"Forget Password?",
         "register":"Register",
         "registerNow":"Register Now",
         "login":"Login",
         "signNow":"sign in now",
         "loginOrRegister":"Login/Register"
     },
     "tip":{
       "accountRequired":"Account number cannot be empty",
       "passwordRequired":"Password cannot be empty",
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
