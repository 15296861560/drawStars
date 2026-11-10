<template>
  <div class="manage-page asmt-channel-page">
    <page-hero
      title="渠道入口管理"
      desc="assessment_channel 渠道表：5 种原生来源系统预置不可删，仅可改挂载目标与启用状态；新建仅限自定义渠道"
    >
      <template #side>
        <span class="page-hero__pill">
          <el-icon :size="14"><Connection /></el-icon>
          原生 5 / 5 预置 · 自定义 {{ customRows.length }} 条
        </span>
      </template>
    </page-hero>

    <!-- ① 原生渠道（5 种，永久预置） -->
    <el-card v-loading="loading || provisioning" shadow="never" class="mb16">
      <template #header>
        <div class="native-head">
          <span class="native-head-title">原生渠道（系统预置 · 不可删除）</span>
          <span class="native-head-tip">
            来源由系统枚举（注册表式扩展），仅可修改「挂载目标页」与「启用状态」
          </span>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col v-for="nc in nativeList" :key="nc.source" :xs="24" :sm="12" :md="8">
          <div class="native-card" :class="{ off: nc.row && nc.row.status !== 1 }">
            <div class="nc-head">
              <span class="nc-icon">{{ nc.icon }}</span>
              <span class="nc-name">{{ nc.label }}渠道</span>
              <el-tag size="small" effect="plain" type="info">预置 · 不可删</el-tag>
            </div>
            <div class="nc-usage">{{ nc.usage }}</div>
            <div class="nc-meta">
              <span class="nc-k">refId</span>
              <code class="nc-ref">{{ nc.row?.refId || '—' }}</code>
            </div>
            <div class="nc-meta">
              <span class="nc-k">目标页</span>
              <span>{{ targetText(nc.row) }}</span>
            </div>
            <div class="nc-meta">
              <span class="nc-k">链接</span>
              <span class="nc-link" :title="linkOf(nc.row)">{{ shortLink(nc.row) }}</span>
            </div>
            <div class="nc-ops">
              <el-switch
                :model-value="nc.row ? nc.row.status === 1 : false"
                inline-prompt
                active-text="启"
                inactive-text="停"
                @change="(v: any) => nc.row && toggleStatus(nc.row, v)"
              />
              <span class="nc-spacer" />
              <el-button link type="primary" size="small" @click="copyLink(nc.row)">
                复制链接
              </el-button>
              <el-button link type="primary" size="small" @click="showQr(nc.row)">
                二维码
              </el-button>
              <el-button link type="primary" size="small" @click="openEdit(nc.row, true)">
                编辑挂载
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- ② 自定义渠道 -->
    <el-card shadow="never" :body-style="{ padding: 0 }">
      <template #header>
        <div class="custom-head">
          <span class="custom-head-title">自定义渠道（新建仅限此类，可编辑 / 删除）</span>
          <div class="custom-head-ops">
            <el-select
              v-model="filterSource"
              placeholder="全部来源"
              clearable
              style="width: 140px"
            >
              <el-option
                v-for="nc in nativeList"
                :key="nc.source"
                :value="nc.source"
                :label="`${nc.label}（${nc.source}）`"
              />
            </el-select>
            <el-input
              v-model="filterKeyword"
              placeholder="搜渠道名 / refId"
              clearable
              style="width: 200px"
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-button type="primary" :icon="Plus" @click="openEdit(null, false)">
              新建自定义渠道
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="filteredCustomRows"
        empty-text="暂无自定义渠道；原生渠道之外的入口（如新刊文批次、新关键词）在此新建"
      >
        <el-table-column label="渠道名" min-width="180">
          <template #default="{ row }">
            <div class="cc-name">{{ row.name }}</div>
            <div class="cc-sub">{{ remarkOf(row) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="来源" width="110">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ sourceLabel(row.source) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="refId" prop="refId" width="140">
          <template #default="{ row }">
            <code class="nc-ref">{{ row.refId || '—' }}</code>
          </template>
        </el-table-column>
        <el-table-column label="挂载目标页" min-width="180">
          <template #default="{ row }">
            <div>{{ targetText(row) }}</div>
            <div v-if="row.targetType === 'fill'" class="cc-sub">shareCode: {{ row.shareCode }}</div>
          </template>
        </el-table-column>
        <el-table-column label="链接" min-width="200">
          <template #default="{ row }">
            <span class="nc-link" :title="linkOf(row)">{{ shortLink(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="启用" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              @change="(v: any) => toggleStatus(row, v)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            <span class="cc-sub">{{ row.createdAt || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="copyLink(row)">复制</el-button>
            <el-button link type="primary" @click="showQr(row)">二维码</el-button>
            <el-button link type="primary" @click="openEdit(row, false)">编辑</el-button>
            <el-popconfirm
              :title="`删除后软删除并保留历史数据；若线上仍有已散播入口，需摘除或复建同 refId 渠道。确认删除「${row.name}」？`"
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

    <!-- 新建 / 编辑弹窗（原生渠道仅可改挂载目标与启用状态） -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-alert
        v-if="dialogMode === 'preset'"
        class="mb16"
        type="info"
        :closable="false"
        show-icon
        title="原生预置渠道：名称 / 来源 / refId 固定不可改，删除已禁用；仅可修改挂载目标页与启用状态"
      />
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="110px">
        <el-form-item label="渠道名" prop="name">
          <el-input
            v-model.trim="form.name"
            :disabled="dialogMode === 'preset'"
            maxlength="30"
            placeholder="内部识别用名称，如：关键词「原型」自动回复"
          />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="来源" prop="source">
              <el-select v-model="form.source" :disabled="dialogMode !== 'create'" style="width: 100%">
                <el-option
                  v-for="nc in nativeList"
                  :key="nc.source"
                  :value="nc.source"
                  :label="`${nc.icon} ${nc.label}（${nc.source}）`"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="refId" prop="refId">
              <el-input
                v-model.trim="form.refId"
                :disabled="dialogMode === 'preset'"
                maxlength="32"
                placeholder="文章批次 / 触发词 / 菜单 key，可空"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="挂载目标页">
          <el-radio-group v-model="form.targetType" :disabled="dialogMode === 'preset'">
            <el-radio-button value="plaza">问星广场</el-radio-button>
            <el-radio-button value="fill">指定上架测评</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.targetType === 'fill'" label="选择测评">
          <el-select
            v-model="form.infoId"
            placeholder="仅可选「已上架」测评（保证链接可访问）"
            style="width: 100%"
          >
            <el-option
              v-for="info in publishedInfos"
              :key="info.id"
              :value="info.id"
              :label="`${info.title}（${info.shareCode}）`"
            />
          </el-select>
          <div v-if="staleTargetTip" class="form-tip warn">{{ staleTargetTip }}</div>
          <div v-else class="form-tip">
            保存后自动携带 info 对应问卷 ID 与公开分享码（groupBy 渠道下钻依据）
          </div>
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch
            v-model="form.statusBool"
            inline-prompt
            active-text="启用"
            inactive-text="停用"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model.trim="form.remark"
            type="textarea"
            :rows="2"
            maxlength="100"
            :disabled="dialogMode === 'preset'"
            placeholder="投放说明 / 下线计划等，可空"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <!-- 二维码弹窗 -->
    <el-dialog v-model="qrVisible" :title="qrTitle" width="380px">
      <div class="qr-wrap">
        <div class="qr-box"><img v-if="qrDataUrl" :src="qrDataUrl" alt="渠道二维码" /></div>
        <div class="qr-link" :title="qrLink">{{ qrLink }}</div>
        <div class="form-tip">
          本地画布生成（无外网依赖）；公众号菜单仅可配置文本链接，文章 / 海报可用此二维码引导
        </div>
      </div>
      <template #footer>
        <el-button :icon="CopyDocument" @click="copyText(qrLink, '链接已复制')">复制链接</el-button>
        <el-button type="primary" :icon="Download" @click="downloadQr">下载 PNG</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Connection, CopyDocument, Download, Plus, Search } from '@element-plus/icons-vue'
import {
  buildChannelLink,
  createChannel,
  deleteChannel,
  getOaConfig,
  listChannels,
  listInfos,
  updateChannel
} from '@/api/assessment'
import type { AssessmentChannel, AssessmentInfo, ChannelSource } from '@/types/assessment'
import { renderQrDataUrl } from '@/views/assessment/components/render-qr'

const PageHero = defineAsyncComponent(
  () => import('@/components/base/PageHero/index.vue')
)

// ===== 原生渠道定义（5 种，PRD 4.4.2 来源枚举） =====
const NATIVE_LIST: Array<{
  source: ChannelSource
  label: string
  icon: string
  usage: string
}> = [
  { source: 'article', label: '文章', icon: '📝', usage: '运营刊文软性引导，底部「阅读原文」挂测评 / 广场' },
  { source: 'keyword', label: '关键词', icon: '💬', usage: '对话关键词触发自动回复，refId 存触发词（如「测评」）' },
  { source: 'welcome', label: '欢迎语', icon: '👋', usage: '被关注自动欢迎语，配合「回复规则管理」使用' },
  { source: 'menu', label: '菜单', icon: '📋', usage: '自定义菜单直达入口，refId 存菜单 key 保持唯一' },
  { source: 'share', label: '分享', icon: '🔗', usage: '海报 / 链接分享回流页（ref 可空）' }
]

const nativeRows = ref<Record<string, AssessmentChannel | null>>({})
const loading = ref(false)
const provisioning = ref(false)
const saving = ref(false)
const filterSource = ref<string>('')
const filterKeyword = ref('')
const allRows = ref<AssessmentChannel[]>([])
const infos = ref<AssessmentInfo[]>([])
const plazaPath = ref('/assessment/list')

const nativeList = computed(() =>
  NATIVE_LIST.map(nc => ({ ...nc, row: nativeRows.value[nc.source] || null }))
)

/** 预置判定：source + refId 命中原生约定槽位（refId === source） */
function isPreset(c: AssessmentChannel) {
  return (c.refId || '') === c.source
}

const customRows = computed(() => allRows.value.filter(c => !isPreset(c)))
const filteredCustomRows = computed(() => {
  let list = customRows.value
  if (filterSource.value) list = list.filter(c => c.source === filterSource.value)
  const kw = filterKeyword.value.trim()
  if (kw) {
    list = list.filter(
      c => c.name.includes(kw) || String(c.refId || '').includes(kw)
    )
  }
  return list
})

const publishedInfos = computed(() => infos.value.filter(i => i.status === 1))

function sourceLabel(source: ChannelSource) {
  return NATIVE_LIST.find(nc => nc.source === source)?.label || source
}
function remarkOf(row: AssessmentChannel) {
  return row.remark || '—'
}

/** 渠道指向的测评（infoId 优先，兜底 shareCode 匹配——兼容 mock 种子） */
function channelTarget(row: AssessmentChannel) {
  if (row.targetType !== 'fill') return undefined
  return (
    infos.value.find(i => i.id === row.infoId) ||
    infos.value.find(i => i.shareCode === row.shareCode)
  )
}

function targetText(row: AssessmentChannel | null) {
  if (!row) return '—'
  if (row.targetType === 'plaza') return '问星广场（全量卡片）'
  const info = channelTarget(row)
  if (info) {
    const st = info.status === 1 ? '上架中' : info.status === 2 ? '已下架' : '草稿'
    return `测评「${info.title}」（${st}）`
  }
  return row.shareCode ? `测评直链（${row.shareCode}）` : '测评直链（未绑定分享码）'
}

function linkOf(row: AssessmentChannel | null) {
  if (!row) return ''
  const info = channelTarget(row)
  return buildChannelLink(
    {
      source: row.source,
      refId: row.refId || '',
      targetType: row.targetType,
      surveyId: info?.surveyId ?? row.surveyId,
      shareCode: info?.shareCode ?? row.shareCode
    },
    plazaPath.value
  )
}
function shortLink(row: AssessmentChannel | null) {
  const link = linkOf(row)
  if (!link) return '—'
  return link.length > 44 ? `${link.slice(0, 42)}…` : link
}

async function load() {
  loading.value = true
  try {
    const [channelRes, infoRes] = await Promise.all([
      listChannels(),
      listInfos()
    ])
    allRows.value = channelRes.list || []
    infos.value = infoRes.list || []
    await ensureNativePresets()
    await refreshNativeRows()
  } catch (e: any) {
    ElMessage.error(e?.message || '渠道列表加载失败')
  } finally {
    loading.value = false
  }
}

/** 原生口径取全渠道（含可能被过滤的预置行） */
async function refreshNativeRows() {
  const res = await listChannels()
  allRows.value = res.list || []
  const map: Record<string, AssessmentChannel | null> = {}
  for (const nc of NATIVE_LIST) {
    map[nc.source] = res.list.find(c => c.source === nc.source && isPreset(c)) || null
  }
  nativeRows.value = map
}

/** 永久预置保证：缺失的原生槽位自动补建（幂等，仅补缺不覆盖） */
async function ensureNativePresets() {
  const missing = NATIVE_LIST.filter(
    nc => !allRows.value.some(c => c.source === nc.source && isPreset(c))
  )
  if (!missing.length) return
  provisioning.value = true
  try {
    for (const nc of missing) {
      await createChannel({
        source: nc.source,
        refId: nc.source,
        name: `原生渠道·${nc.label}`,
        targetType: 'plaza',
        remark: '原生预置（系统），不可删除',
        status: 1
      })
    }
    ElMessage.info(`已自动补齐 ${missing.length} 条缺失的原生预置渠道（永久预置）`)
  } finally {
    provisioning.value = false
  }
}

// ===== 启停（原生 / 自定义通用，保存即生效） =====
async function toggleStatus(row: AssessmentChannel, val: any) {
  const next = val ? 1 : 0
  try {
    const saved = await updateChannel(row.id, { status: next as 0 | 1 })
    Object.assign(row, saved)
    await refreshNativeRows()
    ElMessage.success(
      next === 1
        ? `「${row.name}」已启用，链接即刻生效`
        : `「${row.name}」已停用（历史数据保留）`
    )
  } catch (e: any) {
    ElMessage.error(e?.message || '状态更新失败')
  }
}

// ===== 复制链接 / 二维码 =====
async function copyText(text: string, tip = '已复制到剪贴板') {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(tip)
  } catch (_e) {
    // 非安全环境回退
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    ElMessage.success(tip)
  }
}
function copyLink(row: AssessmentChannel | null) {
  const link = linkOf(row)
  if (!link) return
  copyText(link, '渠道链接已复制（含 source / refId 埋点参数）')
}

const qrVisible = ref(false)
const qrDataUrl = ref('')
const qrLink = ref('')
const qrTitle = ref('渠道二维码')
async function showQr(row: AssessmentChannel | null) {
  const link = linkOf(row)
  if (!link) return
  qrLink.value = link
  qrTitle.value = `渠道二维码 · ${row?.name || ''}`
  qrDataUrl.value = ''
  qrVisible.value = true
  try {
    qrDataUrl.value = await renderQrDataUrl(link)
  } catch (_e) {
    ElMessage.error('二维码生成失败')
  }
}
function downloadQr() {
  if (!qrDataUrl.value) return
  const a = document.createElement('a')
  a.href = qrDataUrl.value
  a.download = `channel-${Date.now()}.png`
  a.click()
  ElMessage.success('二维码 PNG 已下载')
}

// ===== 新建 / 编辑 =====
type DialogMode = 'create' | 'preset' | 'custom'
const dialogVisible = ref(false)
const dialogMode = ref<DialogMode>('create')
const editingRow = ref<AssessmentChannel | null>(null)
const formRef = ref<FormInstance>()
const form = reactive({
  name: '',
  source: 'article' as ChannelSource,
  refId: '',
  targetType: 'plaza' as 'plaza' | 'fill',
  infoId: undefined as number | undefined,
  statusBool: true,
  remark: ''
})

const dialogTitle = computed(() => {
  if (dialogMode.value === 'preset') return '编辑原生渠道挂载'
  if (dialogMode.value === 'custom') return '编辑自定义渠道'
  return '新建自定义渠道'
})

/** 目标测评可访问性提示（fill 目标需为上架中） */
const staleTargetTip = computed(() => {
  if (dialogMode.value !== 'custom' || !editingRow.value) return ''
  if (editingRow.value.targetType !== 'fill') return ''
  const target = infos.value.find(i => i.id === form.infoId)
  if (!target) return ''
  if (target.status !== 1) {
    return `注意：「${target.title}」当前状态为${target.status === 0 ? '草稿' : '已下架'}，保存链接将不可访问，建议改挂广场`
  }
  return ''
})

const formRules: FormRules = {
  name: [{ required: true, message: '请填写渠道名', trigger: 'blur' }],
  source: [{ required: true, message: '请选择来源', trigger: 'change' }],
  infoId: [
    {
      validator: (_r, _v, cb) => {
        if (form.targetType === 'fill' && form.infoId == null) {
          cb(new Error('挂载测评直链时必须选择目标测评'))
        } else cb()
      },
      trigger: 'change'
    }
  ]
}

function openEdit(row: AssessmentChannel | null, isPresetSlot: boolean) {
  if (isPresetSlot && row) {
    dialogMode.value = 'preset'
    editingRow.value = row
  } else if (row) {
    dialogMode.value = 'custom'
    editingRow.value = row
  } else {
    dialogMode.value = 'create'
    editingRow.value = null
  }
  Object.assign(form, {
    name: row?.name || '',
    source: row?.source || 'article',
    refId: row?.refId || '',
    targetType: row?.targetType || 'plaza',
    infoId: row?.infoId ?? undefined,
    statusBool: row ? row.status === 1 : true,
    remark: row?.remark || ''
  })
  dialogVisible.value = true
}

async function save() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  const target = form.infoId != null ? infos.value.find(i => i.id === form.infoId) : undefined
  const payload: Partial<AssessmentChannel> = {
    name: form.name,
    source: form.source,
    refId: form.refId,
    targetType: form.targetType,
    surveyId: form.targetType === 'fill' ? target?.surveyId : undefined,
    shareCode: form.targetType === 'fill' ? target?.shareCode : undefined,
    infoId: form.targetType === 'fill' ? target?.id : undefined,
    status: form.statusBool ? 1 : 0,
    remark: form.remark
  }
  saving.value = true
  try {
    if (dialogMode.value === 'preset' && editingRow.value) {
      await updateChannel(editingRow.value.id, {
        targetType: payload.targetType,
        surveyId: payload.surveyId,
        shareCode: payload.shareCode,
        infoId: payload.infoId,
        status: payload.status
      })
      ElMessage.success('原生渠道挂载已更新，保存即生效')
    } else if (dialogMode.value === 'custom' && editingRow.value) {
      await updateChannel(editingRow.value.id, payload)
      ElMessage.success('自定义渠道已更新（name 改动会同步更新公众号配置）')
    } else {
      await createChannel(payload)
      ElMessage.success('自定义渠道已创建并启用；链接已可复制投放')
    }
    dialogVisible.value = false
    await refreshNativeRows()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function removeRow(row: AssessmentChannel) {
  try {
    await deleteChannel(row.id)
    ElMessage.success(`「${row.name}」已删除（软删除，同 refId 可复建）`)
    await refreshNativeRows()
  } catch (e: any) {
    ElMessage.error(e?.message || '删除失败')
  }
}

onMounted(async () => {
  // 广场路径取 OA 配置（链接构建参数）
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
.asmt-channel-page {
  text-align: left;

  .mb16 {
    margin-bottom: 16px;
  }

  .form-tip {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);

    &.warn {
      color: var(--el-color-warning);
    }
  }

  /* 原生渠道卡片 */
  .native-head {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .native-head-title {
      font-size: 15px;
    }

    .native-head-tip {
      font-size: 12px;
      font-weight: 400;
      color: var(--el-text-color-secondary);
    }
  }

  .native-card {
    padding: 14px;
    margin-bottom: 16px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;

    &.off {
      opacity: 0.55;
    }

    .nc-head {
      display: flex;
      gap: 8px;
      align-items: center;

      .nc-icon {
        font-size: 18px;
      }

      .nc-name {
        font-size: 14px;
        font-weight: 600;
      }
    }

    .nc-usage {
      margin: 8px 0 10px;
      font-size: 12px;
      line-height: 1.6;
      color: var(--el-text-color-secondary);
    }

    .nc-meta {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 6px;
      font-size: 12px;

      .nc-k {
        flex-shrink: 0;
        color: var(--el-text-color-secondary);
      }
    }

    .nc-ref {
      padding: 1px 6px;
      font-size: 12px;
      background: var(--el-fill-color);
      border-radius: 4px;
    }

    .nc-link {
      overflow: hidden;
      font-family: monospace;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .nc-ops {
      display: flex;
      gap: 4px;
      align-items: center;
      margin-top: 10px;

      .nc-spacer {
        flex: 1;
      }
    }
  }

  /* 自定义渠道 */
  .custom-head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .custom-head-ops {
      display: flex;
      gap: 10px;
      align-items: center;
    }
  }

  .cc-name {
    font-weight: 600;
  }

  .cc-sub {
    margin-top: 2px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .nc-link {
    font-size: 12px;
    color: var(--el-text-color-regular);
  }

  /* 二维码 */
  .qr-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;

    .qr-box {
      width: 200px;
      height: 200px;
      padding: 8px;
      background: #fff;
      border: 1px solid var(--el-border-color);
      border-radius: 8px;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .qr-link {
      max-width: 100%;
      margin-top: 12px;
      overflow: hidden;
      font-family: monospace;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .form-tip {
      margin-top: 8px;
      text-align: center;
    }
  }
}
</style>
