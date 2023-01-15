<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-12-31 10:35:17
 * @LastEditors: lgy
 * @LastEditTime: 2023-01-15 23:15:59
-->

<template>
  <canvas ref="mycanvas" class="fireworks"></canvas>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { random, bloom, Firework, Particle } from "./fireworks.js";
import { animationFrame } from "@/utils/canvas/canvasCompatible.js";
let mycanvas = ref(null);
let area = ref(null);
//转换成2d模型
let ctx = null;
//烟花数组
let hue = 120; //设置颜色范围
let timerTick = 0; //计时器
let timerTotal = 5; //每间隔5秒烟花绽放一次
let fireworks = []; //存放烟花数组
let particles = []; //存放碎屑数组
let requestId = 0;

//获取屏幕的宽和高
let clientw = document.documentElement.clientWidth;
let clienth = document.documentElement.clientHeight;
function loop() {
  // 并让浏览器在下一次重绘之前调用指定的函数来更新动画。
  requestId = requestAnimationFrame(loop);

  hue += 0.5;
  //在源图像外显示目标图像。只有源图像外的目标图像部分会被显示，源图像是透明的。
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillRect(0, 0, clientw, clienth);
  ctx.fillStyle = "rgb(0,0,0,0.5)";
  //显示源图像和目标图像。
  ctx.globalCompositeOperation = "lighter";
  let i = fireworks.length;

  while (i--) {
    fireworks[i].draw(ctx);
    fireworks[i].update(i, fireworks, particles);
  }

  bloom(ctx, particles);

  //此时，我们还没有创建任何的烟花。我们希望设置一个定时时间timerTotal，周期性的
  // 产生一个烟花，我们也需要一个时间计数timerTick，在每次帧更新的时候加1，记下帧更新的次数。
  if (timerTick >= timerTotal) {
    fireworks.push(
      new Firework(clientw / 2, clienth, random(0, clientw), random(0, clienth), hue)
    );
    timerTick = 0;
  } else {
    timerTick++;
  }
}
onMounted(() => {
  animationFrame();
  //获取canvas区域.并设置宽和高
  let area = mycanvas.value;
  area.width = document.documentElement.clientWidth;
  area.height = document.documentElement.clientHeight;
  ctx = area.getContext("2d");
  loop();
});

onUnmounted(() => {
  cancelAnimationFrame(requestId);
});
</script>

<style lang="less" scoped>
.fireworks {
  border-radius: 4px;
  width: 100%;
  height: 70vh;
}
</style>
