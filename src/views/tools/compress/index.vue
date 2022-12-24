<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-09-25 23:03:22
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-17 22:23:17
-->
<template>
  <div v-loading.fullscreen.lock="fullscreenLoading">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12">
        <div class="m-box">
          <div class="m-box-title">
            <div>
              <el-button type="primary" size="small" @click="clear"
                ><el-icon><RefreshRight /></el-icon>>{{ $t("btn.clear") }}</el-button
              >
              <el-button type="primary" size="small" @click="running"
                ><el-icon><VideoPlay /></el-icon>{{ $t("btn.clickRun") }}</el-button
              >
            </div>
          </div>
          <div class="m-box-main">
            <textarea v-model="content" class="form-control" rows="" cols=""></textarea>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="m-box">
          <div class="m-box-title">
            <div class="m-btn msg">{{ $t("btn.runningRes") }}</div>
            <div class="m-btn msg" @click="copy">{{ $t("btn.copy") }}</div>
          </div>
          <div class="m-box-main">
            <textarea
              ref="code"
              v-model="compressCode"
              class="form-control"
              readonly
            ></textarea>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { compressCode } from "@/assets/js/api/commomController/commomApi.js";
export default {
  data() {
    return {
      fullscreenLoading: false,
      content: "",
      compressCode: "",
    };
  },
  methods: {
    async running() {
      this.fullscreenLoading = true;
      let res = await compressCode({ content: this.content });
      this.fullscreenLoading = false;
      if (res.status) {
        this.compressCode = res.data;
      }
    },
    clear() {
      this.content = "";
    },
    copy() {
      let copyText = this.$refs.code;
      copyText.select(); // 选择对象
      document.execCommand("Copy");
    },
  },
  mounted() {},
  destroyed() {},
};
</script>
<style></style>
