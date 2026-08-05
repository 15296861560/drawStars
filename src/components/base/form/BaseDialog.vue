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
    <el-form
      v-if="dialogVisible"
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
          :placeholder="field.placeholder"
          :readonly="options.readonly || field.readonly"
          :disabled="isFieldDisabled(field)"
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
import { ref, reactive, defineAsyncComponent, watch, toRefs, computed } from 'vue'
import { useVModels } from '@vueuse/core'
import type { AnyObject, DialogOption, Field } from '@/types/global'
import { showTips } from '@/utils/message/showTips.js'

defineOptions({
  inheritAttrs: false
})

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

const visibleFields = computed(() =>
  (fieldList.value || []).filter((f: Field) => !f.hideDialog)
)

const rules = reactive<AnyObject>({})
fieldList.value.forEach((field: Field) => {
  if (field.rule) {
    rules[field.fieldName] = field.rule
  }
})

const formRef = ref()

const isEditMode = computed(() => !!options.value.initParams?.id)

function isFieldDisabled(field: Field) {
  if (options.value.disabled || field.disabled) return true
  if (field.disableOnEdit && isEditMode.value) return true
  return false
}

const cancel = () => {
  const formEl = formRef.value
  if (!formEl) {
    return
  }
  formEl.resetFields()
  dialogVisible.value = false
  fieldList.value.forEach((element: Field) => {
    formInfo[element.fieldName] =
      element.defaultVal !== undefined ? element.defaultVal : ''
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

  fieldList.value.forEach((element: Field) => {
    formInfo[element.fieldName] =
      element.defaultVal !== undefined ? element.defaultVal : ''
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

    const data = Array.isArray(res.data) ? res.data[0] : res.data
    if (!data) {
      return
    }
    // 保留后端返回的主键
    if (data.id != null) {
      formInfo.id = data.id
    }
    fieldList.value.forEach((element: Field) => {
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
  }
})

defineExpose({
  opentDialog
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
}

/* 遮罩层内水平垂直居中（配合 align-center） */
.el-overlay-dialog:has(> .base-dialog) {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
