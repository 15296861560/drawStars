<template>
  <div class="manage-page">
    <!-- 星夜页头（PageHero 通用组件） -->
    <page-hero title="流程分类" desc="管理流程分类、排序与启用状态">
      <template #side>
        <span class="page-hero__pill">
          <el-icon :size="14"><Collection /></el-icon>
          共 {{ page.total }} 个分类
        </span>
        <el-button
          v-permission="'system:workflow:operate'"
          class="page-hero__btn"
          @click="openCreate"
          >新建分类</el-button
        >
        <el-button class="page-hero__btn" @click="load">刷新</el-button>
      </template>
    </page-hero>
    <!-- 筛选栏 -->
    <filter-bar @search="search" @reset="resetQuery">
      <el-input
        v-model="keyword"
        clearable
        placeholder="名称 / 编码"
        style="width: 200px"
        @keyup.enter="search"
      />
    </filter-bar>

    <!-- 分类列表 -->
    <div class="base-table">
      <el-table
        :data="pagedList"
        v-loading="loading"
        border
        stripe
        size="small"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column
          prop="name"
          label="分类名称"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="code"
          label="编码"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column
          prop="description"
          label="描述"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
              {{ row.enabled ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="sortOrder"
          label="排序"
          width="80"
          align="center"
        />
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column prop="updatedAt" label="更新时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              v-permission="'system:workflow:operate'"
              link
              type="primary"
              @click="openEdit(row)"
              >编辑</el-button
            >
            <el-button
              v-permission="'system:workflow:operate'"
              link
              type="danger"
              @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="pager base-table__pagination">
        <el-pagination
          v-model:current-page="page.curPage"
          v-model:page-size="page.pageSize"
          :total="page.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
        />
      </div>
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
import { computed, defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import type { CategoryPayload, WorkflowCategory } from '@/types/workflow'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory
} from '@/api/workflow'
import { showTips } from '@/utils/message/showTips.js'
import { dialogFields } from './config/categoriesSchema'
import { Collection } from '@element-plus/icons-vue'

const BaseDialog = defineAsyncComponent(
  () => import('@/components/base/form/BaseDialog.vue')
)

const FilterBar = defineAsyncComponent(
  () => import('@/components/base/FilterBar/index.vue')
)

const PageHero = defineAsyncComponent(
  () => import('@/components/base/PageHero/index.vue')
)

const loading = ref(false)
const list = ref<WorkflowCategory[]>([])
const keyword = ref('')
const dialogRef = ref()
const dialogTitle = ref('新建分类')

const page = reactive({
  curPage: 1,
  pageSize: 10,
  total: 0
})

// 接口返回全量数据，分页在前端切片
const pagedList = computed(() => {
  const start = (page.curPage - 1) * page.pageSize
  return list.value.slice(start, start + page.pageSize)
})

const confirmMethod = async (data: Record<string, any>) => {
  const payload = { ...data }
  let res
  if (payload.id) {
    const { id, ...rest } = payload
    res = await updateCategory(id, rest as Partial<CategoryPayload>)
  } else {
    delete payload.id
    res = await createCategory(payload as CategoryPayload)
  }
  if (res?.status === false) {
    return res
  }
  showTips('success', '保存成功')
  return { status: true, msg: 'ok', data: res?.data ?? res }
}

const initMethod = async (params: { id: number }) => {
  const row = list.value.find(r => r.id === params.id)
  if (!row) {
    return { status: false, msg: '未找到分类', data: null }
  }
  return { status: true, msg: 'ok', data: [row] }
}

const dialogOptions = reactive({
  fieldList: dialogFields,
  confirmMethod,
  confirmParams: {
    sortOrder: 0,
    enabled: true
  },
  initMethod,
  initParams: {} as { id?: number },
  disabled: false,
  labelPosition: 'left'
})

async function load() {
  loading.value = true
  try {
    const res = await getCategories({
      keyword: keyword.value || undefined
    })
    list.value = res.list || []
    page.total = list.value.length
  } catch (e: any) {
    showTips('error', e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function search() {
  page.curPage = 1
  load()
}

function resetQuery() {
  keyword.value = ''
  search()
}

function openCreate() {
  dialogTitle.value = '新建分类'
  dialogOptions.disabled = false
  dialogOptions.initParams = {}
  dialogRef.value?.opentDialog()
}

function openEdit(row: WorkflowCategory) {
  dialogTitle.value = '编辑分类'
  dialogOptions.disabled = false
  dialogOptions.initParams = { id: row.id }
  dialogRef.value?.opentDialog()
}

async function handleDelete(row: WorkflowCategory) {
  try {
    await ElMessageBox.confirm(`确认删除分类「${row.name}」？`, '提示', {
      type: 'warning'
    })
  } catch {
    return
  }
  const res = await deleteCategory(row.id)
  if (res?.status === false) {
    showTips('error', res.msg || '删除失败')
    return
  }
  showTips('success', '删除成功')
  await load()
  if (!pagedList.value.length && page.curPage > 1) {
    page.curPage -= 1
  }
}

onMounted(load)
</script>

<style scoped lang="less">
/* 页面骨架与表格白卡样式统一由 .manage-page 全局类（g.less）接管；
   星夜页头样式统一由 PageHero 通用组件携带，本文件仅保留页面局部定制 */

.pager {
  display: flex;
  justify-content: flex-end;
}
</style>
