<template>
  <div class="manage-page">
    <page-hero
      title="对局查询"
      desc="派对房间按口令 / 游戏 / 状态检索（readonly 运营回溯，数据留存 180 天）"
    >
      <template #side>
        <span class="page-hero__pill">共 {{ pageInfo.total }} 局</span>
      </template>
    </page-hero>

    <filter-bar :searching="loading" @search="query" @reset="reset">
      <el-input
        v-model="searchInfo.code"
        placeholder="房间口令"
        clearable
        maxlength="6"
        style="width: 160px"
        @keyup.enter="query"
        @clear="query"
      />
      <el-select
        v-model="searchInfo.gameType"
        clearable
        placeholder="游戏"
        style="width: 150px"
        @change="query"
      >
        <el-option v-for="op in PARTY_GAME_OPTIONS" :key="op.value" :label="op.label" :value="op.value" />
      </el-select>
      <el-select
        v-model="searchInfo.status"
        clearable
        placeholder="对局状态"
        style="width: 130px"
        @change="query"
      >
        <el-option
          v-for="op in PARTY_SESSION_STATUS_TAGS"
          :key="op.value"
          :label="op.label"
          :value="op.value"
        />
      </el-select>
    </filter-bar>

    <base-table :options="tableOptions" :page="pageInfo" />

    <!-- 对局详情弹窗 -->
    <el-dialog v-model="detailVisible" title="对局详情" width="880px" top="6vh" append-to-body>
      <div v-loading="detailLoading" class="session-detail">
        <template v-if="detail">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="房间口令">{{ detail.code }}</el-descriptions-item>
            <el-descriptions-item label="游戏">
              {{ detail.gameEmoji ? `${detail.gameEmoji} ` : '' }}{{ detail.gameName || detail.gameType }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">{{ statusLabel(detail.status) }}</el-descriptions-item>
            <el-descriptions-item label="难度">{{ levelLabel(detail.level) }}</el-descriptions-item>
            <el-descriptions-item label="回合进度">{{ detail.currentRound }} / {{ detail.rounds }}</el-descriptions-item>
            <el-descriptions-item label="默认惩罚">{{ detail.penaltyText || '—' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detail.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="开局 / 关闭">
              {{ detail.startedAt || '—' }} / {{ detail.closedAt || '—' }}
            </el-descriptions-item>
          </el-descriptions>

          <h4 class="session-detail__title">玩家列表（{{ detail.players.length }}）</h4>
          <el-table :data="detail.players" size="small" border>
            <el-table-column prop="name" label="昵称" min-width="120" show-overflow-tooltip />
            <el-table-column label="身份" width="80" align="center">
              <template #default="{ row }">{{ row.isHost ? '房主' : '成员' }}</template>
            </el-table-column>
            <el-table-column label="在线状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="row.online ? 'success' : 'info'">
                  {{ row.absent ? '已掉线' : row.online ? '在场' : '离席' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="joinedAt" label="入座时间" width="170" align="center">
              <template #default="{ row }">{{ row.joinedAt || '—' }}</template>
            </el-table-column>
          </el-table>

          <h4 class="session-detail__title">回合记录（{{ detail.roundRecords.length }}）</h4>
          <el-table :data="detail.roundRecords" size="small" border>
            <el-table-column prop="roundNo" label="回合" width="70" align="center" />
            <el-table-column prop="createdAt" label="时间" width="170" align="center" />
            <el-table-column label="过程快照" min-width="320">
              <template #default="{ row }">
                <pre class="session-detail__json">{{ formatJson(row.data) }}</pre>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { showTips } from '@/utils/message/showTips.js'
import { getSessionDetail, getSessions } from '@/api/party'
import {
  PARTY_GAME_OPTIONS,
  PARTY_LEVEL_OPTIONS,
  PARTY_SESSION_STATUS_TAGS
} from '@/types/party'
import type {
  PartyGameType,
  PartyLevel,
  PartySessionDetail,
  PartySessionQuery,
  PartySessionRow,
  PartySessionStatus
} from '@/types/party'

const BaseTable = defineAsyncComponent(() => import('@/components/base/form/BaseTable.vue'))
const FilterBar = defineAsyncComponent(() => import('@/components/base/FilterBar/index.vue'))
const PageHero = defineAsyncComponent(() => import('@/components/base/PageHero/index.vue'))

const loading = ref(false)
const searchInfo = reactive({
  code: '',
  gameType: '' as PartyGameType | '',
  status: '' as PartySessionStatus | ''
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
  tableName: '对局列表',
  tableData,
  tableFields: [
    { fieldName: 'code', label: '口令', width: 90, align: 'center' },
    { fieldName: 'gameLabel', label: '游戏', minWidth: 150, align: 'left' },
    {
      fieldName: 'status',
      label: '状态',
      width: 90,
      align: 'center',
      type: 'tag',
      options: PARTY_SESSION_STATUS_TAGS
    },
    { fieldName: 'playersText', label: '人数', width: 90, align: 'center' },
    { fieldName: 'progressText', label: '回合进度', width: 100, align: 'center' },
    { fieldName: 'levelLabel', label: '难度', width: 80, align: 'center' },
    { fieldName: 'createdAt', label: '创建时间', width: 170, align: 'center' },
    { fieldName: 'closedAt', label: '关闭时间', width: 170, align: 'center' }
  ],
  showIndex: true,
  pageTableOperate: [
    {
      label: '详情',
      tip: '查看对局详情',
      action: row => openDetail(row as PartySessionRow)
    }
  ],
  tableOperateWidth: 90
})

function statusLabel(status: string) {
  const hit = PARTY_SESSION_STATUS_TAGS.find(op => op.value === status)
  return hit ? hit.label : status
}

function levelLabel(level: string) {
  const hit = PARTY_LEVEL_OPTIONS.find(op => op.value === level)
  return hit ? hit.label : level
}

function formatJson(data: unknown) {
  if (data === null || data === undefined) return '—'
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}

async function load() {
  loading.value = true
  try {
    const params: PartySessionQuery = { page: pageInfo.curPage, pageSize: pageInfo.pageSize }
    if (searchInfo.code) params.code = searchInfo.code.trim()
    if (searchInfo.gameType) params.gameType = searchInfo.gameType
    if (searchInfo.status) params.status = searchInfo.status
    const data = await getSessions(params)
    tableData.value = (data.items || []).map(it => ({
      ...it,
      gameLabel: it.gameName ? `${it.gameName}` : it.gameType,
      playersText: `${it.playersCount}/${it.playerLimit}`,
      progressText: `${it.currentRound}/${it.rounds}`,
      levelLabel: levelLabel(it.level)
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
  searchInfo.code = ''
  searchInfo.gameType = ''
  searchInfo.status = ''
  query()
}

const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<PartySessionDetail | null>(null)

async function openDetail(row: PartySessionRow) {
  detailVisible.value = true
  detailLoading.value = true
  detail.value = null
  try {
    detail.value = await getSessionDetail(row.id)
  } catch (err) {
    showTips('error', (err as Error).message || '详情请求失败')
  } finally {
    detailLoading.value = false
  }
}

onMounted(load)
</script>

<style scoped lang="less">
.session-detail {
  min-height: 180px;

  &__title {
    margin: 18px 0 10px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__json {
    max-height: 180px;
    margin: 0;
    padding: 6px;
    overflow: auto;
    font-size: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }
}
</style>
