<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 14:38:11
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-28 23:40:01
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

<script>
import { getCommitInfo } from "@/assets/js/api/commomController/commomApi.js";
export default {
  name: "CommitInfo",
  props: {},
  data() {
    return {
      commitInfoList: [],
    };
  },
  methods: {
    getCommitInfoList() {
      getCommitInfo()
        .then((res) => {
          if (res.data.length > 15) {
            this.commitInfoList = res.data.splice(0, 15);
          } else {
            this.commitInfoList = res.data;
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  mounted() {
    // 首页刚加载时$axios里无法访问$store，所以
    this.$nextTick(() => {
      this.getCommitInfoList();
    });
  },
};
</script>

<style lang="less" scoped>
.commit {
  display: flex;
  width: 49%;
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
