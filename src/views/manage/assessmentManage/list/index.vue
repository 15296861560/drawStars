<template>
  <div class="manage-page asmt-list-page">
    <page-hero
      title="测评上架管理"
      desc="问星广场选品：把已发布问卷包装为广场商品，四项上架校验前置（问卷 published / 类型注册 / 规则对应 / 展示信息）"
    >
      <template #side>
        <span class="page-hero__pill">
          <el-icon :size="14"><Goods /></el-icon>
          共 {{ rows.length }} 款
        </span>
        <el-button type="primary" class="page-hero__btn" :icon="Plus" @click="create">
          新建上架
        </el-button>
      </template>
    </page-hero>

    <!-- 筛选条 -->
    <el-card shadow="never" class="mb16">
      <div class="filter-bar">
        <el-radio-group v-model="queryStatus" @change="load">
          <el-radio-button :value="-1">全部</el-radio-button>
          <el-radio-button :value="0">草稿</el-radio-button>
          <el-radio-button :value="1">已上架</el-radio-button>
          <el-radio-button :value="2">已下架</el-radio-button>
        </el-radio-group>
        <el-input
          v-model="keyword"
          class="filter-kw"
          placeholder="按标题 / 分享码搜索"
          clearable
          @input="load"
          @clear="load"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <span class="filter-tip">状态与关键词实时查询</span>
      </div>
    </el-card>

    <!-- 上架列表 -->
    <el-card shadow="never" :body-style="{ padding: 0 }">
      <el-table v-loading="loading" :data="pagedRows" empty-text="暂无上架记录，点击右上角「新建上架」创建">
        <el-table-column label="测评名称" min-width="220">
          <template #default="{ row }">
            <div class="title-cell">
              <span class="t-name">{{ row.title }}</span>
              <el-tag
                v-if="parseBadge(row.tags)"
                :type="badgeTagType(parseBadge(row.tags)!)"
                size="small"
                effect="dark"
                class="mr6"
              >
                {{ parseBadge(row.tags) }}
              </el-tag>
            </div>
            <div class="t-sub">{{ row.subtitle || typeOf(row)?.defaultSubtitle || '—' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="关联类型" min-width="180">
          <template #default="{ row }">
            <div class="type-cell">
              <span class="type-icon">{{ typeOf(row)?.icon }}</span>
              <div>
                <div class="type-full">{{ typeOf(row)?.fullName || row.typeKey }}</div>
                <div class="type-meta">
                  <el-tag size="small" type="info" class="mr6">{{ typeOf(row)?.judgeModel }}</el-tag>
                  <span class="type-ver">{{ typeOf(row)?.version === 'v1.0' ? 'v1.0 已上线' : 'v1.1+ 预留' }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="关联问卷（分享码）" min-width="170">
          <template #default="{ row }">
            <div class="survey-cell">
              <div class="s-code">问卷 ID {{ row.surveyId }}</div>
              <div class="s-share">分享码：{{ row.shareCode || '—' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="题数 / 时长" width="110" align="center">
          <template #default="{ row }">
            <div>{{ row.questionNum }} 题</div>
            <div class="t-sub">{{ row.durationDesc }}</div>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sort" width="70" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusMeta(row.status).tag" effect="plain">
              {{ statusMeta(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="上架时间" width="160">
          <template #default="{ row }">
            <span class="t-sub">{{ row.publishedAt || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="editRow(row)">编辑</el-button>
            <el-button
              v-if="row.status !== 1"
              link
              type="success"
              @click="publishRow(row)"
            >
              上架
            </el-button>
            <el-button
              v-else
              link
              type="warning"
              @click="unpublishRow(row)"
            >
              下架
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="rows.length > pageSize" class="pager">
        <el-pagination
          layout="total, prev, pager, next"
          :total="rows.length"
          :page-size="pageSize"
          :current-page="page"
          @current-change="(p: number) => (page = p)"
        />
      </div>
    </el-card>

    <!-- 新建 / 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑上架信息' : '新建上架'"
      width="640px"
      :close-on-click-modal="false"
    >
      <el-alert
        v-if="editingId != null && editingRow?.status === 1"
        class="mb16"
        type="warning"
        :closable="false"
        show-icon
        title="该测评上架中：编辑保存后将自动转为「已下架」，需重新上架才会在广场展示（4.1.4 状态机）"
      />
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="110px">
        <el-form-item label="关联类型" prop="typeKey">
          <el-select
            v-model="form.typeKey"
            placeholder="在类型库中选择（决定判定模型与默认题数）"
            style="width: 100%"
            :disabled="!!editingId"
            @change="onTypeChange"
          >
            <el-option
              v-for="t in registryList"
              :key="t.typeKey"
              :value="t.typeKey"
              :label="`${t.icon} ${t.fullName}（${t.judgeModel} · ${t.questionNum} 题 · ${t.durationDesc}）`"
            >
              <div class="type-option">
                <span>{{ t.icon }} {{ t.fullName }}</span>
                <span class="type-meta">
                  {{ t.judgeModel }} 判定 · {{ t.questionNum }} 题 · {{ t.durationDesc }}
                  <el-tag size="small" :type="t.version === 'v1.0' ? 'success' : 'info'">
                    {{ t.version }}
                  </el-tag>
                </span>
              </div>
            </el-option>
          </el-select>
          <div class="form-tip">
            类型一经创建不可改；未在类型库注册的类型后端将拒绝保存（四项校验 ②）
          </div>
        </el-form-item>
        <el-form-item label="测评标题" prop="title">
          <el-input v-model.trim="form.title" maxlength="30" show-word-limit placeholder="显示在广场卡片主标题" />
        </el-form-item>
        <el-form-item label="推荐语" prop="subtitle">
          <el-input
            v-model.trim="form.subtitle"
            maxlength="40"
            show-word-limit
            :placeholder="typeOfKey(form.typeKey)?.defaultSubtitle || '一句话卖点，显示在卡片底部'"
          />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="关联问卷 ID" prop="surveyId">
              <el-input v-model.trim="form.surveyId" placeholder="问卷域已发布的问卷 id" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分享码" prop="shareCode">
              <el-input
                v-model.trim="form.shareCode"
                placeholder="问卷公开填写码（/survey/fill/{code}）"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="角标">
          <el-checkbox-group v-model="form.badges">
            <el-checkbox-button value="HOT">HOT</el-checkbox-button>
            <el-checkbox-button value="NEW">NEW</el-checkbox-button>
            <el-checkbox-button value="限免">限免</el-checkbox-button>
          </el-checkbox-group>
          <el-input
            v-model.trim="form.customTags"
            class="tags-input"
            placeholder="自定义标签（英文逗号分隔，可留空）"
          />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="题数快照" prop="questionNum">
              <el-input-number v-model="form.questionNum" :min="1" :max="50" style="width: 100%" />
              <div class="form-tip">
                按所选类型默认为 {{ typeOfKey(form.typeKey)?.questionNum || '—' }} 题，需与问卷实际题数一致（四项校验 ④）
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时长提示" prop="durationDesc">
              <el-input v-model.trim="form.durationDesc" placeholder="如 3 分钟" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="排序权重" prop="sort">
          <el-input-number v-model="form.sort" :min="1" :max="999" style="width: 160px" />
          <div class="form-tip">广场排序：置顶权重升序 &gt; 上架时间倒序</div>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Goods, Plus, Search } from '@element-plus/icons-vue'
import { createInfo, listInfos, publishInfo, updateInfo } from '@/api/assessment'
import type { AssessmentInfo, AssessInfoStatus } from '@/types/assessment'
import { ASSESSMENT_TYPE_REGISTRY } from '@/config/assessment-registry'

const PageHero = defineAsyncComponent(
  () => import('@/components/base/PageHero/index.vue')
)

// ===== 列表 =====
const loading = ref(false)
const saving = ref(false)
const rows = ref<AssessmentInfo[]>([])
const queryStatus = ref<number>(-1)
const keyword = ref('')
const page = ref(1)
const pageSize = 8

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize
  return rows.value.slice(start, start + pageSize)
})

const registryList = Object.values(ASSESSMENT_TYPE_REGISTRY)
function typeOf(row: AssessmentInfo) {
  return ASSESSMENT_TYPE_REGISTRY[row.typeKey]
}
function typeOfKey(key: string) {
  return ASSESSMENT_TYPE_REGISTRY[key]
}

/** 角标：tags 首位若为 HOT/NEW/限免 则渲染为角标 */
function parseBadge(tags: string): string | null {
  const first = String(tags || '').split(',')[0]?.trim()
  return ['HOT', 'NEW', '限免'].includes(first) ? first : null
}
function badgeTagType(badge: string) {
  if (badge === 'HOT') return 'danger'
  if (badge === 'NEW') return 'success'
  return 'warning'
}

function statusMeta(status: AssessInfoStatus) {
  return (
    {
      0: { label: '草稿', tag: 'warning' },
      1: { label: '已上架', tag: 'success' },
      2: { label: '已下架', tag: 'info' }
    } as const
  )[status]
}

async function load() {
  loading.value = true
  try {
    const res = await listInfos({
      status: queryStatus.value === -1 ? undefined : queryStatus.value,
      keyword: keyword.value || undefined
    })
    rows.value = res.list || []
    page.value = 1
  } catch (e: any) {
    ElMessage.error(e?.message || '上架列表加载失败')
  } finally {
    loading.value = false
  }
}

// ===== 新建 / 编辑 =====
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const editingRow = ref<AssessmentInfo | null>(null)
const formRef = ref<FormInstance>()
const form = reactive({
  typeKey: 'archetype',
  title: '',
  subtitle: '',
  surveyId: '' as string | number,
  shareCode: '',
  badges: [] as string[],
  customTags: '',
  questionNum: 8,
  durationDesc: '',
  sort: 99
})

const formRules: FormRules = {
  typeKey: [{ required: true, message: '请选择关联类型', trigger: 'change' }],
  title: [{ required: true, message: '请填写测评标题', trigger: 'blur' }],
  surveyId: [{ required: true, message: '请填写关联问卷 ID', trigger: 'blur' }],
  shareCode: [{ required: true, message: '请填写公开分享码', trigger: 'blur' }],
  questionNum: [
    { required: true, message: '题数快照必填（需 > 0）', trigger: 'blur' },
    {
      validator: (_r, v: number, cb) => cb(v > 0 ? undefined : new Error('题数需大于 0（四项校验 ④）')),
      trigger: 'blur'
    }
  ]
}

/** 类型变化：按类型默认值填充题数 / 时长 / 推荐语（默认校验） */
function onTypeChange() {
  const t = typeOfKey(form.typeKey)
  if (!t) return
  form.questionNum = t.questionNum
  form.durationDesc = t.durationDesc
  if (!form.subtitle) form.subtitle = t.defaultSubtitle
}

function composeTags(badges: string[], custom: string) {
  return [...badges, ...custom.split(',').map(s => s.trim()).filter(Boolean)].join(',')
}

function splitTags(tags: string) {
  const tokens = String(tags || '').split(',').map(s => s.trim()).filter(Boolean)
  const badges = ['HOT', 'NEW', '限免'].filter(b => tokens.includes(b))
  const custom = tokens.filter(t => !['HOT', 'NEW', '限免'].includes(t)).join(',')
  return { badges, custom }
}

function create() {
  editingId.value = null
  editingRow.value = null
  Object.assign(form, {
    typeKey: 'archetype',
    title: '',
    subtitle: '',
    surveyId: '',
    shareCode: '',
    badges: [],
    customTags: '',
    questionNum: registryList[0].questionNum,
    durationDesc: registryList[0].durationDesc,
    sort: 99
  })
  onTypeChange()
  dialogVisible.value = true
}

function editRow(row: AssessmentInfo) {
  editingId.value = row.id
  editingRow.value = row
  const { badges, custom } = splitTags(row.tags)
  Object.assign(form, {
    typeKey: row.typeKey,
    title: row.title,
    subtitle: row.subtitle || '',
    surveyId: row.surveyId,
    shareCode: row.shareCode,
    badges,
    customTags: custom,
    questionNum: row.questionNum,
    durationDesc: row.durationDesc || '',
    sort: row.sort
  })
  dialogVisible.value = true
}

async function save() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  const payload: Partial<AssessmentInfo> = {
    typeKey: form.typeKey,
    title: form.title,
    subtitle: form.subtitle,
    surveyId: form.surveyId,
    shareCode: form.shareCode,
    tags: composeTags(form.badges, form.customTags),
    questionNum: form.questionNum,
    durationDesc: form.durationDesc,
    sort: form.sort
  }
  saving.value = true
  try {
    if (editingId.value != null) {
      const saved = await updateInfo(editingId.value, payload)
      ElMessage.success(
        saved.status === 1 ? '已保存（上架中记录保存后已转下架，请重新上架）' : '上架信息已保存'
      )
    } else {
      await createInfo(payload)
      ElMessage.success('已创建草稿；上架前请确认问卷为已发布态且计分规则与类型匹配（四项校验 ①③）')
    }
    dialogVisible.value = false
    await load()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// ===== 上架 / 下架（公开开关仅在草稿态 / 上架态有效约束）=====
async function publishRow(row: AssessmentInfo) {
  const t = typeOf(row)
  const checklist = [
    `① 问卷 ${row.surveyId} 需为已发布（published）态 —— 服务端校验`,
    `② 类型 ${t?.fullName} 已在类型库注册 —— 通过`,
    `③ 计分规则与 ${t?.judgeModel} 判定模型对应 —— 服务端校验`,
    `④ 题数快照 ${row.questionNum} 题 > 0 —— 通过`
  ]
  try {
    await ElMessageBox.confirm(
      `上架校验（四项）：\n${checklist.join('\n')}\n\n确认将「${row.title}」公开发布到问星广场？`,
      '上架确认',
      {
        confirmButtonText: '确认上架',
        cancelButtonText: '再想想',
        customStyle: { whiteSpace: 'pre-line' }
      }
    )
  } catch {
    return
  }
  loading.value = true
  try {
    await publishInfo(row.id, true)
    ElMessage.success(`「${row.title}」已上架，广场即刻可见`)
    await load()
  } catch (e: any) {
    ElMessage.error(e?.message || '上架失败，请检查四项校验')
  } finally {
    loading.value = false
  }
}

async function unpublishRow(row: AssessmentInfo) {
  try {
    await ElMessageBox.confirm(
      `下架后广场即刻隐藏「${row.title}」；已散播出去的链接仍可访问填写；下架时间点与历史数据全部保留。`,
      '下架确认',
      { confirmButtonText: '确认下架', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }
  loading.value = true
  try {
    await updateInfo(row.id, { status: 2 })
    ElMessage.success(`「${row.title}」已下架`)
    await load()
  } catch (e: any) {
    ElMessage.error(e?.message || '下架失败')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped lang="less">
.asmt-list-page {
  text-align: left;

  .mb16 {
    margin-bottom: 16px;
  }

  .mr6 {
    margin-right: 6px;
  }

  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;

    .filter-kw {
      width: 260px;
    }

    .filter-tip {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .title-cell {
    display: flex;
    gap: 6px;
    align-items: center;

    .t-name {
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .t-sub {
    margin-top: 2px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .type-cell {
    display: flex;
    gap: 8px;
    align-items: center;

    .type-icon {
      font-size: 20px;
    }

    .type-full {
      font-size: 13px;
      font-weight: 600;
    }

    .type-meta {
      display: flex;
      align-items: center;
      margin-top: 2px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .survey-cell {
    .s-code {
      font-size: 13px;
    }

    .s-share {
      margin-top: 2px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .pager {
    display: flex;
    justify-content: flex-end;
    padding: 12px 16px;
  }

  .form-tip {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }

  .tags-input {
    width: 220px;
    margin-left: 12px;
  }

  .type-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    .type-meta {
      display: flex;
      gap: 6px;
      align-items: center;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
