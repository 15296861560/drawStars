<template>
  <div>
    <div class="g-module-normal">
      <div class="m-block">
        <div class="m-block-title">{{ $t("module.media.video") }}</div>
        <div class="top-part">
          <el-button size="medium" round type="success" @click="openVideo">
            <span>开启摄像头</span>
          </el-button>
          <el-button size="medium" round type="success" @click="closeVideo">
            <span>关闭摄像头</span>
          </el-button>
          <el-button size="medium" round type="success" @click="closeAllColor">
            <span>清空已选择的颜色</span>
          </el-button>
          <el-color-picker
            v-model="color"
            color-format="rgb"
            :predefine="predefineColors"
            @change="selectColor"
          >
          </el-color-picker>
          <div class="color-group">
            <div
              class="color-block"
              v-for="(c, index) in selectColorList"
              :key="index"
              :style="'background:' + c"
            ></div>
          </div>
        </div>

        <div class="m-block-content2">
          <div class="video-part">
            <div class="video-title">原视频水平翻转180度</div>
            <video
              ref="video"
              id="video"
              width="320"
              height="240"
              autoplay
              class="flip"
            ></video>
          </div>
          <div class="video-part">
            <div class="video-title">复制原视频的画布(可点击该画布选择处理的颜色)</div>
            <canvas
              ref="copyCanvas"
              width="320"
              height="240"
              @click="selectCanvasColor"
            />
          </div>
          <div class="video-part">
            <div class="video-title">处理后的画布</div>
            <canvas ref="showCanvas" width="320" height="240" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      video: {},
      canvas: {},
      copyCanvas: null,
      copyContext: null,
      showCanvas: null,
      showContext: null,
      width: 320,
      height: 240,
      color: "rgba(255, 69, 0, 0.68)",
      predefineColors: [
        "#ff4500",
        "#ff8c00",
        "#ffd700",
        "#90ee90",
        "#00ced1",
        "#1e90ff",
        "#c71585",
        "rgba(255, 69, 0, 0.68)",
        "rgb(255, 120, 0)",
        "hsv(51, 100, 98)",
        "hsva(120, 40, 94, 0.5)",
        "hsl(181, 100%, 37%)",
        "hsla(209, 100%, 56%, 0.73)",
        "#c7158577",
      ],
      selectColorList: [],
      rgbList: [],
    };
  },
  methods: {
    openVideo() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
          this.video.srcObject = stream;
          this.video.play();
        });
      }
    },
    closeVideo() {
      this.video.srcObject.getTracks()[0].stop();
    },
    selectColor() {
      let rgbStr = this.color.slice(4, -1);
      let rgb = rgbStr.split(",");
      rgb.forEach((element) => {
        element = Number(element);
      });

      let RGB = {
        r: rgb[0],
        g: rgb[1],
        b: rgb[2],
      };
      this.rgbList.push(RGB);
      this.selectColorList.push(this.color);
    },
    selectCanvasColor(e) {
      let imageData = this.copyContext.getImageData(e.offsetX, e.offsetY, 1, 1);
      let RGB = {
        r: imageData.data[0],
        g: imageData.data[1],
        b: imageData.data[2],
      };
      this.rgbList.push(RGB);
      this.selectColorList.push(`rgb(${RGB.r},${RGB.g},${RGB.b})`);
    },
    closeAllColor() {
      this.rgbList = [];
      this.selectColorList = [];
    },
    doLoad() {
      this.video = this.$refs.video;
      this.copyCanvas = this.$refs.copyCanvas;
      this.copyContext = this.copyCanvas.getContext("2d");
      this.showCanvas = this.$refs.showCanvas;
      this.showContext = this.showCanvas.getContext("2d");
      let self = this;
      this.video.addEventListener(
        "play",
        function () {
          self.timerCallback();
        },
        false
      );
    },
    timerCallback() {
      this.width = this.video.videoWidth / 2;
      this.height = this.video.videoHeight / 2;
      if (this.video.paused || this.video.ended) {
        return;
      }
      if (this.width && this.height) {
        this.computeFrame();
      }
      let self = this;
      setTimeout(function () {
        self.timerCallback();
      }, 0);
    },
    computeFrame() {
      this.copyContext.drawImage(this.video, 0, 0, this.width, this.height);
      let frame = this.copyContext.getImageData(0, 0, this.width, this.height);
      let l = frame.data.length / 4;

      for (let i = 0; i < l; i++) {
        let r = frame.data[i * 4 + 0];
        let g = frame.data[i * 4 + 1];
        let b = frame.data[i * 4 + 2];
        for (let j = 0, RGB = this.rgbList[0]; RGB; j++) {
          if (
            Math.abs(r - RGB.r) < 10 &&
            Math.abs(g - RGB.g) < 10 &&
            Math.abs(b - RGB.b) < 10
          ) {
            frame.data[i * 4 + 3] = 0;
            break;
          }
          RGB = this.rgbList[j];
        }
      }
      this.showContext.putImageData(frame, 0, 0);
      return;
    },
  },
  mounted() {
    this.doLoad();
    this.openVideo();
  },
  destroyed() {
    this.closeVideo();
  },
};
</script>
<style lang="less" scoped>
.color-group {
  display: flex;
  .color-block {
    height: 40px;
    width: 40px;
    border-radius: 4px;
  }
}

.flip {
  transform: rotateY(180deg);
}

.top-part {
  display: flex;
  align-items: center;

  margin-bottom: 10px;
}

.center-part {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}
.video-part {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
