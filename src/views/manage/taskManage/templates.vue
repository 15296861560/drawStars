<template>
  <div class="task-templates">
    <div class="page-toolbar">
      <div class="page-title">
        <h3>模板管理</h3>
        <p>维护奖励模板与任务模板，便于快速创建任务</p>
      </div>
      <el-button @click="reload">刷新</el-button>
    </div>

    <el-card shadow="never" class="panel-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="奖励模板" name="reward">
          <div class="tab-toolbar">
            <el-button
              v-permission="'system:task:operate'"
              type="primary"
              @click="openRewardCreate"
              >新增奖励模板</el-button
            >
          </div>
          <el-table
            :data="store.rewardTemplates"
            v-loading="loading"
            border
            stripe
            size="small"
            empty-text="暂无模板"
          >
            <el-table-column prop="name" label="名称" min-width="140" />
            <el-table-column
              prop="description"
              label="说明"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column label="奖励项" min-width="200">
              <template #default="{ row }">
                {{
                  (row.rewardConfig?.rewards || [])
                    .map((r: any) => r.description || r.type)
                    .join('、') || '-'
                }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-permission="'system:task:operate'"
                  link
                  type="primary"
                  @click="openRewardEdit(row)"
                  >编辑</el-button
                >
                <el-button
                  v-permission="'system:task:operate'"
                  link
                  type="danger"
                  @click="onDeleteReward(row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="任务模板" name="task">
          <div class="tab-toolbar">
            <el-button
              v-permission="'system:task:operate'"
              type="primary"
              @click="openTaskCreate"
              >新增任务模板</el-button
            >
          </div>
          <el-table
            :data="store.taskTemplates"
            v-loading="loading"
            border
            stripe
            size="small"
            empty-text="暂无模板"
          >
            <el-table-column prop="name" label="名称" min-width="140" />
            <el-table-column
              prop="description"
              label="说明"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                {{
                  (
                    {
                      DAILY: '日常',
                      ONCE: '一次性',
                      LIMITED: '限时',
                      ACHIEVEMENT: '成就',
                      CUSTOM: '自定义'
                    } as Record<string, string>
                  )[row.templateData?.taskType || ''] ||
                  row.templateData?.taskType ||
                  '-'
                }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-permission="'system:task:operate'"
                  link
                  type="primary"
                  @click="openTaskEdit(row)"
                  >编辑</el-button
                >
                <el-button
                  v-permission="'system:task:operate'"
                  link
                  type="danger"
                  @click="onDeleteTask(row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      v-model="rewardDialogVisible"
      :title="rewardEditingId ? '编辑奖励模板' : '新增奖励模板'"
      width="480px"
      destroy-on-close
    >
      <el-form label-width="88px">
        <el-form-item label="名称" required>
          <el-input v-model="rewardForm.name" maxlength="64" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input
            v-model="rewardForm.description"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="积分">
          <el-input-number
            v-model="rewardForm.points"
            :min="0"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="经验">
          <el-input-number
            v-model="rewardForm.exp"
            :min="0"
            controls-position="right"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rewardDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitReward">
          保存
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="taskDialogVisible"
      :title="taskEditingId ? '编辑任务模板' : '新增任务模板'"
      width="480px"
      destroy-on-close
    >
      <el-form label-width="88px">
        <el-form-item label="名称" required>
          <el-input v-model="taskForm.name" maxlength="64" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="taskForm.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="任务类型">
          <el-select v-model="taskForm.taskType" style="width: 100%">
            <el-option label="日常" value="DAILY" />
            <el-option label="一次性" value="ONCE" />
            <el-option label="限时" value="LIMITED" />
            <el-option label="成就" value="ACHIEVEMENT" />
          </el-select>
        </el-form-item>
        <el-form-item label="积分">
          <el-input-number
            v-model="taskForm.points"
            :min="0"
            controls-position="right"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="taskDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitTask">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { taskStore } from '@/stores/task'
import type { RewardTemplate, TaskTemplateRecord } from '@/types/task'

const store = taskStore()
const loading = ref(false)
const submitting = ref(false)
const activeTab = ref('reward')

const rewardDialogVisible = ref(false)
const rewardEditingId = ref<number | null>(null)
const rewardForm = reactive({
  name: '',
  description: '',
  points: 10,
  exp: 0
})

const taskDialogVisible = ref(false)
const taskEditingId = ref<number | null>(null)
const taskForm = reactive({
  name: '',
  description: '',
  taskType: 'DAILY',
  points: 10
})

async function reload() {
  loading.value = true
  try {
    await Promise.all([store.loadRewardTemplates(), store.loadTaskTemplates()])
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function buildRewardConfig(points: number, exp: number) {
  const rewards = []
  if (points > 0) {
    rewards.push({
      type: 'POINTS' as const,
      config: { amount: points },
      description: points + ' 积分'
    })
  }
  if (exp > 0) {
    rewards.push({
      type: 'EXP' as const,
      config: { amount: exp },
      description: exp + ' 经验'
    })
  }
  return { rewards }
}

function openRewardCreate() {
  rewardEditingId.value = null
  rewardForm.name = ''
  rewardForm.description = ''
  rewardForm.points = 10
  rewardForm.exp = 0
  rewardDialogVisible.value = true
}

function openRewardEdit(row: RewardTemplate) {
  rewardEditingId.value = row.id
  rewardForm.name = row.name
  rewardForm.description = row.description || ''
  rewardForm.points =
    row.rewardConfig.rewards.find(r => r.type === 'POINTS')?.config?.amount || 0
  rewardForm.exp =
    row.rewardConfig.rewards.find(r => r.type === 'EXP')?.config?.amount || 0
  rewardDialogVisible.value = true
}

async function submitReward() {
  if (submitting.value || !rewardForm.name.trim()) {
    ElMessage.warning('请输入名称')
    return
  }
  submitting.value = true
  try {
    const payload = {
      name: rewardForm.name.trim(),
      description: rewardForm.description.trim() || undefined,
      rewardConfig: buildRewardConfig(rewardForm.points, rewardForm.exp)
    }
    if (rewardEditingId.value) {
      await store.updateRewardTemplate(rewardEditingId.value, payload)
      ElMessage.success('更新成功')
    } else {
      await store.createRewardTemplate(payload)
      ElMessage.success('创建成功')
    }
    rewardDialogVisible.value = false
    await store.loadRewardTemplates()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

async function onDeleteReward(row: RewardTemplate) {
  try {
    await ElMessageBox.confirm(`确认删除「${row.name}」？`, '提示', {
      type: 'warning'
    })
    await store.deleteRewardTemplate(row.id)
    ElMessage.success('已删除')
  } catch (e: any) {
    if (e === 'cancel' || e === 'close') return
    ElMessage.error(e?.message || '删除失败')
  }
}

function openTaskCreate() {
  taskEditingId.value = null
  taskForm.name = ''
  taskForm.description = ''
  taskForm.taskType = 'DAILY'
  taskForm.points = 10
  taskDialogVisible.value = true
}

function openTaskEdit(row: TaskTemplateRecord) {
  taskEditingId.value = row.id
  taskForm.name = row.name
  taskForm.description = row.description || ''
  taskForm.taskType = row.templateData?.taskType || 'DAILY'
  taskForm.points =
    row.templateData?.rewardConfig?.rewards?.find(r => r.type === 'POINTS')
      ?.config?.amount || 0
  taskDialogVisible.value = true
}

async function submitTask() {
  if (submitting.value || !taskForm.name.trim()) {
    ElMessage.warning('请输入名称')
    return
  }
  submitting.value = true
  try {
    const payload = {
      name: taskForm.name.trim(),
      description: taskForm.description.trim() || undefined,
      templateData: {
        taskType: taskForm.taskType as any,
        conditionType: 'CHECK_IN' as const,
        difficulty: 1 as const,
        targetCount: 1,
        assignMode: 'PUBLIC' as const,
        rewardConfig: buildRewardConfig(taskForm.points, 0)
      }
    }
    if (taskEditingId.value) {
      await store.updateTaskTemplate(taskEditingId.value, payload)
      ElMessage.success('更新成功')
    } else {
      await store.createTaskTemplate(payload)
      ElMessage.success('创建成功')
    }
    taskDialogVisible.value = false
    await store.loadTaskTemplates()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

async function onDeleteTask(row: TaskTemplateRecord) {
  try {
    await ElMessageBox.confirm(`确认删除「${row.name}」？`, '提示', {
      type: 'warning'
    })
    await store.deleteTaskTemplate(row.id)
    ElMessage.success('已删除')
  } catch (e: any) {
    if (e === 'cancel' || e === 'close') return
    ElMessage.error(e?.message || '删除失败')
  }
}

onMounted(reload)
</script>

<style scoped lang="less">
.task-templates {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.tab-toolbar {
  margin-bottom: 12px;
}
</style>
