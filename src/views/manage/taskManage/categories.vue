<template>
  <div class="manage-page">
    <!-- 星夜页头（PageHero 通用组件） -->
    <page-hero title="分类管理" desc="维护任务分类，供任务创建与大厅筛选使用">
      <template #side>
        <span class="page-hero__pill">
          共 {{ store.adminCategories.length }} 个分类
        </span>
        <el-button
          v-permission="'system:task:operate'"
          class="page-hero__btn"
          @click="openCreate"
          >新增分类</el-button
        >
        <el-button class="page-hero__btn" @click="load">刷新</el-button>
      </template>
    </page-hero>

    <!-- 分类列表 -->
    <div class="base-table">
      <el-table
        :data="store.adminCategories"
        v-loading="loading"
        border
        stripe
        size="small"
        empty-text="暂无分类"
      >
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="code" label="编码" min-width="120" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
              v-permission="'system:task:operate'"
              link
              type="primary"
              @click="openEdit(row)"
              >编辑</el-button
            >
            <el-button
              v-permission="'system:task:operate'"
              link
              type="danger"
              @click="onDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑分类' : '新增分类'"
      width="420px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" maxlength="32" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" maxlength="32" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number
            v-model="form.sort"
            :min="0"
            controls-position="right"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { taskStore } from '@/stores/task'
import type { TaskCategory } from '@/types/task'

const PageHero = defineAsyncComponent(
  () => import('@/components/base/PageHero/index.vue')
)

const store = taskStore()
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()

const form = reactive({
  name: '',
  code: '',
  sort: 0
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }]
}

async function load() {
  loading.value = true
  try {
    await store.loadAdminCategories()
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.name = ''
  form.code = ''
  form.sort = 0
  dialogVisible.value = true
}

function openEdit(row: TaskCategory) {
  editingId.value = row.id
  form.name = row.name
  form.code = row.code
  form.sort = row.sort ?? 0
  dialogVisible.value = true
}

async function submit() {
  if (submitting.value) return
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      sort: form.sort
    }
    if (editingId.value) {
      await store.updateCategory(editingId.value, payload)
      ElMessage.success('更新成功')
    } else {
      await store.createCategory(payload)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await load()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

async function onDelete(row: TaskCategory) {
  try {
    await ElMessageBox.confirm(`确认删除分类「${row.name}」？`, '提示', {
      type: 'warning'
    })
    await store.deleteCategory(row.id)
    ElMessage.success('已删除')
    await load()
  } catch (e: any) {
    if (e === 'cancel' || e === 'close') return
    ElMessage.error(e?.message || '删除失败')
  }
}

onMounted(load)
</script>

<style scoped lang="less">
/* 页面骨架与表格白卡样式统一由 .manage-page 全局类（g.less）接管；
   星夜页头样式统一由 PageHero 通用组件携带，本文件仅保留页面局部定制 */
</style>
