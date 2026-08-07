<template>
  <div class="question-bank g-list-vertical">
    <el-row class="mb16" :gutter="16">
      <el-col :span="14">
        <div class="flex gap8">
          <search-item
            v-model:field="search.keyword"
            label="关键词"
            type="input"
            placeholder="题干/标签"
            clearable
            class="w-1/2"
          />
          <search-item
            v-model:field="search.type"
            label="题型"
            type="select"
            placeholder="全部题型"
            :options="typeOptions"
            clearable
            class="w-1/2"
          />
        </div>
      </el-col>
      <el-col :span="10">
        <div class="flex justify-end gap8">
          <el-button type="primary" :icon="Search" @click="query"
            >搜索</el-button
          >
          <el-button :icon="RefreshLeft" @click="reset">重置</el-button>
          <el-button
            v-permission="'survey:questionnaire:questionBank'"
            type="success"
            :icon="Plus"
            @click="openForm()"
            >新增题目</el-button
          >
        </div>
      </el-col>
    </el-row>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column
        prop="title"
        label="题干"
        min-width="220"
        show-overflow-tooltip
      />
      <el-table-column label="题型" width="120">
        <template #default="{ row }">
          {{ getQuestionType(row.type)?.label || row.type }}
        </template>
      </el-table-column>
      <el-table-column label="标签" min-width="140">
        <template #default="{ row }">
          <el-tag
            v-for="t in row.tags || []"
            :key="t"
            size="small"
            class="tag"
            >{{ t }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'survey:questionnaire:questionBank'"
            link
            type="primary"
            @click="openForm(row)"
            >编辑</el-button
          >
          <el-button
            v-permission="'survey:questionnaire:questionBank'"
            link
            type="danger"
            @click="remove(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        v-model:current-page="page.curPage"
        v-model:page-size="page.pageSize"
        layout="total, prev, pager, next"
        :total="page.total"
        @current-change="query"
      />
    </div>

    <base-dialog
      ref="dialogRef"
      :options="dialogOptions"
      :title="dialogTitle"
      width="560px"
      @confirm="query"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Plus, RefreshLeft, Search } from '@element-plus/icons-vue'
import type { QuestionBankItem, QuestionType } from '@/types/survey'
import {
  listQuestionBank,
  createQuestionBankItem,
  updateQuestionBankItem,
  removeQuestionBankItem
} from '@/api/survey'
import { listQuestionTypes, getQuestionType } from '../types'
import formatDate from '@/utils/commom/formatDate.js'
import { showTips, getRequestErrorMessage } from '@/utils/message/showTips.js'
import { questionBankDialogFields } from './config/schema'

const SearchItem = defineAsyncComponent(
  () => import('@/components/base/SearchItem/index.vue')
)
const BaseDialog = defineAsyncComponent(
  () => import('@/components/base/form/BaseDialog.vue')
)

const typeOptions = listQuestionTypes().map(t => ({
  label: t.label,
  value: t.type
}))

const loading = ref(false)
const list = ref<QuestionBankItem[]>([])
const search = reactive({ keyword: '', type: '' })
const page = reactive({ curPage: 1, pageSize: 10, total: 0 })
const dialogRef = ref()
const dialogTitle = ref('新增题目')
const editingConfig = ref<Record<string, any>>({})

const fieldList = reactive(
  questionBankDialogFields.map(f => ({
    ...f,
    options: f.options ? [...f.options] : f.options,
    attrs: f.attrs ? { ...f.attrs } : f.attrs
  }))
)

const confirmMethod = async (data: Record<string, any>) => {
  let options: any[] = []
  try {
    if (String(data.optionsJson || '').trim()) {
      options = JSON.parse(data.optionsJson)
    }
  } catch (_e) {
    return { status: false, msg: '选项 JSON 格式错误' }
  }
  const payload: Partial<QuestionBankItem> = {
    title: data.title,
    type: data.type as QuestionType,
    description: data.description,
    tags: String(data.tagsText || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    config: {
      ...(editingConfig.value || {}),
      options
    }
  }
  try {
    if (data.id) {
      await updateQuestionBankItem(data.id, payload)
    } else {
      await createQuestionBankItem(payload)
    }
    showTips('success', '保存成功')
    return { status: true, msg: 'ok' }
  } catch (e: any) {
    return { status: false, msg: getRequestErrorMessage(e, '保存失败') }
  }
}

const dialogOptions = reactive({
  fieldList,
  confirmMethod,
  confirmText: '确定',
  confirmParams: {} as Record<string, any>,
  seedParams: {} as Record<string, any>,
  initParams: {} as Record<string, any>,
  labelPosition: 'left'
})

async function query() {
  loading.value = true
  try {
    const res = await listQuestionBank({
      keyword: search.keyword,
      type: search.type,
      curPage: page.curPage,
      pageSize: page.pageSize
    })
    list.value = res.list || []
    page.total = res.total || 0
  } catch (e: any) {
    showTips('error', e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function reset() {
  search.keyword = ''
  search.type = ''
  page.curPage = 1
  query()
}

function openForm(row?: QuestionBankItem) {
  if (row) {
    dialogTitle.value = '编辑题目'
    editingConfig.value = { ...(row.config || {}) }
    dialogOptions.initParams = { id: row.id }
    dialogOptions.seedParams = {
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description || '',
      tagsText: (row.tags || []).join(','),
      optionsJson: JSON.stringify(row.config?.options || [], null, 2)
    }
  } else {
    dialogTitle.value = '新增题目'
    editingConfig.value = {}
    dialogOptions.initParams = {}
    dialogOptions.seedParams = {
      type: 'radio',
      title: '',
      description: '',
      tagsText: '',
      optionsJson: '[{"content":"选项A"},{"content":"选项B"}]'
    }
  }
  dialogRef.value?.opentDialog()
}

async function remove(row: QuestionBankItem) {
  await ElMessageBox.confirm('确认删除？', '提示', { type: 'warning' })
  try {
    await removeQuestionBankItem(row.id!)
    showTips('success', '已删除')
    query()
  } catch (e: any) {
    showTips('error', e?.message || '删除失败')
  }
}

onMounted(query)
</script>

<style scoped>
.mb16 {
  margin-bottom: 16px;
}
.gap8 {
  gap: 8px;
}
.tag {
  margin-right: 4px;
}
.pager {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
