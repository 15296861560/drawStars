<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-13 01:02:46
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-19 23:09:50
-->
<template>
  <div class="love-bg center-flex">
    <canvas id="loveBG" ref="loveBG" style="width: 100%; height: 100%"></canvas>
  </div>
</template>
<script>
import { Point, Particle, ParticlePool } from "./love.js";
export default {
  data() {
    return {
      settings: {
        particles: {
          length: 500,
          duration: 2,
          velocity: 100, //速度
          // effect: -0.75,
          size: 30, //小爱心尺寸
        },
      },
      loveBG: null,
      loveBGContext: null,
      image: null,
      time: null,
      loveColor: "#ea80b0",
    };
  },
  methods: {
    // requestAnimationFrame不兼容时的降级策略
    compatible() {
      let vendors = ["webkit", "moz"];
      for (let i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
        let vp = vendors[i];
        window.requestAnimationFrame = window[vp + "RequestAnimationFrame"];
        window.cancelAnimationFrame =
          window[vp + "CancelAnimationFrame"] ||
          window[vp + "CancelRequestAnimationFrame"];
      }
      if (
        /iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || // iOS6 is buggy
        !window.requestAnimationFrame ||
        !window.cancelAnimationFrame
      ) {
        let lastTime = 0;
        window.requestAnimationFrame = function (callback) {
          let now = Date.now();
          let nextTime = Math.max(lastTime + 16, now);
          return setTimeout(function () {
            callback((lastTime = nextTime));
          }, nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
      }
    },
    paint() {
      let settings = this.settings;

      // 背景
      this.loveBG = this.$refs.loveBG;
      this.loveBGContext = this.loveBG.getContext("2d");

      this.particles = new ParticlePool(settings.particles.length);
      this.particleRate = settings.particles.length / settings.particles.duration;

      let littleLoveCanvas = document.createElement("canvas");
      let littleLoveContext = littleLoveCanvas.getContext("2d");
      littleLoveCanvas.width = settings.particles.size;
      littleLoveCanvas.height = settings.particles.size;

      littleLoveContext.beginPath();
      let t = -Math.PI;
      let point = this.to(t);
      littleLoveContext.moveTo(point.x, point.y);
      while (t < Math.PI) {
        t += 0.01;
        point = this.to(t);
        littleLoveContext.lineTo(point.x, point.y);
      }
      littleLoveContext.closePath();
      littleLoveContext.fillStyle = this.loveColor;
      littleLoveContext.fill();

      this.image = new Image();
      this.image.src = littleLoveCanvas.toDataURL();

      let onResize = () => {
        this.loveBG.width = this.loveBG.clientWidth;
        this.loveBG.height = this.loveBG.clientHeight;
      };

      window.onresize = onResize;

      setTimeout(() => {
        onResize();
        this.render();
      }, 10);
    },
    pointOnHeart(t) {
      return new Point(
        160 * Math.pow(Math.sin(t), 3),
        130 * Math.cos(t) -
          50 * Math.cos(2 * t) -
          20 * Math.cos(3 * t) -
          10 * Math.cos(4 * t) +
          25
      );
    },
    to(t) {
      let settings = this.settings;
      let point = this.pointOnHeart(t);
      point.x = settings.particles.size / 2 + (point.x * settings.particles.size) / 350;
      point.y = settings.particles.size / 2 - (point.y * settings.particles.size) / 350;
      return point;
    },
    render() {
      let settings = this.settings;
      let particles = this.particles;
      let particleRate = this.particleRate;

      let newTime = new Date().getTime() / 1000,
        deltaTime = newTime - (this.time || newTime);
      this.time = newTime;

      this.loveBGContext.clearRect(0, 0, this.loveBG.width, this.loveBG.height);

      let amount = particleRate * deltaTime;
      for (let i = 0; i < amount; i++) {
        let pos = this.pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
        let dir = pos.clone().length(settings.particles.velocity);
        particles.add(
          this.loveBG.width / 2 + pos.x,
          this.loveBG.height / 2 - pos.y,
          dir.x,
          -dir.y
        );
      }

      particles.update(deltaTime);

      particles.draw(this.loveBGContext, this.image);

      requestAnimationFrame(this.render);
    },
  },
  mounted() {
    this.compatible();
    this.paint();
  },
};
</script>
<style scoped>
.love-bg {
  background-color: black;
  border-radius: 4px;
  width: 100%;
  height: 70vh;
}
</style>
