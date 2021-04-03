<template>
  <div>
    <div class="g-home-module">
      <div class="m-item" style="align-items: normal">
        <el-progress :percentage="rate"></el-progress>
      </div>
      <div class="m-item" style="align-items: normal">
        <el-progress
          :text-inside="true"
          :stroke-width="26"
          :percentage="rate"
        ></el-progress>
      </div>

      <div class="m-item">
        <el-progress type="circle" :percentage="rate"></el-progress>
      </div>
      <div class="m-item">
        <el-progress type="dashboard" :percentage="rate"></el-progress>
      </div>
      <div class="m-item">
        <div class="liPerson">
          <div class="liPersonBar">
            <div
              :style="{
                width: rate + '%',
                paddingLeft: rate + '%',
              }"
            >
              <span> {{ rate }}% </span>
            </div>
          </div>
        </div>
      </div>

      <div class="m-item">
        <div class="progressBar">
          <div class="progress" :style="{ width: rate + '%' }"></div>
          <span class="in-text" :style="{ left: rate + '%' }">{{ rate + "%" }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rate: 33,
    };
  },
  methods: {},
};
</script>
<style scoped lang="less">
.liPerson {
  width: 200px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .liPersonBar {
    border: 1px solid aqua;
    // padding: 0 0.3vh;
    margin-right: 3%;
    border-radius: 5px;
    height: 2.5vh;
    width: 80%;
    position: relative;
    display: flex;
    align-items: center;

    div {
      border-radius: 5px;
      height: 70%;
      background-color: #1bc3dc;
      position: absolute;
      display: flex;
      align-items: center;
      transition: all 0.5s ease;
    }
  }
}

.progressBar {
  width: 200px;
  height: 20px;
  border: 1px solid transparent;
  border-radius: 10px;
  text-align: left;
  .progress {
    height: 20px;
    background: aqua;
    border-radius: 10px;
  }
  .in-text {
    position: relative;
    bottom: 19px;
  }
}
</style>
