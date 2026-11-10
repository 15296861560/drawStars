<template>
  <div class="manage-page">
    <page-hero
      title="题目池管理"
      desc="真心话 / 大冒险题目与你画我猜词库维护，支持分级、主题标签与上下架"
    >
      <template #side>
        <span v-if="isCrudTab" class="page-hero__pill">共 {{ pageInfo.total }} 条</span>
        <el-button
          v-if="isCrudTab"
          v-permission="'party:question:manage'"
          class="page-hero__btn"
          type="primary"
          :icon="Plus"
          @click="openCreate"
        >
          新增{{ curTab === 'wordbank' ? '词条' : curTab === 'truth' ? '真心话' : '大冒险' }}
        </el-button>
      </template>
    </page-hero>

    <el-tabs v-model="curTab" class="party-tabs" @tab-change="onTabChange">
      <el-tab-pane label="真心话" name="truth" />
      <el-tab-pane label="大冒险" name="dare" />
      <el-tab-pane label="小姐牌" name="lady" />
      <el-tab-pane label="瞎掰王命题" name="bluff" />
      <el-tab-pane label="你画我猜词库" name="wordbank" />
    </el-tabs>

    <filter-bar v-if="isCrudTab" :searching="loading" @search="query" @reset="reset">
      <el-input
        v-model="searchInfo.keyword"
        placeholder="关键词"
        clearable
        style="width: 220px"
        @keyup.enter="query"
        @clear="query"
      />
      <el-select
        v-model="searchInfo.level"
        clearable
        placeholder="分级"
        style="width: 130px"
        @change="query"
      >
        <el-option v-for="op in levelOptions" :key="op.value" :label="op.label" :value="op.value" />
      </el-select>
      <el-select
        v-model="searchInfo.status"
        clearable
        placeholder="状态"
        style="width: 130px"
        @change="query"
      >
        <el-option
          v-for="op in PARTY_CONTENT_STATUS_TAGS"
          :key="op.value"
          :label="op.label"
          :value="op.value"
        />
      </el-select>
    </filter-bar>

    <!-- 小姐牌 / 瞎掰王：纯前端规则引擎 + 小程序内置命题，无服务端题池（PRD 6.4 / 3.5 / 3.6），如实空态 -->
    <el-empty v-if="!isCrudTab" :description="emptyText" />

    <base-table v-else :options="tableOptions" :page="pageInfo" />

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="formVisible" :title="formTitle" width="520px" destroy-on-close append-to-body>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="82px">
        <template v-if="curTab === 'wordbank'">
          <el-form-item label="词条" prop="word">
            <el-input v-model="form.word" maxlength="16" placeholder="请输入词条" />
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="题目内容" prop="text">
            <el-input
              v-model="form.text"
              type="textarea"
              :rows="4"
              maxlength="120"
              show-word-limit
              placeholder="请输入题目内容"
            />
          </el-form-item>
        </template>
        <el-form-item label="分级">
          <el-select v-model="form.level" style="width: 100%">
            <el-option v-for="op in levelOptions" :key="op.value" :label="op.label" :value="op.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="curTab === 'wordbank'" label="主题">
          <el-select
            v-model="form.theme"
            style="width: 100%"
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入主题 tagKey"
          >
            <el-option v-for="key in themeKeys" :key="key" :label="key" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item v-else label="主题标签">
          <el-select
            v-model="form.themes"
            style="width: 100%"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入主题 tagKey"
          >
            <el-option v-for="key in themeKeys" :key="key" :label="key" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio-button value="online">上架</el-radio-button>
            <el-radio-button value="offline">下架</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { showTips } from '@/utils/message/showTips.js'
import {
  createQuestions,
  createWordbank,
  deleteQuestion,
  deleteWordbank,
  getQuestions,
  getThemes,
  getWordbank,
  updateQuestion,
  updateWordbank
} from '@/api/party'
import {
  PARTY_CONTENT_STATUS_TAGS,
  PARTY_LEVEL_OPTIONS
} from '@/types/party'
import type {
  PartyContentStatus,
  PartyLevel,
  PartyQuestion,
  PartyQuestionCreateParams,
  PartyQuestionQuery,
  PartyWord,
  PartyWordCreateParams,
  PartyWordQuery
} from '@/types/party'

const BaseTable = defineAsyncComponent(() => import('@/components/base/form/BaseTable.vue'))
const FilterBar = defineAsyncComponent(() => import('@/components/base/FilterBar/index.vue'))
const PageHero = defineAsyncComponent(() => import('@/components/base/PageHero/index.vue'))

// 词库与题目共用后端 LEVELS 分级键（gentle / standard / starry），见 party.admin.service.ts createWordbank 校验

const emptyTextMap: Record<string, string> = {
  lady: '小姐牌为纯前端规则引擎（PRD 3.5 离线可玩），基础牌组随小程序内置发版，暂无服务端题池',
  bluff: '瞎掰王命题池随小程序本机内置（PRD 3.6），服务端暂未开命题池端点'
}

type TabName = 'truth' | 'dare' | 'lady' | 'bluff' | 'wordbank'

const curTab = ref<TabName>('truth')
const isCrudTab = computed(() => curTab.value === 'truth' || curTab.value === 'dare' || curTab.value === 'wordbank')
const isWordbank = computed(() => curTab.value === 'wordbank')
const emptyText = computed(() => emptyTextMap[curTab.value] || '')
const levelOptions = PARTY_LEVEL_OPTIONS

const loading = ref(false)
const saving = ref(false)
const searchInfo = reactive({
  keyword: '',
  level: '' as PartyLevel | '',
  status: '' as PartyContentStatus | ''
})
const themeKeys = ref<string[]>([])

const pageInfo = reactive({
  curPage: 1,
  pageSize: 10,
  total: 0,
  curPageChange: query,
  sizeChange: query
})

const tableData = ref<Record<string, unknown>[]>([])
const tableOptions = reactive({
  tableName: '题目列表',
  tableData,
  tableFields: computed(() =>
    isWordbank.value
      ? [
          { fieldName: 'word', label: '词条', minWidth: 160, align: 'left' },
          { fieldName: 'levelLabel', label: '难度', width: 90, align: 'center' },
          { fieldName: 'theme', label: '主题', width: 130, align: 'center' },
          {
            fieldName: 'status',
            label: '状态',
            width: 100,
            align: 'center',
            type: 'tag',
            options: PARTY_CONTENT_STATUS_TAGS
          },
          { fieldName: 'createdAt', label: '创建时间', width: 170, align: 'center' }
        ]
      : [
          { fieldName: 'text', label: '题目内容', minWidth: 220, align: 'left' },
          { fieldName: 'levelLabel', label: '分级', width: 90, align: 'center' },
          { fieldName: 'themesText', label: '主题标签', minWidth: 160, align: 'left' },
          {
            fieldName: 'status',
            label: '状态',
            width: 100,
            align: 'center',
            type: 'tag',
            options: PARTY_CONTENT_STATUS_TAGS
          },
          { fieldName: 'createdAt', label: '创建时间', width: 170, align: 'center' }
        ]
  ),
  showIndex: true,
  pageTableOperate: [
    {
      label: '编辑',
      tip: '编辑内容',
      action: row => openEdit(row as PartyQuestion | PartyWord)
    },
    {
      label: '删除',
      tip: '删除记录',
      action: row => removeRow(row as PartyQuestion & PartyWord)
    }
  ],
  tableTools: [{ label: '查询', tip: '查询', icon: Search, action: query }],
  tableOperateWidth: 140
})

const formVisible = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  id: '',
  text: '',
  word: '',
  level: '' as PartyLevel | '',
  theme: '',
  themes: [] as string[],
  status: 'online' as PartyContentStatus | ''
})
const formTitle = computed(() => (form.id ? '编辑' : '新增') + (isWordbank.value ? '词条' : '题目'))
const formRules = computed<FormRules>(() =>
  isWordbank.value ? { word: [{ required: true, message: '词条不能为空', trigger: 'blur' }] } : { text: [{ required: true, message: '题目内容不能为空', trigger: 'blur' }] }
)

function levelLabel(level: string) {
  const hit = PARTY_LEVEL_OPTIONS.find(op => op.value === level)
  return hit ? hit.label : level
}

function onTabChange() {
  searchInfo.keyword = ''
  searchInfo.level = ''
  searchInfo.status = ''
  query()
}

async function load() {
  loading.value = true
  try {
    const page = { page: pageInfo.curPage, pageSize: pageInfo.pageSize }
    if (isWordbank.value) {
      const params: PartyWordQuery = { ...page }
      if (searchInfo.keyword) params.keyword = searchInfo.keyword
      if (searchInfo.level) params.level = searchInfo.level
      if (searchInfo.status) params.status = searchInfo.status
      const data = await getWordbank(params)
      tableData.value = (data.items || []).map(it => ({ ...it, levelLabel: levelLabel(it.level) }))
      pageInfo.total = data.total || 0
      tableOptions.tableName = '你画我猜词库'
    } else {
      const params: PartyQuestionQuery = {
        kind: curTab.value === 'dare' ? 'dare' : 'truth',
        ...page
      }
      if (searchInfo.keyword) params.keyword = searchInfo.keyword
      if (searchInfo.level) params.level = searchInfo.level
      if (searchInfo.status) params.status = searchInfo.status
      const data = await getQuestions(params)
      tableData.value = (data.items || []).map(it => ({
        ...it,
        levelLabel: levelLabel(it.level),
        themesText: (it.themes || []).join(' / ')
      }))
      pageInfo.total = data.total || 0
      tableOptions.tableName = curTab.value === 'dare' ? '大冒险题目' : '真心话题目'
    }
  } catch (err) {
    showTips('error', (err as Error).message || '数据请求失败')
  } finally {
    loading.value = false
  }
}

function query() {
  pageInfo.curPage = 1
  load()
}

function reset() {
  searchInfo.keyword = ''
  searchInfo.level = ''
  searchInfo.status = ''
  query()
}

function fillForm(row?: PartyQuestion | PartyWord) {
  form.id = row ? row.id : ''
  form.text = row && !isWordbank.value ? (row as PartyQuestion).text : ''
  form.word = row && isWordbank.value ? (row as PartyWord).word : ''
  form.level = row ? row.level : levelOptions[0].value
  form.theme = row && isWordbank.value ? (row as PartyWord).theme : ''
  form.themes = row && !isWordbank.value ? [...((row as PartyQuestion).themes || [])] : []
  form.status = row ? row.status : 'online'
}

function openCreate() {
  fillForm()
  formVisible.value = true
}

function openEdit(row: PartyQuestion | PartyWord) {
  fillForm(row)
  formVisible.value = true
}

async function submitForm() {
  await formRef.value?.validate()
  saving.value = true
  try {
    if (isWordbank.value) {
      const payload: PartyWordCreateParams = {
        word: form.word,
        level: form.level || 'gentle',
        theme: form.theme,
        status: form.status || 'online'
      }
      if (form.id) await updateWordbank(form.id, payload)
      else await createWordbank(payload)
    } else {
      const payload: PartyQuestionCreateParams = {
        kind: curTab.value === 'dare' ? 'dare' : 'truth',
        text: form.text,
        level: form.level || 'gentle',
        themes: form.themes,
        status: form.status || 'online'
      }
      if (form.id) await updateQuestion(form.id, payload)
      else await createQuestions(payload)
    }
    showTips('success', '保存成功')
    formVisible.value = false
    load()
  } catch (err) {
    showTips('error', (err as Error).message || '保存失败')
  } finally {
    saving.value = false
  }
}

function removeRow(row: PartyQuestion & PartyWord) {
  ElMessageBox.confirm('删除后玩家端即刻不可抽到该内容，且不可恢复，确认删除？', '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const doDelete = isWordbank.value ? deleteWordbank(row.id) : deleteQuestion(row.id)
      doDelete
        .then(() => {
          showTips('success', '删除成功')
          if (tableData.value.length === 1 && pageInfo.curPage > 1) {
            pageInfo.curPage -= 1
          }
          load()
        })
        .catch(err => showTips('error', (err as Error).message || '删除失败'))
    })
    .catch(() => ElMessage.info('已取消删除'))
}

async function loadThemeKeys() {
  try {
    const res = await getThemes({ scene: 'question' })
    themeKeys.value = (res.items || []).map(t => t.tagKey).filter(key => !!key)
  } catch {
    themeKeys.value = []
  }
}

onMounted(() => {
  loadThemeKeys()
  load()
})
</script>

<style scoped lang="less">
.party-tabs {
  margin-bottom: 8px;
}
</style>
