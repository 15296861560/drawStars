<template>
  <div class="survey-grading" v-loading="loading">
    <div class="toolbar">
      <h3>阅卷工作台</h3>
      <div class="toolbar-actions">
        <el-button
          v-if="current && pendingItems.length"
          type="warning"
          :icon="EditPen"
          :loading="batching"
          @click="batchSameScore"
          >批量赋分(当前分)</el-button
        >
        <el-button
          :icon="DataAnalysis"
          @click="$router.push(`/home/survey/analysis/${surveyId}`)"
          >数据分析</el-button
        >
      </div>
    </div>

    <el-row :gutter="16">
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>待阅卷题目</template>
          <div
            v-for="g in groups"
            :key="String(g.questionId)"
            class="group-item"
            :class="{ active: current?.questionId === g.questionId }"
            @click="selectGroup(g)"
          >
            <div class="g-title">{{ g.questionTitle }}</div>
            <el-tag size="small" type="warning"
              >待批 {{ g.pendingCount }}</el-tag
            >
          </div>
          <el-empty v-if="!groups.length" description="暂无待阅卷" />
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card v-if="currentItem" shadow="never">
          <template #header>
            <div class="card-head">
              <span>答卷 #{{ currentItem.responseId }}</span>
              <span>{{ currentItem.userName || '匿名' }}</span>
            </div>
          </template>

          <div v-if="currentQuestion" class="answer-render">
            <QuestionRenderer
              :question="currentQuestion"
              :model-value="currentItem.answerData"
              :index="1"
              :show-number="true"
              readonly
            />
          </div>
          <div v-else class="answer-box">
            <pre>{{ formatAnswer(currentItem.answerData) }}</pre>
          </div>
          <el-collapse class="mt12">
            <el-collapse-item title="JSON 原始答案" name="json">
              <pre class="json-pre">{{
                formatAnswer(currentItem.answerData)
              }}</pre>
            </el-collapse-item>
          </el-collapse>

          <el-form label-width="80px" class="mt12">
            <el-form-item label="得分">
              <el-input-number
                v-model="score"
                :min="0"
                :max="currentItem.maxScore"
              />
              <span class="hint">满分 {{ currentItem.maxScore }}</span>
            </el-form-item>
            <el-form-item label="评语">
              <el-input v-model="comment" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="submitting" @click="submit"
                >提交评分</el-button
              >
              <el-button @click="nextItem">下一份</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        <el-empty v-else description="请选择左侧题目开始阅卷" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DataAnalysis, EditPen } from '@element-plus/icons-vue'
import type { GradingListItem, Question } from '@/types/survey'
import {
  getGradingList,
  submitGrading,
  batchGrading,
  getSurveyDetail
} from '@/api/survey'
import QuestionRenderer from '../components/QuestionRenderer.vue'

const route = useRoute()
const surveyId = computed(() => String(route.params.id))
const loading = ref(false)
const submitting = ref(false)
const batching = ref(false)
const groups = ref<GradingListItem[]>([])
const current = ref<GradingListItem | null>(null)
const itemIndex = ref(0)
const score = ref(0)
const comment = ref('')
const questions = ref<Question[]>([])

const currentItem = computed(
  () => current.value?.items?.[itemIndex.value] || null
)
const pendingItems = computed(() => current.value?.items || [])
const currentQuestion = computed(() => {
  if (!current.value) return null
  return (
    questions.value.find(
      q => String(q.id) === String(current.value!.questionId)
    ) ||
    ({
      id: current.value.questionId,
      type: 'textarea',
      title: current.value.questionTitle,
      required: false,
      config: {}
    } as Question)
  )
})

function formatAnswer(data: any) {
  try {
    return JSON.stringify(data, null, 2)
  } catch (_e) {
    return String(data)
  }
}

function selectGroup(g: GradingListItem) {
  current.value = g
  itemIndex.value = 0
  score.value = g.items[0]?.currentScore ?? 0
  comment.value = ''
}

function nextItem() {
  if (!current.value) return
  if (itemIndex.value < current.value.items.length - 1) {
    itemIndex.value += 1
    score.value = current.value.items[itemIndex.value]?.currentScore ?? 0
    comment.value = ''
  } else {
    ElMessage.info('已是该题最后一份')
  }
}

async function submit() {
  if (!currentItem.value || !current.value) return
  submitting.value = true
  try {
    await submitGrading(surveyId.value, currentItem.value.responseId, {
      scores: [
        {
          questionId: current.value.questionId,
          score: score.value,
          comment: comment.value
        }
      ]
    })
    ElMessage.success('评分已提交')
    await load()
  } catch (e: any) {
    ElMessage.error(e?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

async function batchSameScore() {
  if (!current.value || !pendingItems.value.length) return
  await ElMessageBox.confirm(
    `将当前分数 ${score.value} 批量应用到该题全部 ${pendingItems.value.length} 份答卷？`,
    '批量阅卷',
    { type: 'warning' }
  )
  batching.value = true
  try {
    await batchGrading(surveyId.value, {
      questionId: current.value.questionId,
      items: pendingItems.value.map(it => ({
        responseId: it.responseId,
        score: score.value,
        comment: comment.value
      }))
    })
    ElMessage.success('批量赋分完成')
    await load()
  } catch (e: any) {
    ElMessage.error(e?.message || '批量失败')
  } finally {
    batching.value = false
  }
}

async function load() {
  loading.value = true
  try {
    if (!questions.value.length) {
      try {
        const detail = await getSurveyDetail(surveyId.value)
        questions.value = detail.questions || []
      } catch (_e) {
        questions.value = []
      }
    }
    groups.value = await getGradingList(surveyId.value)
    if (current.value) {
      const again = groups.value.find(
        g => String(g.questionId) === String(current.value!.questionId)
      )
      if (again) selectGroup(again)
      else {
        current.value = null
        itemIndex.value = 0
      }
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.survey-grading {
  padding: 8px;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.toolbar h3 {
  margin: 0;
}
.toolbar-actions {
  display: flex;
  gap: 8px;
}
.group-item {
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
}
.group-item.active {
  border-color: var(--el-color-primary);
  background: #ecf5ff;
}
.g-title {
  font-size: 13px;
  margin-bottom: 6px;
}
.card-head {
  display: flex;
  justify-content: space-between;
}
.answer-box,
.answer-render {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  max-height: 360px;
  overflow: auto;
}
.answer-box pre,
.json-pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}
.hint {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}
.mt12 {
  margin-top: 12px;
}
</style>
