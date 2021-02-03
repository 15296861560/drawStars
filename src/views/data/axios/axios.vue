<template>
  <div>
    <div class="g-flex-column">
      <div class="m-block">
        <div class="m-block-title">示例</div>
        <div class="m-block-content">
          <div class="m-content-title">代理</div>
          <div class="m-content-area">
            <div class="m-template">代理实现GET请求 实例</div>
            <div class="m-example-area">
              <div class="m-example-code">
                axios <br />.get('/api/try/ajax/json_demo.json') <br />.then(response =>
                (this.info = response)) <br />.catch(function (error) {<br />
                // 请求失败处理<br />
                console.log(error);<br />
                });
              </div>

              <div class="m-example-result">
                <span class="m-badge">Result</span>

                {
                <div class="u-strong-red">&emsp;{{ getOfResult }}</div>
                }

                <div class="m-refresh">
                  <i class="el-icon-refresh" @click="getResult()"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="m-content-area">
            <div class="m-template">代理实现POST请求 实例</div>
            <div class="m-example-area">
              <div class="m-example-code">
                axios <br />.post('/api/try/ajax/json_demo.json') <br />.then(response =>
                (this.info = response)) <br />.catch(function (error) {<br />
                // 请求失败处理<br />
                console.log(error);<br />
                });
              </div>

              <div class="m-example-result">
                <span class="m-badge">Result</span>

                {
                <div class="u-strong-red">&emsp;{{ getOfResult2 }}</div>
                }

                <div class="m-refresh">
                  <i class="el-icon-refresh" @click="getResult2()"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";

export default {
  data() {
    return {
      getOfResult: "",
      getOfResult2: "",
      getOfResultCORS: "",
    };
  },
  methods: {
    getResult() {
      // axios.defaults.baseURL = '/api';
      let _this = this;
      axios
        .get("/api/try/ajax/json_demo.json")
        .then((response) => (_this.getOfResult = response.data))
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
          _this.getOfResult = error;
        });
    },
    getResult2() {
      let _this = this;
      axios
        .post("/api/try/ajax/json_demo.json")
        .then((response) => (_this.getOfResult2 = response.data))
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
          _this.getOfResult2 = error;
        });
    },
  },
};
</script>
<style></style>
