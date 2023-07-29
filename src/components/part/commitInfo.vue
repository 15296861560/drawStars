<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 14:38:11
 * @LastEditors: lgy
 * @LastEditTime: 2023-07-30 02:19:58
-->
<template>
  <div class="commit">
    <div class="title-row">
      <div class="commit-title">{{ $t("commit.updateLog") }}</div>
    </div>
    <div class="commit-main">
      <el-timeline :reverse="false">
        <el-timeline-item
          v-for="(item, index) in commitInfoList"
          :key="index"
          :timestamp="new Date(item.date).toLocaleString()"
          :color="index == 0 ? '#0bbd87' : ''"
        >
          {{ item.feat }}
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { onMounted, reactive } from "vue";
import { showTips } from "@/utils/message/showTips.js";

const commitInfoList = reactive([]);

async function getCommitInfoList() {
  const accout = 15296861560,
    warehouse = "drawStars";
  const url = `https://api.github.com/repos/${accout}/${warehouse}/commits`;
  let res = await axios.get(url).catch((e) => {
    showTips("error", e.toString());
  });
  if (res.status === 200) {
    res.data.forEach((c) => {
      let message = c.commit?.message;
      if (message && message.startsWith("feat")) {
        commitInfoList.push({
          date: c.commit?.author?.date,
          feat: message.slice(5),
        });
      }
    });
  } else {
    showTips("error", res.toString());
  }
}

onMounted(() => {
  getCommitInfoList();
});
</script>

<style lang="less" scoped>
.commit {
  display: flex;
  width: 100%;
  background-color: white;
  flex-direction: column;
  border-radius: 5px;
  text-align: left;
  .title-row {
    display: flex;
    padding-left: 2vw;
    align-items: center;
    height: 5vh;
    border-bottom: solid;
    border-color: #e6e6e6;
    border-width: 1px;
    .commit-title {
      color: black;
    }
  }
  .commit-main {
    display: block;
    padding-left: 2vw;
    padding-right: 2vw;
    margin-top: 2vh;
    margin-bottom: 2vh;
  }
}
</style>
