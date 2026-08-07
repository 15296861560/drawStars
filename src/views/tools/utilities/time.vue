<template>
  <div class="g-flex-column border-normal utilities-page">
    <div class="m-block">
      <div class="m-block-title">时间</div>
      <div class="m-block-content">
        <div class="m-content-title">获取时间戳</div>
        <div class="m-content-area">
          <div class="m-template">
            Date.now() / getTime() / performance.now()
          </div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div class="u-strong-red">Date.now();</div>
              <div>返回当前毫秒时间戳（推荐）</div>
            </div>
            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ timeInMs1 }}</div>
              <br />
              <div class="m-refresh">
                <el-icon @click="getTimeInMs(1)"><Refresh /></el-icon>
              </div>
            </div>
          </div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div class="u-strong-red">new Date().getTime();</div>
              <div>与 Date.now() 等效，但会先创建 Date 实例</div>
            </div>
            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ timeInMs2 }}</div>
              <br />
              <div class="m-refresh">
                <el-icon @click="getTimeInMs(2)"><Refresh /></el-icon>
              </div>
            </div>
          </div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div class="u-strong-red">performance.now();</div>
              <div>高精度相对时间（页面加载起），适合性能计时</div>
            </div>
            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ timeInMs3 }}</div>
              <br />
              <div class="m-refresh">
                <el-icon @click="getTimeInMs(3)"><Refresh /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="m-content-area">
          <div class="m-template">解析 Date 对象字段</div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div class="u-strong-red">const curTime = new Date();</div>
              <div>通过 getFullYear / getMonth / getDate 等读取各部分</div>
            </div>
            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div v-if="curTime">
                curTime:
                <div class="u-strong-red">{{ curTime }}</div>
                完整年份(4位)
                <span class="u-strong-blue"><br />curTime.getFullYear():</span>
                <div class="u-strong-red">{{ curTime.getFullYear() }}</div>
                月份(0-11，0 代表 1 月)
                <span class="u-strong-blue"><br />curTime.getMonth():</span>
                <div class="u-strong-red">{{ curTime.getMonth() }}</div>
                日(1-31)
                <span class="u-strong-blue"><br />curTime.getDate():</span>
                <div class="u-strong-red">{{ curTime.getDate() }}</div>
                星期(0-6，0 代表星期日)
                <span class="u-strong-blue"><br />curTime.getDay():</span>
                <div class="u-strong-red">
                  {{ curTime.getDay() }}（{{ weekDayLabel }}）
                </div>
                时间戳(ms)
                <span class="u-strong-blue"><br />curTime.getTime():</span>
                <div class="u-strong-red">{{ curTime.getTime() }}</div>
                时 / 分 / 秒 / 毫秒
                <span class="u-strong-blue"
                  ><br />getHours / getMinutes / getSeconds /
                  getMilliseconds:</span
                >
                <div class="u-strong-red">
                  {{ curTime.getHours() }}:{{ curTime.getMinutes() }}:{{
                    curTime.getSeconds()
                  }}.{{ curTime.getMilliseconds() }}
                </div>
                本地化日期 / 时间 / 日期时间
                <span class="u-strong-blue"
                  ><br />toLocaleDateString / toLocaleTimeString /
                  toLocaleString:</span
                >
                <div class="u-strong-red">
                  {{ curTime.toLocaleDateString() }} /
                  {{ curTime.toLocaleTimeString() }} /
                  {{ curTime.toLocaleString() }}
                </div>
              </div>
              <br />
              <div class="m-refresh">
                <el-icon @click="getCurTime"><Refresh /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="m-content-area">
          <div class="m-template">格式化为 YYYY-MM-DD HH:mm:ss</div>
          <div class="m-example-area">
            <div class="m-example-code">
              <pre class="u-strong-red m-code-pre">{{ formatCode }}</pre>
            </div>
            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ formattedTime }}</div>
              <br />
              <div class="m-refresh">
                <el-icon @click="formatNow"><Refresh /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="m-content-area">
          <div class="m-template">ISO / UTC 与时区偏移</div>
          <div class="m-example-area">
            <div class="m-example-code">
              <div class="u-strong-red">date.toISOString();</div>
              <div class="u-strong-red">date.getTimezoneOffset();</div>
              <div>偏移分钟：本地 = UTC + (-offset)</div>
            </div>
            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div>
                ISO:
                <div class="u-strong-red">{{ isoTime }}</div>
                UTC 字符串:
                <div class="u-strong-red">{{ utcTime }}</div>
                时区偏移(分钟):
                <div class="u-strong-red">{{ timezoneOffset }}</div>
              </div>
              <br />
              <div class="m-refresh">
                <el-icon @click="getIsoUtc"><Refresh /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="m-content-area">
          <div class="m-template">解析日期字符串 / 计算时间差</div>
          <div class="m-example-area is-stack">
            <div class="m-example-code">
              <div class="m-form-row">
                <span>开始：</span>
                <el-input
                  v-model="diffStart"
                  placeholder="YYYY-MM-DD HH:mm:ss"
                  class="m-form-input"
                />
                <span>结束：</span>
                <el-input
                  v-model="diffEnd"
                  placeholder="YYYY-MM-DD HH:mm:ss"
                  class="m-form-input"
                />
                <el-button type="primary" size="small" @click="calcDiff">
                  计算
                </el-button>
              </div>
              <pre class="u-strong-red m-code-pre mt10">{{ diffCode }}</pre>
            </div>
            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div class="u-strong-red">{{ diffResult }}</div>
            </div>
          </div>
        </div>

        <div class="m-content-area">
          <div class="m-template">相对时间（刚刚 / N 分钟前）</div>
          <div class="m-example-area">
            <div class="m-example-code">
              <pre class="u-strong-red m-code-pre">{{ relativeCode }}</pre>
            </div>
            <div class="m-example-result">
              <span class="m-badge">Result</span>
              <br />
              <div v-for="item in relativeSamples" :key="item.label">
                {{ item.label }}:
                <span class="u-strong-red">{{ item.value }}</span>
              </div>
              <br />
              <div class="m-refresh">
                <el-icon @click="refreshRelative"><Refresh /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
const WEEK_DAYS = [
  '星期日',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六'
]

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatDate(date) {
  const y = date.getFullYear()
  const m = pad2(date.getMonth() + 1)
  const d = pad2(date.getDate())
  const h = pad2(date.getHours())
  const min = pad2(date.getMinutes())
  const s = pad2(date.getSeconds())
  return y + '-' + m + '-' + d + ' ' + h + ':' + min + ':' + s
}

function parseDateInput(value) {
  const text = String(value || '').trim()
  if (!text) return null
  const normalized = text.replace(/-/g, '/')
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return null
  return date
}

function formatDuration(ms) {
  const abs = Math.abs(ms)
  const sign = ms < 0 ? '-' : ''
  const day = Math.floor(abs / 86400000)
  const hour = Math.floor((abs % 86400000) / 3600000)
  const minute = Math.floor((abs % 3600000) / 60000)
  const second = Math.floor((abs % 60000) / 1000)
  return (
    sign +
    day +
    '天 ' +
    hour +
    '小时 ' +
    minute +
    '分 ' +
    second +
    '秒（' +
    ms +
    ' ms）'
  )
}

function toRelative(from, to = Date.now()) {
  const diff = to - from
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return '刚刚'
  const min = Math.floor(sec / 60)
  if (min < 60) return min + '分钟前'
  const hour = Math.floor(min / 60)
  if (hour < 24) return hour + '小时前'
  const day = Math.floor(hour / 24)
  if (day < 30) return day + '天前'
  return formatDate(new Date(from))
}

export default {
  data() {
    const now = new Date()
    const start = new Date(now.getTime() - 90 * 60 * 1000)
    return {
      timeInMs1: '',
      timeInMs2: '',
      timeInMs3: '',
      curTime: null,
      formattedTime: '',
      isoTime: '',
      utcTime: '',
      timezoneOffset: '',
      diffStart: formatDate(start),
      diffEnd: formatDate(now),
      diffResult: '',
      relativeSamples: [],
      formatCode:
        'function formatDate(date) {\n' +
        "  const pad = n => String(n).padStart(2, '0')\n" +
        '  return [\n' +
        '    date.getFullYear(),\n' +
        '    pad(date.getMonth() + 1),\n' +
        '    pad(date.getDate())\n' +
        "  ].join('-') + ' ' + [\n" +
        '    pad(date.getHours()),\n' +
        '    pad(date.getMinutes()),\n' +
        '    pad(date.getSeconds())\n' +
        "  ].join(':')\n" +
        '}',
      diffCode:
        "const start = new Date(startText.replace(/-/g, '/'))\n" +
        "const end = new Date(endText.replace(/-/g, '/'))\n" +
        'const ms = end - start',
      relativeCode:
        'const sec = Math.floor((Date.now() - t) / 1000)\n' +
        "if (sec < 60) return '刚刚'\n" +
        "if (sec < 3600) return Math.floor(sec / 60) + '分钟前'"
    }
  },
  computed: {
    weekDayLabel() {
      if (!this.curTime) return ''
      return WEEK_DAYS[this.curTime.getDay()]
    }
  },
  methods: {
    getTimeInMs(key) {
      if (key === 1) this.timeInMs1 = Date.now()
      if (key === 2) this.timeInMs2 = new Date().getTime()
      if (key === 3) this.timeInMs3 = performance.now().toFixed(3) + ' ms'
    },
    getCurTime() {
      this.curTime = new Date()
    },
    formatNow() {
      this.formattedTime = formatDate(new Date())
    },
    getIsoUtc() {
      const date = new Date()
      this.isoTime = date.toISOString()
      this.utcTime = date.toUTCString()
      this.timezoneOffset = date.getTimezoneOffset()
    },
    calcDiff() {
      const start = parseDateInput(this.diffStart)
      const end = parseDateInput(this.diffEnd)
      if (!start || !end) {
        this.diffResult = '日期格式无效，请使用 YYYY-MM-DD HH:mm:ss'
        return
      }
      const ms = end.getTime() - start.getTime()
      this.diffResult = formatDuration(ms)
    },
    refreshRelative() {
      const now = Date.now()
      this.relativeSamples = [
        { label: '30s 前', value: toRelative(now - 30 * 1000, now) },
        { label: '5 分钟前', value: toRelative(now - 5 * 60 * 1000, now) },
        {
          label: '3 小时前',
          value: toRelative(now - 3 * 60 * 60 * 1000, now)
        },
        {
          label: '2 天前',
          value: toRelative(now - 2 * 24 * 60 * 60 * 1000, now)
        }
      ]
    }
  },
  mounted() {
    this.getTimeInMs(1)
    this.getTimeInMs(2)
    this.getTimeInMs(3)
    this.getCurTime()
    this.formatNow()
    this.getIsoUtc()
    this.calcDiff()
    this.refreshRelative()
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

.m-code-pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: anywhere;
  font-family: Consolas, Monaco, monospace;
  line-height: 1.5;
  max-width: 100%;
}

.m-form-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  max-width: 100%;
}

.m-form-input {
  width: 240px;
  max-width: 100%;
}

.mt10 {
  margin-top: 10px;
}
</style>
