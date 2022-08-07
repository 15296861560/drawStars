<template>
  <div>
    <div class="gradient-bg"></div>
    <vue-particles
      :color="particlesOptiion.color"
      :particleOpacity="particlesOptiion.particleOpacity"
      :particlesNumber="particlesOptiion.particlesNumber"
      :shapeType="particlesOptiion.shapeType"
      :particleSize="particlesOptiion.particleSize"
      :linesColor="particlesOptiion.linesColor"
      :linesWidth="particlesOptiion.linesWidth"
      :lineLinked="particlesOptiion.lineLinked"
      :lineOpacity="particlesOptiion.lineOpacity"
      :linesDistance="particlesOptiion.linesDistance"
      :moveSpeed="particlesOptiion.moveSpeed"
      :hoverEffect="particlesOptiion.hoverEffect"
      :hoverMode="particlesOptiion.hoverMode"
      :clickEffect="particlesOptiion.clickEffect"
      :clickMode="particlesOptiion.clickMode"
      class="canvas-particles"
    >
    </vue-particles>
    <div class="login-form-bg"></div>
    <el-form :rules="rules" :model="loginForm">
      <div class="login-form">
        <h2 class="welcome">{{ $t("welcome") }}</h2>
        <el-form-item prop="account" style="width: 100%">
          <el-input v-model="loginForm.account" :placeholder="$t('placeholder.account')">
            <i class="el-icon-user-solid" slot="prepend"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="password" style="width: 100%">
          <el-input
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="$t('placeholder.password')"
          >
            <i class="el-icon-lock" slot="prepend"></i>
            <img
              src="@/assets/img/login/eye-hidden.svg"
              v-show="!showPassword"
              class="login-eye"
              slot="suffix"
              @click="showPassword = !showPassword"
            />
            <img
              src="@/assets/img/login/eye-show.svg"
              v-show="showPassword"
              class="login-eye"
              slot="suffix"
              @click="showPassword = !showPassword"
            />
          </el-input>
        </el-form-item>

        <router-link to="/forgetPassword" class="forget-password">
          {{ $t("btn.forgetPassword") }}
        </router-link>

        <el-button type="primary" class="btn-submit" @click="submit">{{
          $t("btn.login")
        }}</el-button>
      </div>
    </el-form>
  </div>
</template>
<script>
import { loginByPassword } from "@/assets/js/api/loginController/loginApi.js";
const LOGIN_MODE = {
  password: "password", //密码登录
  passwordFree: "passwordFree", //免密登录
  authorize: "authorize", //授权登录
};
export default {
  name: "Login",
  data() {
    return {
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
      rules: {
        account: [
          { required: true, message: this.$t("tip.accountRequired"), trigger: "blur" },
        ],
        password: [
          { required: true, message: this.$t("tip.passwordRequired"), trigger: "blur" },
        ],
      },
      loginMode: LOGIN_MODE.password,
      showPassword: false,
      userInfo: {},
    };
  },
  created() {},
  methods: {
    submit() {
      if (this.loginMode === LOGIN_MODE.password) {
        this.login();
      }
    },
    async login() {
      let params = {
        phone: this.loginForm.account,
        password: this.loginForm.password,
      };
      let res = await loginByPassword(params);
      if (res.status) {
        this.userInfo = res.data;
        this.$store.dispatch("changeUserInfo", {
          attr: "userInfo",
          val: this.userInfo,
        });
        this.$store.dispatch("changeUserInfo", {
          attr: "token",
          val: this.userInfo.token,
        });

        this.$router.push({
          path: "/",
        });
      } else {
        this.$message.error(res.msg);
      }
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
.login-form-bg {
  width: 30vw;
  height: 40vh;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 4px;
  background: @color-morandi-10;
  filter: blur(4px);
  opacity: 0.5;
  z-index: 3;
}

.login-form {
  width: 30vw;
  height: 40vh;
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
  .welcome {
    font-size: 1.5em;
    font-weight: bold;
  }

  .login-eye {
    width: 1.25rem;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }

  .forget-password {
    text-align: right;
    width: 100%;
    text-decoration: none;
    color: @color-text-selected;
    &:hover {
      color: @color-text-hover;
    }
    &:active {
      color: @color-text-active;
    }
  }

  .btn-submit {
    width: 100%;
  }

  /deep/ .el-form-item__error {
    left: unset;
    right: 0;
  }
}
</style>
<i18n>
{
  "zh": {
     "welcome":"欢迎来到Draw Starts!",
     "placeholder":{
         "account":"请输入手机号",
         "password":"请输入密码"
     },
     "btn":{
         "forgetPassword":"忘记密码?",
         "login":"登录",
         "loginOrRegister":"登录/注册"
     },
     "tip":{
       "accountRequired":"账号不能为空",
       "passwordRequired":"密码不能为空"
     }
  },
  "en": {
    "welcome":"Welcome to draw starts!",
     "placeholder":{
         "account":"Please enter your mobile number",
         "password":"Please input a password"
     },
     "btn":{
         "forgetPassword":"Forget Password?",
         "login":"Login",
         "loginOrRegister":"Login/Register"
     },
     "tip":{
       "accountRequired":"Account number cannot be empty",
       "passwordRequired":"Password cannot be empty"
     }
    
  }
 
}
</i18n>
