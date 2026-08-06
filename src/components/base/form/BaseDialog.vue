<template>
  <el-dialog
    v-model="dialogVisible"
    width="50vw"
    align-center
    class="base-dialog"
    draggable
    overflow
    destroy-on-close
    append-to-body
    v-bind="$attrs"
  >
    <slot v-if="$slots.default" :form="formInfo" :close="cancel" />
    <el-form
      v-else-if="dialogVisible"
      ref="formRef"
      :model="formInfo"
      label-width="auto"
      :rules="rules"
      :label-position="options.labelPosition || 'right'"
    >
      <el-form-item
        v-for="field in visibleFields"
        :key="field.fieldName"
        :label="field.label"
        :prop="field.fieldName"
      >
        <base-form-item
          v-model:field="formInfo[field.fieldName]"
          :type="field.type"
          :rule="field.rule"
          :readonly="options.readonly || field.readonly"
          :disabled="isFieldDisabled(field)"
          :options="field.options"
          :config="field.config"
          :attrs="{
            ...(field.attrs || {}),
            ...(field.placeholder ? { placeholder: field.placeholder } : {})
          }"
          class="w-full"
        />
        <div v-if="field.hint" class="field-hint">{{ field.hint }}</div>
      </el-form-item>
    </el-form>

    <template v-if="!options.hideFooter" #footer>
      <slot name="footer" :form="formInfo" :close="cancel" :confirm="confirm">
        <div class="dialog-footer">
          <el-button @click="cancel">{{
            options.cancelText || '取消'
          }}</el-button>
          <el-button
            v-if="!options.hideConfirm"
            type="primary"
            :loading="confirmLoading"
            @click="confirm"
          >
            {{ options.confirmText || '确认' }}
          </el-button>
        </div>
      </slot>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import {
  ref,
  reactive,
  defineAsyncComponent,
  watch,
  toRefs,
  computed,
  useSlots
} from 'vue'
import { useVModels } from '@vueuse/core'
import type { AnyObject, DialogOption, Field } from '@/types/global'
import { showTips } from '@/utils/message/showTips.js'

defineOptions({
  inheritAttrs: false
})

const slots = useSlots()

const BaseFormItem = defineAsyncComponent(
  () => import('./BaseFormItem/index.vue')
)

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const props = defineProps<{
  options: DialogOption
  modelValue?: boolean
}>()

const { options } = toRefs(props)

const { fieldList } = useVModels(props.options, emit)

const formInfo = reactive<AnyObject>({})

const dialogVisible = ref(false)

const visibleFields = computed(() =>
  (fieldList.value || []).filter((f: Field) => {
    if (f.hideDialog) return false
    if (typeof f.visibleWhen === 'function') {
      return !!f.visibleWhen(formInfo)
    }
    return true
  })
)

const rules = reactive<AnyObject>({})
function rebuildRules() {
  Object.keys(rules).forEach(k => delete rules[k])
  ;(fieldList.value || []).forEach((field: Field) => {
    if (field.rule) {
      rules[field.fieldName] = field.rule
    }
  })
}
rebuildRules()
watch(fieldList, rebuildRules, { deep: true })

const formRef = ref()

const isEditMode = computed(() => !!options.value.initParams?.id)

function isFieldDisabled(field: Field) {
  if (options.value.disabled || field.disabled) return true
  if (field.disableOnEdit && isEditMode.value) return true
  return false
}

const cancel = () => {
  const formEl = formRef.value
  if (formEl) {
    formEl.resetFields()
  }
  dialogVisible.value = false
  ;(fieldList.value || []).forEach((element: Field) => {
    formInfo[element.fieldName] =
      element.defaultVal !== undefined ? element.defaultVal : ''
  })
  delete formInfo.id
  emit('update:modelValue', false)
  emit('close')
}

const confirmLoading = ref(false)
const confirm = async () => {
  const formEl = formRef.value
  const runConfirm = async () => {
    if (options.value.confirmMethod) {
      const defaults = options.value.confirmParams || {}
      const params: AnyObject = { ...formInfo }
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
          if (res.msg) showTips('error', res.msg)
          return
        }
      } finally {
        confirmLoading.value = false
      }
    }

    emit('confirm')
    cancel()
  }

  // 自定义插槽内容且无表单时，直接确认
  if (!formEl && slots.default) {
    await runConfirm()
    return
  }
  if (!formEl) {
    return
  }
  formEl.validate(async (valid: any) => {
    if (valid) {
      await runConfirm()
    }
  })
}

const init = async () => {
  delete formInfo.id
  ;(fieldList.value || []).forEach((element: Field) => {
    formInfo[element.fieldName] =
      element.defaultVal !== undefined ? element.defaultVal : ''
  })

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

  // 打开前注入的初始值（如编辑回填）
  const seed = options.value.seedParams || {}
  Object.keys(seed).forEach(key => {
    if (seed[key] !== undefined) {
      formInfo[key] = seed[key]
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

    const data = Array.isArray(res.data) ? res.data[0] : res.data
    if (!data) {
      return
    }
    if (data.id != null) {
      formInfo.id = data.id
    }
    ;(fieldList.value || []).forEach((element: Field) => {
      if (element.fieldName.endsWith('time')) {
        formInfo[element.fieldName] = new Date(
          data[element.fieldName]
        ).toLocaleString()
      } else if (data[element.fieldName] !== undefined) {
        formInfo[element.fieldName] = data[element.fieldName]
      } else if (element.defaultVal !== undefined) {
        formInfo[element.fieldName] = element.defaultVal
      } else {
        formInfo[element.fieldName] = ''
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
  } else {
    emit('update:modelValue', false)
    emit('close')
  }
})

watch(
  () => props.modelValue,
  v => {
    if (v === undefined) return
    if (v && !dialogVisible.value) {
      dialogVisible.value = true
    } else if (!v && dialogVisible.value) {
      dialogVisible.value = false
    }
  }
)

defineExpose({
  opentDialog,
  formInfo,
  cancel,
  confirm
})
</script>

<style lang="less">
.base-dialog.el-dialog {
  max-width: 96vw;
  max-height: 70vh;
  margin: 0 !important;
  display: flex;
  flex-direction: column;

  .el-dialog__header {
    flex-shrink: 0;
  }

  .el-dialog__title {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.4;
  }

  .el-dialog__body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 16px 20px;
  }

  .el-dialog__footer {
    flex-shrink: 0;
  }

  .el-form-item {
    margin-bottom: 18px;
  }

  .field-hint {
    margin-top: 4px;
    color: #909399;
    font-size: 12px;
    line-height: 1.4;
  }
}

/* 遮罩层内水平垂直居中（配合 align-center） */
.el-overlay-dialog:has(> .base-dialog) {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
