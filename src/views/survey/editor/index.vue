<template>
  <div class="survey-editor" v-loading="loading">
    <div class="top-bar">
      <el-input
        v-model="survey.title"
        class="title-input"
        placeholder="问卷标题"
      />
      <el-switch
        v-model="survey.scoringEnabled"
        active-text="评分模式"
        inactive-text="调研模式"
      />
      <div class="top-actions">
        <el-button :icon="Setting" @click="openSurveySettings"
          >问卷设置</el-button
        >
        <el-button
          type="primary"
          :icon="DocumentChecked"
          :loading="saving"
          @click="saveAll"
          >保存</el-button
        >
        <el-button :icon="View" @click="goPreview">预览</el-button>
        <el-button
          v-permission="'survey:questionnaire:publish'"
          type="success"
          :icon="Promotion"
          @click="publishVisible = true"
          >发布</el-button
        >
        <el-button :icon="Back" @click="$router.push('/home/survey')"
          >返回列表</el-button
        >
      </div>
    </div>

    <div class="editor-body">
      <aside class="left-pane">
        <h4>基础题型</h4>
        <div ref="basicListRef" class="type-list">
          <div
            v-for="t in basicTypes"
            :key="t.type"
            class="type-item"
            :data-q-type="t.type"
            @click="addQuestion(t.type)"
          >
            {{ t.label }}
          </div>
        </div>
        <h4>高级题型</h4>
        <div ref="advancedListRef" class="type-list">
          <div
            v-for="t in advancedTypes"
            :key="t.type"
            class="type-item"
            :data-q-type="t.type"
            @click="addQuestion(t.type)"
          >
            {{ t.label }}
          </div>
        </div>
        <el-button class="page-break-btn" size="small" @click="addPageBreak"
          >插入分页</el-button
        >
        <el-divider />
        <h4>从题库导入</h4>
        <el-input
          v-model="bankKeyword"
          size="small"
          placeholder="搜索题库"
          clearable
          @keyup.enter="loadBank"
        />
        <div ref="bankListRef" class="bank-list" v-loading="bankLoading">
          <div
            v-for="item in bankList"
            :key="item.id"
            class="bank-item"
            :data-q-type="item.type"
            :data-bank-id="String(item.id)"
            @click="importBank(item)"
          >
            <span class="bank-type">{{
              getQuestionType(item.type)?.label
            }}</span>
            {{ item.title }}
          </div>
          <el-empty
            v-if="!bankList.length"
            :image-size="48"
            description="暂无"
          />
        </div>
      </aside>

      <main class="center-pane">
        <el-input
          v-model="survey.description"
          type="textarea"
          :rows="2"
          placeholder="问卷说明（可选）"
          class="mb12"
        />
        <div ref="canvasRef" class="canvas">
          <QuestionEditorCard
            v-for="(q, idx) in questions"
            :key="String(q.id ?? q._key)"
            :question="q"
            :index="idx + 1"
            :active="activeKey === String(q.id ?? q._key)"
            @select="selectQuestion(q)"
            @move-up="moveQuestion(idx, -1)"
            @move-down="moveQuestion(idx, 1)"
            @copy="copyQuestion(q)"
            @remove="removeQuestion(idx)"
          />
          <div v-if="!questions.length" class="canvas-drop-hint" data-drop-hint>
            从左侧拖拽题型到此处，或点击添加
          </div>
        </div>
      </main>

      <aside class="right-pane">
        <div
          v-if="showSurveySettings || !activeQuestion"
          class="survey-settings"
        >
          <h4>问卷设置</h4>
          <el-form label-position="top" size="small">
            <el-form-item label="展示模式">
              <el-radio-group v-model="surveySettings.displayMode">
                <el-radio-button value="multi">分页</el-radio-button>
                <el-radio-button value="single">单页</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-divider content-position="left">外观</el-divider>
            <el-form-item label="主色">
              <el-color-picker v-model="themeConfig.primaryColor" />
            </el-form-item>
            <el-form-item label="背景色">
              <el-color-picker v-model="themeConfig.backgroundColor" />
            </el-form-item>
            <el-form-item label="显示进度条">
              <el-switch v-model="themeConfig.showProgress" />
            </el-form-item>
            <el-form-item label="显示题号">
              <el-switch v-model="themeConfig.showQuestionNumber" />
            </el-form-item>
            <el-form-item label="提交按钮文案">
              <el-input v-model="themeConfig.submitText" placeholder="提交" />
            </el-form-item>
            <el-form-item label="上一页文案">
              <el-input v-model="themeConfig.prevText" placeholder="上一页" />
            </el-form-item>
            <el-form-item label="下一页文案">
              <el-input v-model="themeConfig.nextText" placeholder="下一页" />
            </el-form-item>
            <el-form-item label="感谢文案">
              <el-input
                v-model="themeConfig.thankYouText"
                type="textarea"
                :rows="2"
                placeholder="感谢您的填写！"
              />
            </el-form-item>
            <el-form-item label="感谢跳转链接">
              <el-input
                v-model="themeConfig.thankYouLink"
                placeholder="https://"
              />
            </el-form-item>

            <template v-if="survey.scoringEnabled">
              <el-divider content-position="left">评分规则</el-divider>
              <el-form-item label="评分方式">
                <el-select v-model="scoringConfig.mode" class="w-full">
                  <el-option label="自动判分" value="auto" />
                  <el-option label="手动赋分" value="manual" />
                  <el-option label="混合" value="hybrid" />
                </el-select>
              </el-form-item>
              <el-form-item label="满分">
                <el-input-number v-model="scoringConfig.maxScore" :min="0" />
              </el-form-item>
              <el-form-item label="及格分">
                <el-input-number v-model="scoringConfig.passScore" :min="0" />
              </el-form-item>
              <el-form-item label="提交后显示分数">
                <el-switch v-model="scoringConfig.showScoreAfterSubmit" />
              </el-form-item>
              <el-form-item label="显示正确答案">
                <el-switch v-model="scoringConfig.showCorrectAnswer" />
              </el-form-item>
              <el-form-item label="允许重考">
                <el-switch v-model="scoringConfig.allowRetake" />
              </el-form-item>
              <el-form-item
                v-if="scoringConfig.allowRetake"
                label="最大重考次数"
              >
                <el-input-number v-model="scoringConfig.maxRetakes" :min="0" />
              </el-form-item>
              <el-form-item label="证书">
                <el-switch v-model="scoringConfig.certificateEnabled" />
              </el-form-item>
              <el-form-item label="排行榜">
                <el-switch v-model="scoringConfig.enableRanking" />
              </el-form-item>
              <el-form-item label="成绩可见性">
                <el-select
                  v-model="scoringConfig.resultVisibility"
                  class="w-full"
                >
                  <el-option label="提交后立即显示" value="immediate" />
                  <el-option label="指定时间公布" value="scheduled" />
                  <el-option label="仅管理员可见" value="admin_only" />
                </el-select>
              </el-form-item>
              <el-form-item label="等级映射 (grade_mapping JSON)">
                <el-input
                  v-model="gradeMappingText"
                  type="textarea"
                  :rows="5"
                  placeholder='[{"min":90,"max":100,"label":"A"}]'
                />
              </el-form-item>
            </template>
          </el-form>
          <el-button
            v-if="activeQuestion"
            class="mt8"
            size="small"
            @click="showSurveySettings = false"
            >返回题目属性</el-button
          >
        </div>
        <PropertyPanel
          v-else
          :question="activeQuestion"
          :questions="questions"
          v-model:logic-rules="logicRules"
          :scoring-enabled="!!survey.scoringEnabled"
        />
      </aside>
    </div>

    <PublishDialog
      v-model="publishVisible"
      :survey-id="surveyId"
      :initial="survey.publishConfig"
      @success="afterPublish"
    />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
  reactive,
  ref
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Back,
  DocumentChecked,
  Promotion,
  Setting,
  View
} from '@element-plus/icons-vue'
import Sortable from 'sortablejs'
import type {
  LogicRule,
  Question,
  QuestionType,
  ScoringConfig,
  ScoringRule,
  Survey,
  SurveySettings,
  ThemeConfig,
  QuestionBankItem
} from '@/types/survey'
import {
  createSurvey,
  getSurveyDetail,
  updateSurvey,
  saveQuestions,
  saveLogic,
  listQuestionBank,
  saveScoringConfig,
  getScoringRules,
  saveScoringRules
} from '@/api/survey'
import { listQuestionTypes, getQuestionType } from '../types'
import { nextClientKey } from '../types/base'
import QuestionEditorCard from '../components/QuestionEditorCard.vue'
import PropertyPanel from '../components/PropertyPanel.vue'
import PublishDialog from '../components/PublishDialog.vue'
import { setSurveyPreviewSnapshot } from '../utils/previewSnapshot'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const publishVisible = ref(false)
const showSurveySettings = ref(true)
const surveyId = ref<number | string>('')
const survey = reactive<Survey>({
  title: '未命名问卷',
  description: '',
  type: 'normal',
  status: 'draft',
  scoringEnabled: false,
  settings: { displayMode: 'multi' },
  themeConfig: {}
})
const surveySettings = reactive<SurveySettings>({ displayMode: 'multi' })
const themeConfig = reactive<ThemeConfig>({
  primaryColor: '#4C5EDB',
  backgroundColor: '#ffffff',
  showProgress: true,
  showQuestionNumber: true,
  submitText: '',
  prevText: '',
  nextText: '',
  thankYouText: '',
  thankYouLink: ''
})
const scoringConfig = reactive<ScoringConfig>({
  mode: 'auto',
  maxScore: 100,
  passScore: 60,
  resultVisibility: 'immediate',
  showCorrectAnswer: false,
  showScoreAfterSubmit: true,
  allowRetake: false,
  maxRetakes: 0,
  enableRanking: false,
  certificateEnabled: false
})
const gradeMappingText = ref('[]')
const scoringRules = ref<ScoringRule[]>([])
const questions = ref<Question[]>([])
const logicRules = ref<LogicRule[]>([])
const activeKey = ref('')
const canvasRef = ref<HTMLElement | null>(null)
const basicListRef = ref<HTMLElement | null>(null)
const advancedListRef = ref<HTMLElement | null>(null)
const bankListRef = ref<HTMLElement | null>(null)
const SORT_GROUP = 'survey-editor'
let canvasSortable: Sortable | null = null
const paletteSortables: Sortable[] = []

const basicTypes = listQuestionTypes('basic')
const advancedTypes = listQuestionTypes('advanced')

const activeQuestion = computed(
  () =>
    questions.value.find(q => String(q.id ?? q._key) === activeKey.value) ||
    null
)

const bankKeyword = ref('')
const bankList = ref<QuestionBankItem[]>([])
const bankLoading = ref(false)

async function loadBank() {
  bankLoading.value = true
  try {
    const res = await listQuestionBank({
      keyword: bankKeyword.value,
      pageSize: 50,
      curPage: 1
    })
    bankList.value = res.list || []
  } catch (_e) {
    bankList.value = []
  } finally {
    bankLoading.value = false
    await nextTick()
    initPaletteSortables()
  }
}

function importBank(item: QuestionBankItem) {
  const def = getQuestionType(item.type)
  if (!def) return
  const q = def.createQuestion({
    title: item.title,
    description: item.description,
    config: item.config,
    pageIndex: nextPageIndex(),
    sortOrder: questions.value.length
  })
  insertQuestion(q, questions.value.length)
}

function currentMaxPage() {
  return Math.max(1, ...questions.value.map(q => q.pageIndex || 1))
}

function nextPageIndex() {
  const marked = (survey.settings as any)?._nextPage
  return marked || currentMaxPage()
}

function insertQuestion(q: Question, index: number) {
  const arr = [...questions.value]
  const at = Math.max(0, Math.min(index, arr.length))
  arr.splice(at, 0, q)
  arr.forEach((item, i) => (item.sortOrder = i))
  questions.value = arr
  selectQuestion(q)
}

function addQuestion(type: QuestionType, index?: number) {
  const def = getQuestionType(type)
  if (!def) return
  const at = index == null ? questions.value.length : index
  const q = def.createQuestion({
    pageIndex: nextPageIndex(),
    sortOrder: at
  })
  insertQuestion(q, at)
}

function addQuestionFromDrag(el: HTMLElement, index: number) {
  const bankId = el.getAttribute('data-bank-id')
  if (bankId) {
    const item = bankList.value.find(b => String(b.id) === bankId)
    if (item) {
      const def = getQuestionType(item.type)
      if (!def) return
      const q = def.createQuestion({
        title: item.title,
        description: item.description,
        config: item.config,
        pageIndex: nextPageIndex(),
        sortOrder: index
      })
      insertQuestion(q, index)
      return
    }
  }
  const type = el.getAttribute('data-q-type') as QuestionType | null
  if (type) addQuestion(type, index)
}

function addPageBreak() {
  const nextPage = currentMaxPage() + 1
  if (!survey.settings) survey.settings = {}
  ;(survey.settings as any)._nextPage = nextPage
  ElMessage.success(`已插入分页，后续题目归属第 ${nextPage} 页`)
}

function selectQuestion(q: Question) {
  activeKey.value = String(q.id ?? q._key)
  showSurveySettings.value = false
}

function openSurveySettings() {
  showSurveySettings.value = true
}

function syncThemeAliases() {
  themeConfig.thankYouMessage =
    themeConfig.thankYouText || themeConfig.thankYouMessage
  themeConfig.thankYouRedirect =
    themeConfig.thankYouLink || themeConfig.thankYouRedirect
  scoringConfig.enableCertificate = !!scoringConfig.certificateEnabled
  if (scoringConfig.showScoreAfterSubmit) {
    scoringConfig.resultVisibility =
      scoringConfig.resultVisibility || 'immediate'
  }
}

function parseGradeMapping(): ScoringRule[] {
  const other = scoringRules.value.filter(r => r.type !== 'grade_mapping')
  try {
    const ranges = JSON.parse(gradeMappingText.value || '[]')
    if (Array.isArray(ranges) && ranges.length) {
      return [...other, { type: 'grade_mapping', config: { ranges } }]
    }
  } catch (_e) {
    ElMessage.warning('等级映射 JSON 格式无效，已跳过')
  }
  return other
}

function moveQuestion(index: number, delta: number) {
  const j = index + delta
  if (j < 0 || j >= questions.value.length) return
  const arr = [...questions.value]
  ;[arr[index], arr[j]] = [arr[j], arr[index]]
  arr.forEach((q, i) => (q.sortOrder = i))
  questions.value = arr
}

function copyQuestion(q: Question) {
  const def = getQuestionType(q.type)
  if (!def) return
  const copied = def.createQuestion({
    ...JSON.parse(JSON.stringify(q)),
    id: undefined,
    _key: nextClientKey(),
    title: q.title + '（副本）',
    sortOrder: questions.value.length
  })
  questions.value.push(copied)
  selectQuestion(copied)
}

function removeQuestion(index: number) {
  const removed = questions.value[index]
  questions.value.splice(index, 1)
  const key = String(removed.id ?? removed._key)
  logicRules.value = logicRules.value.filter(
    r =>
      String(r.sourceQuestionId) !== key && String(r.targetQuestionId) !== key
  )
  if (activeKey.value === key) activeKey.value = ''
}

function destroySortables() {
  canvasSortable?.destroy()
  canvasSortable = null
  while (paletteSortables.length) {
    paletteSortables.pop()?.destroy()
  }
}

function createPaletteSortable(el: HTMLElement | null, draggable: string) {
  if (!el) return
  const instance = Sortable.create(el, {
    group: { name: SORT_GROUP, pull: 'clone', put: false },
    sort: false,
    animation: 150,
    draggable,
    filter: '.el-empty',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag'
  })
  paletteSortables.push(instance)
}

function initPaletteSortables() {
  while (paletteSortables.length) {
    paletteSortables.pop()?.destroy()
  }
  createPaletteSortable(basicListRef.value, '.type-item')
  createPaletteSortable(advancedListRef.value, '.type-item')
  createPaletteSortable(bankListRef.value, '.bank-item')
}

function initSortable() {
  if (!canvasRef.value) return
  canvasSortable?.destroy()
  canvasSortable = Sortable.create(canvasRef.value, {
    group: { name: SORT_GROUP, pull: true, put: true },
    animation: 150,
    handle: '.drag-handle',
    draggable: '.editor-card',
    filter: '[data-drop-hint]',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    emptyInsertThreshold: 48,
    onAdd(evt) {
      const insertAt = evt.newIndex ?? questions.value.length
      const source = evt.item as HTMLElement
      // Remove Sortable clone before Vue re-renders the real card
      source.remove()
      addQuestionFromDrag(source, insertAt)
    },
    onEnd(evt) {
      if (evt.from !== evt.to) return
      const { oldIndex, newIndex } = evt
      if (oldIndex == null || newIndex == null || oldIndex === newIndex) return
      const arr = [...questions.value]
      const [moved] = arr.splice(oldIndex, 1)
      arr.splice(newIndex, 0, moved)
      arr.forEach((q, i) => (q.sortOrder = i))
      questions.value = arr
    }
  })
}

function initAllSortables() {
  initPaletteSortables()
  initSortable()
}

async function loadDetail() {
  const id = route.params.id as string
  if (!id || route.path.includes('/create')) {
    surveyId.value = ''
    return
  }
  loading.value = true
  try {
    const data = await getSurveyDetail(id)
    Object.assign(survey, data)
    surveyId.value = data.id!
    Object.assign(surveySettings, { displayMode: 'multi' }, data.settings || {})
    survey.settings = surveySettings
    Object.assign(
      themeConfig,
      {
        primaryColor: '#4C5EDB',
        backgroundColor: '#ffffff',
        showProgress: true,
        showQuestionNumber: true
      },
      data.themeConfig || {}
    )
    themeConfig.thankYouText =
      themeConfig.thankYouText || themeConfig.thankYouMessage || ''
    themeConfig.thankYouLink =
      themeConfig.thankYouLink || themeConfig.thankYouRedirect || ''
    survey.themeConfig = themeConfig
    questions.value = (data.questions || []).map(q => ({
      ...q,
      _key: q._key || nextClientKey()
    }))
    logicRules.value = data.logicRules || []
    if (data.scoringConfig) {
      Object.assign(scoringConfig, data.scoringConfig)
      scoringConfig.certificateEnabled =
        scoringConfig.certificateEnabled ?? !!scoringConfig.enableCertificate
      scoringConfig.showScoreAfterSubmit =
        scoringConfig.showScoreAfterSubmit ??
        scoringConfig.resultVisibility === 'immediate'
      scoringConfig.allowRetake =
        scoringConfig.allowRetake ?? (scoringConfig.maxRetakes ?? 0) > 0
    }
    try {
      const rules = data.scoringRules || (await getScoringRules(data.id!))
      scoringRules.value = rules || []
      const gm = scoringRules.value.find(r => r.type === 'grade_mapping')
      gradeMappingText.value = JSON.stringify(gm?.config?.ranges || [], null, 2)
    } catch (_e) {
      scoringRules.value = data.scoringRules || []
    }
    showSurveySettings.value = !questions.value.length
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
    await nextTick()
    initSortable()
  }
}

async function saveAll() {
  if (!survey.title?.trim()) {
    ElMessage.warning('请填写问卷标题')
    return
  }
  saving.value = true
  try {
    if (!surveyId.value) {
      syncThemeAliases()
      survey.settings = { ...surveySettings }
      survey.themeConfig = { ...themeConfig }
      const res = await createSurvey({
        title: survey.title,
        description: survey.description,
        type: survey.type,
        scoringEnabled: survey.scoringEnabled,
        settings: survey.settings,
        themeConfig: survey.themeConfig
      })
      const id = res?.data?.id || res?.id
      if (!id) {
        ElMessage.error(res?.msg || '创建失败')
        return
      }
      surveyId.value = id
      router.replace(`/home/survey/edit/${id}`)
    } else {
      syncThemeAliases()
      survey.settings = { ...surveySettings }
      survey.themeConfig = { ...themeConfig }
      await updateSurvey(surveyId.value, {
        title: survey.title,
        description: survey.description,
        type: survey.type,
        scoringEnabled: survey.scoringEnabled,
        settings: survey.settings,
        themeConfig: survey.themeConfig
      })
    }
    const oldQuestions = questions.value.map((q, i) => ({ ...q, sortOrder: i }))
    const saved = await saveQuestions(surveyId.value, oldQuestions)
    const savedDetail = (saved as any)?.data || saved
    const newQs: Question[] = savedDetail?.questions || []
    if (newQs.length) {
      const keyToNewId: Record<string, number | string> = {}
      oldQuestions.forEach((oq, i) => {
        const nq = newQs[i]
        if (nq?.id != null) {
          keyToNewId[String(oq.id ?? oq._key)] = nq.id
        }
      })
      logicRules.value = logicRules.value.map(r => {
        const cond = r.condition as any
        const nextCond =
          cond && typeof cond === 'object'
            ? {
                ...cond,
                questionId:
                  keyToNewId[String(cond.questionId)] ?? cond.questionId
              }
            : cond
        return {
          ...r,
          sourceQuestionId:
            keyToNewId[String(r.sourceQuestionId)] ?? r.sourceQuestionId,
          targetQuestionId:
            r.targetQuestionId != null && r.targetQuestionId !== ''
              ? (keyToNewId[String(r.targetQuestionId)] ?? r.targetQuestionId)
              : r.targetQuestionId,
          condition: nextCond
        }
      })
      questions.value = newQs.map(q => {
        const raw = q as Question & { options?: any[] }
        const options = raw.options || raw.config?.options || []
        return {
          ...q,
          config: {
            ...(q.config || {}),
            options
          }
        }
      })
    }
    await saveLogic(surveyId.value, logicRules.value)
    if (survey.scoringEnabled) {
      syncThemeAliases()
      await saveScoringConfig(surveyId.value, { ...scoringConfig })
      const rules = parseGradeMapping()
      scoringRules.value = rules
      await saveScoringRules(surveyId.value, rules)
    }
    ElMessage.success('保存成功')
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function goPreview() {
  if (!surveyId.value) {
    ElMessage.warning('请先保存问卷后再预览（需生成问卷 ID）')
    return
  }
  // 预览当前编辑态（含未保存改动），不强制先落库
  setSurveyPreviewSnapshot({
    surveyId: surveyId.value,
    survey: {
      title: survey.title,
      description: survey.description,
      type: survey.type,
      scoringEnabled: survey.scoringEnabled,
      settings: { ...surveySettings },
      themeConfig: { ...themeConfig }
    },
    questions: JSON.parse(JSON.stringify(questions.value)),
    logicRules: JSON.parse(JSON.stringify(logicRules.value))
  })
  router.push(`/home/survey/preview/${surveyId.value}`)
}

function afterPublish() {
  loadDetail()
}

onMounted(async () => {
  await loadDetail()
  loadBank()
  await nextTick()
  initAllSortables()
})

onBeforeUnmount(() => {
  destroySortables()
})
</script>

<style scoped>
.survey-editor {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}
.top-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}
.title-input {
  max-width: 360px;
}
.top-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.editor-body {
  flex: 1;
  display: grid;
  grid-template-columns: 220px 1fr 280px;
  min-height: 0;
}
.left-pane,
.right-pane {
  background: #fff;
  padding: 12px;
  overflow: auto;
  border-right: 1px solid #ebeef5;
}
.right-pane {
  border-right: none;
  border-left: 1px solid #ebeef5;
}
.center-pane {
  padding: 16px;
  overflow: auto;
}
h4 {
  margin: 8px 0;
  font-size: 13px;
  color: #606266;
}
.type-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.type-item {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 4px 6px;
  font-size: 12px;
  line-height: 1.2;
  color: #606266;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: grab;
  user-select: none;
  text-align: center;
  box-sizing: border-box;
}
.type-item:hover {
  color: var(--el-color-primary);
  border-color: #c6e2ff;
  background: #ecf5ff;
}
.type-item:active {
  cursor: grabbing;
}
.page-break-btn {
  width: 100%;
  margin-top: 8px;
}
.canvas {
  min-height: 280px;
}
.canvas-drop-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  border: 1px dashed #c0c4cc;
  border-radius: 8px;
  color: #909399;
  font-size: 13px;
  background: #fafafa;
  pointer-events: none;
}
.canvas :deep(.sortable-ghost) {
  opacity: 0.45;
  background: #ecf5ff;
  border: 1px dashed var(--el-color-primary);
}
.left-pane :deep(.sortable-ghost),
.left-pane :deep(.sortable-drag) {
  opacity: 0.85;
}
.mt8 {
  margin-top: 8px;
}
.mb12 {
  margin-bottom: 12px;
}
.bank-list {
  margin-top: 8px;
  max-height: 240px;
  overflow: auto;
}
.bank-item {
  padding: 6px 4px;
  font-size: 12px;
  border-bottom: 1px dashed #eee;
  cursor: grab;
  user-select: none;
}
.bank-item:active {
  cursor: grabbing;
}
.bank-item:hover {
  background: #f5f7fa;
}
.bank-type {
  display: inline-block;
  background: #ecf5ff;
  color: var(--el-color-primary);
  padding: 0 4px;
  margin-right: 4px;
  border-radius: 2px;
}
.w-full {
  width: 100%;
}
.survey-settings h4 {
  margin-top: 0;
}
</style>
