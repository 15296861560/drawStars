<template>
  <el-form-item :label="field.columnName" :prop="field.column">
    <el-input
      v-model="modelValue"
      placeholder="请选择地址"
      :disabled="props.disabled"
      :readonly="true"
      @click="handleOpenLatLngDialog"
    >
      <template v-if="!props.disabled" #suffix
        ><el-icon class="cursor-pointer" @click="state.isShowMapDialog = true"
          ><MapLocation /></el-icon
      ></template>
    </el-input>

    <!--    添加经纬度弹框-->
    <el-dialog
      v-model="state.isShowLatLngDialog"
      title="添加经纬度"
      width="35%"
      class="__dialog"
      :close-on-click-modal="false"
      @close="state.isShowLatLngDialog = false"
    >
      <el-form
        :model="state.latLngFormInfo"
        ref="latLngFormRef"
        label-width="105px"
        class="pl-4 reset-form"
        label-position="top"
      >
        <el-row class="mb-4">
          <el-col :span="24">
            <el-form-item label="单个点位：">
              <el-row :gutter="20" justify="space-between" class="w-full">
                <el-col :span="12">
                  <el-input
                    v-model="state.latLngFormInfo.centerPoint.lng"
                    placeholder="请输入经度"
                  ></el-input>
                </el-col>
                <el-col :span="12">
                  <el-input
                    v-model="state.latLngFormInfo.centerPoint.lat"
                    placeholder="请输入纬度"
                  ></el-input>
                </el-col>
              </el-row>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" class="pr-5">
            <el-form-item label="区域点位：">
              <div class="text-yellow-500">
                支持输入多个经纬度，格式要求：[经度,纬度];[经度,纬度]
              </div>
              <div class="mb-2 text-yellow-500">
                输入示例：[109.5078017, 18.2546674];[109.5167951, 18.2502168]
              </div>
              <el-input
                v-model="state.latLngFormInfo.pointListString"
                :autosize="{ minRows: 8, maxRows: 16 }"
                type="textarea"
                placeholder="请输入多个经纬度"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer class="dialog-footer">
        <div class="text-center __button">
          <el-button type="primary" @click="handleSubmitLatLng"
            >保 存</el-button
          >
          <el-button @click="state.isShowLatLngDialog = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!--    添加经纬度地图绘制弹框-->
    <el-dialog
      v-model="state.isShowMapDialog"
      title="点击地图拾取坐标"
      width="50%"
      class="__dialog"
      :close-on-click-modal="false"
      @close="state.isShowMapDialog = false"
    >
      <grid-map
        v-if="state.isShowMapDialog"
        ref="gridMapRef"
        :lat-lng-info="state.latLngFormInfo"
        @set-point-info="handleSetPointInfo"
      ></grid-map>
    </el-dialog>
  </el-form-item>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useVModels } from '@vueuse/core'
import type { AnyObject } from '@/types/global'
import GridMap from '@/components/base/map/GridMap.vue'

const props = defineProps<{
  field: AnyObject
  valueModel?: string
  search?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:valueModel', value: string): void
}>()

const { valueModel } = useVModels(props, emit)

const modelValue = ref('')

const state = reactive({
  isShowMapDialog: false,
  isShowLatLngDialog: false,
  formInfo: {
    code: '',
    id: '',
    name: '',
    pcode: '',
    pid: '',
    point: ''
  },
  latLngFormInfo: {
    centerPoint: {
      lat: '',
      lng: ''
    },
    pointListString: '',
    point: [],
    type: ''
  }
})

const parseLatLng = inputString => {
  // 清理输入，统一使用英文逗号和分号，并去掉方括号
  const cleanedInput = inputString
    .replace(/[，；;]/g, ',')
    .replace(/\[|\]/g, '')

  // 将字符串分割成多个坐标对
  const pairs = cleanedInput.split(',')

  // 创建一个数组来保存转换后的对象
  const pointList = []

  // 遍历坐标对，并构建对象
  for (let i = 0; i < pairs.length; i += 2) {
    const lat = parseFloat(pairs[i])
    const lng = parseFloat(pairs[i + 1])
    if (!isNaN(lat) && !isNaN(lng)) {
      pointList.push({ lat, lng })
    }
  }
  // 构建最终的 JSON 结构
  return pointList
}
const generateInputString = result => {
  // 验证结果是否具有rangePoint属性并且是一个数组
  if (!result || !Array.isArray(result)) {
    return ''
  }

  // 构建输入字符串
  const pointStrings = result.map(point => {
    return `[${point.lat},${point.lng}]`
  })

  // 使用分号连接各个点
  return pointStrings.join(';')
}

const handleOpenLatLngDialog = () => {
  if (state.latLngFormInfo.type === 1) {
    state.latLngFormInfo.centerPoint = state.latLngFormInfo.point[0]
    state.latLngFormInfo.pointListString = ''
  } else {
    state.latLngFormInfo.pointListString =
      state.formInfo.point &&
      generateInputString(JSON.parse(state.formInfo.point))
    state.latLngFormInfo.centerPoint = { lat: '', lng: '' }
  }
  state.isShowLatLngDialog = true
}

const handleCommonPoint = data => {
  state.latLngFormInfo.point = data.point
  state.formInfo.point = JSON.stringify(data.point)
  state.latLngFormInfo.pointListString = generateInputString(
    JSON.parse(state.formInfo.point)
  )
  const point = Array.isArray(data.point) ? data.point[0] : data.point
  modelValue.value = `${point.lat},${point.lng}`
}

const handleSetPointInfo = data => {
  state.isShowMapDialog = false
  state.latLngFormInfo.type = data.type
  switch (data.type) {
    case 1:
      state.latLngFormInfo.centerPoint = data.centerPoint
      state.latLngFormInfo.point[0] = data.centerPoint
      state.formInfo.point = JSON.stringify(data.centerPoint)
      modelValue.value = `${data.centerPoint.lat},${data.centerPoint.lng}`
      state.latLngFormInfo.pointListString = ''
      break
    case 2:
      handleCommonPoint(data)
      break
    case 3:
      handleCommonPoint(data)
      break
    default:
      state.formInfo.point = ''
      state.latLngFormInfo.point = []
      state.latLngFormInfo.centerPoint = {
        lat: '',
        lng: ''
      }
      state.latLngFormInfo.pointListString = ''
      modelValue.value = ''
      break
  }

  valueModel.value = JSON.stringify({
    type: state.latLngFormInfo.type,
    point:
      state.latLngFormInfo.type === 1
        ? [state.latLngFormInfo.centerPoint]
        : state.latLngFormInfo.point
  })
}

const handleSubmitLatLng = () => {
  state.isShowLatLngDialog = false
  if (
    state.latLngFormInfo.centerPoint?.lng &&
    state.latLngFormInfo.centerPoint?.lat
  ) {
    state.formInfo.point = JSON.stringify(state.latLngFormInfo.centerPoint)
    modelValue.value = `${state.latLngFormInfo.centerPoint?.lat},${state.latLngFormInfo.centerPoint?.lng}`
    state.latLngFormInfo.type = 1
  } else {
    state.latLngFormInfo.centerPoint = {
      lat: '',
      lng: ''
    }
    state.formInfo.point = null
    modelValue.value = ''
  }
  if (state.latLngFormInfo.pointListString) {
    state.latLngFormInfo.point = parseLatLng(
      state.latLngFormInfo.pointListString
    )
    state.formInfo.point = JSON.stringify(state.latLngFormInfo.point)
    modelValue.value = `${state.latLngFormInfo.point[0]?.lat},${state.latLngFormInfo.point[0]?.lng}`
    state.latLngFormInfo.type = 3
  }

  valueModel.value = JSON.stringify({
    type: state.latLngFormInfo.type,
    point:
      state.latLngFormInfo.type === 1
        ? [state.latLngFormInfo.centerPoint]
        : state.latLngFormInfo.point
  })
}

onMounted(() => {
  if (valueModel.value) {
    const data = JSON.parse(valueModel.value)
    state.formInfo.point = JSON.stringify(data?.point)
    modelValue.value = `${data.point[0].lat},${data.point[0].lng}`
    Object.assign(state.latLngFormInfo, data)
  }
})

defineExpose({
  modelValue
})
</script>
<style scoped lang="less">
.simple-map-box {
  height: 50vh;
}
</style>
