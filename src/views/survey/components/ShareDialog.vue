<template>
  <base-dialog
    v-model="visible"
    title="分享问卷"
    width="600px"
    :options="dialogOptions"
  >
    <el-form label-width="90px">
      <el-form-item label="来源渠道">
        <el-select
          v-model="source"
          clearable
          filterable
          allow-create
          default-first-option
          placeholder="选择或输入来源"
          style="width: 100%"
          @change="refresh"
        >
          <el-option
            v-for="item in sourceOptions"
            :key="item.source"
            :label="item.label || item.source"
            :value="item.source"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="填写链接">
        <el-input v-model="fillUrl" readonly>
          <template #append>
            <el-button @click="copy(fillUrl)">复制</el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item v-if="sourceLinks.length" label="渠道链接">
        <div class="source-links">
          <div
            v-for="link in sourceLinks"
            :key="link.source"
            class="source-link-row"
          >
            <span>{{ link.label || link.source }}</span>
            <el-button link type="primary" @click="copy(link.url)"
              >复制</el-button
            >
          </div>
        </div>
      </el-form-item>
      <el-form-item label="二维码">
        <div class="qr-wrap">
          <img v-if="qrUrl" :src="qrUrl" alt="qrcode" class="qr-img" />
          <el-button size="small" @click="downloadQr">下载二维码</el-button>
        </div>
      </el-form-item>
      <el-form-item label="嵌入代码">
        <el-input v-model="embedCode" type="textarea" :rows="3" readonly />
        <el-button class="mt8" size="small" @click="copy(embedCode)"
          >复制嵌入代码</el-button
        >
      </el-form-item>
      <el-form-item label="站内通知">
        <el-input
          v-model="notifyIds"
          placeholder="用户ID，逗号分隔"
          clearable
        />
        <el-button
          class="mt8"
          type="primary"
          size="small"
          :loading="notifying"
          @click="doNotify"
        >
          通知用户
        </el-button>
      </el-form-item>
    </el-form>
  </base-dialog>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  buildFillUrl,
  getEmbedCode,
  notifyShare,
  getShareInfo
} from '@/api/survey'

const BaseDialog = defineAsyncComponent(
  () => import('@/components/base/form/BaseDialog.vue')
)

const props = defineProps<{
  modelValue: boolean
  surveyId: number | string
  shareCode: string
  fillUrlProp?: string
  sourceLinksProp?: Array<{ source: string; label?: string; url: string }>
}>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const dialogOptions = reactive({
  fieldList: [],
  hideConfirm: true,
  cancelText: '关闭',
  labelPosition: 'left'
})

const source = ref('')
const fillUrl = ref('')
const baseFillUrl = ref('')
const qrUrl = ref('')
const embedCode = ref('')
const notifyIds = ref('')
const notifying = ref(false)
const sourceLinks = ref<Array<{ source: string; label?: string; url: string }>>(
  []
)
const sourceOptions = ref<
  Array<{ source: string; label?: string; url?: string }>
>([
  { source: 'wechat', label: 'WeChat' },
  { source: 'email', label: 'Email' },
  { source: 'qrcode', label: 'QR' },
  { source: 'link', label: 'Link' }
])

function absoluteUrl(url: string) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  if (url.startsWith('/')) return origin + url
  return origin + '/' + url
}

function fallbackFillPath(code: string) {
  return absoluteUrl('/survey/fill/' + code)
}

function refresh() {
  const base = baseFillUrl.value || fallbackFillPath(props.shareCode)
  if (source.value) {
    const matched = sourceLinks.value.find(l => l.source === source.value)
    if (matched?.url) {
      fillUrl.value = absoluteUrl(matched.url)
    } else {
      const u = new URL(absoluteUrl(base))
      u.searchParams.set('source', source.value)
      fillUrl.value = u.toString()
    }
  } else {
    fillUrl.value = absoluteUrl(base)
  }
  qrUrl.value =
    'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' +
    encodeURIComponent(fillUrl.value)
  embedCode.value = getEmbedCode(fillUrl.value)
}

async function loadShareMeta() {
  baseFillUrl.value = ''
  sourceLinks.value = []
  if (props.fillUrlProp) {
    baseFillUrl.value = absoluteUrl(props.fillUrlProp)
  }
  if (props.sourceLinksProp?.length) {
    sourceLinks.value = props.sourceLinksProp.map(l => ({
      ...l,
      url: absoluteUrl(l.url)
    }))
  }
  if (props.surveyId) {
    try {
      const info = await getShareInfo(props.surveyId)
      if (info?.fillUrl) baseFillUrl.value = absoluteUrl(info.fillUrl)
      if (info?.sourceLinks?.length) {
        sourceLinks.value = info.sourceLinks.map(l => ({
          ...l,
          url: absoluteUrl(l.url)
        }))
      }
    } catch (_e) {
      /* fallback local build */
    }
  }
  if (!baseFillUrl.value) {
    baseFillUrl.value = props.shareCode
      ? buildFillUrl(props.shareCode)
      : fallbackFillPath(props.shareCode)
  }
  if (sourceLinks.value.length) {
    const extras = sourceLinks.value.map(l => ({
      source: l.source,
      label: l.label || l.source,
      url: l.url
    }))
    const map = new Map(sourceOptions.value.map(o => [o.source, o]))
    extras.forEach(o => map.set(o.source, o))
    sourceOptions.value = Array.from(map.values())
  }
  refresh()
}

watch(
  () => [props.modelValue, props.shareCode, props.surveyId, props.fillUrlProp],
  () => {
    if (props.modelValue && (props.shareCode || props.fillUrlProp)) {
      loadShareMeta()
    }
  },
  { immediate: true }
)

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制')
  } catch (_e) {
    ElMessage.error('复制失败，请手动选择')
  }
}

function downloadQr() {
  const a = document.createElement('a')
  a.href = qrUrl.value
  a.download = 'survey-qr.png'
  a.target = '_blank'
  a.click()
}

async function doNotify() {
  const userIds = notifyIds.value
    .split(',')
    .map(s => Number(s.trim()))
    .filter(n => !Number.isNaN(n) && n > 0)
  if (!userIds.length) {
    ElMessage.warning('请填写用户ID')
    return
  }
  notifying.value = true
  try {
    const res = await notifyShare(props.surveyId, {
      userIds,
      message: '邀请您填写问卷：' + fillUrl.value
    })
    if (res?.status === false) {
      ElMessage.error(res.msg || '通知失败')
      return
    }
    ElMessage.success('已发送通知')
  } catch (e: any) {
    ElMessage.error(e?.message || '通知失败')
  } finally {
    notifying.value = false
  }
}
</script>

<style scoped>
.qr-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.qr-img {
  width: 180px;
  height: 180px;
  border: 1px solid #eee;
}
.mt8 {
  margin-top: 8px;
}
.source-links {
  width: 100%;
}
.source-link-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px dashed #ebeef5;
  font-size: 13px;
}
</style>
