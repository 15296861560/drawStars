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
              <div class="m-card-transition fade-in">渐显</div>
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
              <div class="m-card-transition bg-color">背景色</div>
              <div class="m-card-transition shadow">阴影</div>
              <div class="m-card-transition radius">圆角</div>
              <div class="m-card-transition width">宽度</div>
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
              <div class="m-card-transition rotate-scale">旋转缩放</div>
              <div class="m-card-transition fade-scale">渐隐缩放</div>
              <div class="m-card-transition flip-3d">3D翻转</div>
              <div class="m-card-transition skew-rotate">倾斜旋转</div>
              <div class="m-card-transition color-scale">变色缩放</div>
              <div class="m-card-transition slide-bounce">滑动弹跳</div>
            </div>
          </div>
          <div class="m-block-content">
            <div class="m-content-title">高阶</div>
            <div class="g-flex-normal">
              <div class="m-card-transition blur-out">模糊消失</div>
              <div class="m-card-tracking">字距变化</div>
              <div class="m-card-transition text-shadow">文字阴影</div>
              <div class="m-card-transition gradient-bg">渐变背景</div>
              <div class="m-card-transition clip-reveal">剪切显示</div>
              <div class="m-card-transition filter-hue">色相旋转</div>
              <div class="m-card-transition flip-diagonal">对角翻转</div>
              <div class="m-card-transition scale-blur">模糊缩放</div>
              <div class="m-card-transition rotate-blur">模糊旋转</div>
              <div class="m-card-transition skew-fade">倾斜渐隐</div>
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
  transform: translateY(-60px) rotateY(180deg);
}

.slide-skew {
  transition: all 0.5s ease 0s;
}

.slide-skew:hover {
  transform: translateY(-60px) skewX(180deg);
}

/* 渐显 */
.fade-in {
  opacity: 0.3;
  transition: all 0.5s ease 0s;
}

.fade-in:hover {
  opacity: 1;
}

/* 背景色过渡 */
.bg-color {
  transition: background-color 0.5s ease 0s;
}

.bg-color:hover {
  background-color: var(--el-color-primary-light-3);
}

/* 阴影过渡 */
.shadow {
  transition: all 0.5s ease 0s;
}

.shadow:hover {
  box-shadow: 10px 10px 20px #c0c4cc;
}

/* 圆角过渡 */
.radius {
  transition: border-radius 0.5s ease 0s;
}

.radius:hover {
  border-radius: 50px;
}

/* 宽度过渡 */
.width {
  transition: width 0.5s ease 0s;
}

.width:hover {
  width: 160px;
}

/* 旋转缩放 */
.rotate-scale {
  transition: all 0.5s ease 0s;
}

.rotate-scale:hover {
  transform: rotate(180deg) scale(1.5, 1.5);
}

/* 渐隐缩放 */
.fade-scale {
  transition: all 0.5s ease 0s;
}

.fade-scale:hover {
  opacity: 0;
  transform: scale(1.5, 1.5);
}

/* 3D翻转 */
.flip-3d {
  transition: transform 0.5s ease 0s;
  perspective: 800px;
}

.flip-3d:hover {
  transform: rotateY(180deg);
}

/* 倾斜旋转 */
.skew-rotate {
  transition: all 0.5s ease 0s;
}

.skew-rotate:hover {
  transform: skewX(30deg) rotate(45deg);
}

/* 变色缩放 */
.color-scale {
  transition: all 0.5s ease 0s;
}

.color-scale:hover {
  background-color: var(--el-color-primary-light-3);
  transform: scale(1.5, 1.5);
}

/* 滑动弹跳 */
.slide-bounce {
  transition: all 0.5s cubic-bezier(0.54, -0.8, 0.76, 1.85) 0s;
}

.slide-bounce:hover {
  transform: translateY(-60px) scale(1.2, 1.2);
}

/* 模糊消失 */
.blur-out {
  transition: all 0.5s ease 0s;
}

.blur-out:hover {
  filter: blur(8px);
  opacity: 0.3;
}

/* 字距变化 */
.m-card-tracking {
  width: 100px;
  height: 60px;
  background: #f5f8fb;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #333;
  border-radius: 3px;
  justify-content: center;
  margin-right: 50px;
  margin-bottom: 50px;
  letter-spacing: 0;
  transition: letter-spacing 0.5s ease;
}

.m-card-tracking:hover {
  letter-spacing: 0.5em;
}

/* 文字阴影 */
.text-shadow {
  transition: all 0.5s ease 0s;
  color: #333;
}

.text-shadow:hover {
  text-shadow: 3px 3px 6px #c0c4cc;
  color: var(--el-color-primary);
}

/* 渐变背景 */
.gradient-bg {
  transition: background-position 0.5s ease 0s;
  background-image: linear-gradient(
    45deg,
    var(--el-color-primary),
    var(--el-color-primary),
    var(--el-color-primary)
  );
  background-size: 300% 300%;
  background-position: 0% 50%;
}

.gradient-bg:hover {
  background-position: 100% 50%;
}

/* 剪切显示 */
.clip-reveal {
  transition: clip-path 0.5s ease 0s;
  clip-path: inset(0 100% 0 0);
}

.clip-reveal:hover {
  clip-path: inset(0 0 0 0);
}

/* 色相旋转 */
.filter-hue {
  transition: filter 0.5s ease 0s;
}

.filter-hue:hover {
  filter: hue-rotate(180deg);
}

/* 对角翻转 */
.flip-diagonal {
  transition: transform 0.5s ease 0s;
  perspective: 800px;
}

.flip-diagonal:hover {
  transform: rotate3d(1, 1, 0, 180deg);
}

/* 模糊缩放 */
.scale-blur {
  transition: all 0.5s ease 0s;
}

.scale-blur:hover {
  transform: scale(1.5, 1.5);
  filter: blur(4px);
}

/* 模糊旋转 */
.rotate-blur {
  transition: all 0.5s ease 0s;
}

.rotate-blur:hover {
  transform: rotate(180deg);
  filter: blur(4px);
}

/* 倾斜渐隐 */
.skew-fade {
  transition: all 0.5s ease 0s;
}

.skew-fade:hover {
  transform: skewX(30deg);
  opacity: 0.3;
}
</style>
