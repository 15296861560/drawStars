<template>
  <div class="survey-list g-list-vertical">
    <el-row class="mb16" :gutter="16">
      <el-col :span="16">
        <div class="flex gap8">
          <search-item
            v-model:field="searchInfo.title"
            label="标题"
            type="input"
            placeholder="搜索标题"
            clearable
            class="w-1/3"
          />
          <search-item
            v-model:field="searchInfo.status"
            label="状态"
            type="select"
            placeholder="全部状态"
            :options="statusOptions"
            clearable
            class="w-1/3"
          />
          <search-item
            v-model:field="searchInfo.type"
            label="类型"
            type="select"
            placeholder="全部类型"
            :options="typeOptions"
            clearable
            class="w-1/3"
          />
        </div>
      </el-col>
      <el-col :span="8">
        <div class="flex justify-end gap8">
          <el-button type="primary" :icon="Search" @click="query"
            >搜索</el-button
          >
          <el-button :icon="RefreshLeft" @click="reset">重置</el-button>
          <el-button
            v-permission="'survey:questionnaire:create'"
            type="success"
            :icon="Plus"
            @click="goCreate"
            >新建问卷</el-button
          >
          <el-radio-group
            v-model="viewMode"
            size="small"
            class="view-mode-toggle"
          >
            <el-radio-button value="card">
              <el-tooltip content="卡片" placement="top">
                <el-icon :size="16"><Grid /></el-icon>
              </el-tooltip>
            </el-radio-button>
            <el-radio-button value="table">
              <el-tooltip content="表格" placement="top">
                <el-icon :size="16"><List /></el-icon>
              </el-tooltip>
            </el-radio-button>
          </el-radio-group>
        </div>
      </el-col>
    </el-row>

    <div v-loading="loading">
      <div v-if="viewMode === 'card'" class="card-grid">
        <el-card
          v-for="item in list"
          :key="item.id"
          shadow="hover"
          class="survey-card"
        >
          <div class="card-title">{{ item.title }}</div>
          <div class="card-meta">
            <el-tag size="small" :type="statusTag(item.status)">{{
              statusLabel(item.status)
            }}</el-tag>
            <el-tag size="small" type="info">{{ typeLabel(item.type) }}</el-tag>
            <span>回收 {{ item.responseCount ?? 0 }}</span>
          </div>
          <div class="card-time">{{ item.createdAt || '-' }}</div>
          <div class="card-actions">
            <el-button
              v-permission="'survey:questionnaire:update'"
              link
              type="primary"
              @click="goEdit(item)"
              >编辑</el-button
            >
            <el-button
              v-if="item.status === 'draft' || item.status === 'paused'"
              v-permission="'survey:questionnaire:publish'"
              link
              type="success"
              @click="openPublish(item)"
              >发布</el-button
            >
            <el-button
              v-if="item.status === 'published'"
              link
              type="warning"
              @click="doPause(item)"
              >暂停</el-button
            >
            <el-button
              v-if="item.status === 'published' || item.status === 'paused'"
              link
              type="danger"
              @click="doClose(item)"
              >结束</el-button
            >
            <el-button
              v-if="item.status === 'published' || item.status === 'paused'"
              link
              @click="openShare(item)"
              >分享</el-button
            >
            <el-button link @click="goAnalysis(item)">分析</el-button>
            <el-button v-if="item.scoringEnabled" link @click="goGrading(item)"
              >阅卷</el-button
            >
            <el-button link @click="doCopy(item)">复制</el-button>
            <el-button
              v-permission="'survey:questionnaire:delete'"
              link
              type="danger"
              @click="doDelete(item)"
              >删除</el-button
            >
          </div>
        </el-card>
        <el-empty v-if="!list.length" description="暂无问卷" />
      </div>

      <base-table
        v-else
        :options="tableOptions"
        :page="pageInfo"
        max-height="700"
      />
    </div>

    <div v-if="viewMode === 'card'" class="pager">
      <el-pagination
        v-model:current-page="pageInfo.curPage"
        v-model:page-size="pageInfo.pageSize"
        layout="total, prev, pager, next"
        :total="pageInfo.total"
        @current-change="query"
      />
    </div>

    <PublishDialog
      v-model="publishVisible"
      :survey-id="currentId"
      :initial="currentPublish"
      @success="query"
    />
    <ShareDialog
      v-model="shareVisible"
      :survey-id="currentId"
      :share-code="currentShareCode"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Grid, List, Plus, RefreshLeft, Search } from '@element-plus/icons-vue'
import type {
  PublishConfig,
  Survey,
  SurveyStatus,
  SurveyType
} from '@/types/survey'
import {
  listSurveys,
  removeSurvey,
  copySurvey,
  pauseSurvey,
  closeSurvey
} from '@/api/survey'
import PublishDialog from '../components/PublishDialog.vue'
import ShareDialog from '../components/ShareDialog.vue'
import formatDate from '@/utils/commom/formatDate.js'

const SearchItem = defineAsyncComponent(
  () => import('@/components/base/SearchItem/index.vue')
)
const BaseTable = defineAsyncComponent(
  () => import('@/components/base/form/BaseTable.vue')
)

const router = useRouter()
const loading = ref(false)
const viewMode = ref<'card' | 'table'>('card')
const list = ref<Survey[]>([])
const searchInfo = reactive({ title: '', status: '', type: '' })
const pageInfo = reactive({
  curPage: 1,
  pageSize: 12,
  total: 0,
  curPageChange: query
})

const publishVisible = ref(false)
const shareVisible = ref(false)
const currentId = ref<number | string>('')
const currentShareCode = ref('')
const currentPublish = ref<Partial<PublishConfig>>({})

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
  { label: '已暂停', value: 'paused' },
  { label: '已结束', value: 'closed' }
]
const typeOptions = [
  { label: '普通', value: 'normal' },
  { label: '考试', value: 'exam' },
  { label: '报名', value: 'signup' }
]

function statusLabel(s?: SurveyStatus) {
  return statusOptions.find(o => o.value === s)?.label || s || '-'
}
function statusTag(s?: SurveyStatus) {
  const map: Record<string, any> = {
    draft: 'info',
    published: 'success',
    paused: 'warning',
    closed: 'danger'
  }
  return map[s || ''] || 'info'
}
function typeLabel(t?: SurveyType) {
  return typeOptions.find(o => o.value === t)?.label || t || '普通'
}

async function query() {
  loading.value = true
  try {
    const res = await listSurveys({
      title: searchInfo.title,
      status: searchInfo.status as any,
      type: searchInfo.type as any,
      curPage: pageInfo.curPage,
      pageSize: pageInfo.pageSize
    })
    list.value = (res.list || []).map(item => ({
      ...item,
      statusLabel: statusLabel(item.status),
      typeLabel: typeLabel(item.type),
      createdAt: formatDate(item.createdAt) || item.createdAt || '-'
    }))
    pageInfo.total = res.total || 0
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function reset() {
  searchInfo.title = ''
  searchInfo.status = ''
  searchInfo.type = ''
  pageInfo.curPage = 1
  query()
}

function goCreate() {
  router.push('/home/survey/create')
}
function goEdit(item: Survey) {
  router.push(`/home/survey/edit/${item.id}`)
}
function goAnalysis(item: Survey) {
  router.push(`/home/survey/analysis/${item.id}`)
}
function goGrading(item: Survey) {
  router.push(`/home/survey/grading/${item.id}`)
}

function openPublish(item: Survey) {
  currentId.value = item.id!
  currentPublish.value = item.publishConfig || {}
  publishVisible.value = true
}
function openShare(item: Survey) {
  currentId.value = item.id!
  currentShareCode.value = item.publishConfig?.shareCode || ''
  if (!currentShareCode.value) {
    ElMessage.warning('暂无分享码，请先发布')
    return
  }
  shareVisible.value = true
}

async function doPause(item: Survey) {
  try {
    await pauseSurvey(item.id!)
    ElMessage.success('已暂停')
    query()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}
async function doClose(item: Survey) {
  await ElMessageBox.confirm('结束后不可恢复发布，确认结束？', '提示', {
    type: 'warning'
  })
  try {
    await closeSurvey(item.id!)
    ElMessage.success('已结束')
    query()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}
async function doCopy(item: Survey) {
  try {
    await copySurvey(item.id!)
    ElMessage.success('复制成功')
    query()
  } catch (e: any) {
    ElMessage.error(e?.message || '复制失败')
  }
}
async function doDelete(item: Survey) {
  await ElMessageBox.confirm('确认删除该问卷？', '提示', { type: 'warning' })
  try {
    await removeSurvey(item.id!)
    ElMessage.success('删除成功')
    query()
  } catch (e: any) {
    ElMessage.error(e?.message || '删除失败')
  }
}

const tableOptions = reactive({
  tableData: list,
  tableFields: [
    { fieldName: 'title', label: '标题', type: 'text', minWidth: 180 },
    {
      fieldName: 'statusLabel',
      label: '状态',
      type: 'text',
      width: 100
    },
    { fieldName: 'typeLabel', label: '类型', type: 'text', width: 90 },
    { fieldName: 'responseCount', label: '回收', type: 'text', width: 80 },
    { fieldName: 'createdAt', label: '创建时间', type: 'text', minWidth: 160 }
  ],
  pageTableOperate: [
    { label: '编辑', type: 'primary', action: (row: Survey) => goEdit(row) },
    {
      label: '发布',
      type: 'success',
      show: (_o: any, row: Survey) =>
        row.status === 'draft' || row.status === 'paused',
      action: (row: Survey) => openPublish(row)
    },
    {
      label: '暂停',
      type: 'warning',
      show: (_o: any, row: Survey) => row.status === 'published',
      action: (row: Survey) => doPause(row)
    },
    {
      label: '结束',
      type: 'danger',
      show: (_o: any, row: Survey) =>
        row.status === 'published' || row.status === 'paused',
      action: (row: Survey) => doClose(row)
    },
    {
      label: '分享',
      show: (_o: any, row: Survey) =>
        row.status === 'published' || row.status === 'paused',
      action: (row: Survey) => openShare(row)
    },
    { label: '分析', action: (row: Survey) => goAnalysis(row) },
    {
      label: '阅卷',
      show: (_o: any, row: Survey) => !!row.scoringEnabled,
      action: (row: Survey) => goGrading(row)
    },
    { label: '复制', action: (row: Survey) => doCopy(row) },
    {
      label: '删除',
      type: 'danger',
      action: (row: Survey) => doDelete(row)
    }
  ],
  operateFixed: 'right',
  tableOperateWidth: 360
})

onMounted(query)
</script>

<style scoped>
.mb16 {
  margin-bottom: 16px;
}
.gap8 {
  gap: 8px;
}
.gap4 {
  gap: 4px;
}
.view-mode-toggle :deep(.el-radio-button__inner) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.survey-card {
  min-height: 180px;
}
.card-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 10px;
}
.card-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  color: #606266;
  font-size: 13px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.card-time {
  color: #909399;
  font-size: 12px;
  margin-bottom: 12px;
}
.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}
.pager {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
