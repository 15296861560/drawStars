<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2023-02-07 22:48:18
 * @LastEditors: lgy
 * @LastEditTime: 2023-02-19 12:31:14
-->
<template>
  <div class="bind-phone-container">
    <div class="bind-phone-captcha" v-if="curStep === 'captcha'">
      <div class="bind-phone-row">验证码将发送到手机{{ userInfo.getUserInfo.phone }}</div>
      <div class="bind-phone-row">
        <el-input v-model="captcha" placeholder="请输入验证码">
          <template #prepend>
            <label>填写验证码：</label>
          </template>
          <template #append>
            <label class="btn-captcha" @click="sendCaptcha"
              ><span v-show="!countDown">获取验证码</span
              ><span v-show="countDown > 0">{{ `${countDown}s后重试` }}</span></label
            >
          </template>
        </el-input>
      </div>

      <div class="bind-phone-row">
        <el-button type="primary" @click="next">下一步</el-button>
      </div>
    </div>

    <div class="bind-phone-captcha" v-if="curStep === 'bind'">
      <div class="bind-phone-row">
        <el-input
          v-model="newPhone"
          :disabled="phoneDisabled"
          placeholder="请输入新手机号"
        >
          <template #prepend>
            <label>新手机号：</label>
          </template>
        </el-input>
      </div>
      <div class="bind-phone-row">
        <el-input v-model="captcha" placeholder="请输入验证码">
          <template #prepend>
            <label>填写验证码：</label>
          </template>
          <template #append>
            <label class="btn-captcha" @click="sendCaptcha"
              ><span v-show="!countDown">获取验证码</span
              ><span v-show="countDown > 0">{{ `${countDown}s后重试` }}</span></label
            >
          </template>
        </el-input>
      </div>

      <div class="bind-phone-row">
        <el-button type="primary" @click="comfirm">确认</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { showTips } from "@/utils/message/showTips.js";
import {
  getCaptcha,
  changePhone,
  verifyCaptcha,
} from "@/assets/js/api/profileController/profileApi.js";
import { userInfoStore } from "@/stores/user-info";
const userInfo = userInfoStore();

// 验证码
const captcha = ref("");
const countDown = ref(0);
watch(countDown, (newVal) => {
  if (newVal > 0) {
    setTimeout(() => {
      countDown.value = countDown.value - 1;
    }, 1000);
  }
});
// 步骤
const STEP = {
  captcha: "captcha",
  bind: "bind",
};
// 当前步骤
const curStep = ref(STEP.captcha);
// 新手机号
const newPhone = ref("");

// 是否已向新手机发送验证码
const phoneDisabled = ref(false);

// 获取验证码
async function sendCaptcha() {
  if (countDown.value) {
    return;
  }
  countDown.value = 60;
  let param = {};
  if (curStep.value === STEP.captcha) {
    param = { phone: userInfo.getUserInfo.phone };
  } else {
    param = { phone: newPhone.value };
  }

  let res = await getCaptcha(param);
  if (res.status) {
    showTips("success", "验证码发送成功");
  } else {
    countDown.value = 0;
    showTips("error", "验证码发送失败");
  }
}

// 下一步
async function next() {
  let res = await verifyCaptcha({
    phone: userInfo.getUserInfo.phone,
    captcha: captcha.value,
  });
  if (res.status) {
    curStep.value = STEP.bind;
    countDown.value = 0;
  } else {
    showTips("error", "验证码错误");
  }
}

// 确认
async function comfirm() {
  phoneDisabled.value = true;
  let res = await verifyCaptcha({
    phone: userInfo.getUserInfo.phone,
    captcha: captcha.value,
  });
  if (res.status) {
    curStep.value = STEP.captcha;
    countDown.value = 0;
    showTips("success", "修改手机号码成功");
  } else {
    showTips("error", "验证码错误");
  }
  phoneDisabled.value = false;
}
</script>

<style lang="less" scoped>
.bind-phone-container {
  display: flex;
  flex-direction: column;
  padding: 5rem;
  .bind-phone-row {
    height: 3rem;
    margin: 1rem;
    font-size: 2rem;
  }
  .btn-captcha {
    cursor: pointer;
    color: @color-primary;
    &:hover {
      color: @color-text-hover;
    }
    &:active {
      color: @color-text-active;
    }
  }
}
</style>
