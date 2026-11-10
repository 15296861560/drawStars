<template>
  <div class="manage-page">
    <page-hero
      title="主题标签管理"
      desc="题目主题与星愿主题的统一标签池，供题目池 / 词库 / 玩家自定义星愿挂靠"
    >
      <template #side>
        <span class="page-hero__pill">共 {{ fullList.length }} 个标签</span>
        <el-button
          v-permission="'party:theme:manage'"
          class="page-hero__btn"
          type="primary"
          :icon="Plus"
          @click="openCreate"
        >
          新增主题
        </el-button>
      </template>
    </page-hero>

    <filter-bar :searching="loading" @search="query" @reset="reset">
      <el-select
        v-model="searchInfo.scene"
        clearable
        placeholder="标签场景"
        style="width: 150px"
        @change="query"
      >
        <el-option v-for="op in PARTY_THEME_SCENE_TAGS" :key="op.value" :label="op.label" :value="op.value" />
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

    <base-table :options="tableOptions" :page="pageInfo" />

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="formVisible" :title="form.id ? '编辑主题' : '新增主题'" width="480px" destroy-on-close append-to-body>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="标签名" prop="name">
          <el-input v-model="form.name" maxlength="12" show-word-limit placeholder="如：星盘 / 情绪 / 青春" />
        </el-form-item>
        <el-form-item label="tagKey" prop="tagKey">
          <el-input
            v-model="form.tagKey"
            :disabled="!!form.id"
            placeholder="留空自动生成；创建后不可改"
          >
            <template v-if="form.id" #append>创建后不可修改</template>
          </el-input>
        </el-form-item>
        <el-form-item label="场景" prop="scene">
          <el-radio-group v-model="form.scene">
            <el-radio-button v-for="op in PARTY_THEME_SCENE_TAGS" :key="op.value" :value="op.value">
              {{ op.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="面板色">
          <el-color-picker v-model="form.color" show-alpha />
          <span class="theme-color-preview">{{ form.color || '未选择' }}</span>
        </el-form-item>
        <el-form-item label="Emoji">
          <el-input v-model="form.emoji" maxlength="4" style="width: 120px" placeholder="如：✨" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
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
import { defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { showTips } from '@/utils/message/showTips.js'
import { createTheme, deleteTheme, getThemes, updateTheme } from '@/api/party'
import { PARTY_CONTENT_STATUS_TAGS, PARTY_THEME_SCENE_TAGS } from '@/types/party'
import type { PartyTheme, PartyThemeQuery, PartyThemeScene, PartyThemeStatus } from '@/types/party'

const BaseTable = defineAsyncComponent(() => import('@/components/base/form/BaseTable.vue'))
const FilterBar = defineAsyncComponent(() => import('@/components/base/FilterBar/index.vue'))
const PageHero = defineAsyncComponent(() => import('@/components/base/PageHero/index.vue'))

const loading = ref(false)
const saving = ref(false)
const searchInfo = reactive({
  scene: '' as PartyThemeScene | '',
  status: '' as PartyThemeStatus | ''
})

// 主题列表后端全量返回：前端本地过滤 + 切片分页展示
const fullList = ref<PartyTheme[]>([])
const tableData = ref<PartyTheme[]>([])

const pageInfo = reactive({
  curPage: 1,
  pageSize: 10,
  total: 0,
  curPageChange: applyPage,
  sizeChange: () => {
    pageInfo.curPage = 1
    applyPage()
  }
})

function applyPage() {
  const start = (pageInfo.curPage - 1) * pageInfo.pageSize
  tableData.value = fullList.value.slice(start, start + pageInfo.pageSize)
}

const tableOptions = reactive({
  tableName: '主题标签',
  tableData,
  tableFields: [
    { fieldName: 'name', label: '标签名', minWidth: 140, align: 'left' },
    { fieldName: 'tagKey', label: 'tagKey', width: 150, align: 'left' },
    {
      fieldName: 'scene',
      label: '场景',
      width: 100,
      align: 'center',
      type: 'tag',
      options: PARTY_THEME_SCENE_TAGS
    },
    { fieldName: 'emoji', label: 'Emoji', width: 80, align: 'center' },
    { fieldName: 'colorLabel', label: '面板色', width: 100, align: 'left' },
    { fieldName: 'sort', label: '排序', width: 80, align: 'center' },
    {
      fieldName: 'status',
      label: '状态',
      width: 100,
      align: 'center',
      type: 'tag',
      options: PARTY_CONTENT_STATUS_TAGS
    },
    { fieldName: 'createdAt', label: '创建时间', width: 170, align: 'center' }
  ],
  showIndex: true,
  pageTableOperate: [
    {
      label: '编辑',
      tip: '编辑主题',
      action: (row: PartyTheme) => openEdit(row)
    },
    {
      label: '删除',
      tip: '删除主题',
      action: (row: PartyTheme) => removeRow(row)
    }
  ],
  tableTools: [{ label: '查询', tip: '查询', icon: Search, action: query }],
  tableOperateWidth: 140
})

const formVisible = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  id: '',
  tagKey: '',
  name: '',
  scene: 'question' as PartyThemeScene | '',
  color: '',
  emoji: '',
  sort: 0,
  status: 'online' as PartyThemeStatus | ''
})
const formRules: FormRules = {
  name: [{ required: true, message: '标签名不能为空', trigger: 'blur' }],
  scene: [{ required: true, message: '请选择场景', trigger: 'change' }]
}

function openCreate() {
  Object.assign(form, {
    id: '',
    tagKey: '',
    name: '',
    scene: 'question',
    color: '',
    emoji: '',
    sort: 0,
    status: 'online'
  })
  formVisible.value = true
}

function openEdit(row: PartyTheme) {
  Object.assign(form, {
    id: row.id,
    tagKey: row.tagKey,
    name: row.name,
    scene: row.scene,
    color: row.color,
    emoji: row.emoji,
    sort: row.sort,
    status: row.status
  })
  formVisible.value = true
}

async function submitForm() {
  await formRef.value?.validate()
  saving.value = true
  try {
    if (form.id) {
      await updateTheme(form.id, {
        name: form.name,
        scene: form.scene || 'question',
        color: form.color,
        emoji: form.emoji,
        sort: form.sort,
        status: form.status || 'online'
      })
    } else {
      await createTheme({
        tagKey: form.tagKey,
        name: form.name,
        scene: form.scene || 'question',
        color: form.color,
        emoji: form.emoji,
        sort: form.sort,
        status: form.status || 'online'
      })
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

function removeRow(row: PartyTheme) {
  ElMessageBox.confirm('该主题被题目池 / 星愿引用悬空不影响运行，确认删除该主题标签？', '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteTheme(row.id)
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

async function load() {
  loading.value = true
  try {
    const params: PartyThemeQuery = {}
    if (searchInfo.scene) params.scene = searchInfo.scene
    if (searchInfo.status) params.status = searchInfo.status
    const data = await getThemes(params)
    fullList.value = (data.items || []).filter(
      it =>
        (!searchInfo.scene || it.scene === searchInfo.scene) &&
        (!searchInfo.status || it.status === searchInfo.status)
    )
    .map(it => ({
      ...it,
      colorLabel: it.color || '-'
    }))
    pageInfo.total = fullList.value.length
    const maxPage = Math.max(1, Math.ceil(fullList.value.length / pageInfo.pageSize))
    if (pageInfo.curPage > maxPage) pageInfo.curPage = maxPage
    applyPage()
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
  searchInfo.scene = ''
  searchInfo.status = ''
  query()
}

onMounted(load)
</script>

<style scoped lang="less">
.theme-color-preview {
  margin-left: 10px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
