<template>
  <div class="task-hall">
    <div class="page-toolbar">
      <div class="page-title">
        <h3>任务大厅</h3>
        <p>浏览、接取与完成任务，赢取奖励</p>
      </div>
      <div class="page-actions">
        <el-badge :value="store.unreadCount" :hidden="!store.unreadCount">
          <el-button @click="notifyVisible = true">通知</el-button>
        </el-badge>
        <el-button @click="goMy">我的任务</el-button>
        <el-button @click="goAchievements">成就墙</el-button>
        <el-button @click="reload">刷新</el-button>
      </div>
    </div>

    <el-row :gutter="12" class="stats-strip" v-loading="store.loading">
      <el-col :xs="12" :sm="6">
        <div class="stat-item">
          <div class="stat-label">任务总数</div>
          <div class="stat-value">{{ store.hallStatistics.totalTasks }}</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-item">
          <div class="stat-label">今日完成</div>
          <div class="stat-value">
            {{ store.hallStatistics.completedToday }}
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-item">
          <div class="stat-label">可接取</div>
          <div class="stat-value">
            {{ store.hallStatistics.availableTasks }}
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-item">
          <div class="stat-label">今日奖励</div>
          <div class="stat-value">
            {{ store.hallStatistics.totalRewardToday.points }}
            <span class="unit">积分</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card shadow="never" class="panel-card">
      <el-tabs v-model="categoryTab" @tab-change="onCategoryChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane
          v-for="c in store.categories"
          :key="c.id"
          :label="c.name"
          :name="String(c.id)"
        />
      </el-tabs>

      <div class="filter-bar">
        <el-select
          v-model="statusFilter"
          clearable
          placeholder="进度状态"
          style="width: 140px"
          @change="onFilterChange"
        >
          <el-option label="可接取" value="NONE" />
          <el-option label="进行中" value="IN_PROGRESS" />
          <el-option label="待领奖" value="REWARD_PENDING" />
          <el-option label="已完成" value="REWARD_CLAIMED" />
        </el-select>
        <el-input
          v-model="keyword"
          clearable
          placeholder="搜索任务标题"
          style="width: 220px"
          @input="onKeywordInput"
        />
        <el-select
          v-model="sort"
          placeholder="排序"
          style="width: 140px"
          @change="onFilterChange"
        >
          <el-option label="默认" value="" />
          <el-option label="难度" value="difficulty" />
          <el-option label="优先级" value="priority" />
          <el-option label="最新" value="newest" />
        </el-select>
      </div>

      <div v-loading="store.loading" class="card-grid">
        <TaskCard
          v-for="task in displayTasks"
          :key="task.id"
          :task="task"
          @accept="onAccept"
          @continue="onContinue"
          @claim="onClaim"
          @detail="openDetail"
        />
        <el-empty
          v-if="!store.loading && !displayTasks.length"
          description="暂无任务"
        />
      </div>

      <div class="pager">
        <el-pagination
          v-model:current-page="store.pagination.page"
          v-model:page-size="store.pagination.pageSize"
          :total="store.pagination.total"
          :page-sizes="[10, 20, 40]"
          layout="total, sizes, prev, pager, next"
          background
          @current-change="reload"
          @size-change="onSizeChange"
        />
      </div>
    </el-card>

    <TaskDetail
      v-model="detailVisible"
      :task-id="detailId"
      @refreshed="reload"
    />

    <TaskNotificationPanel v-model="notifyVisible" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash'
import { taskStore } from '@/stores/task'
import type { Task } from '@/types/task'
import TaskCard from '@/components/task/TaskCard.vue'
import TaskDetail from '@/components/task/TaskDetail.vue'
import TaskNotificationPanel from '@/components/task/TaskNotificationPanel.vue'

const router = useRouter()
const store = taskStore()

const categoryTab = ref('all')
const statusFilter = ref('')
const keyword = ref('')
const sort = ref('')
const detailVisible = ref(false)
const detailId = ref<number | null>(null)
const notifyVisible = ref(false)

const displayTasks = computed(() => {
  const st = statusFilter.value
  if (!st) return store.tasks
  return store.tasks.filter(t => (t.userProgress?.status || 'NONE') === st)
})
const actionLock = ref(false)
let reqSeq = 0

async function reload() {
  const seq = ++reqSeq
  store.filters.categoryId =
    categoryTab.value === 'all' ? null : Number(categoryTab.value)
  store.filters.status = ''
  store.filters.keyword = keyword.value.trim()
  store.filters.sort = sort.value || ''
  try {
    await store.loadHallTasks()
  } catch (e: any) {
    if (seq === reqSeq) {
      ElMessage.error(e?.message || '加载失败')
    }
  }
}

const debouncedSearch = debounce(() => {
  store.pagination.page = 1
  reload()
}, 300)

function onKeywordInput() {
  debouncedSearch()
}

function onFilterChange() {
  store.pagination.page = 1
  reload()
}

function onCategoryChange() {
  store.pagination.page = 1
  reload()
}

function onSizeChange() {
  store.pagination.page = 1
  reload()
}

function openDetail(task: Task) {
  detailId.value = task.id
  detailVisible.value = true
}

function onContinue(task: Task) {
  openDetail(task)
}

async function onAccept(task: Task) {
  if (actionLock.value) return
  actionLock.value = true
  try {
    await store.acceptTask(task.id)
    ElMessage.success('接取成功')
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '接取失败')
  } finally {
    actionLock.value = false
  }
}

async function onClaim(task: Task) {
  if (actionLock.value) return
  actionLock.value = true
  try {
    const res = await store.claimReward(task.id)
    ElMessage.success(res?.message || '领取成功')
    await reload()
  } catch (e: any) {
    ElMessage.error(e?.message || '领取失败')
  } finally {
    actionLock.value = false
  }
}

function goMy() {
  const p = router.currentRoute.value.path
  if (p.includes('/personalCenter/')) {
    router.push('/home/personalCenter/myTasks')
  } else {
    router.push('/home/taskHall/my')
  }
}

function goAchievements() {
  const p = router.currentRoute.value.path
  if (p.includes('/personalCenter/')) {
    router.push('/home/personalCenter/taskAchievements')
  } else {
    router.push('/home/taskHall/achievements')
  }
}

onMounted(async () => {
  try {
    await store.loadCategories()
    await store.loadNotifications()
  } catch (_) {
    /* ignore */
  }
  await reload()
})

onUnmounted(() => {
  debouncedSearch.cancel()
})
</script>

<style scoped lang="less">
.task-hall {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  text-align: left;
  box-sizing: border-box;
}

.page-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

.page-actions {
  display: flex;
  gap: 8px;
}

.stats-strip {
  .stat-item {
    padding: 14px 16px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background: var(--el-bg-color);
    margin-bottom: 8px;
  }

  .stat-label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .stat-value {
    margin-top: 8px;
    font-size: 22px;
    font-weight: 600;

    .unit {
      margin-left: 4px;
      font-size: 12px;
      font-weight: 400;
      color: var(--el-text-color-secondary);
    }
  }
}

.panel-card {
  border-radius: 8px;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  min-height: 160px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
