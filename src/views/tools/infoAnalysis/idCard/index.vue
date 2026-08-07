<template>
  <div class="g-flex-column border-normal">
    <div class="m-block">
      <div class="m-block-title">{{ $t('title') }}</div>
      <div class="m-block-content">
        <div class="m-content-area">
          <el-form @submit.prevent>
            <el-form-item :label="$t('label')">
              <div class="query-row">
                <el-input
                  v-model="idNumber"
                  clearable
                  maxlength="18"
                  :placeholder="$t('placeholder')"
                  class="query-input"
                  @keyup.enter="handleAnalyze"
                />
                <el-button type="primary" @click="handleAnalyze">
                  {{ $t('analyze') }}
                </el-button>
                <el-button @click="handleClear">{{ $t('clear') }}</el-button>
              </div>
            </el-form-item>
          </el-form>

          <el-alert
            v-if="result"
            :title="result.message"
            :type="result.valid ? 'success' : 'warning'"
            show-icon
            :closable="false"
            class="mb12"
          />

          <el-descriptions
            v-if="result && result.addressCode"
            :title="$t('resultTitle')"
            :column="2"
            border
          >
            <el-descriptions-item :label="$t('fields.idNumber')">
              {{ result.idNumber }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('fields.check')">
              {{
                result.checkPassed
                  ? $t('fields.checkPass')
                  : $t('fields.checkFail')
              }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('fields.address')">
              {{ result.address }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('fields.addressCode')">
              {{ result.addressCode }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('fields.birthday')">
              {{ result.birthday }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('fields.age')">
              {{ result.age ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('fields.gender')">
              {{ result.gender }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('fields.sequentialCode')">
              {{ result.sequentialCode }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { analyzeIdCard } from '../utils/idCard'
import { ElMessage } from 'element-plus'
import { i18nLabelMixin } from '@/views/mixin/i18nLabelMixin'

export default {
  mixins: [i18nLabelMixin],
  data() {
    return {
      idNumber: '',
      result: null
    }
  },
  methods: {
    handleAnalyze() {
      const result = analyzeIdCard(this.idNumber)
      this.result = result
      if (!this.idNumber.trim()) {
        ElMessage.warning(result.message)
      }
    },
    handleClear() {
      this.idNumber = ''
      this.result = null
    }
  }
}
</script>

<style scoped>
.query-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.query-input {
  width: 360px;
  max-width: 100%;
}
.mb12 {
  margin-bottom: 12px;
}
</style>

<i18n>
{
  "en": {
    "title": "ID Card Analysis",
    "label": "ID Number",
    "placeholder": "Enter 15 or 18 digit ID number",
    "analyze": "Analyze",
    "clear": "Clear",
    "resultTitle": "Analysis Result",
    "fields": {
      "idNumber": "ID Number",
      "check": "Checksum",
      "checkPass": "Passed",
      "checkFail": "Failed",
      "address": "Region",
      "addressCode": "Region Code",
      "birthday": "Birthday",
      "age": "Age",
      "gender": "Gender",
      "sequentialCode": "Sequence"
    }
  },
  "zh": {
    "title": "身份证信息分析",
    "label": "身份证号",
    "placeholder": "请输入 15 或 18 位身份证号",
    "analyze": "分析",
    "clear": "清空",
    "resultTitle": "分析结果",
    "fields": {
      "idNumber": "身份证号",
      "check": "校验位",
      "checkPass": "通过",
      "checkFail": "未通过",
      "address": "户籍地",
      "addressCode": "地区编码",
      "birthday": "出生日期",
      "age": "年龄",
      "gender": "性别",
      "sequentialCode": "顺序码"
    }
  }
}
</i18n>
