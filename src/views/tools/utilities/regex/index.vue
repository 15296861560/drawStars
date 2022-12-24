<template>
  <div class="g-flex-column">
    <div class="m-block">
      <div class="m-block-title">正则表达式</div>
      <div class="m-block-content">
        <div class="m-content-title">使用直接量写法</div>
        <div class="m-content-area">
          <div class="m-template">
            <span>测试输入:</span
            ><el-input
              v-model="regexInput1"
              placeholder="请输入测试内容"
              @keyup.enter.native="regex(1)"
            ></el-input>
          </div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div class="u-strong-red">regex = /^[a-zA-Z]+$/;</div>
            </div>

            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ regexResult1 }}</div>
              <br />
              <div class="m-refresh">
                <el-icon @click="regex(1)"><Refresh /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="m-block-content">
        <div class="m-content-title">使用内置构造函数生成</div>
        <div class="m-content-area">
          <div class="m-template">
            <span>测试输入:</span
            ><el-input
              v-model="regexInput2"
              placeholder="请输入测试内容"
              @keyup.enter.native="regex(2)"
            ></el-input>
          </div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div class="u-strong-red">regex = new RegExp('^[a-zA-Z]+$');</div>
            </div>

            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ regexResult2 }}</div>
              <br />
              <div class="m-refresh">
                <el-icon @click="regex(2)"><Refresh /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="m-block-content">
        <div class="m-content-title">搜索字符串, 并显示匹配的起始位置</div>
        <div class="m-content-area">
          <div class="m-template">
            <span>测试输入:</span
            ><el-input
              v-model="regexInput3"
              placeholder="请输入测试内容"
              @keyup.enter.native="regex(3)"
            ></el-input>
          </div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div class="u-strong-red">str.search('[0-9]');</div>
            </div>

            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ regexResult3 }}</div>
              <br />
              <div class="m-refresh">
                <el-icon @click="regex(3)"><Refresh /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="m-block-content">
        <div class="m-content-title">使用正则表达式进行替换</div>
        <div class="m-content-area">
          <div class="m-template">
            <span>测试输入:</span
            ><el-input
              v-model="regexInput4"
              placeholder="请输入测试内容"
              @keyup.enter.native="regex(4)"
            ></el-input>
          </div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div class="u-strong-red">str.replace(/[0-9]/g,"*");</div>
            </div>

            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ regexResult4 }}</div>
              <br />
              <div class="m-refresh">
                <el-icon @click="regex(4)"><Refresh /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="m-block-content">
        <div class="m-content-title">常用例子</div>
        <div class="m-content-area">
          <div class="m-template">
            <span>测试输入:</span
            ><el-input
              v-model="exmampleInput"
              placeholder="请输入测试内容"
              @keyup.enter.native="exmampleInputClick"
            ></el-input>
          </div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div>
                <input
                  class="m-input-normal"
                  ref="regex"
                  v-model="regExp"
                  placeholder="请输入正则表达式"
                  @keyup.enter="exampleRegExp"
                />
              </div>
            </div>

            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ exampleResult }}</div>
              <br />
              <div class="m-refresh">
                <el-icon @click="exampleRegExp"><Refresh /></el-icon>
              </div>
            </div>

            <div class="m-example-code" v-for="(item, index) in exampleList" :key="index">
              <div class="u-strong-blue">{{ item.explain }}</div>
              <div class="u-strong-red">{{ item.regExp }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import exampleData from "./data";
export default {
  data() {
    return {
      regexInput1: "",
      regexInput2: "",
      regexInput3: "",
      regexInput4: "",
      regexResult1: "",
      regexResult2: "",
      regexResult3: "",
      regexResult4: "",
      regExp: "",
      exmampleInput: "",
      exampleResult: "",

      exampleList: [],
    };
  },
  methods: {
    regex(key) {
      switch (key) {
        case 1:
          let regex1 = /^[a-zA-Z]+$/; // 直接量正则表达式
          this.regexResult1 = regex1.test(this.regexInput1);
          break;
        case 2:
          var regex2 = new RegExp("^[a-zA-Z]+$"); // 构造函数
          this.regexResult2 = regex2.test(this.regexInput2);
          break;
        case 3:
          this.regexResult3 = this.regexInput3.search("[0-9]");
          break;
        case 4:
          this.regexResult4 = this.regexInput4.replace(/[0-9]/g, "*");
          break;
        default:
          break;
      }
    },
    exmampleInputClick() {
      this.refs.regex.select();
    },
    exampleRegExp() {
      let regex = new RegExp(this.regExp);
      this.exampleResult = regex.test(this.exmampleInput);
    },
  },

  mounted() {
    this.exampleList = exampleData.exampleList;
  },
};
</script>
<style></style>
