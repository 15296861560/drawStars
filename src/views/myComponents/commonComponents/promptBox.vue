<template>
  <div>
    <div class="g-home-module">
       <el-button type="primary" @click="showHardTip()">硬提示</el-button>
    </div>
    <div class="hardTip-bg" v-if="hardTip">
      <div class="hardTip">
        <div class="content-area">硬提示内容</div>
        <button class="btn" @click="hardTip = false">关闭提示</button>
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
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-color: #80ffff;
    border-style: solid;
    border-width: 1px;
    border-radius: 5px;
    height: 20vh;
    width: 20vw;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    .content-area {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 70%;
    }
    .btn {
      background-color: #6fe7f1;
      border: solid;
      border-color: transparent;
      height: 30%;
      width: 100%;
    }
  }
}
</style>
