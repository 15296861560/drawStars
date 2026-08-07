<template>
  <div class="q-renderer" v-if="visible">
    <div class="q-title">
      <span v-if="showNumber" class="q-no">{{ index }}.</span>
      <span>{{ question.title }}</span>
      <span v-if="effectiveRequired" class="req">*</span>
    </div>
    <div v-if="question.description" class="q-desc">
      {{ question.description }}
    </div>
    <div class="q-body">
      <template v-if="type === 'radio' || type === 'judge'">
        <el-radio-group v-model="inner" :disabled="readonly">
          <el-radio
            v-for="(opt, i) in options"
            :key="optKey(opt, i)"
            :value="optKey(opt, i)"
          >
            {{ opt.content }}
          </el-radio>
        </el-radio-group>
        <el-input
          v-if="isOtherSelected"
          v-model="otherText"
          class="mt8"
          :disabled="readonly"
          placeholder="请填写其他"
        />
      </template>
      <template v-else-if="type === 'checkbox'">
        <el-checkbox-group v-model="innerArr" :disabled="readonly">
          <el-checkbox
            v-for="(opt, i) in options"
            :key="optKey(opt, i)"
            :value="optKey(opt, i)"
          >
            {{ opt.content }}
          </el-checkbox>
        </el-checkbox-group>
      </template>
      <template v-else-if="type === 'input'">
        <el-input
          v-model="inner"
          :disabled="readonly"
          :placeholder="cfg.placeholder || '请输入'"
          :maxlength="cfg.maxLength"
        />
      </template>
      <template v-else-if="type === 'textarea'">
        <el-input
          v-model="inner"
          type="textarea"
          :rows="4"
          :disabled="readonly"
          :placeholder="cfg.placeholder || '请输入'"
          :maxlength="cfg.maxLength"
        />
      </template>
      <template v-else-if="type === 'number'">
        <el-input-number
          v-model="innerNum"
          :disabled="readonly"
          :min="cfg.min"
          :max="cfg.max"
          :step="cfg.step || 1"
        />
      </template>
      <template v-else-if="type === 'rating'">
        <el-rate
          v-model="innerNum"
          :disabled="readonly"
          :max="cfg.ratingMax || 5"
        />
      </template>
      <template v-else-if="type === 'date'">
        <el-date-picker
          v-model="inner"
          :type="datePickerType"
          :disabled="readonly"
          :format="dateDisplayFormat"
          :value-format="dateValueFormat"
          :placeholder="cfg.placeholder || '请选择日期'"
        />
      </template>
      <template v-else-if="type === 'slider'">
        <el-slider
          v-model="innerNum"
          :disabled="readonly"
          :min="cfg.min ?? 0"
          :max="cfg.max ?? 100"
          :step="cfg.step || 1"
          show-input
        />
      </template>
      <template v-else-if="type === 'sort'">
        <div class="sort-list">
          <div v-for="(item, i) in sortList" :key="item" class="sort-item">
            <span>{{ i + 1 }}. {{ optionLabel(item) }}</span>
            <span>
              <el-button
                size="small"
                :disabled="readonly || i === 0"
                @click="moveSort(i, -1)"
                >上移</el-button
              >
              <el-button
                size="small"
                :disabled="readonly || i === sortList.length - 1"
                @click="moveSort(i, 1)"
                >下移</el-button
              >
            </span>
          </div>
        </div>
      </template>
      <template v-else-if="type === 'matrix_radio'">
        <el-table :data="matrixRows" border size="small">
          <el-table-column prop="label" label="" width="120" />
          <el-table-column
            v-for="col in matrixColumns"
            :key="col.id"
            :label="col.label"
            align="center"
          >
            <template #default="{ row }">
              <el-radio
                v-model="matrixMap[row.id]"
                :value="col.id"
                :disabled="readonly"
                @change="emitMatrix"
                >&nbsp;</el-radio
              >
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template v-else-if="type === 'matrix_input'">
        <el-table :data="matrixRows" border size="small">
          <el-table-column prop="label" label="" width="120" />
          <el-table-column
            v-for="col in matrixColumns"
            :key="col.id"
            :label="col.label"
          >
            <template #default="{ row }">
              <el-input
                v-model="matrixMap[row.id + '_' + col.id]"
                :disabled="readonly"
                size="small"
                @input="emitMatrix"
              />
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template v-else-if="type === 'image' || type === 'file'">
        <el-input
          v-model="inner"
          :disabled="readonly"
          :placeholder="
            type === 'image' ? '请填写图片URL或上传后的地址' : '请填写文件URL'
          "
        />
      </template>
      <template v-else-if="type === 'signature'">
        <div class="sign-box">
          <canvas
            ref="canvasRef"
            class="sign-canvas"
            @mousedown="startDraw"
            @mousemove="drawing"
            @mouseup="endDraw"
            @mouseleave="endDraw"
          />
          <div class="sign-actions">
            <el-button size="small" :disabled="readonly" @click="clearSign"
              >清除</el-button
            >
            <el-button
              size="small"
              type="primary"
              :disabled="readonly"
              @click="saveSign"
              >确认签名</el-button
            >
          </div>
          <img v-if="inner" :src="inner" class="sign-preview" alt="signature" />
        </div>
      </template>
      <template v-else-if="type === 'location'">
        <div class="loc-panel">
          <el-button
            type="primary"
            :disabled="readonly"
            :loading="locLoading"
            @click="getLocation"
            >获取定位</el-button
          >
          <el-button
            v-if="!readonly && hasLocCoords"
            :disabled="locLoading"
            @click="resolveAddressFromCoords"
            >解析地址</el-button
          >
          <div class="loc-fields">
            <div class="loc-item">
              <div class="loc-label">经度</div>
              <el-input
                v-model="locForm.longitude"
                :disabled="readonly"
                placeholder="例如 116.397428"
              />
            </div>
            <div class="loc-item">
              <div class="loc-label">纬度</div>
              <el-input
                v-model="locForm.latitude"
                :disabled="readonly"
                placeholder="例如 39.90923"
              />
            </div>
            <div class="loc-item loc-item-full">
              <div class="loc-label">位置信息</div>
              <el-input
                v-model="locForm.address"
                type="textarea"
                :rows="2"
                :disabled="readonly"
                placeholder="获取定位后自动回填，也可手动修改"
              />
            </div>
          </div>
        </div>
      </template>
      <div v-else class="unsupported">暂不支持的题型：{{ type }}</div>
    </div>
    <div v-if="error" class="q-error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  reactive,
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick
} from 'vue'
import { ElMessage } from 'element-plus'
import type { Question, QuestionConfig } from '@/types/survey'
import { getQuestionType } from '../types'
import { reverseGeocode } from '../utils/geocode'

const props = withDefaults(
  defineProps<{
    question: Question
    modelValue?: any
    index?: number
    showNumber?: boolean
    readonly?: boolean
    visible?: boolean
    forceRequired?: boolean
    error?: string
  }>(),
  {
    index: 1,
    showNumber: true,
    readonly: false,
    visible: true,
    forceRequired: false,
    error: ''
  }
)
const emit = defineEmits<{ 'update:modelValue': [any] }>()

const EMPTY_CFG: QuestionConfig = Object.freeze({})
const EMPTY_ARR: readonly any[] = Object.freeze([])

const type = computed(() => props.question.type)
const cfg = computed(() => props.question.config || EMPTY_CFG)
const options = computed(() => cfg.value.options || EMPTY_ARR)
/** 稳定引用，避免 el-table :data 每次渲染拿到新 [] 触发无限更新 */
const matrixRows = computed(() => cfg.value.rows || EMPTY_ARR)
const matrixColumns = computed(() => cfg.value.columns || EMPTY_ARR)
const datePickerType = computed(() => {
  if (cfg.value.dateType === 'datetime') return 'datetime'
  if (cfg.value.dateType === 'daterange') return 'daterange'
  return 'date'
})
/** Element Plus 展示/绑定格式；默认 yyyy-MM-dd HH:mm:ss（datetime） */
const dateDisplayFormat = computed(() => {
  if (cfg.value.dateType === 'daterange') return 'YYYY-MM-DD'
  if (cfg.value.dateType === 'date') return 'YYYY-MM-DD'
  return 'YYYY-MM-DD HH:mm:ss'
})
const dateValueFormat = computed(() => dateDisplayFormat.value)
const effectiveRequired = computed(
  () => props.forceRequired || !!props.question.required
)

function optKey(opt: any, i: number) {
  return String(opt.id ?? opt.content ?? i)
}
function optionLabel(key: string) {
  const opt = options.value.find((o: any, i: number) => optKey(o, i) === key)
  return opt?.content || key
}

const inner = ref<any>('')
const innerArr = ref<any[]>([])
const innerNum = ref<number | undefined>()
const locLoading = ref(false)
const locForm = reactive({
  longitude: '',
  latitude: '',
  address: ''
})
const hasLocCoords = computed(() => {
  const lng = Number(locForm.longitude)
  const lat = Number(locForm.latitude)
  return !Number.isNaN(lng) && !Number.isNaN(lat)
})
const otherText = ref('')
const sortList = ref<string[]>([])
const matrixMap = reactive<Record<string, any>>({})
const canvasRef = ref<HTMLCanvasElement | null>(null)
let drawingFlag = false

const isOtherSelected = computed(() => {
  const opts = options.value
  const sel = inner.value
  const other = opts.find((o: any) => o.isOther)
  if (!other) return false
  return sel === optKey(other, opts.indexOf(other))
})

function normalizeOut() {
  if (type.value === 'location') {
    return {
      value: {
        longitude: locForm.longitude === '' ? '' : locForm.longitude,
        latitude: locForm.latitude === '' ? '' : locForm.latitude,
        address: locForm.address || ''
      }
    }
  }
  if (type.value === 'checkbox') return { value: [...innerArr.value] }
  if (
    type.value === 'number' ||
    type.value === 'rating' ||
    type.value === 'slider'
  )
    return { value: innerNum.value }
  if (type.value === 'sort') return { value: [...sortList.value] }
  if (type.value === 'matrix_radio' || type.value === 'matrix_input')
    return { value: { ...matrixMap } }
  if (type.value === 'radio' || type.value === 'judge') {
    return { value: inner.value, otherText: otherText.value }
  }
  return { value: inner.value }
}

function emitValue() {
  const next = normalizeOut()
  const prev = props.modelValue
  try {
    if (prev != null && JSON.stringify(prev) === JSON.stringify(next)) return
  } catch (_e) {
    /* ignore */
  }
  emit('update:modelValue', next)
}

function emitMatrix() {
  emitValue()
}

watch(
  [inner, innerArr, innerNum, otherText, sortList],
  () => {
    if (type.value === 'location') return
    emitValue()
  },
  { deep: true }
)
watch(
  locForm,
  () => {
    if (type.value === 'location') emitValue()
  },
  { deep: true }
)

watch(
  () => props.modelValue,
  v => {
    const val = v?.value !== undefined ? v.value : v
    if (type.value === 'checkbox') {
      innerArr.value = Array.isArray(val) ? [...val] : []
    } else if (
      type.value === 'number' ||
      type.value === 'rating' ||
      type.value === 'slider'
    ) {
      innerNum.value = val === '' || val == null ? undefined : Number(val)
    } else if (type.value === 'sort') {
      if (Array.isArray(val) && val.length) sortList.value = [...val]
    } else if (type.value === 'matrix_radio' || type.value === 'matrix_input') {
      Object.keys(matrixMap).forEach(k => delete matrixMap[k])
      Object.assign(matrixMap, val || {})
    } else if (type.value === 'location') {
      applyLocationValue(val)
    } else {
      inner.value = val ?? ''
      otherText.value = v?.otherText || ''
    }
  },
  { immediate: true, deep: true }
)

onMounted(() => {
  if (type.value === 'sort' && !sortList.value.length) {
    sortList.value = options.value.map((o: any, i: number) => optKey(o, i))
    emitValue()
  }
  if (type.value === 'signature') {
    nextTick(() => {
      syncSignCanvasSize()
      if (typeof ResizeObserver !== 'undefined' && canvasRef.value) {
        signResizeObserver = new ResizeObserver(() => syncSignCanvasSize())
        signResizeObserver.observe(canvasRef.value)
      }
    })
  }
})

onBeforeUnmount(() => {
  signResizeObserver?.disconnect()
  signResizeObserver = null
})

function moveSort(i: number, delta: number) {
  const j = i + delta
  if (j < 0 || j >= sortList.value.length) return
  const arr = [...sortList.value]
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
  sortList.value = arr
}

let lastX = 0
let lastY = 0
let signResizeObserver: ResizeObserver | null = null

function syncSignCanvasSize() {
  const el = canvasRef.value
  if (!el) return
  const w = Math.max(1, Math.round(el.clientWidth))
  const h = Math.max(1, Math.round(el.clientHeight))
  if (el.width === w && el.height === h) return
  // 调整位图尺寸会清空画布；若已有确认签名预览则保留 inner
  el.width = w
  el.height = h
}
function startDraw(e: MouseEvent) {
  if (props.readonly) return
  drawingFlag = true
  const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
  lastX = e.clientX - rect.left
  lastY = e.clientY - rect.top
}
function drawing(e: MouseEvent) {
  if (!drawingFlag || !canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  ctx.strokeStyle = '#222'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  lastX = x
  lastY = y
}
function endDraw() {
  drawingFlag = false
}
function clearSign() {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  ctx?.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  inner.value = ''
}
function saveSign() {
  if (!canvasRef.value) return
  inner.value = canvasRef.value.toDataURL('image/png')
}
function parseLocationValue(val: any) {
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    return {
      longitude: val.longitude != null ? String(val.longitude) : '',
      latitude: val.latitude != null ? String(val.latitude) : '',
      address: val.address != null ? String(val.address) : ''
    }
  }
  if (typeof val === 'string' && val.includes(',')) {
    const parts = val.split(',').map(x => x.trim())
    if (
      parts.length >= 2 &&
      !Number.isNaN(Number(parts[0])) &&
      !Number.isNaN(Number(parts[1]))
    ) {
      // historical "lat,lng" string
      return { latitude: parts[0], longitude: parts[1], address: '' }
    }
  }
  return { longitude: '', latitude: '', address: '' }
}

function applyLocationValue(val: any) {
  const next = parseLocationValue(val)
  if (
    locForm.longitude === next.longitude &&
    locForm.latitude === next.latitude &&
    locForm.address === next.address
  ) {
    return
  }
  locForm.longitude = next.longitude
  locForm.latitude = next.latitude
  locForm.address = next.address
}

function onLocFieldChange() {
  emitValue()
}

async function resolveAddressFromCoords() {
  const lng = Number(locForm.longitude)
  const lat = Number(locForm.latitude)
  if (Number.isNaN(lng) || Number.isNaN(lat)) {
    return
  }
  locLoading.value = true
  try {
    const address = await reverseGeocode(lng, lat)
    if (address) {
      locForm.address = address
      emitValue()
    } else {
      ElMessage.warning('未能自动解析地址，请手动填写位置信息')
    }
  } finally {
    locLoading.value = false
  }
}

function getLocation() {
  if (!navigator.geolocation) {
    locForm.address = '浏览器不支持定位'
    emitValue()
    return
  }
  locLoading.value = true
  navigator.geolocation.getCurrentPosition(
    async pos => {
      locForm.latitude = String(pos.coords.latitude)
      locForm.longitude = String(pos.coords.longitude)
      emitValue()
      try {
        const address = await reverseGeocode(
          pos.coords.longitude,
          pos.coords.latitude
        )
        if (address) {
          locForm.address = address
        } else {
          ElMessage.warning(
            '经纬度已获取，地址解析失败，请手动填写或点击「解析地址」重试'
          )
        }
        emitValue()
      } finally {
        locLoading.value = false
      }
    },
    () => {
      locLoading.value = false
      if (!locForm.latitude && !locForm.longitude) {
        locForm.address = '定位失败，请手动填写'
      }
      emitValue()
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  )
}

defineExpose({
  validate() {
    const def = getQuestionType(props.question.type)
    const q = { ...props.question, required: effectiveRequired.value }
    return def?.validate(normalizeOut(), q) || null
  }
})
</script>

<style scoped>
.q-renderer {
  margin-bottom: 20px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
.q-title {
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.5;
}
.q-no {
  margin-right: 4px;
  color: #666;
}
.req {
  color: #f56c6c;
  margin-left: 4px;
}
.q-desc {
  color: #909399;
  font-size: 13px;
  margin-bottom: 8px;
}
.q-error {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 6px;
}
.mt8 {
  margin-top: 8px;
}
.sort-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px dashed #eee;
}
.sign-box {
  width: 100%;
}
.sign-canvas {
  display: block;
  width: 100%;
  height: 180px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  cursor: crosshair;
  box-sizing: border-box;
}
.sign-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}
.sign-preview {
  display: block;
  margin: 12px auto 0;
  max-width: 100%;
  border: 1px solid #eee;
  border-radius: 4px;
}
.loc-panel {
  margin-top: 4px;
}
.loc-fields {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 12px;
}
@media (max-width: 768px) {
  .loc-fields {
    grid-template-columns: 1fr;
  }
  .sign-canvas {
    height: 160px;
  }
}
.loc-item {
  min-width: 0;
}
.loc-item-full {
  grid-column: 1 / -1;
}
.loc-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}
.loc-text {
  margin-top: 8px;
  color: #606266;
  font-size: 13px;
}
.unsupported {
  color: #909399;
}
</style>
