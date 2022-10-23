<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-19 22:15:21
 * @LastEditors: lgy
 * @LastEditTime: 2022-10-23 15:22:47
-->
<template>
  <div class="g-flex-normal" style="position: realative">
    <div class="m-card-normal mr10" v-copy="copyText">{{ $t("copy") }}</div>
    <div class="m-card-normal mr10" v-longpress="longpress">{{ $t("longpress") }}</div>
    <div class="m-card-normal mr10" v-debounce="debounceClick">{{ $t("debounce") }}</div>
    <div
      class="m-card-normal mr10"
      v-waterMarker="{ text: '水印~', textColor: 'rgba(180, 180, 180, 0.4)' }"
    >
      {{ $t("waterMarker") }}
    </div>

    <div class="draggable-area mb10">
      <div class="m-card-normal draggable-el" v-draggable>{{ $t("draggable") }}</div>
    </div>

    <br class="mb10" />

    <el-input
      type="text"
      class="mb10"
      :placeholder="$t('tips.emojiTip')"
      v-model="inputText"
      v-emoji
    ></el-input>

    <img
      style="width: 100px; height: 100px; position: relative; top: 100vh"
      v-lazyload="imgSrc"
    />
  </div>
</template>
<script>
import "@/utils/directives/index.js";
export default {
  data() {
    return {
      copyText: "复制内容",
      inputText: "",
      imgSrc: require("@/assets/img/lab.svg"),
    };
  },
  methods: {
    longpress() {
      this.$message({
        type: "success",
        message: this.$t("tips.longPressSuccess"),
      });
    },
    debounceClick() {
      this.$message({
        type: "success",
        message: this.$t("tips.cancelClick"),
      });
    },
  },
};
</script>
<style scoped>
.draggable-area {
  position: relative;
  width: 50vw;
  height: 50vh;
  border: solid aqua 1px;
  border-radius: 4px;
}

.draggable-el {
  position: relative;
  user-select: none;
}
</style>
<i18n>
{
  "zh": {
     "copy":"复制",
     "longpress":"长按",
     "debounce":"防抖",
     "draggable":"可拖拽元素",
     "waterMarker":"水印",
     "tips":{
      "emojiTip":"禁止输入表情",
      "longPressSuccess":"长按成功",
      "cancelClick":"1s内取消重复触发"
     }
  },
  "en": {
    "copy":"Copy",
     "longpress":"Long Press",
     "debounce":"Debounce",
     "draggable":"Draggable Element",
     "waterMarker":"Water Marker",
     "tips":{
      "emojiTip":"No expression input",
      "longPressSuccess":"Long press succeeded",
      "cancelClick":"Cancel repeated triggering within 1s"
     }
  }
}
</i18n>
