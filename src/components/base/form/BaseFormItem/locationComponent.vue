<template>
  <div>
    <el-input
      v-model="modelValue"
      placeholder="请选择地址"
      :disabled="props.disabled"
      :readonly="true"
    >
      <template v-if="!props.disabled" #suffix>
        <el-link type="primary" @click="mapDialogVisble = true"
          >点击定位</el-link
        >
      </template>
    </el-input>

    <!--  点位选择弹窗 -->
    <el-dialog
      v-model="mapDialogVisble"
      title="选择地点"
      width="45%"
      :close-on-click-modal="false"
      :show-close="false"
      :append-to-body="true"
    >
      <div class="simple-map-box">
        <simple-map
          ref="simpleMapRef"
          v-model:show="mapDialogVisble"
          :reuse-form="reuseForm"
          search
          :range="props.range"
        />
      </div>

      <template #footer>
        <div class="text-center">
          <el-button @click="mapDialogVisble = false"> 取 消</el-button>
          <el-button type="primary" @click="handleSave"> 确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, watchEffect } from 'vue'
import * as _Global from '@/types/global'
import { useVModels } from '@vueuse/core'

const SimpleMap = defineAsyncComponent(
  () => import('@/components/base/map/SimpleLeafletMap.vue')
)

const props = defineProps<{
  field: string | number | boolean | string[] | any
  valueModel?: string
  search?: boolean
  range?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:valueModel', value: string): void
}>()

const { valueModel } = useVModels(props, emit)

const modelValue = ref(valueModel.value?.split(',').reverse().join(',') || '')
let radius = ''
watchEffect(() => {
  if (props.search) {
    const lnglat = modelValue.value?.split(',')
    const searchData = {
      centerX: lnglat[0],
      centerY: lnglat[1],
      radius,
      type: 1
    }

    valueModel.value = JSON.stringify(searchData)
  } else {
    valueModel.value = `${modelValue.value || ''}`
  }
})

const mapDialogVisble = ref(false)

const handleItems = (data: _Global.AnyObject) => {
  const res = { ...data }
  modelValue.value = `${res.point.lng},${res.point.lat}`
  radius = res.radius
}

const reuseForm = ref({})
const simpleMapRef = ref()

const handleSave = (): void => {
  handleItems({
    ...simpleMapRef.value.state.lnglat,
    radius: simpleMapRef.value.value
  })
  mapDialogVisble.value = false
}
</script>
<style scoped lang="less">
.simple-map-box {
  height: 50vh;
}
</style>
