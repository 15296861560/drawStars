<template>
  <div>
    <el-form :inline="true" :model="localUser" class="send-area">
      <el-form-item label="账户">
        <el-input
          v-model="localUser.accountName"
          placeholder="请输入账户"
          ref="account"
        ></el-input>
      </el-form-item>
      <el-form-item label="频道">
        <el-input
          v-model="localUser.channelName"
          placeholder="请输入频道"
          ref="channelName"
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button size="medium" type="success" @click="getRTMToken">
          <span>登录</span>
        </el-button>
        <el-button size="medium" type="success" @click="logout">
          <span>退出</span>
        </el-button>
      </el-form-item>
    </el-form>
    <div class="chat-room">
      <div class="msg-list">
        <div class="send-row" v-for="(msg, index) in msgList">
          <div class="send-user">{{ msg.accountName }}:</div>
          <div class="send-msg">{{ msg.channelMessage }}</div>
        </div>
      </div>
      <div class="send-area">
        <el-input v-model="msg" placeholder="请输入内容"></el-input>
        <el-button type="success" @click="sendMsg">发送</el-button>
      </div>
    </div>
  </div>
</template>
<script>
const agoraConfig = require("../Agora/agora-config.js");
import RtmClient from "./rtm-client";

export default {
  data() {
    return {
      rtmClient: null,
      localUser: {
        accountName: "",
        channelName: "",
      },
      msg: "",
      msgList: [],
      rtmToken: "",
    };
  },
  created() {
    this.init();
  },
  methods: {
    async init() {},
    getRTMToken() {
      this.$axios({ account: this.localUser.accountName }, "/agoraApi/getRTMToken").then(
        (res) => {
          if (res.status) {
            this.rtmToken = res.data;
            this.initClient();
          }
        }
      );
    },
    async initClient() {
      this.rtmClient = new RtmClient();
      let rtm = this.rtmClient;

      const params = {
        accountName: this.localUser.accountName,
        appId: agoraConfig.appId,
        token: this.rtmToken,
      };

      try {
        rtm.init(params.appId);
        rtm
          .login(params.accountName, params.token)
          .then(() => {
            rtm._logined = true;
            console.log("Login: " + params.accountName, " token: ", params.token);
            this.joinChannel();
            this.initRTMListen();
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (err) {
        Toast.error("Login failed, please open console see more details");
        console.error(err);
      }
    },
    logout() {
      this.rtmClient.logout();
    },
    initRTMListen() {
      let rtm = this.rtmClient;
      rtm.on("ConnectionStateChanged", (newState, reason) => {
        console.log("reason", reason);
        if (newState === "ABORTED") {
          if (reason === "REMOTE_LOGIN") {
            console.log("You have already been kicked off!");
          }
        }
      });

      rtm.on("MessageFromPeer", async (message, peerId) => {
        console.log(message);
      });

      rtm.on("MemberJoined", ({ channelName, args }) => {
        const memberId = args[0];
        console.log("channel ", channelName, " member: ", memberId, " joined");
      });

      rtm.on("MemberLeft", ({ channelName, args }) => {
        const memberId = args[0];
        console.log("channel ", channelName, " member: ", memberId, " joined");
      });

      rtm.on("ChannelMessage", async ({ channelName, args }) => {
        const [message, memberId] = args;

        console.log(
          "channel ",
          channelName,
          ", messsage: ",
          message.text,
          ", memberId: ",
          memberId
        );

        if (message.messageType === "IMAGE") {
          const blob = await rtm.client.downloadMedia(message.mediaId);
          blobToImage(blob, (image) => {
            let msgObj = {
              accountName: memberId,
              channelMessage: message.text,
              channelName: channelName,
              msgType: "IMAGE",
              imgSrc: image.src,
            };
            this.msgList.push(msgObj);
          });
        } else {
          let msgObj = {
            accountName: memberId,
            channelMessage: message.text,
            channelName: channelName,
          };
          this.msgList.push(msgObj);
        }
      });
    },
    joinChannel() {
      const channelName = this.localUser.channelName;
      this.rtmClient
        .joinChannel(channelName)
        .then(() => {
          this.rtmClient.channels[channelName].joined = true;
        })
        .catch((err) => {
          console.error("Join channel failed, please open console see more details.");
          console.error(err);
        });
    },
    sendMsg() {
      let rtm = this.rtmClient;
      const channelName = this.localUser.channelName;
      if (!rtm._logined) {
        console.log("Please Login First");
        return;
      }
      if (
        !rtm.channels[channelName] ||
        (rtm.channels[channelName] && !rtm.channels[channelName].joined)
      ) {
        console.log("Please Join first");
      }

      rtm
        .sendChannelMessage(this.msg, channelName)
        .then(() => {
          let msgObj = {
            accountName: rtm.accountName,
            channelMessage: this.msg,
            channelName: channelName,
          };
          this.msgList.push(msgObj);
          this.msg = "";
        })
        .catch((err) => {
          console.log(
            "Send message to channel " +
              channelName +
              " failed, please open console see more details."
          );
          console.error(err);
        });
    },
  },
};
</script>
<style scoped lang="less">
.chat-room {
  width: 100%;
  height: 59.375rem /* 950/16 */;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .msg-list {
    width: 100%;
    height: 90%;
    background-color: white;
    .send-row {
      display: flex;
      margin: 0.625rem /* 10/16 */ 0;
      .send-user {
        color: green;
        width: 6.25rem; /* 100/16 */
      }
      .send-msg {
      }
    }
  }
}

.send-area {
  display: flex;
}
</style>
