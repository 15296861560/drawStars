<template>
  <div class="g-flex-column border-normal utilities-page">
    <div class="m-block">
      <div class="m-block-title">正则表达式</div>

      <div class="m-block-content">
        <div class="m-content-title">字面量 / 构造函数</div>
        <div class="m-content-area">
          <div class="m-template">
            <span>测试输入:</span>
            <el-input
              v-model="regexInput1"
              placeholder="请输入测试内容"
              class="m-form-input"
              @keyup.enter="runRegex(1)"
            />
          </div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div class="u-strong-red">/^[a-zA-Z]+$/.test(str)</div>
              <div>仅字母（直接量）</div>
            </div>
            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ regexResult1 }}</div>
              <br />
              <div class="m-refresh">
                <el-icon @click="runRegex(1)"><Refresh /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="m-content-area">
          <div class="m-template">
            <span>测试输入:</span>
            <el-input
              v-model="regexInput2"
              placeholder="请输入测试内容"
              class="m-form-input"
              @keyup.enter="runRegex(2)"
            />
          </div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div class="u-strong-red">
                new RegExp('^[a-zA-Z]+$').test(str)
              </div>
              <div>构造函数写法，适合动态拼接模式</div>
            </div>
            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ regexResult2 }}</div>
              <br />
              <div class="m-refresh">
                <el-icon @click="runRegex(2)"><Refresh /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="m-block-content">
        <div class="m-content-title">search / replace / match / exec</div>
        <div class="m-content-area">
          <div class="m-template">
            <span>测试输入:</span>
            <el-input
              v-model="regexInput3"
              placeholder="例：abc123xyz"
              class="m-form-input"
              @keyup.enter="runRegex(3)"
            />
          </div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div class="u-strong-red">str.search(/[0-9]/)</div>
              <div>返回首个数字的起始下标，未匹配为 -1</div>
            </div>
            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ regexResult3 }}</div>
              <br />
              <div class="m-refresh">
                <el-icon @click="runRegex(3)"><Refresh /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="m-content-area">
          <div class="m-template">
            <span>测试输入:</span>
            <el-input
              v-model="regexInput4"
              placeholder="例：订单A12B34"
              class="m-form-input"
              @keyup.enter="runRegex(4)"
            />
          </div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div class="u-strong-red">str.replace(/[0-9]/g, '*')</div>
              <div>全局替换数字为 *</div>
            </div>
            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ regexResult4 }}</div>
              <br />
              <div class="m-refresh">
                <el-icon @click="runRegex(4)"><Refresh /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="m-content-area">
          <div class="m-template">
            <span>测试输入:</span>
            <el-input
              v-model="regexInput5"
              placeholder="例：Tel: 138-0013-8000"
              class="m-form-input"
              @keyup.enter="runRegex(5)"
            />
          </div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div class="u-strong-red">str.match(/\d+/g)</div>
              <div>提取全部连续数字片段</div>
            </div>
            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ regexResult5 }}</div>
              <br />
              <div class="m-refresh">
                <el-icon @click="runRegex(5)"><Refresh /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="m-content-area">
          <div class="m-template">
            <span>测试输入:</span>
            <el-input
              v-model="regexInput6"
              placeholder="例：id=12&name=Tom"
              class="m-form-input"
              @keyup.enter="runRegex(6)"
            />
          </div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div class="u-strong-red">
                /([\w]+)=([\w]+)/g.exec 循环提取键值对
              </div>
            </div>
            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ regexResult6 }}</div>
              <br />
              <div class="m-refresh">
                <el-icon @click="runRegex(6)"><Refresh /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="m-block-content">
        <div class="m-content-title">常用正则（点击填入并测试）</div>
        <div class="m-content-area">
          <div class="m-template">
            <span>测试输入:</span>
            <el-input
              v-model="exampleInput"
              placeholder="请输入测试内容"
              class="m-form-input"
              @keyup.enter="exampleRegExp"
            />
          </div>
          <div class="m-example-area is-stack">
            <div class="m-example-code">
              <div class="m-form-row">
                <span>模式:</span>
                <el-input
                  ref="regexInput"
                  v-model="regExp"
                  placeholder="请输入正则（不含两端 / ）"
                  class="m-form-input m-form-input--wide"
                  @keyup.enter="exampleRegExp"
                />
                <span class="m-flag-label">
                  标志
                  <el-tooltip
                    placement="top"
                    :show-after="120"
                    popper-class="regex-flag-tip-popper"
                  >
                    <template #content>
                      <div>
                        <div>正则标志（flags）可组合使用，例如 gi：</div>
                        <div>g：全局匹配，找出全部结果</div>
                        <div>i：忽略大小写</div>
                        <div>m：多行模式，^/$ 匹配每行首尾</div>
                        <div>s：点号 . 可匹配换行符</div>
                        <div>u：Unicode 模式</div>
                        <div>y：粘性匹配，从 lastIndex 位置开始</div>
                      </div>
                    </template>
                    <el-icon class="m-flag-tip-icon"><WarningFilled /></el-icon>
                  </el-tooltip>
                  :
                </span>
                <el-input
                  v-model="regFlags"
                  placeholder="gi"
                  class="m-form-input m-form-input--flag"
                  @keyup.enter="exampleRegExp"
                />
                <el-button type="primary" size="small" @click="exampleRegExp">
                  测试
                </el-button>
              </div>
            </div>
            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ exampleResult }}</div>
            </div>
            <div
              class="m-example-code m-example-clickable"
              v-for="(item, index) in exampleList"
              :key="index"
              @click="applyExample(item)"
            >
              <div class="u-strong-blue">{{ item.explain }}</div>
              <div class="u-strong-red">{{ item.regExp }}</div>
              <div v-if="item.sample" class="m-sample">
                示例值: {{ item.sample }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import exampleData from './data'

export default {
  data() {
    return {
      regexInput1: 'Hello',
      regexInput2: 'Hello123',
      regexInput3: 'abc123xyz',
      regexInput4: '订单A12B34',
      regexInput5: 'Tel: 138-0013-8000',
      regexInput6: 'id=12&name=Tom&role=admin',
      regexResult1: '',
      regexResult2: '',
      regexResult3: '',
      regexResult4: '',
      regexResult5: '',
      regexResult6: '',
      regExp: '^[a-zA-Z0-9_-]{4,16}$',
      regFlags: '',
      exampleInput: 'user_01',
      exampleResult: '',
      exampleList: []
    }
  },
  methods: {
    runRegex(key) {
      switch (key) {
        case 1: {
          const regex1 = /^[a-zA-Z]+$/
          this.regexResult1 = String(regex1.test(this.regexInput1))
          break
        }
        case 2: {
          const regex2 = new RegExp('^[a-zA-Z]+$')
          this.regexResult2 = String(regex2.test(this.regexInput2))
          break
        }
        case 3:
          this.regexResult3 = String(this.regexInput3.search(/[0-9]/))
          break
        case 4:
          this.regexResult4 = this.regexInput4.replace(/[0-9]/g, '*')
          break
        case 5: {
          const matched = this.regexInput5.match(/\d+/g)
          this.regexResult5 = matched ? JSON.stringify(matched) : 'null'
          break
        }
        case 6: {
          const re = /([\w]+)=([\w]+)/g
          const pairs = []
          let m = re.exec(this.regexInput6)
          while (m) {
            pairs.push(m[1] + '=' + m[2])
            m = re.exec(this.regexInput6)
          }
          this.regexResult6 = pairs.length ? JSON.stringify(pairs) : '无匹配'
          break
        }
        default:
          break
      }
    },
    applyExample(item) {
      this.regExp = item.regExp
      if (item.sample) this.exampleInput = item.sample
      this.exampleRegExp()
      this.$nextTick(() => {
        const input = this.$refs.regexInput
        if (input && input.focus) input.focus()
        if (input && input.select) input.select()
      })
    },
    exampleRegExp() {
      const pattern = String(this.regExp || '').trim()
      if (!pattern) {
        this.exampleResult = '请先输入正则表达式'
        return
      }
      try {
        const flags = String(this.regFlags || '').replace(/[^gimsuy]/g, '')
        const regex = new RegExp(pattern, flags)
        const text = this.exampleInput
        const ok = regex.test(text)
        let detail = 'test: ' + ok
        if (flags.includes('g')) {
          const all = text.match(regex)
          detail += ' | match: ' + JSON.stringify(all)
        } else {
          const one = text.match(regex)
          detail += ' | match: ' + JSON.stringify(one)
        }
        this.exampleResult = detail
      } catch (e) {
        this.exampleResult = '正则无效: ' + (e && e.message ? e.message : e)
      }
    }
  },
  mounted() {
    this.exampleList = exampleData.exampleList
    ;[1, 2, 3, 4, 5, 6].forEach(k => this.runRegex(k))
    this.exampleRegExp()
  }
}
</script>
<style scoped>
.utilities-page {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  align-items: stretch;
  flex-wrap: nowrap;
  overflow-x: hidden;
}

.utilities-page :deep(.m-block),
.utilities-page :deep(.m-block-content),
.utilities-page :deep(.m-content-area),
.utilities-page :deep(.m-example-area) {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.utilities-page :deep(.m-template) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  box-sizing: border-box;
}

.utilities-page :deep(.m-example-code),
.utilities-page :deep(.m-example-result) {
  width: calc((100% - 50px) / 2);
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.utilities-page :deep(.m-example-area.is-stack) {
  flex-direction: column;
}

.utilities-page :deep(.m-example-area.is-stack .m-example-code),
.utilities-page :deep(.m-example-area.is-stack .m-example-result) {
  width: 100%;
  margin-right: 0;
}

.utilities-page :deep(.m-example-area.is-stack .m-example-code::after),
.utilities-page :deep(.m-example-area.is-stack .m-example-code ::after) {
  display: none;
}

@media (max-width: 960px) {
  .utilities-page :deep(.m-example-code),
  .utilities-page :deep(.m-example-result) {
    width: 100%;
    margin-right: 0;
  }

  .utilities-page :deep(.m-example-code::after),
  .utilities-page :deep(.m-example-code ::after) {
    display: none;
  }
}

.m-form-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  max-width: 100%;
}

.m-form-input {
  width: 280px;
  max-width: 100%;
}

.m-form-input--wide {
  width: 420px;
}

.m-form-input--flag {
  width: 80px;
}

.m-flag-label {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.m-flag-tip-icon {
  color: #e6a23c;
  cursor: help;
  font-size: 14px;
  vertical-align: middle;
}

.m-example-clickable {
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.m-example-clickable:hover {
  box-shadow: 0 0 0 2px #409eff inset;
}

.m-sample {
  margin-top: 6px;
  color: #666;
  font-size: 12px;
  word-break: break-all;
}
</style>
<style>
.regex-flag-tip-popper {
  max-width: 300px;
  line-height: 1.6;
}
</style>
