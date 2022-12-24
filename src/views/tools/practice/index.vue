<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:22
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-17 15:20:46
-->
<template>
  <div>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12">
        <div class="m-box">
          <div class="m-box-title">
            <div class="m-btn msg">{{ $t("btn.sourceCode") }}</div>
            <div>
              <el-button type="primary" size="small" @click="refresh"
                ><el-icon><RefreshRight /></el-icon>>{{ $t("btn.reset") }}</el-button
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
          </div>
          <div class="m-box-main">
            <iframe ref="showPage" class="m-iframe"></iframe>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { getContent } from "@/assets/js/api/commomController/commomApi.js";
export default {
  data() {
    return {
      content: "",
    };
  },
  methods: {
    getTemplate() {
      let _this = this;
      getContent().then((res) => {
        if (res.status) {
          this.content = res.data;
        }
      });
    },
    running() {
      let page = this.$refs.showPage;
      let doc = page.contentDocument || page.contentWindow.document; // W3C || IE
      // doc.designMode = "on";//控制整个文档是否可编辑
      //当一个HTML元素的contenteditable属性被设置为true时，document.execCommand() 方法便可使用。
      // doc.contentEditable = true;//让iframe可编辑
      doc.open();
      doc.write(this.content);
      doc.close();
    },
    refresh() {
      this.getTemplate();
    },
  },
  mounted() {
    this.getTemplate();
  },
  destroyed() {},
};
</script>
<style></style>
