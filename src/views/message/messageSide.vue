<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2023-03-05 17:58:05
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-15 23:48:59
-->
<template>
  <div class="message-box slideInRight" ref="msgBox" v-show="showMessageBox">
    <div class="message-box__header">
      <h2 class="message-box__title">站内信</h2>
      <div class="message-box__header__right">
        <div class="message-btn__more u-btn" @click="queryMore">查看更多</div>
        <el-icon><Close class="u-btn" @click="close" /></el-icon>
      </div>
    </div>

    <div class="message-box__body">
      <div class="message-box__body__select">
        <el-select v-model="option" class="m-2">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <div class="message-btn__all-read u-btn">
          <el-icon><BrushFilled /></el-icon>
          全部已读
        </div>
      </div>

      <ul class="message-box__body__list" v-for="notify in notifyList" :key="notify.id">
        <li class="message-card">
          <div class="message-card__notify">
            {{ notify.content }}
          </div>
          <div class="message-card__info">
            <div class="message-card__info__tag">{{ notify.tag }}</div>
            <div class="message-card__info__time">
              {{ formatDate(notify.createTime, "yyyy-MM-dd HH:mm") }}
            </div>
          </div>
        </li>

        <li class="message__no-more" v-if="!hasMore">没有更多了~</li>
      </ul>

      <div class="nothing">当前没有通知~</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, watch } from "vue";
import { showTips } from "@/utils/message/showTips.js";
import formatDate from "@/utils/commom/formatDate.js";
import { userInfoStore } from "@/stores/user-info";
import {
  queryNotifyById,
  queryNotifyByType,
  queryMyNotifyByType,
  queryAllNotify,
  queryMyAllNotify,
} from "@/assets/js/api/notifyController/notifyApi.js";
const userInfo = userInfoStore();

const props = defineProps({
  showMessageBox: { type: Boolean, required: false, default: true },
});

// 运行时
const emit = defineEmits(["change", "update", "close"]);

const option = ref("all");
const options = [
  {
    value: "all",
    label: "全部",
  },
  {
    value: "read",
    label: "已读",
  },
  {
    value: "unread",
    label: "未读",
  },
];

const msgBox = ref(null);
const hasMore = ref(false);

const queryMore = () => {};

const close = () => {
  emit("close", false);
};

let notifyList = reactive([]);

const getMyAllNotify = async () => {
  let res = await queryMyAllNotify();
  if (!res.status || !res.data) {
    return;
  }
  notifyList.value = res.data;
};

const init = async () => {
  getMyAllNotify();
};

onMounted(() => {
  init();
});
</script>
<style lang="less" scoped>
.message-box {
  position: fixed;
  top: 60px;
  left: auto;
  right: 0;
  bottom: 0;
  width: 480px;
  background-color: #fff;
  box-shadow: 0 2px 4px 0 rgb(54 58 80 / 32%);
  display: flex;
  color: rgba(0, 0, 0, 0.9);
  flex-direction: column;
  z-index: 10;
  transition: all ease 0.5s;
  animation-duration: 0.5s;
  .message-box__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;
    padding: 10px 20px;
    border-bottom: 1px solid #e7eaef;
    flex: 0 0 50px;
    .message-box__title {
      line-height: 28px;
    }
    .message-box__header__right {
      display: flex;
      align-items: center;
      .message-btn__more {
        margin-right: 4px;
      }
      .message-box__close {
        font-size: 1rem;
      }
    }
  }

  .message-box__body {
    flex: 1 1 auto;
    overflow: auto;
    padding: 20px;
    .message-box__body__select {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .message-btn__all-read {
      height: 30px;
      min-width: 24px;
      padding: 0 20px;
      color: #fff;
      border: 1px solid #006eff;
      line-height: 28px;
      text-align: center;
      display: inline-block;
      cursor: pointer;
      outline: 0 none;
      box-sizing: border-box;
      text-decoration: none;
      font-size: 12px;
      vertical-align: middle;
      white-space: nowrap;
      border-radius: 0;
      -webkit-user-select: none;
      -moz-user-select: none;
      user-select: none;
      color: #006eff;
      &:hover {
        background-color: #ebeef2;
        border-color: #cfd5de;
        color: #006eff;
      }
    }

    .message-box__body__list {
      display: flex;
      flex-direction: column;
      .message-card {
        padding: 10px 20px 10px 31px;
        border-bottom: 1px solid #ddd;
        cursor: pointer;
        position: relative;
        &:hover {
          background: #e7eaef;
        }
        .message-card__notify {
          margin-bottom: 5px;
          color: #000;
          font-weight: 600;
          line-height: 20px;
          flex: 1 1 auto;
          min-width: 20px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
        .message-card__info {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          .message-card__info__tag {
            position: relative;
            margin: 4px 4px 0 0;
            padding: 0 7px;
            height: auto;
            line-height: 18px;
            vertical-align: middle;
            border: 1px solid #f3f4f7;
            border-radius: 0;
            background-color: #ffe8d5;
            border-color: #ffe8d5;
            color: #ff7200;
          }
          .message-card__info__time {
            color: rgba(0, 0, 0, 0.4);
            line-height: 20px;
          }
        }
      }
      .message__no-more {
        position: relative;
        padding: 10px;
        text-align: center;
      }
    }
  }

  .nothing {
    text-align: center;
    font-size: 16px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
