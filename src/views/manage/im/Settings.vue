<template>
  <div class="g-list-vertical im-mg-settings">
    <el-tabs v-model="tab">
      <el-tab-pane label="系统配置" name="config">
        <el-form
          :model="config"
          label-width="180px"
          style="max-width: 640px"
          v-loading="configLoading"
        >
          <el-form-item
            v-for="key in configKeys"
            :key="key"
            :label="configLabels[key] || key"
          >
            <el-input v-model="config[key]" style="width: 240px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveConfig">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="敏感词" name="sensitive">
        <div class="im-mg-bar">
          <el-input
            v-model="newWord"
            placeholder="敏感词"
            style="width: 200px"
          />
          <el-select v-model="newAction" style="width: 140px">
            <el-option label="拦截 BLOCK" value="BLOCK" />
            <el-option label="审核 REVIEW" value="REVIEW" />
          </el-select>
          <el-button type="primary" @click="addWord">添加</el-button>
          <el-button @click="reload">重载</el-button>
        </div>
        <el-table :data="words" border size="small">
          <el-table-column prop="word" label="敏感词" />
          <el-table-column prop="action" label="动作" width="120" />
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{ row }">{{ fmtTime(row.createdAt) }}</template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="分类" name="category">
        <div class="im-mg-bar">
          <el-input
            v-model="catForm.code"
            placeholder="编码"
            style="width: 160px"
          />
          <el-input
            v-model="catForm.name"
            placeholder="名称"
            style="width: 160px"
          />
          <el-input
            v-model.number="catForm.sort"
            placeholder="排序"
            style="width: 100px"
          />
          <el-button type="primary" @click="addCategory">添加</el-button>
        </div>
        <el-table :data="categories" border size="small">
          <el-table-column prop="code" label="编码" width="160" />
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="sort" label="排序" width="100" />
          <el-table-column prop="status" label="状态" width="100" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminApi } from '@/api/im'

const tab = ref('config')

const config = ref<Record<string, string>>({})
const configKeys = [
  'freqPerSec',
  'freqPerMin',
  'createRoomPerDay',
  'roomHistoryRetainDays',
  'groupHistoryRetainDays',
  'strangerPerDayUsers',
  'strangerPerDayMsgs'
]
const configLabels: Record<string, string> = {
  freqPerSec: '每秒频率上限',
  freqPerMin: '每分钟频率上限',
  createRoomPerDay: '每日建房上限',
  roomHistoryRetainDays: '房间历史保留天数',
  groupHistoryRetainDays: '群组历史保留天数',
  strangerPerDayUsers: '陌生人每日人数',
  strangerPerDayMsgs: '陌生人每日消息数'
}
const configLoading = ref(false)

const newWord = ref('')
const newAction = ref('BLOCK')
const words = ref<any[]>([])
const catForm = ref({ code: '', name: '', sort: 0 })
const categories = ref<any[]>([])

async function loadConfig() {
  configLoading.value = true
  try {
    const res = await adminApi.getSettings()
    if (res.status && res.data) config.value = { ...res.data }
  } finally {
    configLoading.value = false
  }
}
async function saveConfig() {
  const res = await adminApi.updateSettings(config.value)
  if (res.status) ElMessage.success('已保存')
}

async function loadWords() {
  const res = await adminApi.listSensitiveWords()
  if (res.status && res.data) words.value = res.data as any[]
}
async function addWord() {
  if (!newWord.value.trim()) return
  const res = await adminApi.addSensitiveWord(
    newWord.value.trim(),
    newAction.value
  )
  if (res.status) {
    ElMessage.success('已添加')
    newWord.value = ''
    loadWords()
  }
}
async function reload() {
  await adminApi.reloadSensitiveWords()
  ElMessage.success('已重载')
}

async function loadCategories() {
  const res = await adminApi.listCategories()
  if (res.status && res.data) categories.value = res.data as any[]
}
async function addCategory() {
  if (!catForm.value.code || !catForm.value.name) return
  const res = await adminApi.createCategory(
    catForm.value.code,
    catForm.value.name,
    catForm.value.sort
  )
  if (res.status) {
    ElMessage.success('已添加')
    catForm.value = { code: '', name: '', sort: 0 }
    loadCategories()
  }
}

function fmtTime(t: string): string {
  const n = Number(t)
  if (!n) return ''
  return new Date(n > 1e12 ? n : n).toLocaleString()
}

onMounted(() => {
  loadConfig()
  loadWords()
  loadCategories()
})
</script>

<style scoped lang="less">
.im-mg-settings {
  padding: 12px 16px;
  background: @color-bg;
}
.im-mg-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
</style>
