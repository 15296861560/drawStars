<template>
  <el-dialog
    :model-value="modelValue"
    :title="editingTask ? '编辑任务' : '创建任务'"
    width="680px"
    destroy-on-close
    @update:model-value="$emit('update:modelValue', $event)"
    @closed="onClosed"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="108px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" maxlength="64" show-word-limit />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="图标">
        <el-input v-model="form.icon" placeholder="如 calendar / trophy" />
      </el-form-item>
      <el-form-item label="分类" prop="categoryId">
        <el-select v-model="form.categoryId" style="width: 100%">
          <el-option
            v-for="c in categories"
            :key="c.id"
            :label="c.name"
            :value="c.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="taskType">
        <el-select v-model="form.taskType" style="width: 100%">
          <el-option
            v-for="t in typeOptions"
            :key="t.value"
            :label="t.label"
            :value="t.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="条件" prop="conditionType">
        <el-select v-model="form.conditionType" style="width: 100%">
          <el-option
            v-for="c in conditionOptions"
            :key="c.value"
            :label="c.label"
            :value="c.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="难度" prop="difficulty">
        <el-rate v-model="form.difficulty" :max="4" />
      </el-form-item>
      <el-form-item label="标签">
        <el-input
          v-model="form.tagsText"
          placeholder="逗号分隔，如 签到,日常"
        />
      </el-form-item>
      <el-form-item label="目标次数">
        <el-input-number
          v-model="form.targetCount"
          :min="1"
          :max="9999"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item label="奖励模板">
        <el-select
          v-model="form.rewardTemplateId"
          clearable
          placeholder="可选，应用预置奖励"
          style="width: 100%"
          @change="applyRewardTemplate"
        >
          <el-option
            v-for="tpl in rewardTemplates"
            :key="tpl.id"
            :label="tpl.name"
            :value="tpl.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="积分奖励">
        <el-input-number
          v-model="form.pointsAmount"
          :min="0"
          :max="999999"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item label="经验奖励">
        <el-input-number
          v-model="form.expAmount"
          :min="0"
          :max="999999"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item label="实物奖励">
        <el-checkbox v-model="form.hasPhysical">启用实物奖励</el-checkbox>
      </el-form-item>
      <template v-if="form.hasPhysical">
        <el-form-item label="物品名称">
          <el-input v-model="form.physicalName" placeholder="如：限定徽章" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number
            v-model="form.physicalStock"
            :min="0"
            controls-position="right"
          />
        </el-form-item>
      </template>
      <el-form-item label="分配模式" prop="assignMode">
        <el-select v-model="form.assignMode" style="width: 100%">
          <el-option label="公开" value="PUBLIC" />
          <el-option label="定向指派" value="ASSIGNED" />
          <el-option label="角色" value="ROLE_BASED" />
          <el-option label="等级限制" value="LEVEL_GATED" />
          <el-option label="条件触发" value="CONDITIONAL" />
        </el-select>
      </el-form-item>
      <el-form-item label="完成模式">
        <el-select v-model="form.completionMode" style="width: 100%">
          <el-option label="全部完成" value="ALL" />
          <el-option label="完成 N 项" value="ANY_N" />
        </el-select>
      </el-form-item>
      <el-form-item label="解锁模式">
        <el-select v-model="form.unlockMode" style="width: 100%">
          <el-option label="顺序解锁" value="SEQUENTIAL" />
          <el-option label="并行解锁" value="PARALLEL" />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级">
        <el-input-number
          v-model="form.priority"
          :min="0"
          :max="999"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item label="开始时间">
        <el-date-picker
          v-model="form.startTime"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss[Z]"
          placeholder="可选"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="结束时间">
        <el-date-picker
          v-model="form.endTime"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss[Z]"
          placeholder="可选"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="每日上限">
        <el-input-number
          v-model="form.dailyLimit"
          :min="0"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item label="总上限">
        <el-input-number
          v-model="form.totalLimit"
          :min="0"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item label="接取有效(h)">
        <el-input-number
          v-model="form.acceptValidHours"
          :min="0"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item label="子任务">
        <div class="children-editor">
          <div
            v-for="(child, idx) in form.children"
            :key="idx"
            class="child-row"
          >
            <el-input v-model="child.title" placeholder="子任务标题" />
            <el-button link type="danger" @click="removeChild(idx)"
              >删除</el-button
            >
          </div>
          <el-button type="primary" link @click="addChild"
            >+ 添加子任务</el-button
          >
        </div>
      </el-form-item>
      <el-form-item v-if="!editingTask" label="跳过审核">
        <el-checkbox v-model="form.skipAudit">直接上线</el-checkbox>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type {
  AssignMode,
  CompletionMode,
  ConditionType,
  CreateTaskPayload,
  RewardTemplate,
  Task,
  TaskCategory,
  TaskSubTask,
  TaskType,
  UnlockMode
} from '@/types/task'

const props = defineProps<{
  modelValue: boolean
  editingTask?: Task | null
  categories: TaskCategory[]
  rewardTemplates: RewardTemplate[]
  submitting?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  submit: [payload: CreateTaskPayload]
}>()

const formRef = ref<FormInstance>()

const form = reactive({
  title: '',
  description: '',
  icon: '',
  categoryId: 1,
  taskType: 'DAILY' as TaskType,
  conditionType: 'CHECK_IN' as ConditionType,
  difficulty: 1 as 1 | 2 | 3 | 4,
  tagsText: '',
  targetCount: 1,
  pointsAmount: 10,
  expAmount: 0,
  hasPhysical: false,
  physicalName: '',
  physicalStock: 0,
  assignMode: 'PUBLIC' as AssignMode,
  completionMode: 'ALL' as CompletionMode,
  unlockMode: 'SEQUENTIAL' as UnlockMode,
  priority: 50,
  startTime: null as string | null,
  endTime: null as string | null,
  dailyLimit: undefined as number | undefined,
  totalLimit: undefined as number | undefined,
  acceptValidHours: null as number | null,
  children: [] as { title: string }[],
  skipAudit: false,
  rewardTemplateId: null as number | null
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  taskType: [{ required: true, message: '请选择类型', trigger: 'change' }],
  conditionType: [{ required: true, message: '请选择条件', trigger: 'change' }]
}

const typeOptions = [
  { value: 'DAILY', label: '日常' },
  { value: 'ONCE', label: '一次性' },
  { value: 'LIMITED', label: '限时' },
  { value: 'ACHIEVEMENT', label: '成就' },
  { value: 'CUSTOM', label: '自定义' }
]

const conditionOptions = [
  { value: 'LOGIN', label: '登录' },
  { value: 'CHECK_IN', label: '签到' },
  { value: 'SHARE', label: '分享' },
  { value: 'PURCHASE', label: '购买' },
  { value: 'INVITE', label: '邀请' },
  { value: 'CONTENT', label: '内容' },
  { value: 'SURVEY', label: '问卷' },
  { value: 'LEARN', label: '学习' },
  { value: 'CUSTOM', label: '自定义' },
  { value: 'COMPOSITE', label: '组合' }
]

function resetForm() {
  form.title = ''
  form.description = ''
  form.icon = ''
  form.categoryId = props.categories[0]?.id || 1
  form.taskType = 'DAILY'
  form.conditionType = 'CHECK_IN'
  form.difficulty = 1
  form.tagsText = ''
  form.targetCount = 1
  form.pointsAmount = 10
  form.expAmount = 0
  form.hasPhysical = false
  form.physicalName = ''
  form.physicalStock = 0
  form.assignMode = 'PUBLIC'
  form.completionMode = 'ALL'
  form.unlockMode = 'SEQUENTIAL'
  form.priority = 50
  form.startTime = null
  form.endTime = null
  form.dailyLimit = undefined
  form.totalLimit = undefined
  form.acceptValidHours = null
  form.children = []
  form.skipAudit = false
  form.rewardTemplateId = null
}

function fillFromTask(task: Task) {
  form.title = task.title
  form.description = task.description || ''
  form.icon = task.icon || ''
  form.categoryId = task.categoryId
  form.taskType = task.taskType
  form.conditionType = task.conditionType
  form.difficulty = task.difficulty
  form.tagsText = (task.tags || []).join(',')
  form.targetCount = task.targetCount
  form.pointsAmount =
    task.rewardConfig?.rewards?.find(r => r.type === 'POINTS')?.config
      ?.amount || 0
  form.expAmount =
    task.rewardConfig?.rewards?.find(r => r.type === 'EXP')?.config?.amount || 0
  const physical = task.rewardConfig?.rewards?.find(r => r.type === 'PHYSICAL')
  form.hasPhysical = !!physical
  form.physicalName = physical?.config?.itemName || ''
  form.physicalStock = physical?.config?.stock || 0
  form.assignMode = task.assignMode
  form.completionMode = task.completionMode || 'ALL'
  form.unlockMode = task.unlockMode || 'SEQUENTIAL'
  form.priority = task.priority ?? 50
  form.startTime = task.startTime || null
  form.endTime = task.endTime || null
  form.dailyLimit = task.dailyLimit
  form.totalLimit = task.totalLimit
  form.acceptValidHours = task.acceptValidHours ?? null
  form.children = (task.children || []).map(c => ({ title: c.title }))
  form.skipAudit = false
  form.rewardTemplateId = null
}

function applyRewardTemplate(id: number | null) {
  if (!id) return
  const tpl = props.rewardTemplates.find(t => t.id === id)
  if (!tpl) return
  const points = tpl.rewardConfig.rewards.find(r => r.type === 'POINTS')
  const exp = tpl.rewardConfig.rewards.find(r => r.type === 'EXP')
  const physical = tpl.rewardConfig.rewards.find(r => r.type === 'PHYSICAL')
  if (points) form.pointsAmount = points.config.amount || 0
  if (exp) form.expAmount = exp.config.amount || 0
  if (physical) {
    form.hasPhysical = true
    form.physicalName = physical.config.itemName || ''
    form.physicalStock = physical.config.stock || 0
  }
}

function addChild() {
  form.children.push({ title: '' })
}

function removeChild(idx: number) {
  form.children.splice(idx, 1)
}

function buildPayload(): CreateTaskPayload {
  const rewards: CreateTaskPayload['rewardConfig']['rewards'] = []
  if (form.pointsAmount > 0) {
    rewards.push({
      type: 'POINTS',
      config: { amount: form.pointsAmount },
      description: form.pointsAmount + ' 积分'
    })
  }
  if (form.expAmount > 0) {
    rewards.push({
      type: 'EXP',
      config: { amount: form.expAmount },
      description: form.expAmount + ' 经验'
    })
  }
  if (form.hasPhysical && form.physicalName) {
    rewards.push({
      type: 'PHYSICAL',
      config: {
        itemName: form.physicalName,
        stock: form.physicalStock || 0
      },
      description: form.physicalName
    })
  }
  const children: TaskSubTask[] = form.children
    .filter(c => c.title.trim())
    .map((c, i) => ({
      id: i + 1,
      title: c.title.trim()
    }))
  const tags = form.tagsText
    .split(/[,，]/)
    .map(s => s.trim())
    .filter(Boolean)
  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    icon: form.icon.trim() || undefined,
    categoryId: form.categoryId,
    taskType: form.taskType,
    conditionType: form.conditionType,
    difficulty: Math.max(1, Math.min(4, form.difficulty || 1)) as 1 | 2 | 3 | 4,
    tags: tags.length ? tags : undefined,
    targetCount: form.targetCount || 1,
    assignMode: form.assignMode,
    completionMode: form.completionMode,
    unlockMode: form.unlockMode,
    priority: form.priority,
    startTime: form.startTime,
    endTime: form.endTime,
    dailyLimit: form.dailyLimit,
    totalLimit: form.totalLimit,
    acceptValidHours: form.acceptValidHours,
    rewardConfig: {
      rewards: rewards.length
        ? rewards
        : [{ type: 'POINTS', config: { amount: 0 } }]
    },
    children: children.length ? children : undefined,
    skipAudit: form.skipAudit
  }
}

async function onSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  emit('submit', buildPayload())
}

function onClosed() {
  formRef.value?.resetFields()
}

watch(
  () => [props.modelValue, props.editingTask] as const,
  ([open, task]) => {
    if (!open) return
    if (task) fillFromTask(task)
    else resetForm()
  }
)
</script>

<style scoped lang="less">
.children-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.child-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
