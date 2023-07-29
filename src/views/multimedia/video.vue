<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2023-07-27 23:16:59
 * @LastEditors: lgy
 * @LastEditTime: 2023-07-30 02:06:05
-->
<template>
  <el-row :gutter="20">
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
      <video id="videoPlayer" ref="videoPlayer" class="video-js video-container"></video>
    </el-col>
  </el-row>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, reactive } from "vue";
import "video.js/dist/video-js.css";
import videojs from "video.js";
import * as zh from "video.js/dist/lang/zh-CN.json";
const videoPlayer = ref(null);
const player = ref(null);
const option = reactive({
  controls: true, // 设置是否显示控制条，默认为true
  autoplay: false, // 设置是否自动播放，默认为false
  preload: "auto", // 设置预加载行为，可选值为auto、metadata或none
  poster: "//vjs.zencdn.net/v/oceans.png", // 设置视频封面图的URL
  // 指定要播放的视频源，可以是一个数组，每个元素包含src和type属性
  sources: [
    {
      src: "//vjs.zencdn.net/v/oceans.mp4",
      type: "video/mp4",
    },
  ],
  loop: true, // 是否循环播放
  language: "zh-CN", // 指定控制条的语言
  autoplay: true, // 设置自动播放
  muted: true, // 设置了它为true，才可实现自动播放,同时视频也被静音 （Chrome66及以上版本，禁止音视频的自动播放）
  preload: "auto", // 预加载
  controls: true, // 显示播放的控件
  fluid: true, // 自适应宽高
  playbackRates: [0.5, 1, 1.5, 2, 3, 4], //倍速播放
  controlBar: {
    // 设置控制条组件
    currentTimeDisplay: true,
    // 视频播放总时间
    durationDisplay: true,
    // 剩余时间
    remainingTimeDisplay: {
      displayNegative: false, // 默认情况下，剩余时间显示为负时间。不显示负号集
    },
    // 音量控制
    volumePanel: {
      inline: true, // 水平展示
    },
    // 组件位置
    children: [
      {
        // 播放/暂停按钮
        name: "playToggle",
      },
      {
        // 视频当前已播放时间
        name: "currentTimeDisplay",
      },
      {
        // 时间分隔符
        name: "timeDivider",
      },
      {
        // 视频播放总时间
        name: "durationDisplay",
      },
      {
        // 播放进度条
        name: "progressControl",
      },
      {
        // 剩余时间
        name: "remainingTimeDisplay",
      },
      {
        // 倍速播放
        name: "playbackRateMenuButton",
      },
      {
        // 音量控制
        name: "volumePanel",
      },
      {
        // 全屏
        name: "FullscreenToggle",
      },
    ],
  },
});

const onPlayerReady = function () {
  //在回调函数中，this代表当前播放器，
  //可以调用方法，也可以绑定事件。
  /**
   * 事件events    绑定事件用on    移除事件用off
   */
  this.on("suspend", function () {
    //延迟下载
    console.log("延迟下载");
  });
  this.on("loadstart", function () {
    //客户端开始请求数据
    console.log("客户端开始请求数据");
  });
  this.on("progress", function () {
    //客户端正在请求数据
    console.log("客户端正在请求数据");
  });
  this.on("abort", function () {
    //客户端主动终止下载（不是因为错误引起）
    console.log("客户端主动终止下载");
  });
  this.on("error", function () {
    //请求数据时遇到错误
    console.log("请求数据时遇到错误");
  });
  this.on("stalled", function () {
    //网速失速
    console.log("网速失速");
  });
  this.on("play", function () {
    //开始播放
    console.log("开始播放");
  });
  this.on("pause", function () {
    //暂停
    console.log("暂停");
  });
  this.on("loadedmetadata", function () {
    //成功获取资源长度
    console.log("成功获取资源长度");
  });
  this.on("loadeddata", function () {
    //渲染播放画面
    console.log("渲染播放画面");
  });
  this.on("waiting", function () {
    //等待数据，并非错误
    console.log("等待数据");
  });
  this.on("playing", function () {
    //开始回放
    console.log("开始回放");
  });
  this.on("canplay", function () {
    //可以播放，但中途可能因为加载而暂停
    console.log("可以播放，但中途可能因为加载而暂停");
  });
  this.on("canplaythrough", function () {
    //可以播放，歌曲全部加载完毕
    console.log("可以播放，歌曲全部加载完毕");
  });
  this.on("seeking", function () {
    //寻找中
    console.log("寻找中");
  });
  this.on("seeked", function () {
    //寻找完毕
    console.log("寻找完毕");
  });
  this.on("timeupdate", function () {
    //播放时间改变
    console.log("播放时间改变");
  });
  this.on("ended", function () {
    //播放结束
    console.log("播放结束");
  });
  this.on("ratechange", function () {
    //播放速率改变
    console.log("播放速率改变");
  });
  this.on("durationchange", function () {
    //资源长度改变
    console.log("资源长度改变");
  });
  this.on("volumechange", function () {
    //音量改变
    console.log("音量改变");
  });
};

onMounted(() => {
  videojs.addLanguage("zh-CN", zh);
  player.value = videojs(videoPlayer.value, option, onPlayerReady);
});

onBeforeUnmount(() => {
  if (player.value) {
    player.value.dispose();
  }
});
</script>
<style lang="less">
.video-container {
  width: 100%;
}
.vjs-live .vjs-time-control,
.vjs-live .vjs-time-divider,
.video-js .vjs-current-time,
.video-js .vjs-duration,
.vjs-time-divider {
  display: unset;
}
</style>
