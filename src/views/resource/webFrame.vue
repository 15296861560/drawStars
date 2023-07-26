<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:22
 * @LastEditors: lgy
 * @LastEditTime: 2023-07-26 23:25:34
-->
<template>
  <div class="g-flex-normal">
    <el-card class="web-card" v-for="(item, index) in webFrameAddress" :key="item.id">
      <div class="image-container">
        <img :src="item.icon" class="web-image" :title="item.name" />
      </div>
      <div class="web-card__bottom">
        <span class="web-name">{{ item.name }}</span>
        <div class="bottom">
          <time class="time">{{ item.createTime }}</time>
          <el-button text class="button" @click="open(item)">{{
            item.openWay === "newTab" ? "打开" : "进入"
          }}</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { showTips } from "@/utils/message/showTips.js";
import { queryWebsite } from "@/assets/js/api/webAdressController/webAdressApi.js";

interface WebObj {
  address: string;
  id: number;
  icon: string;
  name: string;
  openWay: string;
  open_way: string;
  type: string;
  createTime: string;
  create_time: string;
  updateTime: string;
  update_time: string;
}

const OPEN_WAY = {
  newTab: "newTab",
  curWindow: "curWindow",
  module: "module",
};

const router = useRouter();

const webFrameAddress = ref([]);
onMounted(() => {
  initDate();
});

async function initDate() {
  const result = await queryWebsite();
  const DEFAULT_IMG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect fill='%23cccccc' width='200' height='150'%3E%3C/rect%3E%3Ctext fill='%23000000' font-family='Verdana' font-size='20' dy='0.35em' x='50%25' y='50%25' text-anchor='middle'%3E无图片%3C/text%3E%3C/svg%3E`;
  if (result.status) {
    webFrameAddress.value = result.data.map((item: WebObj) => {
      item.createTime = new Date(item.create_time).toLocaleString();
      item.updateTime = new Date(item.update_time).toLocaleString();
      item.openWay = item.open_way;
      if (!item.icon) {
        item.icon = DEFAULT_IMG;
      }
      return item;
    });
  } else {
    showTips("error", result.msg);
  }
}
function open(openObj: WebObj) {
  switch (openObj.openWay) {
    case OPEN_WAY.newTab:
      window.open(openObj.address);
      break;
    case OPEN_WAY.curWindow:
      window.location.href = openObj.address;
      break;
    case OPEN_WAY.module:
      const { address, name, type } = openObj;
      router.push({ name: "模块", query: { address, name, type } });
      break;
    default:
      break;
  }
}
</script>
<style scoped lang="less">
.web-card {
  width: 12.5rem /* 200/16 */;
  margin: 0.625rem /* 10/16 */;
  .image-container {
    width: 100%;
    display: flex;
    align-items: center;
    height: 7.5rem /* 120/16 */;
    border-radius: 4px;
    overflow: hidden;
    .web-image {
      width: 100%;
      transition: all ease 0.5s;
      &:hover {
        scale: 1.2;
      }
    }
  }
  .web-card__bottom {
    margin-top: 0.625rem /* 10/16 */;
    .web-name {
      font-size: 1rem /* 16/16 */;
      color: @color-text-normal;
    }

    .time {
      font-size: 0.75rem /* 12/16 */;
      color: @color-text-secondary;
      line-height: 1.5;
      text-align: left;
    }

    .bottom {
      margin-top: 0.75rem /* 12/16 */;
      line-height: 0.75rem /* 12/16 */;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .button {
      min-height: auto;
    }
  }
}
</style>
