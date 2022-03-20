<template>
  <div v-show="showSetting">
    <div class="dialog-mask" @click="cancel"></div>
    <div class="setting-dialog" id="dialog">
      <div class="dialog-top">
        <div>设备调试</div>
        <i class="el-icon-close dialog-close" @click="cancel"></i>
      </div>
      <div class="dialog-main">
        <div class="dialog-camera">
          <video class="video-window" ref="video" id="video" autoplay></video>
          <i v-show="!isOpenViveo" class="el-icon-user-solid video-user"></i>
          <div class="debug-btns">
            <div
              class="icon icon-mic"
              :class="isMicrophoneTesting ? 'icon-mic' : 'icon-mic-off'"
              @click="testMicrophone"
            ></div>
            <div
              class="icon"
              :class="isOpenViveo ? 'icon-video' : 'icon-video-off'"
              @click="debugCamera"
            ></div>
          </div>
        </div>
        <div class="dialog-setting">
          <el-form ref="form" label-width="80px" label-position="left">
            <el-form-item label="摄像头">
              <el-select v-model="cameraId" placeholder="请选择摄像头">
                <el-option
                  v-for="item in cameras"
                  :key="item.deviceId"
                  :label="item.label"
                  :value="item.deviceId"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="麦克风">
              <el-select v-model="microphoneId" placeholder="请选麦克风">
                <el-option
                  v-for="item in microphones"
                  :key="item.deviceId"
                  :label="item.label"
                  :value="item.deviceId"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="扬声器">
              <el-select v-model="playbackDeviceId" placeholder="请选择扬声器">
                <el-option
                  v-for="item in playbackDevices"
                  :key="item.deviceId"
                  :label="item.label"
                  :value="item.deviceId"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>

          <div class="debugging">
            <div class="setting-row pointer" @click="testPlayer">
              <i class="el-icon-headset mr10"></i>
              <span>试听</span>
              <audio controls style="display: none" ref="music">
                <source src="@/assets/audio/horse.mp3" type="audio/mpeg" />
              </audio>
            </div>
            <div class="setting-row">
              <i
                class="mr10 pointer"
                :class="
                  isMicrophoneTesting
                    ? 'el-icon-microphone'
                    : 'el-icon-turn-off-microphone'
                "
                @click="testMicrophone"
              ></i>
              <div class="progress-bg">
                <div class="progress" :style="{ width: volumeLevel + '%' }"></div>
              </div>
            </div>
            <el-button size="medium" type="success" @click="confirm">
              <span>确定</span>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AgoraRTC from "agora-rtc-sdk-ng";
export default {
  name: "MediaSettings",
  props: {
    showSetting: Boolean,
  },

  data() {
    return {
      cameraId: "",
      cameras: [],
      microphoneId: "",
      microphones: [],
      playbackDeviceId: "",
      playbackDevices: [],
      volumeLevel: 0,
      isMicrophoneTesting: false,
      mediaStreamTrack: null,
      isOpenViveo: false,
    };
  },
  methods: {
    init() {
      this.getDevices();
    },
    // 获取设备列表
    getDevices() {
      AgoraRTC.getCameras().then((devices) => {
        this.cameras = devices;
        if (devices.length) {
          this.cameraId = devices[0].deviceId;
        }
      });
      AgoraRTC.getMicrophones().then((devices) => {
        this.microphones = devices;
        if (devices.length) {
          this.microphoneId = devices[0].deviceId;
        }
      });
      AgoraRTC.getPlaybackDevices().then((devices) => {
        this.playbackDevices = devices;
        if (devices.length) {
          this.playbackDeviceId = devices[0].deviceId;
        }
      });
    },
    debugCamera() {
      if (!this.cameraId) {
        return;
      }
      this.isOpenViveo = !this.isOpenViveo;
      if (this.isOpenViveo) {
        this.playVideo();
      } else {
        this.stopVideo();
      }
    },
    // 播放视频
    playVideo() {
      let video = this.$refs.video;

      AgoraRTC.createCameraVideoTrack({ cameraId: this.cameraId }).then((videoTrack) => {
        this.mediaStreamTrack = videoTrack.getMediaStreamTrack();
        video.srcObject = new MediaStream([this.mediaStreamTrack]);
        video.play();
      });
    },
    // 停止播放
    stopVideo() {
      let video = this.$refs.video;
      if (!video || !video.srcObject) {
        return;
      }
      this.mediaStreamTrack.stop();
      video.srcObject = null;
    },
    // 扬声器测试
    testPlayer() {
      let audio = this.$refs.music;
      audio.play();
    },
    // 麦克风测试
    testMicrophone() {
      this.isMicrophoneTesting = !this.isMicrophoneTesting;
      if (!this.isMicrophoneTesting) {
        return;
      }
      AgoraRTC.createMicrophoneAudioTrack({ microphoneId: this.microphoneId }).then(
        (audioTrack) => {
          setInterval(() => {
            this.volumeLevel = audioTrack.getVolumeLevel() * 100;
            if (!this.isMicrophoneTesting) {
              audioTrack.stop();
              this.volumeLevel = 0;
            }
          }, 500);
        }
      );
    },
    cancel() {
      this.$parent.showSetting = false;
    },
    confirm() {
      this.$parent.showSetting = false;
      let obj = {
        cameraId: this.cameraId,
        microphoneId: this.microphoneId,
        playbackDeviceId: this.playbackDeviceId,
      };
      this.$emit("confirm", obj);
    },
  },
  mounted() {},
  created() {
    this.init();
  },
};
</script>

<style lang="less" scoped>
.dialog-mask {
  background-color: black;
  opacity: 0.5;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.pointer {
  cursor: pointer;
}

.setting-dialog {
  display: flex;
  flex-direction: column;
  position: absolute;
  z-index: 11;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  box-sizing: border-box;
  width: 60rem /* 960/16 */;
  height: 29.5rem /* 472/16 */;
  border-radius: 4px;
  padding: 2rem /* 32/16 */;
  overflow: auto;
  background: @color-bg;
  .dialog-top {
    display: flex;
    justify-content: space-between;
    width: calc(100%-2.5rem);
    height: 1.5rem /* 24/16 */;
    font-size: 1.25rem /* 20/16 */;
    margin-bottom: 1.5rem /* 24/16 */;
    .dialog-title {
      height: 1.5rem /* 24/16 */;
      line-height: 1.5rem /* 24/16 */;
      font-size: 1.25rem /* 20/16 */;
      color: @color-text-normal;
      font-weight: bold;
    }
    .dialog-close {
      width: 1rem /* 16/16 */;
      height: 1rem /* 16/16 */;
      &:hover {
        color: @color-icon-hover;
      }
      &:active {
        color: @color-icon-active;
      }
    }
  }
  .dialog-main {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  .dialog-camera {
    background-color: @color-gray-scale-14;
    width: 31.125rem /* 498/16 */;
    height: 22.5rem /* 360/16 */;
    border-radius: 4px;
    position: relative;
    .video-user {
      color: @color-gray-scale-3;
      font-size: 3rem /* 48/16 */;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }
  .video-window {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: @color-gray-scale-13;
  }
  .debug-btns {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    z-index: 2;
    left: 1rem /* 16/16 */;
    bottom: 1rem /* 16/16 */;
    box-sizing: border-box;
    padding: 0.5rem /* 8/16 */ 0.75rem /* 12/16 */;
    width: 5rem /* 80/16 */;
    height: 2.5rem /* 40/16 */;
    border-radius: 1.375rem /* 22/16 */;
    background-color: @color-mask-shadow;
  }

  .dialog-setting {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 23.375rem /* 374/16 */;
    .setting-row {
      display: flex;
      align-items: center;
      height: 2.5rem /* 40/16 */;
      margin-bottom: 1rem /* 16/16 */;
    }
  }

  .volume-setting {
    display: flex;
    font-size: 0.75rem /* 12/16 */;
    color: @color-text-normal;
  }
  .volume-option {
    font-size: 0.75rem /* 12/16 */;
    margin-left: 0.75rem /* 12/16 */;
  }

  .progress-bg {
    width: 10rem /* 160/16 */;
    height: 0.5rem /* 8/16 */;
    background: @color-gray-scale-4;
    border-radius: 100px;
  }
  .progress {
    height: 0.5rem /* 8/16 */;
    background: @color-success;
    border-radius: 6.25rem /* 100/16 */;
    transition: all ease 1s;
  }

  .empty-video-container {
    width: 4rem /* 64/16 */;
    height: 4rem /* 64/16 */;
    background: @color-icon-normal;
    border-radius: 50%;
  }
}
.icon {
  cursor: pointer;
  width: 1rem /* 16/16 */;
  height: 1rem; /* 16/16 */
  background-size: 100%;
  background-repeat: no-repeat;
}

.icon-mic {
  background-image: url("../../../assets/img/tools/agora/mic-on.svg");
  &:hover {
    background-image: url("../../../assets/img/tools/agora/mic-on__hover.svg");
  }
}
.icon-mic-off {
  background-image: url("../../../assets/img/tools/agora/mic-off.svg");
  &:hover {
    background-image: url("../../../assets/img/tools/agora/mic-off__hover.svg");
  }
}
.icon-video {
  background-image: url("../../../assets/img/tools/agora/video-on.svg");
  &:hover {
    background-image: url("../../../assets/img/tools/agora/video-on__hover.svg");
  }
}
.icon-video-off {
  background-image: url("../../../assets/img/tools/agora/video-off.svg");
  &:hover {
    background-image: url("../../../assets/img/tools/agora/video-off__hover.svg");
  }
}
</style>
