<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:22
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-06 00:08:38
-->
<template>
  <div>
    <div class="g-module-normal">
      <div class="m-block">
        <div class="m-block-title">{{ $t("module.media.video") }}</div>
        <div class="m-block-content2">
          <div>
            <video ref="video" id="video" width="640" height="480" autoplay></video>
          </div>
          <div style="display: flex; justify-content: center">
            <el-button size="default" id="snap" v-on:click="capture()">{{
              $t("btn.capture")
            }}</el-button>
          </div>
          <canvas ref="canvas" id="canvas" width="640" height="480"></canvas>
          <ul>
            <li v-for="(c, index) in captures" :key="index">
              <img v-bind:src="c" height="50" />
            </li>
          </ul>
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
      captures: [],
    };
  },
  methods: {
    capture() {
      this.canvas = this.$refs.canvas;
      var context = this.canvas.getContext("2d").drawImage(this.video, 0, 0, 640, 480);
      this.captures.push(canvas.toDataURL("image/png"));
    },
  },
  mounted() {
    this.video = this.$refs.video;
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
