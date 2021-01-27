<template>
  <div class="g-flex-column">
    <div class="m-block">
      <div class="m-block-title">数据模板定义</div>
      <div class="m-block-content">
        <div class="m-content-title">String</div>
        <div class="m-content-area">
          <div class="m-template">'name|min-max':string</div>
          <div class="m-example-area">
            <div class="m-example-code">
              Mock.mock({
              <div class="u-strong-red">&emsp;"string|1-10": "★"</div>
              })
            </div>

            <div class="m-example-result">
              <span class="m-badge">Result</span>

              {
              <div class="u-strong-red">&emsp;"string": "{{data.string}}"</div>
              }

              <div class="m-refresh">
                <i class="el-icon-refresh" @click="refresh"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="m-content-area">
          <div class="m-template">'name|count': string</div>
          <div class="m-example-area">
            <div class="m-example-code">
              Mock.mock({
              <div class="u-strong-red">&emsp;"string|5": "★★★★★"</div>
              })
            </div>

            <div class="m-example-result">
              <span class="m-badge">Result</span>

              {
              <div class="u-strong-red">&emsp;"string": "{{data.string}}"</div>
              }

              <div class="m-refresh">
                <i class="el-icon-refresh" @click=""></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Mock from "mockjs";
export default {
  data() {
    return {
      data: "",
    };
  },
  methods: {
    refresh() {
      this.data = Mock.mock({
        "string|1-10": "★",
      });
      console.log(this.data.string)
    },
  },
};
</script>
<style></style>
