<template>
  <div>
    <div class="g-module-normal">
      <div class="g-flex-column">
        <div class="m-block">
          <div class="m-block-title">文字</div>
          <div class="m-block-content">
            <div class="m-content-title">基本</div>
            <div class="g-flex-normal m-font30-b">
              <div
                v-for="(item, index) in basicList"
                :key="index"
                class="m-font-area"
              >
                <div :class="item.class">{{ item.name }}</div>
              </div>
            </div>
          </div>
          <div class="m-block-content">
            <div class="m-content-title">结合</div>
            <div class="g-flex-normal m-font30-b">
              <div class="m-font-area">
                <div class="com-linear">动态渐变</div>
              </div>
              <div class="m-font-area">
                <div class="com-shine">闪烁</div>
              </div>
              <div class="m-font-area">
                <div class="com-typing">打字机</div>
              </div>
              <div class="m-font-area">
                <div class="com-glitch" data-text="故障">故障</div>
              </div>
              <div class="m-font-area">
                <div class="com-3d">3D文字</div>
              </div>
              <div class="m-font-area">
                <div class="com-wave">波浪</div>
              </div>
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
    return {
      basicList: [
        { name: '渐变色一', class: 'linear1' },
        { name: '渐变色二', class: 'linear2' },
        { name: '发光一', class: 'shine1' },
        { name: '阴影', class: 'shadow' },
        { name: '描边', class: 'stroke' },
        { name: '镂空', class: 'hollow' },
        { name: '模糊', class: 'blur' }
      ]
    }
  },
  methods: {}
}
</script>
<style lang="less" scoped>
.linear1 {
  background-image: linear-gradient(
    to right,
    #ff0000,
    #ff7f00,
    #ffff00,
    #00ff00,
    #00ffff,
    #0000ff,
    #8b00ff
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.linear2 {
  color: var(--el-color-primary);
  -webkit-mask-image: linear-gradient(black, transparent);
}

.shine1 {
  color: white;
  text-shadow:
    0 0 10px var(--el-color-primary),
    0 0 20px var(--el-color-primary),
    0 0 30px var(--el-color-primary),
    0 0 40px var(--el-color-primary);
}

.shadow {
  color: black;
  text-shadow: 5px 5px 0px #b5b4b4;
}

/* 描边 */
.stroke {
  color: transparent;
  -webkit-text-stroke: 2px var(--el-color-primary);
}

/* 镂空 */
.hollow {
  color: white;
  -webkit-text-stroke: 2px #333;
}

/* 模糊 */
.blur {
  color: #333;
  filter: blur(3px);
}

.com-linear {
  background-image: linear-gradient(45deg, #f35626, #feab3a);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: hue 6s infinite linear;
}

@keyframes hue {
  from {
    filter: hue-rotate(0deg);
  }

  to {
    filter: hue-rotate(-360deg);
  }
}

.com-shine {
  color: white;
  text-shadow:
    0 0 10px var(--el-color-primary),
    0 0 20px var(--el-color-primary),
    0 0 30px var(--el-color-primary),
    0 0 40px var(--el-color-primary);
  animation: Glow 0.5s ease infinite alternate;
}

@keyframes Glow {
  from {
    text-shadow:
      0 0 10px #fff,
      0 0 20px #fff,
      0 0 30px #fff,
      0 0 40px orange,
      0 0 70px orange,
      0 0 80px orange,
      0 0 100px orange,
      0 0 120px orange;
  }
  to {
    text-shadow:
      0 0 5px #fff,
      0 0 10px #fff,
      0 0 15px #fff,
      0 0 20px orange,
      0 0 35px orange,
      0 0 40px orange,
      0 0 50px orange,
      0 0 75px orange;
  }
}

/* 打字机 */
.com-typing {
  color: #333;
  overflow: hidden;
  white-space: nowrap;
  border-right: 3px solid #333;
  width: 0;
  animation:
    typing 3s steps(3) infinite alternate,
    cursor 0.6s step-end infinite;
}

@keyframes typing {
  0% {
    width: 0;
  }
  60%,
  100% {
    width: 3em;
  }
}

@keyframes cursor {
  50% {
    border-color: transparent;
  }
}

/* 故障 */
.com-glitch {
  color: #333;
  position: relative;
}

.com-glitch::before,
.com-glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.com-glitch::before {
  color: #ff0000;
  animation: glitchTop 2s infinite linear alternate-reverse;
  clip-path: inset(0 0 60% 0);
}

.com-glitch::after {
  color: #00ffff;
  animation: glitchBottom 2.5s infinite linear alternate-reverse;
  clip-path: inset(60% 0 0 0);
}

@keyframes glitchTop {
  0%,
  100% {
    transform: translate(0);
  }
  20% {
    transform: translate(-3px, -2px);
  }
  40% {
    transform: translate(3px, 1px);
  }
  60% {
    transform: translate(-2px, 2px);
  }
  80% {
    transform: translate(2px, -1px);
  }
}

@keyframes glitchBottom {
  0%,
  100% {
    transform: translate(0);
  }
  20% {
    transform: translate(3px, 2px);
  }
  40% {
    transform: translate(-3px, -1px);
  }
  60% {
    transform: translate(2px, -2px);
  }
  80% {
    transform: translate(-2px, 1px);
  }
}

/* 3D文字 */
.com-3d {
  color: white;
  text-shadow:
    1px 1px 0 #ccc,
    2px 2px 0 #bbb,
    3px 3px 0 #aaa,
    4px 4px 0 #999,
    5px 5px 0 #888,
    6px 6px 1px #777,
    0 0 10px rgba(0, 0, 0, 0.3);
  transform: perspective(100px) rotateX(20deg);
}

/* 波浪 */
.com-wave {
  background-image: linear-gradient(
    to right,
    var(--el-color-primary),
    #67c23a,
    #e6a23c,
    #f56c6c
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  animation: waveMove 3s linear infinite;
}

@keyframes waveMove {
  to {
    background-position: 200% center;
  }
}
</style>
