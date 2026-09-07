<template>
  <div>
    <div class="g-module-normal">
      <div class="g-flex-column">
        <div class="m-block">
          <div class="m-block-title">动画</div>
          <div class="m-block-content">
            <div class="m-content-title">基本</div>
            <div class="g-flex-normal">
              <div class="m-card-transition discolor">变色</div>
              <div class="m-card-transition fade-in">渐显</div>
              <div class="m-card-transition slide">滑动</div>
              <div class="m-card-transition rotate">旋转</div>
              <div class="m-card-transition scale">缩放</div>
              <div class="m-card-transition skew">倾斜</div>
              <div class="m-card-transition transshape">变形</div>
              <div class="m-card-transition gradients">渐变色</div>
              <div class="m-card-transition opacityColor">动画透明色</div>
              <div class="m-card-transition bounce">弹跳</div>
              <div class="m-card-transition shake">抖动</div>
              <div class="m-card-transition pulse">脉冲</div>
              <div class="m-card-transition flip">翻转</div>
              <div class="m-card-transition swing">摆动</div>
              <div class="m-card-transition wobble">摇晃</div>
            </div>
          </div>
          <div class="m-block-content">
            <div class="m-content-title">结合</div>
            <div class="g-flex-normal">
              <div class="m-card-transition rotate-scale">旋转缩放</div>
              <div class="m-card-transition slide-rotate">滑动旋转</div>
              <div class="m-card-transition fade-scale">渐隐缩放</div>
              <div class="m-card-transition bounce-rotate">弹跳旋转</div>
              <div class="m-card-transition color-rotate">变色旋转</div>
              <div class="m-card-transition slide-fade">滑动渐隐</div>
            </div>
          </div>
          <div class="m-block-content">
            <div class="m-content-title">高阶</div>
            <div class="g-flex-normal">
              <div class="m-card-transition tracking-in-expand">文字展开</div>
              <div class="m-card-transition text-blur-out">模糊消失</div>
              <div class="m-card-transition flicker">闪烁</div>
              <div class="m-card-transition heartbeat">心跳</div>
              <div class="m-card-transition jello">果冻</div>
              <div class="m-card-transition rubber-band">橡皮筋</div>
              <div class="m-card-transition tada">抖动放大</div>
              <div class="m-card-transition roll-in">滚入</div>
              <div class="m-card-transition slide-in-blurred-left">
                模糊滑入
              </div>
              <div class="m-card-transition rotate-scale-up">旋转放大</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {}
  },
  methods: {}
}
</script>
<style lang="less" scoped>
.discolor {
  animation: discolor;
  // 规定动画完成一个周期所花费的秒或毫秒。默认是 0
  animation-duration: 5s;
  // 规定动画的速度曲线。默认是 "ease"
  animation-timing-function: linear;
  // 规定动画被播放的次数。默认是 1
  animation-iteration-count: infinite;
}

@keyframes discolor {
  0% {
    background: red;
  }
  25% {
    background: yellow;
  }
  50% {
    background: blue;
  }
  100% {
    background: green;
  }
}

.fade-in {
  animation: fade-in 5s;
  // 规定动画被播放的次数。默认是 1
  animation-iteration-count: infinite;
}

@keyframes fade-in {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.slide {
  animation: slide 5s;
  // 规定动画被播放的次数。默认是 1
  animation-iteration-count: infinite;
  position: relative;
}

@keyframes slide {
  0% {
    left: 0px;
    top: 0px;
  }
  25% {
    left: 30px;
    top: 0px;
  }
  50% {
    left: 30px;
    top: 30px;
  }
  75% {
    left: 0px;
    top: 30px;
  }
  100% {
    left: 0px;
    top: 0px;
  }
}

.rotate {
  animation: rotate 5s;
  // 规定动画被播放的次数。默认是 1
  animation-iteration-count: infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.scale {
  animation: scale 5s;
  // 规定动画被播放的次数。默认是 1
  animation-iteration-count: infinite;
}

@keyframes scale {
  0% {
    transform: scale(1, 1);
  }
  25% {
    transform: scale(0.5, 0.5);
  }
  50% {
    transform: scale(1, 1);
  }
  75% {
    transform: scale(1.5, 1.5);
  }
  100% {
    transform: scale(1, 1);
  }
}

.skew {
  animation: skew 5s;
  // 规定动画被播放的次数。默认是 1
  animation-iteration-count: infinite;
}

@keyframes skew {
  0% {
    transform: skew(0deg, 0deg);
  }
  25% {
    transform: skew(40deg, 40deg);
  }
  50% {
    transform: skew(40deg, -40deg);
  }
  75% {
    transform: skew(-40deg, -40deg);
  }
  100% {
    transform: skew(0deg, 0deg);
  }
}

.transshape {
  animation: transshape 5s;
  // 规定动画被播放的次数。默认是 1
  animation-iteration-count: infinite;
}

@keyframes transshape {
  25% {
    width: 75px;
  }
  50% {
    height: 75px;
  }
  75% {
    border-radius: 50px;
  }
}

.gradients {
  animation: gradients 5s;
  // 规定动画被播放的次数。默认是 1
  animation-iteration-count: infinite;
}

@keyframes gradients {
  0% {
    background-image: linear-gradient(to top, red, yellow, blue);
  }
  12.5% {
    background-image: linear-gradient(45deg, red, yellow, blue);
  }
  25% {
    background-image: linear-gradient(90deg, red, yellow, blue);
  }
  37.5% {
    background-image: linear-gradient(to bottom right, red, yellow, blue);
  }
  50% {
    background-image: linear-gradient(to bottom, red, yellow, blue);
  }
  62.50% {
    background-image: linear-gradient(to bottom left, red, yellow, blue);
  }
  75% {
    background-image: linear-gradient(to left, red, yellow, blue);
  }
  87.5% {
    background-image: linear-gradient(to top left, red, yellow, blue);
  }
  100% {
    background-image: linear-gradient(to top, red, yellow, blue);
  }
}

.opacityColor {
  animation: opacityColor 1s -0.3s linear paused;
}
@keyframes opacityColor {
  0% {
    background-color: transparent;
  }
  100% {
    background-color: aqua;
  }
}

/* 弹跳 */
.bounce {
  animation: bounce 2s ease infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}

/* 抖动 */
.shake {
  animation: shake 1s ease infinite;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-10px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(10px);
  }
}

/* 脉冲 */
.pulse {
  animation: pulse 2s ease infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1, 1);
  }
  50% {
    transform: scale(1.2, 1.2);
  }
  100% {
    transform: scale(1, 1);
  }
}

/* 翻转 */
.flip {
  animation: flip 2s ease infinite;
}

@keyframes flip {
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(180deg);
  }
  100% {
    transform: rotateY(360deg);
  }
}

/* 摆动 */
.swing {
  animation: swing 2s ease infinite;
  transform-origin: top center;
}

@keyframes swing {
  20% {
    transform: rotate(15deg);
  }
  40% {
    transform: rotate(-10deg);
  }
  60% {
    transform: rotate(5deg);
  }
  80% {
    transform: rotate(-5deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

/* 摇晃 */
.wobble {
  animation: wobble 2s ease infinite;
}

@keyframes wobble {
  0%,
  100% {
    transform: translateX(0%);
  }
  15% {
    transform: translateX(-25%) rotate(-5deg);
  }
  30% {
    transform: translateX(20%) rotate(3deg);
  }
  45% {
    transform: translateX(-15%) rotate(-3deg);
  }
  60% {
    transform: translateX(10%) rotate(2deg);
  }
  75% {
    transform: translateX(-5%) rotate(-1deg);
  }
}

/* 旋转缩放 */
.rotate-scale {
  animation: rotateScale 3s ease infinite;
}

@keyframes rotateScale {
  0% {
    transform: rotate(0deg) scale(1, 1);
  }
  50% {
    transform: rotate(180deg) scale(1.5, 1.5);
  }
  100% {
    transform: rotate(360deg) scale(1, 1);
  }
}

/* 滑动旋转 */
.slide-rotate {
  animation: slideRotate 3s ease infinite;
  position: relative;
}

@keyframes slideRotate {
  0% {
    left: 0px;
    transform: rotate(0deg);
  }
  25% {
    left: 30px;
    transform: rotate(90deg);
  }
  50% {
    left: 0px;
    transform: rotate(180deg);
  }
  75% {
    left: -30px;
    transform: rotate(270deg);
  }
  100% {
    left: 0px;
    transform: rotate(360deg);
  }
}

/* 渐隐缩放 */
.fade-scale {
  animation: fadeScale 3s ease infinite;
}

@keyframes fadeScale {
  0% {
    opacity: 1;
    transform: scale(1, 1);
  }
  50% {
    opacity: 0.3;
    transform: scale(1.5, 1.5);
  }
  100% {
    opacity: 1;
    transform: scale(1, 1);
  }
}

/* 弹跳旋转 */
.bounce-rotate {
  animation: bounceRotate 2s ease infinite;
}

@keyframes bounceRotate {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(90deg);
  }
  50% {
    transform: translateY(0) rotate(180deg);
  }
  75% {
    transform: translateY(-20px) rotate(270deg);
  }
}

/* 变色旋转 */
.color-rotate {
  animation: colorRotate 3s ease infinite;
}

@keyframes colorRotate {
  0% {
    background-color: #f5f8fb;
    transform: rotate(0deg);
  }
  25% {
    background-color: aqua;
    transform: rotate(90deg);
  }
  50% {
    background-color: greenyellow;
    transform: rotate(180deg);
  }
  75% {
    background-color: pink;
    transform: rotate(270deg);
  }
  100% {
    background-color: #f5f8fb;
    transform: rotate(360deg);
  }
}

/* 滑动渐隐 */
.slide-fade {
  animation: slideFade 3s ease infinite;
  position: relative;
}

@keyframes slideFade {
  0% {
    left: 0px;
    opacity: 1;
  }
  25% {
    left: 30px;
    opacity: 0.5;
  }
  50% {
    left: 0px;
    opacity: 0;
  }
  75% {
    left: -30px;
    opacity: 0.5;
  }
  100% {
    left: 0px;
    opacity: 1;
  }
}

/* 文字展开（tracking-in-expand） */
.tracking-in-expand {
  animation: trackingInExpand 2s ease infinite;
}

@keyframes trackingInExpand {
  0% {
    letter-spacing: -0.5em;
    opacity: 0;
  }
  40% {
    opacity: 0.6;
  }
  100% {
    letter-spacing: 0.3em;
    opacity: 1;
  }
}

/* 模糊消失（text-blur-out） */
.text-blur-out {
  animation: textBlurOut 2s ease infinite;
}

@keyframes textBlurOut {
  0% {
    filter: blur(0);
    opacity: 1;
  }
  50% {
    filter: blur(8px);
    opacity: 0;
  }
  100% {
    filter: blur(0);
    opacity: 1;
  }
}

/* 闪烁（flicker） */
.flicker {
  animation: flicker 2s linear infinite;
}

@keyframes flicker {
  0%,
  19%,
  21%,
  23%,
  25%,
  54%,
  56%,
  100% {
    opacity: 1;
  }
  20%,
  24%,
  55% {
    opacity: 0.4;
  }
}

/* 心跳（heartbeat） */
.heartbeat {
  animation: heartbeat 1.5s ease infinite;
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1, 1);
  }
  10%,
  30% {
    transform: scale(0.9, 0.9);
  }
  20%,
  40% {
    transform: scale(1.1, 1.1);
  }
}

/* 果冻（jello） */
.jello {
  animation: jello 2s ease infinite;
}

@keyframes jello {
  0%,
  11%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  22% {
    transform: skewX(-12deg) skewY(-12deg);
  }
  33% {
    transform: skewX(6deg) skewY(6deg);
  }
  44% {
    transform: skewX(-3deg) skewY(-3deg);
  }
  55% {
    transform: skewX(1.5deg) skewY(1.5deg);
  }
}

/* 橡皮筋（rubber-band） */
.rubber-band {
  animation: rubberBand 2s ease infinite;
}

@keyframes rubberBand {
  0%,
  100% {
    transform: scale3d(1, 1, 1);
  }
  30% {
    transform: scale3d(1.25, 0.75, 1);
  }
  40% {
    transform: scale3d(0.75, 1.25, 1);
  }
  50% {
    transform: scale3d(1.15, 0.85, 1);
  }
  65% {
    transform: scale3d(0.95, 1.05, 1);
  }
  75% {
    transform: scale3d(1.05, 0.95, 1);
  }
}

/* 抖动放大（tada） */
.tada {
  animation: tada 2s ease infinite;
}

@keyframes tada {
  0%,
  100% {
    transform: scale3d(1, 1, 1);
  }
  10%,
  20% {
    transform: scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg);
  }
  30%,
  50%,
  70%,
  90% {
    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);
  }
  40%,
  60%,
  80% {
    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);
  }
}

/* 滚入（roll-in） */
.roll-in {
  animation: rollIn 2s ease infinite;
}

@keyframes rollIn {
  0% {
    opacity: 0;
    transform: translateX(-100%) rotate(-120deg);
  }
  100% {
    opacity: 1;
    transform: translateX(0) rotate(0deg);
  }
}

/* 模糊滑入（slide-in-blurred-left） */
.slide-in-blurred-left {
  animation: slideInBlurredLeft 2s cubic-bezier(0.23, 1, 0.32, 1) infinite;
}

@keyframes slideInBlurredLeft {
  0% {
    transform: translateX(-50px) scale(0.8);
    filter: blur(5px);
    opacity: 0;
  }
  50% {
    transform: translateX(0) scale(1);
    filter: blur(0);
    opacity: 1;
  }
  100% {
    transform: translateX(50px) scale(0.8);
    filter: blur(5px);
    opacity: 0;
  }
}

/* 旋转放大（rotate-scale-up） */
.rotate-scale-up {
  animation: rotateScaleUp 2s ease infinite;
}

@keyframes rotateScaleUp {
  0% {
    transform: rotate(0deg) scale(1, 1);
  }
  50% {
    transform: rotate(360deg) scale(1.5, 1.5);
  }
  100% {
    transform: rotate(720deg) scale(1, 1);
  }
}
</style>
