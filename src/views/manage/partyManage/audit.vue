<template>
  <div class="manage-page">
    <page-hero
      title="内容举报"
      desc="题目 / 词库 / 提示词举报流转：复核中 pending → reviewing，结案须填写处理备注，可联动下架 / 删除被举报内容"
    >
      <template #side>
        <span class="page-hero__pill">共 {{ pageInfo.total }} 条</span>
      </template>
    </page-hero>

    <filter-bar :searching="loading" @search="query" @reset="reset">
      <el-select
        v-model="searchInfo.status"
        clearable
        placeholder="状态"
        style="width: 130px"
        @change="query"
      >
        <el-option
          v-for="op in PARTY_REPORT_STATUS_TAGS"
          :key="op.value"
          :label="op.label"
          :value="op.value"
        />
      </el-select>
      <el-select
        v-model="searchInfo.targetType"
        clearable
        placeholder="举报对象"
        style="width: 140px"
        @change="query"
      >
        <el-option
          v-for="op in PARTY_REPORT_TARGET_TAGS"
          :key="op.value"
          :label="op.label"
          :value="op.value"
        />
      </el-select>
    </filter-bar>

    <base-table :options="tableOptions" :page="pageInfo" />

    <!-- 结案弹窗 -->
    <el-dialog v-model="closeVisible" title="举报结案" width="480px" destroy-on-close append-to-body>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="被举报对象">
          <span>{{ targetLabel }} · #{{ form.targetId }}</span>
        </el-form-item>
        <el-form-item label="举报理由">
          <span>{{ form.reason }}</span>
        </el-form-item>
        <el-form-item label="处理备注" prop="handleNote">
          <el-input
            v-model="form.handleNote"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="处理说明（同步进举报详情记录）"
          />
        </el-form-item>
        <el-form-item label="处置动作">
          <el-radio-group v-model="form.targetAction">
            <el-radio-button value="">仅结案</el-radio-button>
            <el-radio-button value="offline">下架内容</el-radio-button>
            <el-radio-button value="delete">删除内容</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeVisible = false">取消</el-button>
        <el-button type="primary" :loading="closing" @click="submitClose">结案</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { showTips } from '@/utils/message/showTips.js'
import { getReports, handleReport } from '@/api/party'
import { PARTY_REPORT_STATUS_TAGS, PARTY_REPORT_TARGET_TAGS } from '@/types/party'
import type {
  PartyReport,
  PartyReportQuery,
  PartyReportStatus,
  PartyReportTargetAction,
  PartyReportTargetType
} from '@/types/party'

const BaseTable = defineAsyncComponent(() => import('@/components/base/form/BaseTable.vue'))
const FilterBar = defineAsyncComponent(() => import('@/components/base/FilterBar/index.vue'))
const PageHero = defineAsyncComponent(() => import('@/components/base/PageHero/index.vue'))

const loading = ref(false)
const searchInfo = reactive({
  status: '' as PartyReportStatus | '',
  targetType: '' as PartyReportTargetType | ''
})

const pageInfo = reactive({
  curPage: 1,
  pageSize: 10,
  total: 0,
  curPageChange: load,
  sizeChange: () => {
    pageInfo.curPage = 1
    load()
  }
})

const tableData = ref<Record<string, unknown>[]>([])
const tableOptions = reactive({
  tableName: '举报列表',
  tableData,
  tableFields: [
    {
      fieldName: 'targetType',
      label: '举报对象',
      width: 110,
      align: 'center',
      type: 'tag',
      options: PARTY_REPORT_TARGET_TAGS
    },
    { fieldName: 'targetId', label: '对象ID', width: 100, align: 'center' },
    { fieldName: 'reason', label: '举报理由', minWidth: 150, align: 'left' },
    { fieldName: 'description', label: '补充说明', minWidth: 160, align: 'left' },
    {
      fieldName: 'status',
      label: '状态',
      width: 90,
      align: 'center',
      type: 'tag',
      options: PARTY_REPORT_STATUS_TAGS
    },
    { fieldName: 'handleNote', label: '处理备注', minWidth: 140, align: 'left' },
    { fieldName: 'createdAt', label: '举报时间', width: 170, align: 'center' }
  ],
  showIndex: true,
  pageTableOperate: [
    {
      label: '复核',
      tip: '开始复核（pending → reviewing）',
      show: (op, row) => (row as PartyReport).status === 'pending',
      action: row => reviewReport(row as PartyReport)
    },
    {
      label: '结案',
      tip: '处理完成后结案',
      show: (op, row) => {
        const st = (row as PartyReport).status
        return st === 'pending' || st === 'reviewing'
      },
      action: row => openClose(row as PartyReport)
    }
  ],
  tableOperateWidth: 130
})

async function load() {
  loading.value = true
  try {
    const params: PartyReportQuery = { page: pageInfo.curPage, pageSize: pageInfo.pageSize }
    if (searchInfo.status) params.status = searchInfo.status
    if (searchInfo.targetType) params.targetType = searchInfo.targetType
    const data = await getReports(params)
    tableData.value = (data.items || []).map(it => ({
      ...it,
      handleNote: it.handleNote || '',
      description: it.description || ''
    }))
    pageInfo.total = data.total || 0
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
  searchInfo.status = ''
  searchInfo.targetType = ''
  query()
}

/** 末页全被结案 / 处理后回退一页，避免停留在空页 */
function fallbackPageAfterShrink() {
  const maxPage = Math.max(1, Math.ceil(pageInfo.total / pageInfo.pageSize))
  if (pageInfo.curPage > maxPage) pageInfo.curPage = maxPage
}

async function reviewReport(row: PartyReport) {
  try {
    await ElMessageBox.confirm(
      `确认开始复核该举报（对象 #${row.targetId} · ${row.reason}）？状态将置为「复核中」。`,
      '开始复核',
      { confirmButtonText: '开始复核', cancelButtonText: '取消', type: 'info' }
    )
  } catch {
    return
  }
  try {
    await handleReport(row.id, { action: 'review' })
    showTips('success', '已进入复核中')
    load()
  } catch (err) {
    showTips('error', (err as Error).message || '操作失败')
  }
}

const closeVisible = ref(false)
const closing = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  id: '',
  targetId: '',
  reason: '',
  targetType: '' as PartyReportTargetType | '',
  handleNote: '',
  targetAction: '' as PartyReportTargetAction | ''
})
const formRules: FormRules = {
  handleNote: [{ required: true, message: '请填写处理备注', trigger: 'blur' }]
}

const targetLabel = computed(() => {
  const hit = PARTY_REPORT_TARGET_TAGS.find(op => op.value === form.targetType)
  return hit ? hit.label : form.targetType
})

function openClose(row: PartyReport) {
  form.id = row.id
  form.targetId = row.targetId
  form.reason = row.reason
  form.targetType = row.targetType
  form.handleNote = ''
  form.targetAction = ''
  closeVisible.value = true
}

async function submitClose() {
  await formRef.value?.validate()
  closing.value = true
  try {
    const params: { action: 'close'; handleNote?: string; targetAction?: PartyReportTargetAction } = {
      action: 'close',
      handleNote: form.handleNote
    }
    if (form.targetAction) params.targetAction = form.targetAction
    await handleReport(form.id, params)
    showTips('success', '已结案')
    closeVisible.value = false
    pageInfo.total -= 1
    fallbackPageAfterShrink()
    load()
  } catch (err) {
    showTips('error', (err as Error).message || '结案失败')
  } finally {
    closing.value = false
  }
}

onMounted(load)
</script>
