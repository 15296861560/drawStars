<template>
  <div>
    <div class="g-module-normal">
      <div class="m-block">
        <div class="m-block-title">{{$t("module.media.audio")}}</div>
        <div class="m-block-content2">
          <el-button size="medium" round type="success u-el-icon-auqa" @click="playMusic">
            <i
              :class="
                (Music ? 'el-icon-video-pause' : 'el-icon-video-play') +
                ' fontsize-16'
              "
            ></i>
            <span>{{Music ?$t("btn.pause"):$t("btn.play")}}</span>
          </el-button>
          <audio width="320" height="240" controls class="ml40" ref="music">
            <source :src="musicSrc" type="audio/mpeg" />
          </audio>
        </div>
      </div>
      <div class="m-block">
        <div class="m-block-title">{{$t("module.media.video")}}</div>
        <div class="m-block-content2">
          <el-button size="medium" round type="success u-el-icon-auqa" @click="playVideo">
            <i
              :class="
                (Video ? 'el-icon-video-pause' : 'el-icon-video-play') +
                ' fontsize-16'
              "
            ></i>
            <span>{{Video ?$t("btn.pause"):$t("btn.play")}}</span>
          </el-button>
          <video width="320" height="240" controls class="ml40" ref="video">
            <source :src="videoSrc" type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      playing: false,
      Music: false,
      Video: false,
      musicSrc:
        "http://lgy-lgy.cn-bj.ufileos.com/drawStars/multimedia/music/回小仙 - 醒不来的梦.mp3?UCloudPublicKey=mzdHRbIdeChTJqpz3gzop2E3NbCVEFq4T5WJMpTi&Signature=7XuIhl3ckkh939SMPyVUxvbH3h0%3D&Expires=1611883345",
      videoSrc:
        "http://lgy-lgy.cn-bj.ufileos.com/drawStars/multimedia/video/movie.ogg?UCloudPublicKey=mzdHRbIdeChTJqpz3gzop2E3NbCVEFq4T5WJMpTi&Signature=g%2B6ES21eMBWi%2Fpr7FwH06jxox2w%3D&Expires=1611883833",
    };
  },
  methods: {
    playMusic() {
      let audio = this.$refs.music;
      if (this.Music) {
        this.Music = false;
        audio.pause();
      } else {
        this.Music = true;
        audio.play();
      }
    },
    playVideo() {
      let audio = this.$refs.video;
      if (this.Video) {
        this.Video = false;
        audio.pause();
      } else {
        this.Video= true;
        audio.play();
      }
    },
  },
};
</script>
<style></style>
