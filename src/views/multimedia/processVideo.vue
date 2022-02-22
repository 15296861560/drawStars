<template>
  <div>
    <div class="g-module-normal">
      <div class="m-block">
        <div class="m-block-title">{{ $t("module.media.video") }}</div>
        <div class="m-block-content2">
            <video ref="video" id="video" width="640" height="480" autoplay></video>
            <canvas ref="copyCanvas" width="320" height="240" />
            <canvas ref="showCanvas" width="320" height="240" />
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
      width: 640,
      height: 480,
    };
  },
  methods: {
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
        if (g > 100 && r > 100 && b < 43) frame.data[i * 4 + 3] = 0;
      }
      this.showContext.putImageData(frame, 0, 0);
      return;
    },
  },
  mounted() {
    this.doLoad();
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        video.srcObject = stream;
        this.video.play();
      });
    }
  },
};
</script>
<style></style>
