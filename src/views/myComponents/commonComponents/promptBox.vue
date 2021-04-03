<template>
  <div>
    <div class="g-home-module">
      <div class="m-item" @click="showHardTip()">普通软提示</div>
      <div class="m-item"></div>
      <div class="m-item"></div>
    </div>
    <div class="hardTip-bg">
      <div class="hardTip">
        硬提示内容
        <button class="btn">关闭提示</button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      hardTip: false,
    };
  },
  methods: {
    showHardTip() {
      this.hardTip = true;
    },
    showSoftTip(showTime) {
      this.setInterval(() => {
        this.hardTip = false;
      }, 1000 * showTime);
    },
  },
};
</script>
<style scoped lang="less">
.hardTip-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.5);
  .hardTip {
    background-color: white;
    overflow: hidden;
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-color: #80ffff;
    border-style: solid;
    border-width: 1px;
    border-radius: 5px;
    height: 200px;
    width: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    .btn {
      background-color: #6fe7f1;
      border: solid;
      border-color: transparent;
      height: 30%;
      width:100%;
    }
  }
}
</style>
