<template>
  <ul class="acc-pass-list">
    <li class="pass-row">
      <label class="pass-label">输入旧密码：</label>
      <el-input
        v-model="oldPassword"
        type="password"
        placeholder="请输入旧密码"
        show-password
      />
    </li>
    <li class="pass-row">
      <label class="pass-label">输入新密码：</label>
      <el-input
        v-model="password"
        type="password"
        placeholder="请输入新密码"
        show-password
      />
    </li>
    <li class="pass-row">
      <label class="pass-label">确认新密码：</label>
      <el-input
        v-model="newPassword"
        type="password"
        placeholder="请确认新密码"
        show-password
      />
    </li>

    <li class="pass-row"><el-button type="primary" @click="comfirm">确认</el-button></li>
  </ul>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { showTips } from "@/utils/message/showTips.js";
import { changePassword } from "@/assets/js/api/profileController/profileApi.js";
import { userInfoStore } from "@/stores/user-info";
const userInfo = userInfoStore();

const oldPassword = ref("");
const password = ref("");
const newPassword = ref("");

async function comfirm() {
  if (password.value !== newPassword.value) {
    showTips("error", "两次新密码不一致");
    return;
  }

  let param = {
    id: userInfo.getUserId,
    password: oldPassword.value,
    newPassword: newPassword.value,
  };

  let res = await changePassword(param);
  if (res.status) {
    showTips("success", "修改成功");
  } else {
    showTips("error", res.msg);
  }
}
</script>

<style lang="less" scoped>
.acc-pass-list {
  display: flex;
  flex-direction: column;
  padding: 5rem;
  .pass-row {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 3rem;
    margin: 1rem;
    .pass-label {
      width: 10rem;
      display: flex;
      align-items: center;
    }
  }
}
</style>
