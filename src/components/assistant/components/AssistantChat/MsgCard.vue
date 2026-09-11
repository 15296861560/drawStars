<template>
  <div class="msg-card" :class="{ 'msg-card__my': msgInfo.role }">
    <!--    <img class="user-avatar" :src="userAvatar" />-->

    <div class="msg-item" :class="{ 'msg-item__loading': msgInfo.loading }">
      <div v-if="msgInfo.content.emphasize" class="msg-emphasize">
        {{ msgInfo.content.emphasize }}
      </div>

      <div class="msg-text" :class="{ 'msg-text__loading': msgInfo.loading }">
        <!-- {{ msgInfo.content.prefixContent }} -->
        <XMarkdown :markdown="processedPrefixContent" />

        <div class="msg-operations">
          <div
            v-for="item in msgInfo.content.operations"
            class="btn-operate"
            :class="{
              'btn-operate__fill':
                item.isClick || item.status === 2 || msgInfo.id !== latestMsgId
            }"
            @click="msgAction(msgInfo.content, item)"
          >
            <el-icon
              v-if="item.status === 1 && msgInfo.id === latestMsgId"
              class="is-loading"
            >
              <Loading />
            </el-icon>

            {{ item.label || item.buttonName }}
          </div>
        </div>
        <el-icon v-if="msgInfo.loading" class="msg-loading is-loading">
          <Loading />
        </el-icon>
      </div>

      <div v-if="msgInfo.content.showBusinessCards" class="business-cards">
        <!-- <div class="business-card" @click="msgTextLink('低保办理')">
          <img class="business-card__icon" :src="getAssetsImgFile('assistant/like.png')" />
          <div class="business-card__content">
            <div class="card-title">低保办理</div>
            <div class="card-tip">享受最低生活保障补助的家庭</div>
          </div>
        </div> -->
        <!--        <div class="business-card" @click="msgTextLink('燃气巡查')">-->
        <!--          <img class="business-card__icon" :src="getAssetsImgFile('assistant/gas.png')" />-->
        <!--          <div class="business-card__content">-->
        <!--            <div class="card-title">燃气巡查</div>-->
        <!--            <div class="card-tip">享受最低生活保障补助的家庭</div>-->
        <!--          </div>-->
        <!--        </div>-->
        <!-- <div class="business-card" @click="msgTextLink('城市事件')">
          <img class="business-card__icon" :src="getAssetsImgFile('assistant/city.png')" />
          <div class="business-card__content">
            <div class="card-title">城市事件</div>
            <div class="card-tip">城市一网统管事件</div>
          </div>
        </div> -->
        <div class="business-card" @click="msgTextLink('手动接报')">
          <img
            class="business-card__icon"
            :src="getAssetsImgFile('assistant/like.png')"
          />
          <div class="business-card__content">
            <div class="card-title">手动接报</div>
            <div class="card-tip">多种数据源手动接报</div>
          </div>
        </div>
        <div class="business-card" @click="msgTextLink('事件日报')">
          <img
            class="business-card__icon"
            :src="getAssetsImgFile('assistant/city.png')"
          />
          <div class="business-card__content">
            <div class="card-title">事件日报</div>
            <div class="card-tip">一键总结当日事件信息</div>
          </div>
        </div>
      </div>

      <div v-if="msgInfo.content.extContent" class="msg-text">
        {{ msgInfo.content.extContent }}
      </div>

      <div v-if="msgInfo.content.btnExamples?.length" class="msg-btns">
        <div
          v-for="item in msgInfo.content.btnExamples"
          class="msg-btn-example"
          @click="msgTextLink(item)"
        >
          {{ item }}
        </div>
      </div>

      <div v-if="msgInfo.content.examples?.length" class="msg-examples">
        <div
          v-for="item in msgInfo.content.examples"
          class="msg-example"
          @click="msgTextLink(item, msgInfo.content.flag)"
        >
          {{ item }}
        </div>
      </div>

      <div
        v-for="extInfo in msgInfo.content.processList"
        v-if="msgInfo.content.processList?.length"
        class="msg-process"
      >
        <div class="ext-content ext-content__link">
          <div
            class="process-status"
            :class="{ 'process-status__success': extInfo.template?.isSubmit }"
          />
          {{ extInfo.name }}
        </div>

        <div class="msg-operations">
          <div
            v-for="item in extInfo.operations"
            class="btn-operate"
            :class="{
              'btn-operate__fill':
                item.isClick || item.status === 2 || msgInfo.id !== latestMsgId
            }"
            @click="msgAction(extInfo, item)"
          >
            <el-icon
              v-if="item.status === 1 && msgInfo.id === latestMsgId"
              class="is-loading"
            >
              <Loading />
            </el-icon>
            {{ item.label || item.buttonName }}
          </div>
        </div>
      </div>

      <div v-if="msgInfo.content.configList?.length" class="config-list">
        <div v-for="item in msgInfo.content.configList" class="w-full">
          <div
            v-if="item.chartType === 1"
            v-html="converChartType1(item)"
          ></div>

          <div
            v-if="
              item.chartType === 2 &&
              chartOption?.customSetting?.chartType === 'table'
            "
            class="chart-dom"
          >
            <div v-if="chartOption.title?.text" class="chart-dom__title">
              {{ chartOption.title?.text }}
            </div>

            <el-table
              ref="tableRef"
              :data="tableMsg.tableData"
              :stripe="chartOption.stripe"
              :border="chartOption.border"
              :default-sort="{
                prop: chartOption.customSetting.sortProp,
                order: chartOption.customSetting.sortOrder
              }"
            >
              <el-table-column label="序号" width="80px" type="index" />
              <template v-for="item in chartOption.columnList">
                <el-table-column
                  :label="item.label"
                  :prop="item.prop"
                  :show-overflow-tooltip="chartOption.showOverflowTooltip"
                  :sortable="item.prop === chartOption.customSetting.sortProp"
                />
              </template>
            </el-table>

            <div
              v-if="chartOption.pagination?.isUse"
              class="__pagination"
              style="margin: 5px 0"
            >
              <el-pagination
                v-model:currentPage="tableMsg.pageNo"
                v-model:page-size="tableMsg.pageSize"
                layout="total,prev,pager,next,jumper"
                :total="tableMsg.total"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>

          <div
            v-if="
              item.chartType === 2 &&
              chartOption?.customSetting?.chartType !== 'table'
            "
            ref="chartRef"
            class="chart-dom"
          ></div>
        </div>
      </div>

      <div v-if="msgInfo.content.numberAllCount" class="number-all-count">
        <div
          v-for="dataKey in Object.keys(msgInfo.content.numberAllCount)"
          class="data-card"
        >
          <img
            class="data-card__icon"
            :src="getAssetsImgFile(`assistant/low-${dataKey}.png`)"
          />
          <div class="data-card__content">
            <div class="card-title">
              {{ msgInfo.content.numberAllCount[dataKey] }}
            </div>
            <div class="card-tip">
              {{ msgInfo.content.numberAllCountTip[dataKey] }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="msgInfo.content.files?.length" class="chat-files">
        <div v-for="item in msgInfo.content.files" class="chat-file">
          <img
            class="chat-file__img"
            :src="getAssetsImgFile(`assistant/${getFileType(item)}.png`)"
          />

          <div class="file-info">
            <div class="file-name" :title="item.fileName">
              {{ item.fileName }}
            </div>
            <div class="file-tip">{{ item.size }}</div>
          </div>
        </div>
      </div>

      <div v-if="msgInfo.content.stop" class="msg-stop">
        <img
          class="clock-icon"
          :src="getAssetsImgFile('assistant/clock.png')"
        />
        <span class="stop-tip">已停止生成</span>
      </div>
    </div>

    <div v-if="msgInfo.isFail" class="msg-fail-icon">
      <el-icon><WarningFilled /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, toRefs, onMounted, reactive } from 'vue'
import { IReactive } from '@/types'
import { getAssetsImgFile } from '@/utils/tool'
import { useSetEcharts } from '@/hooks/echarts'

import { XMarkdown } from 'vue-element-plus-x'

const props = defineProps<{
  msgInfo: Object
  userId: String
  latestMsgId: String
}>()

const { msgInfo, latestMsgId } = toRefs(<IReactive>props)

const emit = defineEmits(['msg-action', 'msg-text-link'])

const processedPrefixContent = computed(() => {
  const content = msgInfo.value.content.prefixContent
  if (!content) return content

  // 使用正则表达式移除.和**之间的空格 否则数字不显示
  // 匹配点号后跟空格再跟**的模式，并替换为点号直接跟**
  return content.replace(/\.\s*\*\*/g, '.**')
})

const msgAction = (extInfo: IReactive, op: IReactive) => {
  if (op.isClick || op.status === 2 || msgInfo.value.id !== latestMsgId.value) {
    return
  }
  emit('msg-action', { extInfo, op, taskId: msgInfo.value?.content.taskId })
}

const msgTextLink = (link: string, flag = '') => {
  emit('msg-text-link', link, flag)
}

/**数据转换 */

const converChartType1 = (config: IReactive) => {
  const { dataText, data } = config

  return dataText.replace(/\$\{.*?\}/g, (x: string) => {
    const key = x.slice(2, -1)
    return `<span class='data-num'>${data[0]?.[key]}</span>`
  })
}

const chartRef = ref()
const chartOption = ref<IReactive>({})

const converChartType2 = (config: IReactive, chartDom: HTMLElement) => {
  const { data, options } = config

  const option = JSON.parse(options)[0] || {}
  chartOption.value = option

  if (option?.series) {
    handleRecords(option, data)
  } else {
    chartOption.value.data = data
    tableMsg.total = data.length

    if (chartOption.value?.pagination?.isUse) {
      tableMsg.pageSize = chartOption.value.pagination.pageSize
      tableMsg.tableData = data.slice(0, tableMsg.pageSize)
    } else {
      tableMsg.tableData = data
    }
  }

  const chartType = option?.customSetting?.chartType
  if (chartType === 'table') {
    handleTableSetting(option)
    return
  }

  if (!chartDom) return
  nextTick(() => {
    useSetEcharts(chartDom, option)
  })
}

const tableRef = ref()
const handleTableSetting = (option: IReactive) => {
  tableRef.value?.sort(
    option.customSetting.sortProp,
    option.customSetting.sortOrder
  )
}

const handleRecords = (chartOption: IReactive, records: Array<IReactive>) => {
  chartOption.customSetting = {
    ...chartOption.customSetting
  }

  let resData = [...records]
  const sortProp = chartOption.customSetting.sortProp
  const sortOrder = chartOption.customSetting.sortOrder
  if (sortProp && sortOrder && sortOrder === 'ascending') {
    resData.sort((a, b) => a[sortProp] - b[sortProp])
  }
  if (sortProp && sortOrder && sortOrder === 'descending') {
    resData.sort((a, b) => b[sortProp] - a[sortProp])
  }

  if (chartOption.xAxis) {
    chartOption.xAxis.data = resData.map(
      obj => obj[chartOption.customSetting.dimensionality]
    )
  }
  chartOption.series[0].data = resData.map(
    obj => obj[chartOption.customSetting.indicator[0]]
  )
}

const getFileType = (file: IReactive) => {
  const fileName = file.fileName?.toLocaleLowerCase() || ''
  if (fileName.endsWith('docx') || fileName.endsWith('doc')) {
    return 'WORD'
  }
  if (fileName.endsWith('pdf') || fileName.endsWith('ppt')) {
    return 'PDF'
  }
  if (fileName.endsWith('xls') || fileName.endsWith('xlsx')) {
    return 'Excel'
  }
  if (fileName.endsWith('mp3') || fileName.endsWith('m4a')) {
    return 'audio-file'
  }

  return 'WORD'
}

const tableMsg = reactive({
  tableData: [],
  pageSize: 10,
  pageNo: 1,
  total: 0
})

const handleCurrentChange = (e: number) => {
  tableMsg.pageNo = e
  tableMsg.tableData =
    chartOption.value.data?.slice(
      (tableMsg.pageNo - 1) * tableMsg.pageSize,
      tableMsg.pageNo * tableMsg.pageSize
    ) || []
}

onMounted(() => {
  if (msgInfo.value.content.configList?.length) {
    msgInfo.value.content.configList.forEach((item: IReactive) => {
      if (item.chartType === 2) {
        converChartType2(item, chartRef.value[0])
      }
    })
  }
})
</script>

<style scoped lang="less">
.msg-card {
  width: 100%;
  display: flex;
  margin-bottom: 15px;
  max-width: 1000px;

  .user-avatar {
    width: 40px;
    height: 40px;
    margin-right: 15px;
  }

  .msg-fail-icon {
    color: red;
    font-size: 24px;
    right: -15px;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    height: fit-content;
  }

  .msg-item {
    overflow: hidden;
    background: #ffffff;
    border-radius: 10px;
    box-sizing: border-box;
    padding: 8px 15px;
    &__loading {
    }
    .process-status {
      margin-right: 10px;
      position: relative;
      width: 50px;
      min-width: 50px;
      height: 33px;
      background: url('@/assets/img/assistant/file.png') no-repeat;
      background-size: 100%;
      &__success {
        &::after {
          content: '';
          width: 14px;
          height: 14px;
          position: absolute;
          right: 0;
          bottom: 0;
          background: url('@/assets/img/assistant/success.png') no-repeat;
          background-size: 100%;
        }
      }
    }
    .msg-text {
      font-size: 16px;
      color: #333333;
      white-space: pre-line;
      line-height: 24px;
      .msg-loading {
        position: relative;
        top: 2px;
      }
      &__loading {
        // color: white;
      }
    }

    .msg-operations {
      display: flex;
      gap: 5px;
      .btn-operate {
        min-width: 52px;
        height: 34px;
        background: #ffffff;
        border: 1px solid var(--el-color-primary);
        border-radius: 2px;
        color: var(--el-color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        cursor: pointer;
        &:hover {
          opacity: 0.8;
        }
        &__fill {
          background: #8ba0cf;
          border-radius: 2px;
          border: none;
          color: #ffffff;
          cursor: not-allowed;
          &:hover {
            opacity: 1;
          }
        }
      }
    }

    .msg-process {
      margin-top: 10px;

      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      min-height: 50px;
      background: #f5f7fd;
      border-radius: 4px;
      margin-bottom: 5px;
      padding: 8px;
      box-sizing: border-box;
      .ext-content {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: var(--el-color-primary);
        margin-right: 10px;
        &__link {
          text-decoration-line: underline;
        }
      }
    }
    .msg-emphasize {
      font-size: 20px;
      color: #333333;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .business-cards {
      display: flex;
      justify-content: space-between;
      margin: 15px 0px;
      gap: 25px;
      .business-card {
        width: 450px;
        height: 100px;
        background: linear-gradient(128deg, #f0f4ff, #f4f9fd 91%);
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        &__icon {
          width: 64px;
          height: 64px;
        }
        &__content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          .card-title {
            font-size: 18px;
            color: #333333;
          }
          .card-tip {
            font-size: 14px;
            color: #7a859a;
          }
        }
        &:hover {
          .business-card__content {
            .card-title {
              color: var(--el-color-primary);
            }
            .card-tip {
              color: var(--el-color-primary);
            }
          }
        }

        &__disabled {
          cursor: not-allowed;
          background-color: var(--el-disabled-bg-color);
          color: var(--el-disabled-text-color);
          .business-card__content {
            .card-title {
              color: var(--el-disabled-text-color);
            }
            .card-tip {
              color: var(--el-disabled-text-color);
            }
          }
          &:hover {
            .business-card__content {
              .card-title {
                color: var(--el-disabled-text-color);
              }
              .card-tip {
                color: var(--el-disabled-text-color);
              }
            }
          }
        }
      }
    }

    .msg-btns {
      margin-top: 10px;
      display: flex;
      gap: 15px;
      .msg-btn-example {
        width: 84px;
        height: 30px;
        background: #edf6ff;
        border-radius: 6px;
        font-size: 16px;
        color: var(--el-color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        &:hover {
          opacity: 0.8;
        }

        &__disabled {
          cursor: not-allowed;
          background-color: var(--el-disabled-bg-color);
          color: var(--el-disabled-text-color);
          &:hover {
            opacity: 1;
          }
        }
      }
    }

    .msg-examples {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 10px 0px;
      .msg-example {
        font-size: 16px;
        color: var(--el-color-primary);
        cursor: pointer;
        &:hover {
          opacity: 0.8;
        }
      }
    }

    .config-list {
      max-width: 100%;
      width: 1100px;
      :deep(.data-num) {
        color: var(--el-color-primary);
      }
      .chart-dom {
        width: 100%;
        min-height: 227px;
        margin-top: 20px;
        &__title {
          margin-bottom: 10px;
          font-weight: bold;
        }
      }
    }

    .number-all-count {
      max-width: 100%;
      width: 1100px;
      display: flex;
      .data-card {
        width: 25%;
        height: 66px;
        background: #f8faff;
        display: flex;
        align-items: center;
        gap: 10px;
        padding-left: 15px;
        box-sizing: border-box;
        &__icon {
          width: 30px;
          height: 30px;
        }
        &__content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          .card-title {
            font-size: 24px;
            color: #333333;
            font-weight: bold;
          }
          .card-tip {
            font-size: 14px;
            color: #7a859a;
            text-wrap: nowrap;
          }
        }
      }
    }

    .chat-files {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 5px;
      max-height: 140px;
      padding-top: 5px;
      .chat-file {
        width: 24%;
        min-width: 200px;
        height: 60px;
        background: #ffffff;
        border: 1px solid #f0f0f0;
        border-radius: 4px;
        padding: 10px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
        &__img {
          width: 30px;
          height: 30px;
        }
        .file-info {
          display: flex;
          flex-direction: column;
          .file-name {
            width: 154px;
            font-size: 14px;
            color: #333333;
            text-wrap: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 4px;
          }
          .file-tip {
            width: 100%;
            font-size: 12px;
            color: #9fa7ba;
            &__danger {
              color: #ff2020;
            }
          }
        }
      }
    }
  }

  &__my {
    flex-direction: row-reverse;
    .user-avatar {
      margin-left: 15px;
      margin-right: 0px;
    }
    .msg-fail-icon {
      right: 15px;
    }
    .msg-item {
      background: #d3e8ff;
      .msg-text {
        color: #202327;
      }
    }
  }

  .msg-stop {
    display: flex;
    align-items: center;
    gap: 5px;
    .clock-icon {
      width: 20px;
      height: 20px;
    }
    .stop-tip {
      font-size: 14px;
      color: #9fa7ba;
    }
  }
}
</style>
