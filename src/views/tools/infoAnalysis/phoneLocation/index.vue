<template>
  <div class="g-flex-column border-normal" v-loading="loading">
    <div class="m-block">
      <div class="m-block-title">{{ $t('title') }}</div>
      <div class="m-block-content">
        <div class="m-content-area">
          <el-form @submit.prevent>
            <el-form-item :label="$t('label')">
              <div class="query-row">
                <el-input
                  v-model="phone"
                  clearable
                  maxlength="11"
                  :placeholder="$t('placeholder')"
                  class="query-input"
                  @keyup.enter="handleQuery"
                />
                <el-button type="primary" @click="handleQuery">
                  {{ $t('query') }}
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
            v-if="result && result.valid"
            :title="$t('resultTitle')"
            :column="2"
            border
          >
            <el-descriptions-item :label="$t('fields.phone')">
              {{ result.phone }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('fields.carrier')">
              {{ result.carrier }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('fields.province')">
              {{ result.province }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('fields.city')">
              {{ result.city }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('fields.source')">
              {{
                result.source === 'api'
                  ? $t('fields.sourceApi')
                  : $t('fields.sourceLocal')
              }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { queryPhoneLocation } from '../utils/phoneLocation'
import { ElMessage } from 'element-plus'
import { i18nLabelMixin } from '@/views/mixin/i18nLabelMixin'

export default {
  mixins: [i18nLabelMixin],
  data() {
    return {
      phone: '',
      loading: false,
      result: null
    }
  },
  methods: {
    async handleQuery() {
      this.loading = true
      try {
        const result = await queryPhoneLocation(this.phone)
        this.result = result
        if (!result.valid) {
          ElMessage.warning(result.message)
        }
      } finally {
        this.loading = false
      }
    },
    handleClear() {
      this.phone = ''
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
    "title": "Phone Number Location",
    "label": "Phone",
    "placeholder": "Enter 11-digit mobile number",
    "query": "Query",
    "clear": "Clear",
    "resultTitle": "Query Result",
    "fields": {
      "phone": "Phone",
      "carrier": "Carrier",
      "province": "Province",
      "city": "City",
      "source": "Data Source",
      "sourceApi": "Online API",
      "sourceLocal": "Local Prefix"
    }
  },
  "zh": {
    "title": "手机号码归属地查询",
    "label": "手机号",
    "placeholder": "请输入 11 位手机号码",
    "query": "查询",
    "clear": "清空",
    "resultTitle": "查询结果",
    "fields": {
      "phone": "手机号",
      "carrier": "运营商",
      "province": "省份",
      "city": "城市",
      "source": "数据来源",
      "sourceApi": "在线接口",
      "sourceLocal": "本地号段"
    }
  }
}
</i18n>
