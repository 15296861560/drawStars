<template>
  <div>
    <div class="g-module-normal">
      <div class="g-flex-column">
        <div class="m-block">
          <div class="m-block-title">过渡</div>
          <div class="m-block-content">
            <div class="m-content-title">基本</div>
            <div class="g-flex-normal">
              <div class="m-card-transition fade-out">渐隐</div>
              <div class="m-card-transition slide">滑动</div>
              <div class="m-card-transition slide-x">X轴滑动</div>
              <div class="m-card-transition slide-y">y轴滑动</div>
              <div class="m-card-transition rotate">旋转</div>
              <div class="m-card-transition rotate-x">x轴旋转</div>
              <div class="m-card-transition rotate-y">y轴旋转</div>
              <div class="m-card-transition scale">缩放</div>
              <div class="m-card-transition scale-x">x轴缩放</div>
              <div class="m-card-transition scale-y">y轴缩放</div>
              <div class="m-card-transition skew">倾斜</div>
              <div class="m-card-transition skew-x">x轴倾斜</div>
              <div class="m-card-transition skew-y">y轴倾斜</div>
              <div class="m-card-transition matrix">矩阵</div>
            </div>
          </div>
          <div class="m-block-content">
            <div class="m-content-title">结合</div>
            <div class="g-flex-normal">
              <div class="m-card-transition rotate-left">基点旋转</div>
              <div class="m-card-transition bounce-out">弹出</div>
              <div class="m-card-transition slide-scale">滑动缩放</div>
              <div class="m-card-transition slide-fade">滑动消失</div>
              <div class="m-card-transition slide-rotate">滑动旋转</div>
              <div class="m-card-transition slide-skew">滑动倾斜</div>
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
.fade-out {
  transition: all 0.5s ease 0s;
}
.fade-out:hover {
  opacity: 0;
}

.slide {
  transition: all 0.5s ease 0s;
}

.slide:hover {
  transform: translate(30px, -30px);
}

.slide-x {
  transition: all 0.5s ease 0s;
}

.slide-x:hover {
  transform: translateX(30px);
}

.slide-y {
  transition: all 0.5s ease 0s;
}

.slide-y:hover {
  transform: translateY(-30px);
}

.rotate {
  transition: all 0.5s ease 0s;
}

.rotate:hover {
  transform: rotate(30deg);
}

.rotate-x {
  transition: all 0.5s ease 0s;
}

.rotate-x:hover {
  transform: rotateX(90deg);
}

.rotate-y {
  transition: all 0.5s ease 0s;
}

.rotate-y:hover {
  transform: rotateY(90deg);
}

.scale {
  transition: all 0.5s ease 0s;
}

.scale:hover {
  transform: scale(1.5, 1.5);
}

.scale-x {
  transition: all 0.5s ease 0s;
}

.scale-x:hover {
  transform: scaleX(1.5);
}

.scale-y {
  transition: all 0.5s ease 0s;
}

.scale-y:hover {
  transform: scaleY(1.5);
}

.skew {
  transition: all 0.5s ease 0s;
}

.skew:hover {
  transform: skew(45deg, 45deg);
}

.skew-x {
  transition: all 0.5s ease 0s;
}

.skew-x:hover {
  transform: skewX(45deg);
}

.skew-y {
  transition: all 0.5s ease 0s;
}

.skew-y:hover {
  transform: skewY(45deg);
}

.matrix {
  transition: all 0.5s ease 0s;
}

.matrix:hover {
  /* matrix 方法有六个参数，包含旋转，缩放，移动（平移）和倾斜功能。 */
  transform: matrix(0.8, 0.5, -0.5, 0.8, 10, 10);
}

.rotate-left {
  transition: all 0.5s ease 0s;
  transform-origin: left;
}

.rotate-left:hover {
  transform: rotateY(90deg);
}

.bounce-out {
  transition: all 0.5s cubic-bezier(0.54, -0.8, 0.76, 1.85) 0s;
}

.bounce-out:hover {
  transform: translateY(-60px);
}

.slide-scale {
  transition: all 0.5s ease 0s;
}

.slide-scale:hover {
  transform: translateY(-60px) scale(1.5, 1.5);
}

.slide-fade {
  transition: all 0.5s ease 0s;
}

.slide-fade:hover {
  transform: translateY(-60px);
  opacity: 0;
}

.slide-rotate {
  transition: all 0.5s ease 0s;
}

.slide-rotate:hover {
  transform: translateY(-60px) rotateY(180deg);;
}

.slide-skew {
  transition: all 0.5s ease 0s;
}

.slide-skew:hover {
  transform: translateY(-60px) skewX(180deg);;
}
</style>
