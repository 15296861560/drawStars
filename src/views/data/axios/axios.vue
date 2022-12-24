<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-26 16:37:23
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-17 15:13:05
-->
<template>
  <div>
    <div class="g-flex-column">
      <div class="m-block">
        <div class="m-block-title">示例</div>
        <div class="m-block-content">
          <div class="m-content-title">代理(服务器是本地发布在另一个端口的后台服务)</div>
          <div class="m-content-area">
            <div class="m-template">代理实现GET请求 实例</div>
            <div class="m-example-area">
              <div class="m-example-code">
                axios <br />.get('/api/testApi/test/getTest') <br />.then(response =>
                (this.info = response)) <br />.catch(function (error) {<br />
                // 请求失败处理<br />
                alert(error);<br />
                });
              </div>

              <div class="m-example-result">
                <span class="m-badge">Result</span>

                {
                <div class="u-strong-red">&emsp;{{ getOfResult }}</div>
                }

                <div class="m-refresh">
                  <el-icon @click="getResult()"><Refresh /></el-icon>
                </div>
              </div>
            </div>
          </div>
          <div class="m-content-area">
            <div class="m-template">代理实现POST请求 实例</div>
            <div class="m-example-area">
              <div class="m-example-code">
                axios <br />.post('/api/testApi/test/postTest') <br />.then(response =>
                (this.info = response)) <br />.catch(function (error) {<br />
                // 请求失败处理<br />
                alert(error);<br />
                });
              </div>

              <div class="m-example-result">
                <span class="m-badge">Result</span>

                {
                <div class="u-strong-red">&emsp;{{ getOfResult2 }}</div>
                }

                <div class="m-refresh">
                  <el-icon @click="getResult2()"><Refresh /></el-icon>
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
        .get("/api/testApi/test/getTest")
        .then((response) => (_this.getOfResult = response.data))
        .catch(function (error) {
          // 请求失败处理
          alert(error);
          _this.getOfResult = error;
        });
    },
    getResult2() {
      let _this = this;
      axios
        .post("/api/testApi/test/postTest")
        .then((response) => (_this.getOfResult2 = response.data))
        .catch(function (error) {
          // 请求失败处理
          alert(error);
          _this.getOfResult2 = error;
        });
    },
  },
};
</script>
<style></style>
