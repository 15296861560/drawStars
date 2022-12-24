<template>
  <div class="g-home-module">
    <div class="g-list-vertical">
      <div class="operation">
        <el-select v-model="from" placeholder="请选择">
          <el-option
            v-for="item in language"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-icon
          :class="from === 'auto' ? 'disable' : 'change'"
          @click="toChange"
          title="交换"
          ><Sort
        /></el-icon>
        <el-select v-model="to" placeholder="请选择">
          <el-option
            v-for="item in language.slice(1)"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-button type="primary" @click="translate" class="translate">翻译</el-button>
      </div>
      <div class="translate-part">
        <div class="original-lang">
          <el-input
            type="textarea"
            :rows="5"
            placeholder="请输入需要翻译的内容"
            v-model="originalText"
            resize="none"
            @keyup.enter.native="translate"
          >
          </el-input>
          <el-icon class="clear-org" title="清空" @click="clearInput"
            ><CircleClose
          /></el-icon>
        </div>
        <div class="post-translation-lang">
          <el-input
            type="textarea"
            :rows="5"
            placeholder=""
            v-model="postText"
            :readonly="true"
            resize="none"
          >
          </el-input>
        </div>
      </div>

      <div class="history">
        <div class="history-top">
          <div class="top-left">
            <el-icon class="mr4"><Clock /></el-icon>
            <span>历史记录</span>
          </div>

          <div class="top-right" v-show="!isEdit">
            <span @click="clearHistory">清空</span>|
            <span @click="isEdit = true">编辑</span>
          </div>

          <div class="edit" v-show="isEdit" @click="finish">完成</div>
        </div>
        <div class="history-content">
          <div class="content" v-for="(msg, index) in historyList" :key="index">
            <span class="msg" @click="toTranslate(msg.src)">
              {{ msg.src }}
            </span>
            <el-icon class="delete" v-show="isEdit" @click="deleteHistory(index)"
              ><RemoveFilled
            /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import storage from "@/utils/commom/storage.ts";
import { jsonp } from "vue-jsonp";
import { getSign } from "@/assets/js/api/translateController/translateApi.js";

export default {
  data() {
    return {
      originalText: "",
      postText: "",
      //语言列表
      language: [
        {
          value: "auto",
          text: "自动检测",
        },
        {
          value: "zh",
          text: "中文",
        },
        {
          value: "cht",
          text: "繁体中文",
        },
        {
          value: "en",
          text: "英文",
        },
        {
          value: "jp",
          text: "日语",
        },
        {
          value: "ru",
          text: "俄语",
        },
        {
          value: "de",
          text: "德语",
        },
        {
          value: "swe",
          text: "瑞典语",
        },
      ],
      from: "auto",
      to: "en",
      historyList: [],
      isEdit: false,
    };
  },
  methods: {
    async translate() {
      let appID = "";
      let sign = "";

      const contents = this.originalText;
      const salt = parseInt(Math.random() * 10000);

      // 获取appid和签名
      let res = await getSign({ contents, salt }, "/translateApi/getSign");
      if (res.status) {
        appID = res.data && res.data.appID;
        sign = res.data && res.data.sign;
      }

      // 发送翻译请求
      const url = "http://api.fanyi.baidu.com/api/trans/vip/translate";
      const params = {
        q: contents, //翻译内容
        from: this.from,
        to: this.to,
        appid: appID,
        salt: salt,
        sign: sign,
      };
      jsonp(url, params).then((res) => {
        if (res && res.trans_result) {
          this.postText = res.trans_result[0].dst;
          this.handelHistory(this.historyList, res.trans_result[0]);
        }
      });
    },
    handelHistory(historyList, trans) {
      if (historyList.length < 50) {
        historyList.push(trans);
      } else {
        historyList.shift();
        historyList.push(trans);
      }
      let historyObj = {};
      historyList.forEach((history) => {
        historyObj[history.src] = history;
      });
      historyList = Object.values(historyObj);
      this.historyList = historyList;

      storage.local.save("translate-history", historyList);
    },
    clearHistory() {
      this.historyList = [];
      storage.local.save("translate-history", this.historyList);
    },
    clearInput() {
      this.originalText = "";
      this.postText = "";
    },
    toTranslate(word) {
      this.originalText = word;
      this.translate();
    },
    toChange() {
      if (this.from === "auto") {
        return;
      }

      [this.from, this.to] = [this.to, this.from];
    },
    finish() {
      this.isEdit = false;
      storage.local.save("translate-history", this.historyList);
    },
    deleteHistory(index) {
      this.historyList.splice(index, 1);
    },
  },
  created() {
    this.historyList = storage.local.get("translate-history", []);
  },
};
</script>
<style lang="less" scoped>
.operation {
  display: flex;
  margin: 1rem 0;
  .change {
    font-size: 24px;
    transform: rotate(90deg);
    margin: auto;
    cursor: pointer;
    &:hover {
      color: @color-text-hover;
    }
    &:active {
      color: @color-text-active;
    }
  }
  .disable {
    color: @color-text-disabled;
    font-size: 24px;
    transform: rotate(90deg);
    margin: auto;
  }
  .translate {
    margin-left: 20%;
  }
}

.translate-part {
  display: flex;
  margin-bottom: 1rem /* 16/16 */;
  .original-lang {
    position: relative;
    width: 37.5rem /* 600/16 */;
    margin-right: 5rem /* 80/16 */;
    & deep(.el-textarea__inner) {
      border-color: transparent;
    }
    & deep(.el-textarea__inner:hover) {
      border-color: @color-border-highlight-hover;
    }
    & deep(.el-textarea__inner:active) {
      border-color: @color-border-highlight-active;
    }

    .clear-org {
      position: absolute;
      font-size: 1.5rem /* 24/16 */;
      right: 0.5rem /* 8/16 */;
      top: 0.5rem /* 8/16 */;
      color: @color-gray-scale-5;
      cursor: pointer;
      &:hover {
        color: @color-gray-scale-7;
      }
      &:active {
        color: @color-gray-scale-8;
      }
    }
  }
  .post-translation-lang {
    width: 37.5rem /* 600/16 */;
    // & deep(.el-textarea__inner) {
    //   border: none;
    // }
  }
  .el-textarea {
    font-size: 2rem /* 32/16 */;
  }
}

.history {
  display: flex;
  flex-direction: column;
  background-color: @color-gray-scale-5;

  padding: 1rem /* 16/16 */;
  border-radius: 4px;
  .history-top {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem /* 12/16 */;
    color: @color-text-secondary;
    height: 1.5rem /* 24/16 */;
    line-height: 1.5rem /* 24/16 */;
    .top-left {
      display: flex;
      align-items: center;
    }
    .top-right {
      span {
        cursor: pointer;
      }
      span:hover {
        color: @color-text-hover;
      }
    }

    .edit:hover {
      color: @color-text-hover;
    }
  }

  .history-content {
    display: flex;
    flex-wrap: wrap;
    .content {
      position: relative;
      .msg {
        position: relative;
        display: inline-block;
        padding: 0 0.5625rem /* 9/16 */;
        overflow: hidden;
        white-space: nowrap;
        color: @color-text-placeholder;
        border: 1px solid @color-liner-border;
        border-radius: 4px;
        height: 1.75rem /* 28/16 */;
        line-height: 1.75rem /* 28/16 */;
        background-color: @color-gray-scale-2;
        margin-right: 0.625rem /* 10/16 */;
        margin-top: 0.375rem /* 6/16 */;
        vertical-align: top;
        cursor: pointer;
        &:hover {
          color: @color-text-normal;
          background-color: @color-gray-scale-1;
        }
      }

      .delete {
        position: absolute;
        right: 4px;
        top: 0px;
        color: @color-text-placeholder;
        cursor: pointer;
        &:hover {
          color: @color-danger;
        }
        &:active {
          color: @color-text-secondary;
        }
      }
    }
  }
}
</style>
