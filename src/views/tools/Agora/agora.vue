<template>
  <div>
    <el-form :inline="true" :model="localUser">
      <el-form-item label="账户">
        <el-input
          v-model="localUser.account"
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
        <el-button size="medium" type="success" @click="join">
          <span>加入</span>
        </el-button>
        <el-button size="medium" type="success" @click="exit">
          <span>退出</span>
        </el-button>
      </el-form-item>
    </el-form>
    <div>
      <el-button size="medium" type="success" @click="openVideo">
        <span>打开视频</span>
      </el-button>
      <el-button size="medium" type="success" @click="closeVideo">
        <span>关闭视频</span>
      </el-button>
      <el-button size="medium" type="success" @click="openAudio">
        <span>打开麦克风</span>
      </el-button>
      <el-button size="medium" type="success" @click="closeAudio">
        <span>关闭麦克风</span>
      </el-button>
      <el-button size="medium" type="success" @click="shareScreen">
        <span>共享屏幕</span>
      </el-button>
      <el-button size="medium" type="success" @click="closeShare">
        <span>关闭屏幕共享</span>
      </el-button>
      <el-button size="medium" type="success" @click="showSetting = true">
        <span> 音视频设备测试 </span>
      </el-button>
      <el-button size="medium" type="success" @click="">
        <span> 调整通话音量 </span>
      </el-button>
    </div>

    <el-row class="video-row">
      <div
        class="window"
        v-for="(user, index) in userList"
        :key="index"
        :id="`user-${user.uid}`"
      ></div>
    </el-row>

    <el-row class="video-row">
      <el-col :xs="24" :sm="12" class="local-video">
        <h1>本地视频</h1>
        <div class="window" ref="video"></div>
      </el-col>
      <el-col :xs="24" :sm="12" class="local-video">
        <h1>本地屏幕</h1>
        <div class="window" ref="screen"></div>
      </el-col>
    </el-row>

    <mediaSettings
      v-show="showSetting"
      :showDialog="showSetting"
      @confirm="selectDevice"
    ></mediaSettings>
  </div>
</template>
<script>
const agoraConfig = require("./agora-config.js");
import AgoraRTC from "agora-rtc-sdk-ng";
import mediaSettings from "./mediaSettings.vue";
export default {
  components: {
    mediaSettings,
  },
  data() {
    return {
      rtc: {
        localAudioTrack: null,
        localVideoTrack: null,
        client: null,
        screenClient: null,
      },
      options: null,
      localUser: {
        account: "",
        channelName: "",
        role: "PUBLISHER",
      },
      users: {},

      client: null,
      showSetting: false,
      deviceObj: {
        cameraId: "",
        microphoneId: "",
        playbackDeviceId: "",
      },
      rtcToken: "",
    };
  },
  computed: {
    userList() {
      return Object.values(this.users);
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      this.rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      this.bindEvent();
    },
    async getRTCToken(account, channelName, role) {
      let rtcToken = "";
      await this.$axios(
        { user: account, channelName, role },
        "/agoraApi/getRTCToken"
      ).then((res) => {
        if (res.status) {
          rtcToken = res.data;
          this.rtcToken = res.data;
        } else {
          throw new Error("getRTCToken fail");
        }
      });

      return rtcToken;
    },
    bindEvent() {
      this.rtc.client.on("user-published", async (user, mediaType) => {
        if (user.uid.indexOf(this.options.uid) > -1) return;
        await this.rtc.client.subscribe(user, mediaType);
        console.log("发布成功");
        this.$set(this.users, user.uid, user);
        if (mediaType === "video") {
          const remoteVideoTrack = user.videoTrack;
          this.$nextTick(() => {
            const remotePlayerEl = document.getElementById(`user-${user.uid}`);
            remotePlayerEl && remoteVideoTrack.play(remotePlayerEl);
          });
        }
        if (mediaType === "audio") {
          const remoteAudioTrack = user.audioTrack;
          remoteAudioTrack.play();
        }
        this.rtc.client.on("user-unpublished", (user) => {
          const remotePlayerEl = document.getElementById(`user-${user.uid}`);
          remotePlayerEl && remotePlayerEl.remove();
        });
      });
    },
    async join() {
      const { account, channelName, role } = this.localUser;
      this.options = {
        appId: agoraConfig.appId,
        channel: channelName,
        token: await this.getRTCToken(account, channelName, role),
        uid: account,
      };
      const { appId, channel, token, uid } = this.options;
      await this.rtc.client.join(appId, channel, token, uid);
    },
    exit() {
      this.rtc.client.leave();
    },
    async openVideo() {
      if (this.rtc.localVideoTrack) {
        // 恢复摄像头采集
        this.rtc.localVideoTrack.setEnabled(true);
        return;
      }
      this.rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
        cameraId: this.deviceObj.cameraId,
      });
      await this.rtc.client.publish([this.rtc.localVideoTrack]);

      const localPlayerContainer = this.$refs.video;
      this.rtc.localVideoTrack.play(localPlayerContainer);
    },
    async openAudio() {
      this.rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        microphoneId: this.deviceObj.microphoneId,
      });
      await this.rtc.client.publish([this.rtc.localAudioTrack]);
    },
    closeVideo() {
      // this.rtc.localVideoTrack.close();
      this.rtc.localVideoTrack.setEnabled(false);
    },
    closeAudio() {
      this.rtc.localAudioTrack.close();
    },
    async shareScreen() {
      if (!this.rtc.screenClient) {
        const { appId, channel, uid } = this.options;

        const account = this.options.uid + "_screen";
        this.options.token = await this.getRTCToken(
          account,
          channel,
          this.localUser.role
        );
        const token = this.options.token;
        this.rtc.screenClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        await this.rtc.screenClient.join(appId, channel, token, account);
      }

      this.rtc.localSreenTrack = await AgoraRTC.createScreenVideoTrack();
      await this.rtc.screenClient.publish(this.rtc.localSreenTrack);
      const localPlayerContainer = this.$refs.screen;
      this.rtc.localSreenTrack.play(localPlayerContainer);
    },
    closeShare() {
      this.rtc.localSreenTrack.close();
    },
    // 选择设备
    selectDevice(deviceObj) {
      Object.assign(this.deviceObj, deviceObj);
      this.rtc.localVideoTrack &&
        this.rtc.localVideoTrack.setDevice(this.deviceObj.cameraId);
      this.rtc.localAudioTrack &&
        this.rtc.localAudioTrack.setDevice(this.deviceObj.microphoneId);
    },
  },
};
</script>

<style scoped lang="less">
.window {
  width: 6.25rem /* 100/16 */;
  height: 6.25rem /* 100/16 */;
  margin: 0.625rem; /* 10/16 */
}
.video-row {
  margin-top: 0.625rem /* 10/16 */;
  display: flex;

  .local-video {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
