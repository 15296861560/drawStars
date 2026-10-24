<template>
  <div class="manage-page">
    <!-- 星夜页头（PageHero 通用组件） -->
    <page-hero
      title="网站配置"
      desc="配置埋点站点，Website UUID 对应前端 umami-config"
    >
      <template #side>
        <span class="page-hero__pill">
          <el-icon :size="14"><Monitor /></el-icon>
          共 {{ list.length }} 个站点
        </span>
        <el-button
          type="primary"
          class="page-hero__btn"
          :icon="Plus"
          @click="openCreate"
          >新建网站</el-button
        >
      </template>
    </page-hero>

    <BaseTable :options="tableOptions" />

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑网站' : '新建网站'"
      width="480px"
    >
      <el-form label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="站点名称" />
        </el-form-item>
        <el-form-item label="域名">
          <el-input
            v-model="form.domain"
            placeholder="如 localhost / example.com"
          />
        </el-form-item>
        <el-form-item v-if="!editingId" label="Website UUID">
          <el-input
            v-model="form.websiteUuid"
            placeholder="留空自动生成；可填 umami-config 中的 ID"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { showTips } from '@/utils/message/showTips.js'
import analyticsApi from '@/assets/js/api/analyticsController/analyticsApi.js'
import { Monitor, Plus } from '@element-plus/icons-vue'

const BaseTable = defineAsyncComponent(
  () => import('@/components/base/form/BaseTable.vue')
)
const PageHero = defineAsyncComponent(
  () => import('@/components/base/PageHero/index.vue')
)

const router = useRouter()
const list = ref([])
const dialogVisible = ref(false)
const editingId = ref(null)
const form = reactive({
  name: '',
  domain: '',
  websiteUuid: ''
})

// 表格配置（BaseTable 配置驱动：弹性列宽 + 语义色操作按钮；无分页不传 page）
// 「清空统计」命中语义词表「清空」→ danger，与删除同色；「仪表盘」为导航浏览类 → info
const tableOptions = reactive({
  tableData: list,
  tableName: '网站配置',
  tableFields: [
    { fieldName: 'websiteId', label: 'ID', width: 80 },
    { fieldName: 'name', label: '名称', width: 140 },
    { fieldName: 'domain', label: '域名', width: 160 },
    { fieldName: 'websiteUuid', label: 'Website UUID', width: 280 }
  ],
  showIndex: false,
  showSelection: false,
  pageTableOperate: [
    { label: '仪表盘', type: 'info', action: row => goDashboard(row) },
    { label: '编辑', type: 'primary', action: row => openEdit(row) },
    { label: '清空统计', type: 'danger', action: row => handleReset(row) },
    { label: '删除', type: 'danger', action: row => handleDelete(row) }
  ]
})

function goDashboard(row) {
  router.push({
    path: '/home/logs/traffic',
    query: { websiteId: String(row.websiteId) }
  })
}

async function load() {
  const res = await analyticsApi.listWebsites()
  if (res.status) {
    list.value = res.data || []
  } else {
    showTips('error', res.msg)
  }
}

function openCreate() {
  editingId.value = null
  form.name = ''
  form.domain = ''
  form.websiteUuid = ''
  dialogVisible.value = true
}

function openEdit(row) {
  editingId.value = row.websiteId
  form.name = row.name
  form.domain = row.domain || ''
  form.websiteUuid = row.websiteUuid
  dialogVisible.value = true
}

async function submit() {
  if (!form.name.trim()) {
    showTips('warning', '请输入名称')
    return
  }
  let res
  if (editingId.value) {
    res = await analyticsApi.updateWebsite(editingId.value, {
      name: form.name,
      domain: form.domain
    })
  } else {
    res = await analyticsApi.createWebsite({
      name: form.name,
      domain: form.domain,
      websiteUuid: form.websiteUuid || undefined
    })
  }
  if (res.status) {
    showTips('success', '保存成功')
    dialogVisible.value = false
    load()
  }
}

function handleReset(row) {
  ElMessageBox.confirm(`确定清空「${row.name}」的全部访问统计？`, '提示', {
    type: 'warning'
  })
    .then(async () => {
      const res = await analyticsApi.resetWebsite(row.websiteId)
      if (res.status) showTips('success', '已清空')
    })
    .catch(() => {})
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除网站「${row.name}」？`, '提示', {
    type: 'warning'
  })
    .then(async () => {
      const res = await analyticsApi.deleteWebsite(row.websiteId)
      if (res.status) {
        showTips('success', '已删除')
        load()
      }
    })
    .catch(() => {})
}

onMounted(load)
</script>
