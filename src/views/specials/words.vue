<template>
  <div>
    <div class="g-module-normal">
      <div class="g-flex-column">
        <div class="m-block">
          <div class="m-block-title">文字</div>
          <div class="m-block-content">
            <div class="m-content-title">基本</div>
            <div class="g-flex-normal m-font30-b">
              <div v-for="(item, index) in basicList" :key="index" class="m-font-area">
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
        { name: "渐变色一", class: "linear1" },
        { name: "渐变色二", class: "linear2" },
        { name: "发光一", class: "shine1" },
        { name: "阴影", class: "shadow" },
      ],
    };
  },
  methods: {},
};
</script>
<style lang="less" scoped>
.linear1 {
  background-image: linear-gradient(to right, red, yellow, aqua, green);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.linear2 {
  color: aqua;
  -webkit-mask-image: linear-gradient(black, transparent);
}

.shine1 {
  color: white;
  text-shadow: 0 0 10px aqua, 0 0 20px aqua, 0 0 30px aqua, 0 0 40px aqua;
}

.shadow {
  color: black;
  text-shadow: 5px 5px 0px #b5b4b4;
}

.com-linear {
  background-image: -webkit-linear-gradient(45deg, #f35626, #feab3a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-animation: hue 6s infinite linear;
}
@-webkit-keyframes hue {
  from {
    -webkit-filter: hue-rotate(0deg);
  }

  to {
    -webkit-filter: hue-rotate(-360deg);
  }
}

.com-shine {
  color: white;
  text-shadow: 0 0 10px aqua, 0 0 20px aqua, 0 0 30px aqua, 0 0 40px aqua;
  animation: Glow 0.5s ease infinite alternate;
}

@keyframes Glow {
  from {
    text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 40px orange,
      0 0 70px orange, 0 0 80px orange, 0 0 100px orange, 0 0 120px orange;
  }
  to {
    text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px orange,
      0 0 35px orange, 0 0 40px orange, 0 0 50px orange, 0 0 75px orange;
  }
}
</style>
