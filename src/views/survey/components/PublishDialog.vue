<template>
  <base-dialog
    v-model="visible"
    title="发布问卷"
    width="560px"
    :options="dialogOptions"
    @confirm="emit('success')"
  />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, reactive, watch } from 'vue'
import type { PublishConfig } from '@/types/survey'
import { publishSurvey } from '@/api/survey'
import { getRequestErrorMessage } from '@/utils/message/showTips.js'
import { publishDialogFields } from './config/publishSchema'

const BaseDialog = defineAsyncComponent(
  () => import('@/components/base/form/BaseDialog.vue')
)

const props = defineProps<{
  modelValue: boolean
  surveyId: number | string
  initial?: Partial<PublishConfig>
}>()
const emit = defineEmits<{
  'update:modelValue': [boolean]
  success: []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const fieldList = reactive(
  publishDialogFields.map(f => ({
    ...f,
    options: f.options ? [...f.options] : f.options,
    attrs: f.attrs ? { ...f.attrs } : f.attrs
  }))
)

const dialogOptions = reactive({
  fieldList,
  confirmText: '发布',
  labelPosition: 'left',
  confirmParams: {} as Record<string, any>,
  seedParams: {} as Record<string, any>,
  initParams: {} as Record<string, any>,
  confirmMethod: async (data: Record<string, any>) => {
    if (!props.surveyId) {
      return { status: false, msg: '缺少问卷 ID' }
    }
    try {
      const payload: Record<string, unknown> = { ...data }
      delete payload.whitelistText
      delete payload.publishMode
      if (data.publishMode === 'now') payload.publishTime = null
      if (!payload.maxResponses) payload.maxResponses = null
      const ids = String(data.whitelistText || '')
        .split(/[,，\s]+/)
        .map(s => Number(s.trim()))
        .filter(n => Number.isFinite(n) && n > 0)
      payload.whitelist = ids.length ? ids : null
      const res = await publishSurvey(props.surveyId, payload)
      if (res?.status === false) {
        return res
      }
      const { showTips } = await import('@/utils/message/showTips.js')
      showTips('success', '发布成功')
      return { status: true, msg: 'ok', data: res?.data ?? res }
    } catch (e: any) {
      return {
        status: false,
        msg: getRequestErrorMessage(e, '发布失败')
      }
    }
  }
})

watch(
  () => props.modelValue,
  v => {
    if (!v) return
    const initial = props.initial || {}
    const wl = (initial as any).whitelist
    dialogOptions.seedParams = {
      publishMode: initial.publishTime ? 'schedule' : 'now',
      publishTime: initial.publishTime ?? null,
      expireTime: initial.expireTime ?? null,
      maxResponses: initial.maxResponses ?? 0,
      limitPerUser: initial.limitPerUser ?? 1,
      ipLimit: initial.ipLimit ?? 0,
      deviceLimit: initial.deviceLimit ?? 0,
      requireLogin: initial.requireLogin ?? 'none',
      accessPassword: initial.accessPassword ?? '',
      minDuration: (initial as any).minDuration ?? 0,
      whitelistText: Array.isArray(wl) ? wl.join(',') : ''
    }
  },
  { flush: 'sync' }
)
</script>
