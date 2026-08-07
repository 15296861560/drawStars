<template>
  <div class="analytics-page g-list-vertical">
    <el-row class="mb20" :gutter="16" align="middle">
      <el-col :span="12">
        <h3 class="page-title">网站配置</h3>
        <p class="page-desc">配置埋点站点，Website UUID 对应前端 umami-config</p>
      </el-col>
      <el-col :span="12" class="text-right">
        <el-button type="primary" @click="openCreate">新建网站</el-button>
      </el-col>
    </el-row>

    <el-table :data="list" stripe border>
      <el-table-column prop="websiteId" label="ID" width="80" />
      <el-table-column prop="name" label="名称" min-width="140" />
      <el-table-column prop="domain" label="域名" min-width="160" />
      <el-table-column prop="websiteUuid" label="Website UUID" min-width="280" />
      <el-table-column label="操作" width="320" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goDashboard(row)">仪表盘</el-button>
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="warning" @click="handleReset(row)"
            >清空统计</el-button
          >
          <el-button link type="danger" @click="handleDelete(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

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
          <el-input v-model="form.domain" placeholder="如 localhost / example.com" />
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { showTips } from '@/utils/message/showTips.js'
import analyticsApi from '@/assets/js/api/analyticsController/analyticsApi.js'

const router = useRouter()
const list = ref([])
const dialogVisible = ref(false)
const editingId = ref(null)
const form = reactive({
  name: '',
  domain: '',
  websiteUuid: ''
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

<style scoped lang="less">
.page-title {
  margin: 0;
  font-size: 18px;
}
.page-desc {
  margin: 6px 0 0;
  color: #909399;
  font-size: 13px;
}
.text-right {
  text-align: right;
}
</style>
