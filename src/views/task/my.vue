<template>
  <div class="my-tasks">
    <div class="page-toolbar">
      <div class="page-title">
        <h3>我的任务</h3>
        <p>查看进度、继续完成或领取奖励</p>
      </div>
      <el-button @click="goHall">返回大厅</el-button>
    </div>

    <el-card shadow="never" class="panel-card">
      <el-tabs v-model="activeTab" @tab-change="onTabChange">
        <el-tab-pane label="进行中" name="inProgress" />
        <el-tab-pane label="待领奖" name="rewardPending" />
        <el-tab-pane label="已完成" name="completed" />
        <el-tab-pane label="已指派" name="assigned" />
        <el-tab-pane label="已过期" name="expired" />
      </el-tabs>

      <div v-loading="store.loading" class="card-grid">
        <TaskCard
          v-for="inst in list"
          :key="inst.id"
          :task="asTask(inst)"
          @accept="onAccept"
          @continue="onContinue"
          @claim="onClaim"
          @detail="onContinue"
        />
        <el-empty
          v-if="!store.loading && !list.length"
          description="暂无任务"
        />
      </div>
    </el-card>

    <TaskDetail v-model="detailVisible" :task-id="detailId" @refreshed="load" />

    <el-dialog v-model="addressVisible" title="填写收货地址" width="420px">
      <el-form label-width="72px">
        <el-form-item label="收件人" required>
          <el-input v-model="addressForm.name" />
        </el-form-item>
        <el-form-item label="电话" required>
          <el-input v-model="addressForm.phone" />
        </el-form-item>
        <el-form-item label="地址" required>
          <el-input v-model="addressForm.address" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addressVisible = false">取消</el-button>
        <el-button type="primary" :loading="actionLock" @click="saveAddress">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { taskStore } from '@/stores/task'
import type { Task, TaskInstance } from '@/types/task'
import TaskCard from '@/components/task/TaskCard.vue'
import TaskDetail from '@/components/task/TaskDetail.vue'

const router = useRouter()
const store = taskStore()
const activeTab = ref('inProgress')
const detailVisible = ref(false)
const detailId = ref<number | null>(null)
const actionLock = ref(false)
const addressVisible = ref(false)
const addressTaskId = ref<number | null>(null)

const addressForm = reactive({
  name: '',
  phone: '',
  address: ''
})

const list = computed(() => {
  const g = store.myTaskGroups
  return (g[activeTab.value] as TaskInstance[]) || store.myTasks
})

function asTask(inst: TaskInstance): Task {
  const base = inst.task
  const progress = {
    status: inst.status,
    currentCount: inst.currentCount,
    targetCount: inst.targetCount,
    rewardClaimed: inst.rewardClaimed,
    instanceId: inst.id,
    completedAt: inst.completedAt,
    progressPercent: Math.round(
      (inst.currentCount / Math.max(inst.targetCount, 1)) * 100
    )
  }
  if (base) {
    return { ...base, userProgress: progress }
  }
  return {
    id: inst.taskId,
    title: '任务 #' + inst.taskId,
    categoryId: 0,
    taskType: 'CUSTOM',
    conditionType: 'CUSTOM',
    difficulty: 1,
    rewardConfig: { rewards: [] },
    targetCount: inst.targetCount,
    status: 'APPROVED',
    assignMode: 'PUBLIC',
    userProgress: progress
  }
}

function hasPhysical(task: Task) {
  return task.rewardConfig?.rewards?.some(r => r.type === 'PHYSICAL')
}

async function load() {
  try {
    await store.loadMyTasks(activeTab.value)
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  }
}

function onTabChange() {
  load()
}

function onContinue(task: Task) {
  detailId.value = task.id
  detailVisible.value = true
}

async function onAccept(task: Task) {
  if (actionLock.value) return
  actionLock.value = true
  try {
    await store.acceptTask(task.id)
    ElMessage.success('接取成功')
    await load()
  } catch (e: any) {
    ElMessage.error(e?.message || '接取失败')
  } finally {
    actionLock.value = false
  }
}

async function onClaim(task: Task) {
  if (actionLock.value) return
  actionLock.value = true
  try {
    const res = await store.claimReward(task.id)
    ElMessage.success(res?.message || '领取成功')
    if (hasPhysical(task)) {
      addressTaskId.value = task.id
      addressForm.name = ''
      addressForm.phone = ''
      addressForm.address = ''
      addressVisible.value = true
    }
    await load()
  } catch (e: any) {
    ElMessage.error(e?.message || '领取失败')
  } finally {
    actionLock.value = false
  }
}

async function saveAddress() {
  if (!addressTaskId.value || actionLock.value) return
  if (!addressForm.name || !addressForm.phone || !addressForm.address) {
    ElMessage.warning('请填写完整收货信息')
    return
  }
  actionLock.value = true
  try {
    await store.saveShippingAddress(addressTaskId.value, { ...addressForm })
    ElMessage.success('地址已保存')
    addressVisible.value = false
    await load()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    actionLock.value = false
  }
}

async function tryConfirmReceipt(inst: TaskInstance) {
  const claimStatus = inst.task?.userProgress?.claimStatus
  if (claimStatus !== 'SHIPPED') return
  try {
    await ElMessageBox.confirm(
      '该任务实物奖励已发货，是否确认收货？',
      '确认收货',
      {
        type: 'info',
        confirmButtonText: '确认收货',
        cancelButtonText: '稍后'
      }
    )
    await store.confirmReceipt(inst.taskId)
    ElMessage.success('已确认收货')
    await load()
  } catch (e: any) {
    if (e === 'cancel' || e === 'close') return
  }
}

function goHall() {
  const p = router.currentRoute.value.path
  if (p.includes('/personalCenter/')) {
    router.push('/home/personalCenter/taskHall')
  } else {
    router.push('/home/taskHall')
  }
}

onMounted(async () => {
  await load()
  for (const inst of list.value) {
    await tryConfirmReceipt(inst)
  }
})
</script>

<style scoped lang="less">
.my-tasks {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  text-align: left;
  box-sizing: border-box;
}

.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

.panel-card {
  border-radius: 8px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  min-height: 160px;
}
</style>
