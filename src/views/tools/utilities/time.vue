<template>
  <div class="g-flex-column">
    <div class="m-block">
      <div class="m-block-title">时间</div>
      <div class="m-block-content">
        <div class="m-content-title">获取时间</div>
        <div class="m-content-area">
          <div class="m-template">获取时间戳</div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div class="u-strong-red">Date.parse(new Date());</div>
            </div>

            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ timeInMs1 }}</div>
              <br />
              <div class="m-refresh">
                <i class="el-icon-refresh" @click="getTimeInMs(1)"></i>
              </div>
            </div>
          </div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div class="u-strong-red">new Date().getTime();</div>
            </div>

            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ timeInMs2 }}</div>
              <br />
              <div class="m-refresh">
                <i class="el-icon-refresh" @click="getTimeInMs(2)"></i>
              </div>
            </div>
          </div>

          <!-- 测试获取时间差-->
          <!-- console.time('test'); console.timeEnd('test');  -->
        </div>

        <div class="m-content-area">
          <div class="m-template">获取当前时间</div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div class="u-strong-red">let curTime = new Date();</div>
            </div>

            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div v-if="curTime">
                curTime:
                <div class="u-strong-red">{{ curTime }}</div>
                获取当前年份(2位)<span class="u-strong-blue"
                  ><br />curTime.getYear():</span
                >
                <div class="u-strong-red">
                  {{ curTime.getYear() }}
                </div>
                获取完整的年份(4位,1970-????)<span class="u-strong-blue"
                  ><br />curTime.getFullYear():</span
                >
                <div class="u-strong-red">
                  {{ curTime.getFullYear() }}
                </div>
                获取当前月份(0-11,0代表1月)<span class="u-strong-blue"
                  ><br />curTime.getMonth():</span
                >
                <div class="u-strong-red">
                  {{ curTime.getMonth() }}
                </div>
                获取当前日(1-31)<span class="u-strong-blue"
                  ><br />curTime.getDate():</span
                >
                <div class="u-strong-red">
                  {{ curTime.getDate() }}
                </div>
                获取当前星期X(0-6,0代表星期天)<span class="u-strong-blue"
                  ><br />curTime.getDay():</span
                >
                <div class="u-strong-red">
                  {{ curTime.getDay() }}
                </div>
                获取当前时间(从1970.1.1开始的毫秒数)<span class="u-strong-blue"
                  ><br />curTime.getTime():</span
                >
                <div class="u-strong-red">
                  {{ curTime.getTime() }}
                </div>
                获取当前小时数(0-23)<span class="u-strong-blue"
                  ><br />curTime.getHours():</span
                >
                <div class="u-strong-red">
                  {{ curTime.getHours() }}
                </div>
                获取当前分钟数(0-59)<span class="u-strong-blue"
                  ><br />curTime.getMinutes():</span
                >
                <div class="u-strong-red">
                  {{ curTime.getMinutes() }}
                </div>
                获取当前秒数(0-59)<span class="u-strong-blue"
                  ><br />curTime.getSeconds():</span
                >
                <div class="u-strong-red">
                  {{ curTime.getSeconds() }}
                </div>
                获取当前毫秒数(0-999)<span class="u-strong-blue"
                  ><br />curTime.getMilliseconds():</span
                >
                <div class="u-strong-red">
                  {{ curTime.getMilliseconds() }}
                </div>
                获取当前日期<span class="u-strong-blue"
                  ><br />curTime.toLocaleDateString():</span
                >
                <div class="u-strong-red">
                  {{ curTime.toLocaleDateString() }}
                </div>
                获取当前时间<span class="u-strong-blue"
                  ><br />curTime.toLocaleTimeString():</span
                >
                <div class="u-strong-red">
                  {{ curTime.toLocaleTimeString() }}
                </div>
                获取日期与时间<span class="u-strong-blue"
                  ><br />curTime.toLocaleString():</span
                >
                <div class="u-strong-red">
                  {{ curTime.toLocaleString() }}
                </div>
              </div>

              <br />
              <div class="m-refresh">
                <i class="el-icon-refresh" @click="getCurTime1(1)"></i>
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
      timeInMs1: "",
      timeInMs2: "",
      timeInMs3: "",
      curTime: "",
      curTime2: "",
    };
  },
  methods: {
    getTimeInMs(key) {
      switch (key) {
        case 1:
          this.timeInMs1 = Date.now();
          break;
        case 2:
          this.timeInMs2 = new Date().getTime();
          break;
        case 3:
          this.timeInMs3 = performance.now();
          break;
        default:
          break;
      }
    },
    getCurTime1(key) {
      switch (key) {
        case 1:
          this.curTime = new Date();
          break;
        case 2:
          this.timeInMs2 = new Date().getTime();
          break;
        case 3:
          this.timeInMs3 = performance.now();
          break;
        default:
          break;
      }
    },
  },
};
</script>
<style></style>
