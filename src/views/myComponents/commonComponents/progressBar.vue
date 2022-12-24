<template>
  <div>
    <div class="g-home-module">
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
          <div class="in-text" :style="{ left: rate + '%' }">{{ rate + "%" }}</div>
        </div>
      </div>

      <div class="m-item">
        <div class="gradualBar">
          <div class="gradual" :style="{ width: rate + '%' }"></div>
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
      rate: 66,
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
  height: 1vh;
  border: 1px solid transparent;
  border-radius: 10px;
  text-align: left;
  .progress {
    height: 1vh;
    background: aqua;
    border-radius: 10px;
  }
  .in-text {
    position: relative;
    transform: translateY(-100%);
    top: 50%;
    padding-left: 1vw;
  }
}
.gradualBar {
  width: 200px;
  height: 1vh;
  border: 1px solid transparent;
  border-radius: 10px;
  text-align: left;
  .gradual {
    height: 1vh;
    background-image: linear-gradient(to right, transparent, #01d4e5);
    border-radius: 15px;
    height: 1vh;
  }
  .in-text {
    position: relative;
    font-size: 2vh;
    bottom: 1.6vh;
    margin-left: 1vw;
  }
}
</style>
