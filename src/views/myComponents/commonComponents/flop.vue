<template>
  <div class="count-flop">
    <div
      :class="item !== '.' ? 'count-flop-box' : 'count-flop-point'"
      v-for="(item, index) in value"
      :key="index"
    >
      <div v-if="item != '.'" class="count-flop-content" :class="['rolling_' + item]">
        <div v-for="(num, numIndex) in numberList" :key="numIndex" class="count-flop-num">
          {{ num }}
        </div>
      </div>
      <div v-else class="count-flop-content">.</div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      val: 0,
      value: [],
      numberList: [...new Array(10).keys()],
      timer: null,
    };
  },
  watch: {
    val() {
      this.value = this.val.toString().split("");
    },
  },
  created() {
    this.value = this.val.toString().split("");
    this.timer = setInterval(() => {
      this.val++;
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {},
};
</script>
<style lang="less" scoped>
.count-flop {
  display: inline-block;
  height: 3.125rem /* 50/16 */;
  line-height: 3.125rem /* 50/16 */;
  font-size: 2.25rem /* 36/16 */;
  color: @color-text-selected;
}

.count-flop > div {
  position: relative;
  display: inline-block;
  overflow: hidden;
  height: 100%;
}

.count-flop-box {
  margin-right: 0.25rem /* 4/16 */;
  width: 2.25rem /* 36/16 */;
  border: 1px solid @color-border-highlight-selected;
  line-height: 3rem /* 48/16 */;
  border-radius: 4px;
}

.count-flop-point {
  margin-right: 0.25rem /* 4/16 */;
  width: 0.625rem /* 10/16 */;
}

.count-flop-content {
  text-align: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  animation-fill-mode: forwards !important;
}

.rolling_0 {
  animation: rolling_0 0.5s ease;
}

@keyframes rolling_0 {
  from {
    transform: translateY(-90%);
  }
  to {
    transform: translateY(0);
  }
}

.rolling_1 {
  animation: rolling_1 0.5s ease;
}

@keyframes rolling_1 {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-10%);
  }
}

.rolling_2 {
  animation: rolling_2 0.5s ease;
}

@keyframes rolling_2 {
  from {
    transform: translateY(-10%);
  }
  to {
    transform: translateY(-20%);
  }
}

.rolling_3 {
  animation: rolling_3 0.5s ease;
}

@keyframes rolling_3 {
  from {
    transform: translateY(-20%);
  }
  to {
    transform: translateY(-30%);
  }
}

.rolling_4 {
  animation: rolling_4 0.5s ease;
}

@keyframes rolling_4 {
  from {
    transform: translateY(-30%);
  }
  to {
    transform: translateY(-40%);
  }
}

.rolling_5 {
  animation: rolling_5 0.5s ease;
}

@keyframes rolling_5 {
  from {
    transform: translateY(-40%);
  }
  to {
    transform: translateY(-50%);
  }
}

.rolling_6 {
  animation: rolling_6 0.5s ease;
}

@keyframes rolling_6 {
  from {
    transform: translateY(-50%);
  }
  to {
    transform: translateY(-60%);
  }
}

.rolling_7 {
  animation: rolling_7 0.5s ease;
}

@keyframes rolling_7 {
  from {
    transform: translateY(-60%);
  }
  to {
    transform: translateY(-70%);
  }
}

.rolling_8 {
  animation: rolling_8 0.5s ease;
}

@keyframes rolling_8 {
  from {
    transform: translateY(-70%);
  }
  to {
    transform: translateY(-80%);
  }
}

.rolling_9 {
  animation: rolling_9 0.5s ease;
}

@keyframes rolling_9 {
  from {
    transform: translateY(-80%);
  }
  to {
    transform: translateY(-90%);
  }
}
</style>
