<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-29 17:12:19
 * @LastEditors: lgy
 * @LastEditTime: 2022-10-29 18:50:07
-->
<template>
  <div>
    <el-form :model="formInline" class="demo-form-inline">
      <el-form-item required :label="$t('address')">
        <el-input
          v-model="formInline.address"
          :disabled="!isModifyAddress"
          :placeholder="$t('placeholder.address')"
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('message')">
        <el-input
          v-model="formInline.message"
          :placeholder="$t('placeholder.message')"
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="connection">{{
          $t("btn.connection")
        }}</el-button>
        <el-button type="primary" @click="modifyAddress">{{
          $t("btn.modifyAddress")
        }}</el-button>
        <el-button type="primary" @click="send">{{ $t("btn.send") }}</el-button>
      </el-form-item>
    </el-form>

    <h2>{{ $t("tip.msgList") }}</h2>

    <div class="msg-area">
      <div>
        <h3>{{ $t("tip.sendMsgList") }}</h3>
        <div class="msg" v-for="(msg, index) in sendMsgList" :key="index">{{ msg }}</div>
      </div>
      <div>
        <h3>{{ $t("tip.receiveMsgList") }}</h3>
        <div class="msg" v-for="(msg, index) in receiveMsgList" :key="index">
          {{ msg }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      formInline: {
        address: "ws://localhost:8020/",
        message: "",
      },
      isModifyAddress: false,
      receiveMsgList: [],
      sendMsgList: [],
      client: null,
    };
  },
  methods: {
    connection() {
      this.client = new WebSocket(this.formInline.address);
      this.client.addEventListener("open", () => {
        this.$message({
          type: "success",
          message: this.$t("tip.success"),
        });
      });
      this.client.addEventListener("close", () => {
        this.$message({
          type: "error",
          message: this.$t("tip.disconnect"),
        });
      });
      this.client.addEventListener("message", (event) => {
        this.receiveMsgList.push(event.data);
      });
    },
    modifyAddress() {
      this.isModifyAddress = !this.isModifyAddress;
    },
    send() {
      this.client.send(this.formInline.message);
      this.sendMsgList.push(this.formInline.message);
    },
  },

  mounted() {},
};
</script>
<style lang="less" scoped>
.msg-area {
  display: flex;
  justify-content: space-around;
  width: 100%;
  .msg {
    font-size: 16px;
  }
}
</style>
<i18n>
{
  "zh": {
     "address":"地址",
     "message":"消息",
     "placeholder":{
      "address":"请输入地址",
      "message":"请输入消息"
     },
     "tip":{
      "msgList":"消息列表",
      "sendMsgList":"发送消息列表",
      "receiveMsgList":"接收消息列表",
      "success":"连接成功",
      "disconnect":"断开连接"
     },
     "btn":{
      "connection":"建立连接",
      "modifyAddress":"修改地址",
      "send":"发送"
     }
  },
  "en": {
    "address":"Address",
    "message":"Message",
    "placeholder":{
      "address":"Please enter the address",
      "message":"Please enter a message"
     },
     "tip":{
      "msgList":"Message List",
      "sendMsgList":"Send Message List",
      "receiveMsgList":"Receive Message List",
      "success":"Connection succeeded",
      "disconnect":"Disconnect"
     },
     "btn":{
      "connection":"Establish a connection",
      "modifyAddress":"Modify Address",
      "send":"Send"
     }
  }
}
</i18n>
