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
    return {};
  },
  methods: {},
};
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
</style>
