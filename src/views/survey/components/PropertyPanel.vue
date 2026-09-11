<template>
  <div class="property-panel" v-if="question">
    <h4>题目属性</h4>
    <el-form label-position="top" size="small">
      <el-form-item label="题干">
        <el-input v-model="question.title" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="说明">
        <el-input v-model="question.description" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="必填">
        <el-switch v-model="question.required" />
      </el-form-item>
      <el-form-item label="所在页">
        <el-input-number v-model="question.pageIndex" :min="1" :max="99" />
      </el-form-item>

      <template v-if="hasOptions">
        <el-divider content-position="left">选项</el-divider>
        <div
          v-for="(opt, i) in question.config!.options"
          :key="i"
          class="opt-row"
        >
          <el-input v-model="opt.content" placeholder="选项内容" />
          <el-checkbox v-model="opt.isOther">其他</el-checkbox>
          <el-button link type="danger" @click="removeOpt(i)">删</el-button>
        </div>
        <el-button size="small" @click="addOpt">添加选项</el-button>
      </template>

      <template v-if="question.type === 'checkbox'">
        <el-form-item label="最少选择">
          <el-input-number v-model="question.config!.minSelect" :min="0" />
        </el-form-item>
        <el-form-item label="最多选择">
          <el-input-number v-model="question.config!.maxSelect" :min="0" />
        </el-form-item>
      </template>

      <template
        v-if="question.type === 'input' || question.type === 'textarea'"
      >
        <el-form-item label="最大字数">
          <el-input-number v-model="question.config!.maxLength" :min="0" />
        </el-form-item>
        <el-form-item v-if="question.type === 'input'" label="正则校验">
          <el-input v-model="question.config!.pattern" placeholder="可选" />
        </el-form-item>
      </template>

      <template v-if="question.type === 'number' || question.type === 'slider'">
        <el-form-item label="最小值">
          <el-input-number v-model="question.config!.min" />
        </el-form-item>
        <el-form-item label="最大值">
          <el-input-number v-model="question.config!.max" />
        </el-form-item>
      </template>

      <template v-if="question.type === 'rating'">
        <el-form-item label="满分">
          <el-input-number
            v-model="question.config!.ratingMax"
            :min="1"
            :max="10"
          />
        </el-form-item>
      </template>

      <template
        v-if="
          question.type === 'matrix_radio' || question.type === 'matrix_input'
        "
      >
        <el-divider content-position="left">矩阵行</el-divider>
        <div
          v-for="(row, i) in question.config!.rows || []"
          :key="'r' + i"
          class="opt-row"
        >
          <el-input v-model="row.label" />
          <el-button
            link
            type="danger"
            @click="(question.config!.rows || []).splice(i, 1)"
            >删</el-button
          >
        </div>
        <el-button size="small" @click="addRow">添加行</el-button>
        <el-divider content-position="left">矩阵列</el-divider>
        <div
          v-for="(col, i) in question.config!.columns || []"
          :key="'c' + i"
          class="opt-row"
        >
          <el-input v-model="col.label" />
          <el-button
            link
            type="danger"
            @click="(question.config!.columns || []).splice(i, 1)"
            >删</el-button
          >
        </div>
        <el-button size="small" @click="addCol">添加列</el-button>
      </template>

      <template v-if="scoringEnabled">
        <el-divider content-position="left">评分</el-divider>
        <el-form-item label="参与评分">
          <el-switch v-model="scoring.enabled" />
        </el-form-item>
        <el-form-item label="分值">
          <el-input-number v-model="scoring.points" :min="0" />
        </el-form-item>
        <el-form-item label="判分方式">
          <el-select v-model="scoring.scoringType" class="w-full">
            <el-option label="自动" value="auto" />
            <el-option label="手动" value="manual" />
            <el-option label="混合" value="hybrid" />
          </el-select>
        </el-form-item>
        <el-form-item label="标准答案">
          <el-input
            v-model="correctAnswerText"
            placeholder="选项ID或文本，多选用逗号分隔"
            @change="syncCorrect"
          />
        </el-form-item>
        <el-form-item label="解析">
          <el-input v-model="scoring.explanation" type="textarea" :rows="2" />
        </el-form-item>
      </template>

      <el-divider content-position="left">逻辑</el-divider>
      <div v-for="(rule, i) in relatedRules" :key="i" class="logic-block">
        <div class="logic-row">
          <el-select v-model="rule.actionType" size="small" style="width: 90px">
            <el-option label="显示" value="show" />
            <el-option label="隐藏" value="hide" />
            <el-option label="跳转" value="jump" />
            <el-option label="必填" value="required" />
          </el-select>
          <el-select
            v-if="rule.actionType !== 'jump'"
            v-model="rule.targetQuestionId"
            size="small"
            placeholder="目标题"
            style="flex: 1"
          >
            <el-option
              v-for="q in otherQuestions"
              :key="String(q.id ?? q._key)"
              :label="q.title"
              :value="q.id ?? q._key"
            />
          </el-select>
          <el-input-number
            v-else
            v-model="rule.targetPage"
            size="small"
            :min="1"
            placeholder="页码"
          />
          <el-button link type="danger" @click="removeRule(i)">删</el-button>
        </div>
        <div class="logic-row cond-row">
          <el-select
            :model-value="ensureCondition(rule).operator"
            size="small"
            style="width: 110px"
            @update:model-value="
              (v: any) => (ensureCondition(rule).operator = v)
            "
          >
            <el-option label="等于" value="eq" />
            <el-option label="不等于" value="neq" />
            <el-option label="包含" value="includes" />
            <el-option label="大于" value="gt" />
            <el-option label="小于" value="lt" />
            <el-option label="非空" value="not_empty" />
          </el-select>
          <el-select
            v-if="
              sourceOptions.length &&
              ensureCondition(rule).operator !== 'not_empty'
            "
            :model-value="ensureCondition(rule).value"
            size="small"
            placeholder="条件值"
            style="flex: 1"
            clearable
            @update:model-value="(v: any) => (ensureCondition(rule).value = v)"
          >
            <el-option
              v-for="(opt, oi) in sourceOptions"
              :key="String(opt.id ?? opt.content ?? oi)"
              :label="opt.content"
              :value="opt.id ?? opt.content"
            />
          </el-select>
          <el-input
            v-else-if="ensureCondition(rule).operator !== 'not_empty'"
            :model-value="String(ensureCondition(rule).value ?? '')"
            size="small"
            placeholder="条件值"
            style="flex: 1"
            @update:model-value="
              (v: string) => (ensureCondition(rule).value = v)
            "
          />
        </div>
      </div>
      <el-button size="small" @click="addRule">添加逻辑</el-button>
    </el-form>
  </div>
  <div v-else class="empty">请选择题目进行编辑</div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type {
  Question,
  LogicRule,
  LogicCondition,
  QuestionScoringConfig
} from '@/types/survey'

const props = defineProps<{
  question: Question | null
  questions: Question[]
  logicRules: LogicRule[]
  scoringEnabled?: boolean
}>()
const emit = defineEmits<{ 'update:logicRules': [LogicRule[]] }>()

const hasOptions = computed(() =>
  ['radio', 'checkbox', 'sort', 'judge'].includes(props.question?.type || '')
)

const sourceOptions = computed(() => props.question?.config?.options || [])

const otherQuestions = computed(() =>
  props.questions.filter(
    q => (q.id ?? q._key) !== (props.question?.id ?? props.question?._key)
  )
)

function ensureCondition(rule: LogicRule): LogicCondition {
  const cond = rule.condition as any
  if (!cond || typeof cond !== 'object' || 'logic' in cond) {
    rule.condition = {
      questionId: rule.sourceQuestionId,
      operator: 'eq',
      value: ''
    }
  } else {
    if (!cond.operator) cond.operator = 'eq'
    if (cond.questionId == null) cond.questionId = rule.sourceQuestionId
  }
  return rule.condition as LogicCondition
}

const qKey = computed(() =>
  String(props.question?.id ?? props.question?._key ?? '')
)

const relatedRules = computed({
  get: () =>
    props.logicRules.filter(r => String(r.sourceQuestionId) === qKey.value),
  set: () => {}
})

const scoring = reactive<QuestionScoringConfig>({
  enabled: false,
  points: 0,
  scoringType: 'auto',
  correctAnswer: { value: '' },
  explanation: ''
})
const correctAnswerText = computed({
  get: () => {
    const v = scoring.correctAnswer?.value
    return Array.isArray(v) ? v.join(',') : String(v ?? '')
  },
  set: (t: string) => {
    syncCorrect(t)
  }
})

watch(
  () => props.question,
  q => {
    if (!q) return
    if (!q.config) q.config = {}
    if (!q.config.scoring) {
      q.config.scoring = {
        enabled: false,
        points: 0,
        scoringType: 'auto',
        correctAnswer: { value: '' },
        explanation: ''
      }
    }
    Object.assign(scoring, q.config.scoring)
  },
  { immediate: true }
)

watch(
  scoring,
  () => {
    if (props.question?.config) {
      props.question.config.scoring = { ...scoring }
    }
  },
  { deep: true }
)

function syncCorrect(t: string) {
  const parts = String(t || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  scoring.correctAnswer = {
    value: parts.length > 1 ? parts : parts[0] || ''
  }
}

function addOpt() {
  if (!props.question?.config) return
  if (!props.question.config.options) props.question.config.options = []
  props.question.config.options.push({
    content: '新选项',
    sortOrder: props.question.config.options.length + 1
  })
}
function removeOpt(i: number) {
  props.question?.config?.options?.splice(i, 1)
}
function addRow() {
  if (!props.question?.config) return
  if (!props.question.config.rows) props.question.config.rows = []
  const id = 'r' + Date.now()
  props.question.config.rows.push({ id, label: '新行' })
}
function addCol() {
  if (!props.question?.config) return
  if (!props.question.config.columns) props.question.config.columns = []
  const id = 'c' + Date.now()
  props.question.config.columns.push({ id, label: '新列' })
}

function addRule() {
  if (!props.question) return
  const next = [
    ...props.logicRules,
    {
      sourceQuestionId: props.question.id ?? props.question._key!,
      condition: {
        questionId: props.question.id ?? props.question._key!,
        operator: 'eq' as const,
        value: ''
      },
      actionType: 'show' as const,
      targetQuestionId: '',
      sortOrder: props.logicRules.length
    }
  ]
  emit('update:logicRules', next)
}

function removeRule(i: number) {
  const related = relatedRules.value
  const target = related[i]
  const next = props.logicRules.filter(r => r !== target)
  emit('update:logicRules', next)
}
</script>

<style scoped>
.property-panel {
  padding: 8px;
}
h4 {
  margin: 0 0 12px;
  font-size: 15px;
}
.opt-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 6px;
}
.logic-block {
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #ebeef5;
}
.logic-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 6px;
}
.cond-row {
  padding-left: 2px;
}
.empty {
  color: #909399;
  padding: 24px 8px;
  text-align: center;
}
.w-full {
  width: 100%;
}
</style>
