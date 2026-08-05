<template>
  <el-dialog v-model="dialogVisible" v-bind="$attrs" draggable overflow>
    <el-form
      v-if="dialogVisible"
      ref="formRef"
      :model="formInfo"
      label-width="auto"
      :rules="rules"
      :label-position="options.labelPosition || 'right'"
    >
      <el-form-item
        v-for="field in fieldList"
        :label="field.label"
        :prop="field.fieldName"
      >
        <base-form-item
          v-model:field="formInfo[field.fieldName]"
          :type="field.type"
          :rule="field.rule"
          :placeholder="field.placeholder"
          :readonly="options.readonly"
          :disabled="options.disabled"
          :options="field.options"
          :config="field.config"
          :attrs="field.attrs"
          class="w-full"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="confirm" :loading="confirmLoading">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref, reactive, defineAsyncComponent, watch, toRefs } from 'vue'
import { useVModels } from '@vueuse/core'
import type { AnyObject, DialogOption } from '@/types/global'
import { showTips } from '@/utils/message/showTips.js'
const BaseFormItem = defineAsyncComponent(
  () => import('./BaseFormItem/index.vue')
)

const emit = defineEmits<{
  (e: 'confirm'): void
}>()

const dialogVisible = ref(false)

const props = defineProps<{
  options: DialogOption
}>()

const { options } = toRefs(props)

const { fieldList } = useVModels(props.options, emit)

const formInfo = reactive<AnyObject>({})

const rules = reactive<AnyObject>({})
fieldList.value.forEach(field => {
  if (field.rule) {
    rules[field.fieldName] = field.rule
  }
})

const formRef = ref()

const cancel = () => {
  const formEl = formRef.value
  if (!formEl) {
    return
  }
  formEl.resetFields()
  dialogVisible.value = false
  fieldList.value.forEach(element => {
    formInfo[element.fieldName] = element.defaultVal || ''
  })
  // 清除编辑态主键，避免残留到下次新增
  delete formInfo.id
}

const confirmLoading = ref(false)
const confirm = async () => {
  const formEl = formRef.value
  if (!formEl) {
    return
  }
  formEl.validate(async (valid: any) => {
    if (valid) {
      if (options.value.confirmMethod) {
        // 默认参数仅补齐空值，避免覆盖用户已编辑内容
        const defaults = options.value.confirmParams || {}
        const params: AnyObject = { ...formInfo }
        // 编辑态：确保带上 id（schema 通常不含 id 字段）
        if (
          (params.id === undefined || params.id === null || params.id === '') &&
          options.value.initParams?.id
        ) {
          params.id = options.value.initParams.id
        }
        Object.keys(defaults).forEach(key => {
          if (
            params[key] === undefined ||
            params[key] === null ||
            params[key] === ''
          ) {
            params[key] = defaults[key]
          }
        })

        confirmLoading.value = true
        try {
          const res = await options.value.confirmMethod(params)
          if (!res.status) {
            showTips('error', res.msg)
            return
          }
        } finally {
          confirmLoading.value = false
        }
      }

      emit('confirm')
      cancel()
    }
  })
}

const init = async () => {
  // 先清空旧主键，避免新增误带上次编辑 id
  delete formInfo.id

  fieldList.value.forEach(element => {
    formInfo[element.fieldName] = element.defaultVal ?? ''
  })

  // 新增时用 confirmParams 作为初始默认值
  const defaults = options.value.confirmParams || {}
  Object.keys(defaults).forEach(key => {
    if (
      formInfo[key] === undefined ||
      formInfo[key] === null ||
      formInfo[key] === ''
    ) {
      formInfo[key] = defaults[key]
    }
  })

  if (options.value.initMethod && options.value.initParams?.id) {
    const editId = options.value.initParams.id
    formInfo.id = editId

    const params = Object.assign({}, formInfo, options.value.initParams)
    const res = await options.value.initMethod(params)
    if (!res.status) {
      showTips('error', res.msg)
      return
    }

    const data = res.data[0]
    if (!data) {
      return
    }
    // 保留后端返回的主键
    if (data.id != null) {
      formInfo.id = data.id
    }
    fieldList.value.forEach(element => {
      if (element.fieldName.endsWith('time')) {
        formInfo[element.fieldName] = new Date(
          data[element.fieldName]
        ).toLocaleString()
      } else {
        formInfo[element.fieldName] = data[element.fieldName] ?? ''
      }
    })
  }
}

const opentDialog = () => {
  dialogVisible.value = true
}

watch(dialogVisible, v => {
  if (v) {
    init()
  }
})

defineExpose({
  opentDialog
})
</script>
