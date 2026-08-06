<template>
  <div class="survey-template" v-loading="loading">
    <div class="toolbar">
      <h3>问卷模板</h3>
      <div>
        <el-button
          v-permission="'survey:questionnaire:template'"
          type="primary"
          :icon="DocumentAdd"
          @click="openCreate"
          >从空白创建模板</el-button
        >
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </div>

    <div class="card-grid">
      <el-card
        v-for="item in list"
        :key="item.id"
        shadow="hover"
        class="tpl-card"
      >
        <div class="title">{{ item.title }}</div>
        <div class="desc">{{ item.description || '暂无描述' }}</div>
        <div class="meta">
          <el-tag size="small">{{ categoryLabel(item.category) }}</el-tag>
          <el-tag size="small" type="info">{{
            typeLabel(resolveTemplateType(item))
          }}</el-tag>
        </div>
        <div class="actions">
          <el-button
            v-permission="'survey:questionnaire:create'"
            type="primary"
            size="small"
            @click="useTpl(item)"
            >使用模板</el-button
          >
          <el-button
            v-permission="'survey:questionnaire:template'"
            type="danger"
            size="small"
            link
            @click="remove(item)"
            >删除</el-button
          >
        </div>
      </el-card>
      <el-empty v-if="!list.length" description="暂无模板" />
    </div>

    <base-dialog
      ref="dialogRef"
      :options="dialogOptions"
      :title="dialogTitle"
      @confirm="load"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { DocumentAdd, Refresh } from '@element-plus/icons-vue'
import type { SurveyTemplate, SurveyType } from '@/types/survey'
import {
  listTemplates,
  listSurveys,
  getSurveyDetail,
  createTemplate,
  removeTemplate,
  useTemplate
} from '@/api/survey'
import { showTips, getRequestErrorMessage } from '@/utils/message/showTips.js'
import { dialogFields } from './config/schema'

const BaseDialog = defineAsyncComponent(
  () => import('@/components/base/form/BaseDialog.vue')
)

const typeOptions: { label: string; value: SurveyType }[] = [
  { label: '普通', value: 'normal' },
  { label: '考试', value: 'exam' },
  { label: '报名', value: 'signup' }
]

const categoryMap: Record<string, string> = {
  general: '通用',
  satisfaction: '满意度',
  feedback: '活动反馈',
  demand: '需求收集',
  requirement: '需求收集',
  exam: '考试测评',
  signup: '活动报名',
  hr: '人力资源',
  education: '教育培训',
  market: '市场调研'
}

function typeLabel(t?: SurveyType | string) {
  return typeOptions.find(o => o.value === t)?.label || t || '普通'
}

function categoryLabel(c?: string) {
  if (!c) return '通用'
  return categoryMap[c] || categoryMap[c.toLowerCase()] || c
}

function resolveTemplateType(item: SurveyTemplate) {
  return item.type || item.content?.type || 'normal'
}

/** Build API `content` payload expected by survey template create */
async function buildTemplateContent(data: Record<string, any>) {
  if (
    data.surveyId !== undefined &&
    data.surveyId !== null &&
    data.surveyId !== ''
  ) {
    const detail = await getSurveyDetail(data.surveyId)
    const questions = (detail.questions || []).map((q, i) => ({
      type: q.type,
      title: q.title,
      description: q.description || '',
      required: !!q.required,
      sortOrder: q.sortOrder ?? i,
      pageIndex: q.pageIndex || 1,
      config: q.config || {},
      options: (q as any).options || q.config?.options || [],
      extra: q.extra || {}
    }))
    if (!questions.length) {
      throw new Error('来源问卷尚无题目，无法生成模板内容')
    }
    return {
      title: data.title || detail.title,
      description: data.description ?? detail.description ?? '',
      type: data.type || detail.type || 'normal',
      scoringEnabled: !!detail.scoringEnabled,
      scoringConfig: detail.scoringConfig,
      settings: detail.settings,
      themeConfig: detail.themeConfig,
      logicRules: detail.logicRules || [],
      questions
    }
  }

  // Blank template: still must send non-empty content object
  return {
    title: data.title,
    description: data.description || '',
    type: data.type || 'normal',
    scoringEnabled: false,
    questions: []
  }
}

const router = useRouter()
const loading = ref(false)
const list = ref<SurveyTemplate[]>([])
const dialogRef = ref()
const dialogTitle = ref('创建模板')

const fieldList = reactive(
  dialogFields.map(f => ({
    ...f,
    options: f.options ? [...f.options] : f.options,
    attrs: f.attrs ? { ...f.attrs } : f.attrs
  }))
)

async function loadSurveyOptions(keyword = '') {
  const surveyField = fieldList.find(f => f.fieldName === 'surveyId')
  if (!surveyField) return
  try {
    const res = await listSurveys({
      curPage: 1,
      pageSize: 100,
      ...(keyword ? { title: keyword } : {})
    })
    surveyField.options = (res.list || [])
      .filter(s => s.id != null)
      .map(s => ({
        label: s.title ? `${s.title} (#${s.id})` : `问卷 #${s.id}`,
        value: String(s.id)
      }))
  } catch (_e) {
    surveyField.options = []
  }
}

const confirmMethod = async (data: Record<string, any>) => {
  try {
    const content = await buildTemplateContent(data)
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
      content
    }
    const res = await createTemplate(payload)
    if (res?.status === false) {
      return res
    }
    showTips('success', '创建成功')
    return { status: true, msg: 'ok', data: res?.data ?? res }
  } catch (e: any) {
    return { status: false, msg: getRequestErrorMessage(e, '创建失败') }
  }
}

const dialogOptions = reactive({
  fieldList,
  confirmMethod,
  confirmParams: {
    category: 'general',
    type: 'normal'
  },
  initParams: {} as Record<string, any>,
  disabled: false,
  labelPosition: 'left'
})

async function load() {
  loading.value = true
  try {
    const res = await listTemplates({ curPage: 1, pageSize: 50 })
    list.value = res.list || []
  } catch (e: any) {
    showTips('error', e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function openCreate() {
  dialogTitle.value = '创建模板'
  dialogOptions.disabled = false
  dialogOptions.initParams = {}
  await loadSurveyOptions()
  dialogRef.value?.opentDialog()
}

async function useTpl(item: SurveyTemplate) {
  try {
    const res = await useTemplate(item.id!)
    const id = res?.data?.id || res?.id
    showTips('success', '已基于模板创建问卷')
    if (id) router.push(`/home/survey/edit/${id}`)
    else router.push('/home/survey')
  } catch (e: any) {
    showTips('error', e?.message || '使用失败')
  }
}

async function remove(item: SurveyTemplate) {
  await ElMessageBox.confirm('确认删除该模板？', '提示', {
    type: 'warning'
  })
  try {
    await removeTemplate(item.id!)
    showTips('success', '已删除')
    load()
  } catch (e: any) {
    showTips('error', e?.message || '删除失败')
  }
}

onMounted(load)
</script>

<style scoped>
.survey-template {
  padding: 8px;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.toolbar h3 {
  margin: 0;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.tpl-card .title {
  font-weight: 600;
  margin-bottom: 8px;
}
.tpl-card .desc {
  color: #909399;
  font-size: 13px;
  min-height: 40px;
  margin-bottom: 10px;
}
.meta {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}
.actions {
  display: flex;
  gap: 8px;
}
</style>
