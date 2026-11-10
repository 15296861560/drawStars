<template>
  <div class="manage-page asmt-reply-page">
    <page-hero
      title="回复规则管理"
      desc="assessment_reply_rules：关键词 / 欢迎语两类回复；文案与渠道一致（网络效应），绑定目标页需可访问
（{link} 占位符自动替换为带渠道参数链接）"
    >
      <template #side>
        <span class="page-hero__pill">
          <el-icon :size="14"><ChatDotRound /></el-icon>
          已生效 {{ syncedEnabledCount }} / 启用 {{ enabledCount }}
        </span>
        <span v-if="pendingCount" class="page-hero__pill page-hero__pill--warn">
          未同步 {{ pendingCount }}
        </span>
        <el-button type="primary" class="page-hero__btn" :icon="Plus" :loading="loading" @click="openCreate">
          新建回复规则
        </el-button>
      </template>
    </page-hero>

    <!-- 筛选 -->
    <el-card shadow="never" class="mb16">
      <div class="filter-bar">
        <el-radio-group v-model="filterType" @change="applyFilter">
          <el-radio-button value="all">全部</el-radio-button>
          <el-radio-button value="keyword">关键词回复</el-radio-button>
          <el-radio-button value="welcome">欢迎语回复</el-radio-button>
        </el-radio-group>
        <el-input
          v-model="keyword"
          class="filter-kw"
          placeholder="按触发词 / 文案搜索"
          clearable
          @input="applyFilter"
          @clear="applyFilter"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <span class="filter-tip">
          「待同步」= 内容已变更尚未粘贴到公众号后台；pending 超 3 天自动高亮（4.5.4 看板口径）
        </span>
      </div>
    </el-card>

    <!-- 规则列表 -->
    <el-card shadow="never" :body-style="{ padding: 0 }">
      <el-table
        v-loading="loading"
        :data="filteredRows"
        empty-text="暂无回复规则；新建后需复制文案粘贴至公众号后台并通过验证"
      >
        <el-table-column label="类型" width="110">
          <template #default="{ row }">
            <el-tag size="small" :type="row.ruleType === 'welcome' ? 'success' : 'primary'">
              <el-icon><ChatLineSquare /></el-icon>
              {{ sourceLabel(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="触发词" min-width="180">
          <template #default="{ row }">
            <div v-if="row.ruleType === 'keyword'" class="kw-tags">
              <el-tag
                v-for="kw in kwListOf(row).slice(0, 5)"
                :key="kw"
                size="small"
                effect="plain"
                class="kw-tag"
              >
                {{ kw }}
              </el-tag>
              <span v-if="kwListOf(row).length > 5" class="kw-more">+{{ kwListOf(row).length - 5 }}</span>
              <span class="kw-count">{{ kwListOf(row).length }}/10</span>
            </div>
            <span v-else class="kw-welcome">新关注后自动下发</span>
          </template>
        </el-table-column>
        <el-table-column label="回复文案" min-width="260">
          <template #default="{ row }">
            <div class="reply-line break" v-html="hlLink(row.replyContent)"></div>
          </template>
        </el-table-column>
        <el-table-column label="绑定渠道" min-width="170">
          <template #default="{ row }">
            <div class="cc-bind">
              <code class="cc-ref">{{ row.refId || '—' }}</code>
              <span class="cc-chname">{{ findBoundChannel(row)?.name || '渠道缺失' }}</span>
            </div>
            <div
              class="bind-state"
              :class="bindState(row).level"
              :title="bindState(row).text"
            >
              {{ bindState(row).text }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="同步状态" width="110">
          <template #default="{ row }">
            <el-tooltip
              v-if="isPendingLong(row)"
              content="内容变更后超 3 天未同步公众号，建议尽快复制更新"
              placement="top"
            >
              <el-tag type="danger" effect="dark" size="small">待同步·超3天</el-tag>
            </el-tooltip>
            <el-tag v-else-if="row.syncStatus === 'pending'" type="warning" size="small">待同步</el-tag>
            <el-tag v-else type="success" size="small">已同步</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="启用" width="80" align="center">
          <template #default="{ row }">
            <el-switch :model-value="row.status === 1" @change="(v: any) => toggleStatus(row, v)" />
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="160">
          <template #default="{ row }">
            <span class="cc-sub break">{{ row.updatedAt || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="copyRule(row)">复制整段</el-button>
            <el-button
              link
              type="success"
              :disabled="row.syncStatus === 'synced'"
              @click="markSynced(row)"
            >
              标记已同步
            </el-button>
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-popconfirm
              :title="`删除「${row.refId}」规则后需在公众号后台同步摘除自动回复，确认删除？`"
              confirm-button-text="删除"
              cancel-button-text="取消"
              @confirm="removeRow(row)"
            >
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建 / 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑回复规则' : '新建回复规则'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-alert
        class="mb16"
        type="info"
        :closable="false"
        show-icon
        title="文案与渠道一致（网络效应）：{link} 与绑定渠道的 tgt / shareCode 信息强一致；保存与标记同步前会校验渠道可访问性"
      />
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="规则类型">
          <el-radio-group v-model="form.ruleType" :disabled="!!editingId" @change="onTypeChange">
            <el-radio-button value="keyword">关键词回复</el-radio-button>
            <el-radio-button value="welcome">欢迎语回复</el-radio-button>
          </el-radio-group>
          <div class="form-tip">
            {{ form.ruleType === 'keyword' ? '用户在对话中发送触发词命中' : '新关注用户自动下发欢迎语' }}
          </div>
        </el-form-item>
        <el-form-item v-if="form.ruleType === 'keyword'" label="触发词" prop="keywordsText">
          <el-input
            v-model.trim="form.keywordsText"
            placeholder="英文逗号分隔，如：测评,心理测评,人格测试"
            maxlength="120"
          />
          <div class="form-tip">触发词全局唯一、互不重叠；已用 {{ parsedKeywords.length }}/10 个</div>
        </el-form-item>
        <el-form-item label="绑定渠道" prop="refId">
          <el-select v-model="form.refId" placeholder="选择同来源渠道（refId）" style="width: 100%">
            <el-option
              v-for="opt in channelOptions"
              :key="opt.value"
              :value="opt.value"
              :label="opt.label"
              :disabled="opt.disabled"
            />
          </el-select>
          <div class="form-tip">
            渠道挂「测评直链」时须为上架中状态；绑定的目标页在保存与同步时均校验可访问性
          </div>
        </el-form-item>
        <el-form-item label="回复文案" prop="replyContent">
          <el-input
            v-model="form.replyContent"
            type="textarea"
            :rows="3"
            maxlength="120"
            show-word-limit
            placeholder="如：欢迎来到问星，用3分钟解锁你的本命心智原型，{link} 即刻开始～"
          />
          <div class="form-tip">
            <el-button link type="primary" size="small" @click="form.replyContent += '{link}'">
              + 插入 {link} 占位符（自动替换为渠道带参链接）
            </el-button>
          </div>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="1" :max="999" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用状态">
              <el-switch
                v-model="form.statusBool"
                inline-prompt
                active-text="启用"
                inactive-text="停用"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model.trim="form.remark" placeholder="运营备注，可空" maxlength="60" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ChatDotRound, ChatLineSquare, Plus, Search } from '@element-plus/icons-vue'
import {
  buildChannelLink,
  createReplyRule,
  deleteReplyRule,
  getOaConfig,
  listChannels,
  listInfos,
  listReplyRules,
  updateReplyRule
} from '@/api/assessment'
import type { AssessmentChannel, AssessmentInfo, AssessmentReplyRule, ReplyRuleType } from '@/types/assessment'

const PageHero = defineAsyncComponent(
  () => import('@/components/base/PageHero/index.vue')
)

// ===== 列表 =====
const loading = ref(false)
const saving = ref(false)
const rows = ref<AssessmentReplyRule[]>([])
const channels = ref<AssessmentChannel[]>([])
const infos = ref<AssessmentInfo[]>([])
const plazaPath = ref('/assessment/list')
const remoteKeyword = ref('')
const filterType = ref<'all' | 'keyword' | 'welcome'>('all')
const keyword = ref('')

async function load() {
  loading.value = true
  try {
    const [ruleRes, channelRes, infoRes] = await Promise.all([
      listReplyRules({ keyword: remoteKeyword.value || undefined }),
      listChannels(),
      listInfos()
    ])
    rows.value = ruleRes.list || []
    channels.value = channelRes.list || []
    infos.value = infoRes.list || []
  } catch (e: any) {
    ElMessage.error(e?.message || '回复规则加载失败')
  } finally {
    loading.value = false
  }
}

/** 关键词搜索走接口，类型筛选在前端（实时查询） */
async function applyFilter() {
  remoteKeyword.value = keyword.value.trim()
  await load()
}

const filteredRows = computed(() => {
  if (filterType.value === 'all') return rows.value
  return rows.value.filter(r => r.ruleType === filterType.value)
})

const enabledCount = computed(() => rows.value.filter(r => r.status === 1).length)
const syncedEnabledCount = computed(
  () => rows.value.filter(r => r.status === 1 && r.syncStatus === 'synced').length
)
const pendingCount = computed(() => rows.value.filter(r => r.syncStatus === 'pending').length)

function sourceLabel(row: AssessmentReplyRule) {
  return row.ruleType === 'welcome' ? '欢迎语' : '关键词'
}

/** 触发词数组（keywords 为逗号分隔 string，兼容中文逗号） */
function kwListOf(row: AssessmentReplyRule): string[] {
  return String(row.keywords || '')
    .split(/[,，]/)
    .map(s => s.trim())
    .filter(Boolean)
}

/** pending 超 3 天 → 高亮（4.5.4） */
function isPendingLong(row: AssessmentReplyRule) {
  if (row.syncStatus !== 'pending' || !row.updatedAt) return false
  const ts = new Date(String(row.updatedAt).replace(' ', 'T')).getTime()
  if (Number.isNaN(ts)) return false
  return Date.now() - ts > 3 * 24 * 3600 * 1000
}

// ===== 绑定渠道可访问性校验 =====
function findBoundChannel(rule: AssessmentReplyRule) {
  return channels.value.find(c => c.source === rule.source && (c.refId || '') === (rule.refId || ''))
}

function bindState(rule: AssessmentReplyRule): { level: 'ok' | 'warn' | 'error'; text: string } {
  const channel = findBoundChannel(rule)
  if (!channel && !rule.source && !rule.refId) {
    return { level: 'error', text: '未绑定渠道，{link} 无法带渠道参数（请编辑绑定）' }
  }
  if (!channel) {
    return { level: 'error', text: `渠道 ${rule.refId || '—'} 不存在，{link} 失配` }
  }
  if (channel.status !== 1) {
    return { level: 'warn', text: '渠道已停用（文案暂不可达）' }
  }
  if (channel.targetType === 'fill') {
    const info =
      infos.value.find(i => i.id === channel.infoId) ||
      infos.value.find(i => i.shareCode === channel.shareCode)
    if (!info || info.status !== 1) {
      return {
        level: 'error',
        text: `目标测评${!info ? '不存在' : '已下架/草稿'}，同步被阻断`
      }
    }
  }
  return { level: 'ok', text: '文案与渠道一致' }
}

/** 解析渠道真实链接（infoId → 实际 shareCode；渠道缺失兜底广场链接） */
function resolveLink(rule: AssessmentReplyRule) {
  const channel = findBoundChannel(rule)
  if (!channel) {
    // 未绑定渠道兜底：不带埋点参数的广场直链
    return `${location.origin}${plazaPath.value}`
  }
  const info =
    channel.targetType === 'fill'
      ? infos.value.find(i => i.id === channel.infoId) ||
        infos.value.find(i => i.shareCode === channel.shareCode)
      : undefined
  return buildChannelLink(
    {
      source: channel.source,
      refId: channel.refId || '',
      targetType: channel.targetType,
      surveyId: info?.surveyId ?? channel.surveyId,
      shareCode: info?.shareCode ?? channel.shareCode
    },
    plazaPath.value
  )
}

/** 文案中 {link} 高亮 */
function hlLink(text: string) {
  const esc = String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return esc.replace(/\{link\}/g, '<b class="link-slot">{link}</b>')
}

/** 一键复制整段（触发词 + 引导文案 + 替换后链接） */
async function copyRule(rule: AssessmentReplyRule) {
  const link = resolveLink(rule)
  const content = rule.replyContent.replace(/\{link\}/g, link)
  const lines: string[] = []
  if (rule.ruleType === 'keyword') {
    lines.push(`【触发词】${rule.keywords || '—'}`)
  } else {
    lines.push('【欢迎语规则】新关注后自动回复')
  }
  lines.push('【回复文案】', content)
  lines.push(`【绑定渠道】${rule.source} · ${rule.refId || '—'}`)
  const text = lines.join('\n')
  try {
    await navigator.clipboard.writeText(text)
    const st = bindState(rule)
    ElMessage.success(
      st.level === 'ok'
        ? '整段规则文案已复制（含替换后链接），粘贴到公众号后台生效'
        : `已复制，但渠道校验提示：${st.text}`
    )
  } catch (_e) {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    ElMessage.success('已复制到剪贴板')
  }
}

// ===== 启停 / 同步标记 =====
async function toggleStatus(row: AssessmentReplyRule, val: any) {
  try {
    await updateReplyRule(row.id, { status: val ? 1 : 0 })
    row.status = val ? 1 : 0
    ElMessage.success(val ? '规则已启用' : '规则已停用（公众号后台回复保留，不再命中）')
  } catch (e: any) {
    ElMessage.error(e?.message || '状态更新失败')
  }
}

async function markSynced(row: AssessmentReplyRule) {
  const st = bindState(row)
  if (st.level === 'error') {
    ElMessage.error(`同步校验未通过：${st.text}；请先修复绑定渠道或其挂载测评`)
    return
  }
  if (st.level === 'warn') {
    ElMessage.warning(`渠道当前已停用，已允许标记同步，但文案暂不可达：${st.text}`)
  }
  try {
    await updateReplyRule(row.id, { syncStatus: 'synced' })
    row.syncStatus = 'synced'
    ElMessage.success('已标记同步（请确认文案已粘贴至公众号后台并通过验证）')
  } catch (e: any) {
    ElMessage.error(e?.message || '标记同步失败')
  }
}

// ===== 新建 / 编辑 =====
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const form = reactive({
  ruleType: 'keyword' as ReplyRuleType,
  keywordsText: '',
  refId: '',
  replyContent: '',
  sort: 10,
  statusBool: true,
  remark: ''
})

const parsedKeywords = computed(() =>
  form.keywordsText
    .split(/[,，]/)
    .map(s => s.trim())
    .filter(Boolean)
)

/** 绑定渠道下拉：同来源渠道；目标测评非上架中的标记不可选（可访问性校验前置） */
const channelOptions = computed(() => {
  const opts: Array<{ value: string; label: string; disabled?: boolean }> = []
  for (const c of channels.value.filter(c => c.source === form.ruleType)) {
    const inValidStatus =
      c.targetType === 'fill' &&
      !infos.value.some(i => (i.id === c.infoId || i.shareCode === c.shareCode) && i.status === 1)
    const valid = c.status === 1
    opts.push({
      value: c.refId || '',
      label: `${c.name}${c.refId ? `（refId: ${c.refId}）` : '（无 refId）'}${inValidStatus ? ' · 目标未上架' : ''}${valid ? '' : ' · 已停用'}`,
      disabled: inValidStatus
    })
  }
  // 兜底：当前值不在渠道列表（渠道被删）时占位展示
  if (form.refId && !opts.some(o => o.value === form.refId)) {
    opts.unshift({ value: form.refId, label: `${form.refId}（渠道不存在，需重新绑定）` })
  }
  return opts
})

const formRules: FormRules = {
  refId: [{ required: true, message: '请选择绑定渠道', trigger: 'change' }],
  replyContent: [
    { required: true, message: '请填写回复文案', trigger: 'blur' },
    {
      validator: (_r, _v, cb) => {
        if (form.ruleType === 'keyword' && !parsedKeywords.value.length) {
          cb(new Error('关键词回复至少配置 1 个触发词'))
        } else cb()
      },
      trigger: 'blur'
    },
    {
      validator: (_r, _v, cb) => {
        if (form.ruleType === 'keyword' && parsedKeywords.value.length > 10) {
          cb(new Error('触发词最多 10 个（逗号分隔）'))
        } else cb()
      },
      trigger: 'blur'
    }
  ]
}

function onTypeChange() {
  form.refId = ''
}

function openCreate() {
  editingId.value = null
  Object.assign(form, {
    ruleType: 'keyword',
    keywordsText: '',
    refId: '',
    replyContent: '',
    sort: 10,
    statusBool: true,
    remark: ''
  })
  dialogVisible.value = true
}

function openEdit(row: AssessmentReplyRule) {
  editingId.value = row.id
  Object.assign(form, {
    ruleType: row.ruleType,
    keywordsText: row.keywords || '',
    refId: row.refId || '',
    replyContent: row.replyContent,
    sort: row.sort,
    statusBool: row.status === 1,
    remark: row.remark || ''
  })
  dialogVisible.value = true
}

async function save() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  // 绑定目标页可访问性校验（网络效应：保存前校验）
  const st = bindState(rowStub())
  if (st.level === 'error') {
    ElMessage.error(`绑定渠道校验未通过：${st.text}`)
    return
  }

  const payload: Partial<AssessmentReplyRule> = {
    ruleType: form.ruleType,
    // keyword 规则绑关键词渠道、welcome 规则绑欢迎语渠道（网络效应，来源一致）
    source: form.ruleType,
    refId: form.refId,
    keywords: form.ruleType === 'keyword' ? parsedKeywords.value.join(',') : '',
    replyContent: form.replyContent,
    sort: form.sort,
    status: form.statusBool ? 1 : 0,
    remark: form.remark,
    syncStatus: 'pending' // 内容/绑定变更后回到待同步，等待复制粘贴至公众号后台
  }
  saving.value = true
  try {
    if (editingId.value != null) {
      await updateReplyRule(editingId.value, payload)
      ElMessage.success('规则已保存（标记待同步）——请复制文案到公众号后台更新')
    } else {
      await createReplyRule(payload)
      ElMessage.success('规则已创建（待同步）——请通过「复制整段」粘贴到公众号后台')
    }
    dialogVisible.value = false
    await load()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function rowStub(): AssessmentReplyRule {
  return {
    id: 0,
    ruleType: form.ruleType,
    keywords: form.ruleType === 'keyword' ? parsedKeywords.value.join(',') : '',
    replyContent: form.replyContent,
    source: form.ruleType,
    refId: form.refId,
    sort: form.sort,
    status: form.statusBool ? 1 : 0,
    syncStatus: 'pending',
    createdAt: '',
    updatedAt: ''
  }
}

async function removeRow(row: AssessmentReplyRule) {
  try {
    await deleteReplyRule(row.id)
    ElMessage.success(`「${row.refId || sourceLabel(row)}」规则已删除`)
    await load()
  } catch (e: any) {
    ElMessage.error(e?.message || '删除失败')
  }
}

onMounted(async () => {
  try {
    const oa = await getOaConfig()
    plazaPath.value = oa.plazaPath || '/assessment/list'
  } catch (_e) {
    /* 兜底默认路径 */
  }
  await load()
})
</script>

<style scoped lang="less">
.asmt-reply-page {
  text-align: left;

  .mb16 {
    margin-bottom: 16px;
  }

  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;

    .filter-kw {
      width: 240px;
    }

    .filter-tip {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .kw-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;

    .kw-tag {
      font-weight: 400;
    }

    .kw-more {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .kw-count {
      margin-left: 4px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .kw-welcome {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .reply-line {
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
    word-break: break-all;

    :deep(.link-slot) {
      padding: 0 4px;
      font-weight: 600;
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      border-radius: 4px;
    }
  }

  .cc-bind {
    display: flex;
    gap: 6px;
    align-items: center;

    .cc-ref {
      padding: 1px 6px;
      font-size: 12px;
      background: var(--el-fill-color);
      border-radius: 4px;
    }

    .cc-chname {
      overflow: hidden;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .bind-state {
    margin-top: 4px;
    font-size: 12px;

    &.ok {
      color: var(--el-color-success);
    }

    &.warn {
      color: var(--el-color-warning);
    }

    &.error {
      color: var(--el-color-danger);
    }
  }

  .cc-sub {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .page-hero__pill--warn {
    color: var(--el-color-warning);
  }

  .form-tip {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }
}
</style>
