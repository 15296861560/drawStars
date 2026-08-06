<template>
  <el-dialog
    :model-value="modelValue"
    :title="detail?.title || '任务详情'"
    width="640px"
    destroy-on-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-loading="loading" class="task-detail">
      <template v-if="detail">
        <div class="meta-row">
          <el-tag size="small" effect="plain">
            {{ detail.category?.name || '-' }}
          </el-tag>
          <el-tag size="small" type="info" effect="plain">
            {{ typeLabel }}
          </el-tag>
          <span class="diff">
            <span
              v-for="n in 4"
              :key="n"
              class="star"
              :class="{ on: n <= detail.difficulty }"
              >★</span
            >
          </span>
        </div>

        <p class="desc">{{ detail.description || '暂无描述' }}</p>

        <div class="section">
          <div class="section-title">完成条件</div>
          <div class="section-body">
            {{ conditionText }}
            <span class="muted"> （目标 {{ detail.targetCount }} 次） </span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">奖励</div>
          <TaskReward :reward-config="detail.rewardConfig" />
        </div>

        <div v-if="detail.children?.length" class="section">
          <div class="section-title">子任务</div>
          <TaskSubTasks
            :items="detail.children"
            :completed-ids="completedSubTaskIds"
            :can-complete="canCompleteSubTask"
            :loading-id="subTaskLoadingId"
            @complete="onCompleteSubTask"
          />
        </div>

        <TaskProgress
          v-if="showProgress"
          class="progress-block"
          :current="progress.current"
          :target="progress.target"
          :percent="progress.percent"
        />

        <div v-if="needsAddress" class="section">
          <div class="section-title">收货地址</div>
          <el-form label-width="72px" size="small">
            <el-form-item label="收件人">
              <el-input v-model="addressForm.name" />
            </el-form-item>
            <el-form-item label="电话">
              <el-input v-model="addressForm.phone" />
            </el-form-item>
            <el-form-item label="地址">
              <el-input
                v-model="addressForm.address"
                type="textarea"
                :rows="2"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                :loading="actionLoading"
                @click="onSaveAddress"
                >保存地址</el-button
              >
            </el-form-item>
          </el-form>
        </div>

        <div v-if="canConfirmReceipt" class="section">
          <el-alert
            type="info"
            show-icon
            :closable="false"
            title="商品已发货，请确认收货"
          />
        </div>
      </template>
    </div>

    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">关闭</el-button>
      <el-button
        v-if="canConfirmReceipt"
        type="success"
        :loading="actionLoading"
        @click="onConfirmReceipt"
        >确认收货</el-button
      >
      <el-button
        v-if="cta === 'accept'"
        type="primary"
        :loading="actionLoading"
        @click="onAccept"
        >接取任务</el-button
      >
      <el-button
        v-else-if="cta === 'submit' && !detail?.children?.length"
        type="primary"
        :loading="actionLoading"
        @click="onSubmit"
        >提交完成</el-button
      >
      <el-button
        v-else-if="cta === 'claim'"
        type="warning"
        :loading="actionLoading"
        @click="onClaim"
        >领取奖励</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { Task } from '@/types/task'
import { taskStore } from '@/stores/task'
import TaskProgress from './TaskProgress.vue'
import TaskReward from './TaskReward.vue'
import TaskSubTasks from './TaskSubTasks.vue'

const props = defineProps<{
  modelValue: boolean
  taskId: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  refreshed: []
}>()

const store = taskStore()
const loading = ref(false)
const actionLoading = ref(false)
const subTaskLoadingId = ref<number | null>(null)
const detail = ref<Task | null>(null)

const addressForm = reactive({
  name: '',
  phone: '',
  address: ''
})

const TYPE_LABEL: Record<string, string> = {
  DAILY: '日常',
  ONCE: '一次性',
  LIMITED: '限时',
  ACHIEVEMENT: '成就',
  CUSTOM: '自定义'
}

const COND_LABEL: Record<string, string> = {
  LOGIN: '登录',
  CHECK_IN: '签到',
  SHARE: '分享',
  PURCHASE: '购买',
  INVITE: '邀请',
  CONTENT: '内容',
  SURVEY: '问卷',
  LEARN: '学习',
  CUSTOM: '自定义',
  COMPOSITE: '组合条件'
}

const typeLabel = computed(
  () => TYPE_LABEL[detail.value?.taskType || ''] || detail.value?.taskType
)

const conditionText = computed(() => {
  const t = detail.value?.conditionType
  return COND_LABEL[t || ''] || t || '-'
})

const status = computed(() => detail.value?.userProgress?.status || 'NONE')

const completedSubTaskIds = computed(
  () => detail.value?.userProgress?.completedSubTaskIds || []
)

const hasPhysical = computed(() =>
  detail.value?.rewardConfig?.rewards?.some(r => r.type === 'PHYSICAL')
)

const claimStatus = computed(
  () => detail.value?.userProgress?.claimStatus || ''
)

const needsAddress = computed(
  () =>
    hasPhysical.value &&
    (claimStatus.value === 'PENDING_ADDRESS' ||
      (status.value === 'REWARD_PENDING' && !addressForm.name))
)

const canConfirmReceipt = computed(
  () => hasPhysical.value && claimStatus.value === 'SHIPPED'
)

const showProgress = computed(() => {
  const s = status.value
  return s !== 'NONE' && s !== 'ASSIGNED' && s !== 'EXPIRED'
})

const canCompleteSubTask = computed(() => {
  const s = status.value
  return s === 'IN_PROGRESS' || s === 'SUBMITTED'
})

const progress = computed(() => {
  const up = detail.value?.userProgress
  return {
    current: up?.currentCount ?? 0,
    target: up?.targetCount ?? detail.value?.targetCount ?? 1,
    percent: up?.progressPercent
  }
})

const cta = computed(() => {
  const s = status.value
  if (s === 'NONE' || s === 'ASSIGNED') return 'accept'
  if (s === 'IN_PROGRESS' || s === 'SUBMITTED') {
    if (detail.value?.children?.length) return ''
    return 'submit'
  }
  if (s === 'REWARD_PENDING' || s === 'COMPLETED') return 'claim'
  return ''
})

async function loadDetail() {
  if (!props.taskId) {
    detail.value = null
    return
  }
  loading.value = true
  try {
    detail.value = await store.loadTaskDetail(props.taskId)
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.modelValue, props.taskId] as const,
  ([open]) => {
    if (open) loadDetail()
  },
  { immediate: true }
)

async function onAccept() {
  if (!detail.value || actionLoading.value) return
  actionLoading.value = true
  try {
    await store.acceptTask(detail.value.id)
    ElMessage.success('接取成功')
    await loadDetail()
    emit('refreshed')
  } catch (e: any) {
    ElMessage.error(e?.message || '接取失败')
  } finally {
    actionLoading.value = false
  }
}

async function onSubmit() {
  if (!detail.value || actionLoading.value) return
  actionLoading.value = true
  try {
    await store.submitTask(detail.value.id)
    ElMessage.success('提交成功')
    await loadDetail()
    emit('refreshed')
  } catch (e: any) {
    ElMessage.error(e?.message || '提交失败')
  } finally {
    actionLoading.value = false
  }
}

async function onCompleteSubTask(subTaskId: number) {
  if (!detail.value || subTaskLoadingId.value) return
  subTaskLoadingId.value = subTaskId
  try {
    await store.submitTask(detail.value.id, { subTaskId })
    ElMessage.success('子任务已完成')
    await loadDetail()
    emit('refreshed')
  } catch (e: any) {
    ElMessage.error(e?.message || '提交失败')
  } finally {
    subTaskLoadingId.value = null
  }
}

async function onClaim() {
  if (!detail.value || actionLoading.value) return
  actionLoading.value = true
  try {
    const res = await store.claimReward(detail.value.id)
    ElMessage.success(res?.message || '领取成功')
    await loadDetail()
    emit('refreshed')
  } catch (e: any) {
    ElMessage.error(e?.message || '领取失败')
  } finally {
    actionLoading.value = false
  }
}

async function onSaveAddress() {
  if (!detail.value || actionLoading.value) return
  if (!addressForm.name || !addressForm.phone || !addressForm.address) {
    ElMessage.warning('请填写完整收货信息')
    return
  }
  actionLoading.value = true
  try {
    await store.saveShippingAddress(detail.value.id, { ...addressForm })
    ElMessage.success('地址已保存')
    await loadDetail()
    emit('refreshed')
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    actionLoading.value = false
  }
}

async function onConfirmReceipt() {
  if (!detail.value || actionLoading.value) return
  actionLoading.value = true
  try {
    await store.confirmReceipt(detail.value.id)
    ElMessage.success('已确认收货')
    await loadDetail()
    emit('refreshed')
  } catch (e: any) {
    ElMessage.error(e?.message || '确认失败')
  } finally {
    actionLoading.value = false
  }
}
</script>

<style scoped lang="less">
.task-detail {
  min-height: 120px;
  text-align: left;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.diff .star {
  color: var(--el-border-color);
  font-size: 12px;

  &.on {
    color: #f7ba2a;
  }
}

.desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.section-body {
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.muted {
  color: var(--el-text-color-secondary);
  margin-left: 4px;
}

.progress-block {
  margin-top: 8px;
}
</style>
