<template>
  <div class="manage-page asmt-oa-page">
    <page-hero
      title="公众号配置"
      desc="公众号信息与引导位配置（assessment_oa_config 单行表），保存即生效，C 端缓存 ≤ 5 分钟"
    >
      <template #side>
        <span class="page-hero__pill">
          <el-icon :size="14"><Clock /></el-icon>
          最近更新：{{ form.updatedAt || '—' }}
        </span>
        <el-button type="primary" class="page-hero__btn" :loading="saving" @click="save">
          保存配置
        </el-button>
      </template>
    </page-hero>

    <!-- 能力提示横幅（账号类型驱动，4.4.1） -->
    <el-alert
      v-if="form.accountType === 0"
      class="mb16"
      type="warning"
      :closable="false"
      show-icon
      title="能力提示（个人未认证订阅号）"
    >
      当前账号类型无法使用 OAuth 网页授权 / 模板消息 / 带参数二维码 / JS-SDK 高级接口，相关能力归档为 v1.2+；正文超链仅可指向公众号文章，请为测评入口使用「阅读原文」。
    </el-alert>

    <div v-loading="loading" class="oa-body">
      <el-empty v-if="!loading && loadError" description="配置加载失败，请刷新重试" />

      <el-form
        v-else
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="140px"
        @submit.prevent
      >
        <!-- ① 基础信息 -->
        <el-card shadow="never" class="mb16">
          <template #header>基础信息</template>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="公众号名称" prop="officialName">
                <el-input
                  v-model.trim="form.officialName"
                  placeholder="如：易道心智"
                  maxlength="30"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="原始 ID（gh_）" prop="wechatId">
                <el-input
                  v-model.trim="form.wechatId"
                  placeholder="公众号后台「设置→账号详情」获取，如 gh_yidao_xinzhi"
                  maxlength="64"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="账号类型" prop="accountType">
                <el-select v-model="form.accountType" style="width: 100%">
                  <el-option :value="0" label="个人未认证订阅号" />
                  <el-option :value="1" label="认证订阅号" />
                  <el-option :value="2" label="认证服务号" />
                </el-select>
                <div class="form-tip">
                  账号类型决定可用交互能力，切换后能力提示横幅随之变化（仅提示，非硬限制）
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="广场页路径" prop="plazaPath">
                <el-input
                  v-model.trim="form.plazaPath"
                  placeholder="C 端广场路由，建议 /assessment/list"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- ② 关注二维码 -->
        <el-card shadow="never" class="mb16">
          <template #header>关注二维码</template>
          <el-row :gutter="24">
            <el-col :span="14">
              <el-form-item label="二维码图片 URL" prop="qrCodeUrl">
                <el-input
                  v-model.trim="form.qrCodeUrl"
                  placeholder="公众号后台「设置→公众号设置」获取原图，单图 ≤ 500KB；为空时 C 端渲染占位二维码"
                />
                <div class="form-tip">公众号后台下载原图后粘贴图片地址；C 端引导位长按识别即此图</div>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <div class="qr-preview">
                <div class="qr-box">
                  <el-image
                    v-if="form.qrCodeUrl"
                    :src="form.qrCodeUrl"
                    fit="contain"
                    :preview-src-list="[form.qrCodeUrl]"
                  >
                    <template #error><fake-qr :seed="202611" /></template>
                  </el-image>
                  <fake-qr v-else :seed="202611" />
                </div>
                <div class="qr-tip">{{ form.qrCodeUrl ? '二维码预览' : '未配置，当前展示占位二维码' }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- ③ 引导位文案与总开关 -->
        <el-card shadow="never" class="mb16">
          <template #header>
            <div class="card-head">
              <span>引导位文案</span>
              <div class="head-switch">
                <span class="head-switch-label">引导位总开关：{{ form.guideEnabled ? '已开启' : '已关闭' }}</span>
                <el-switch v-model="form.guideEnabled" />
              </div>
            </div>
          </template>

          <el-alert
            v-if="!form.guideEnabled"
            class="mb16"
            type="info"
            :closable="false"
            show-icon
            :title="`引导位已关闭：C 端报告页 / 完成页 / 海报三处引导位全部隐藏（数据保留，重新打开立即恢复）；E06/E07 事件停止上报，其余埋点照常`"
          />

          <div class="section-title">通用兜底话术（位置文案留空时回退）</div>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="引导标题" prop="guideTitle">
                <el-input v-model="form.guideTitle" maxlength="30" show-word-limit>
                  <template #append>
                    <el-button @click="insertSlot('guideTitle')">+ {结果名}</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="引导副标题" prop="guideDesc">
                <el-input v-model="form.guideDesc" maxlength="60" show-word-limit />
              </el-form-item>
            </el-col>
          </el-row>

          <div class="section-title">报告结果页引导</div>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="结果页标题" prop="resultGuideTitle">
                <el-input
                  v-model="form.resultGuideTitle"
                  placeholder="留空回退通用标题"
                  maxlength="30"
                  show-word-limit
                >
                  <template #append>
                    <el-button @click="insertSlot('resultGuideTitle')">+ {结果名}</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结果页副标题" prop="resultGuideDesc">
                <el-input
                  v-model="form.resultGuideDesc"
                  placeholder="留空回退通用副标题"
                  maxlength="60"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>

          <div class="section-title">问卷完成页引导</div>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="完成页标题" prop="completeGuideTitle">
                <el-input
                  v-model="form.completeGuideTitle"
                  placeholder="留空回退通用标题"
                  maxlength="30"
                  show-word-limit
                >
                  <template #append>
                    <el-button @click="insertSlot('completeGuideTitle')">+ {结果名}</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="完成页副标题" prop="completeGuideDesc">
                <el-input
                  v-model="form.completeGuideDesc"
                  placeholder="留空回退通用副标题"
                  maxlength="60"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>

          <div class="section-title">海报分享语（朋友圈转发文案）</div>
          <el-row :gutter="24">
            <el-col :span="18">
              <el-form-item label="分享语文案" prop="posterShareText">
                <el-input
                  v-model="form.posterShareText"
                  type="textarea"
                  :rows="2"
                  maxlength="60"
                  show-word-limit
                  placeholder="展示在海报下方与转发语中，如：我在问星测出了我的本命心智原型，快来看看你的~"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- ④ 移动端预览 -->
        <el-card shadow="never" class="mb16">
          <template #header>移动端预览（引导位实时渲染）</template>
          <div class="preview-row">
            <div class="phone">
              <div class="phone-bar">报告结果页</div>
              <div class="guide-block" :class="{ off: !form.guideEnabled }">
                <template v-if="form.guideEnabled">
                  <div class="qr-mini"><fake-qr :seed="3" /></div>
                  <div class="guide-text">
                    <div class="g-title">{{ renderPreview(preview.result.title, '开拓者·乾') }}</div>
                    <div class="g-desc">{{ renderPreview(preview.result.desc, '开拓者·乾') }}</div>
                  </div>
                </template>
                <div v-else class="guide-off-tip">引导位已隐藏</div>
              </div>

              <div class="phone-bar">问卷完成页</div>
              <div class="guide-block" :class="{ off: !form.guideEnabled }">
                <template v-if="form.guideEnabled">
                  <div class="qr-mini"><fake-qr :seed="8" /></div>
                  <div class="guide-text">
                    <div class="g-title">{{ renderPreview(preview.complete.title, '上上签') }}</div>
                    <div class="g-desc">{{ renderPreview(preview.complete.desc, '上上签') }}</div>
                  </div>
                </template>
                <div v-else class="guide-off-tip">引导位已隐藏</div>
              </div>

              <div class="phone-bar">海报分享</div>
              <div class="guide-block" :class="{ off: !form.guideEnabled }">
                <template v-if="form.guideEnabled">
                  <div class="g-title share-line">{{ form.posterShareText || '未配置分享语' }}</div>
                </template>
                <div v-else class="guide-off-tip">海报引导隐藏（海报本体不变）</div>
              </div>
            </div>
          </div>
        </el-card>

        <div class="oa-footer">
          <el-button type="primary" :loading="saving" @click="save">保存配置</el-button>
          <span class="form-tip">保存立即生效（无草稿态）；关闭引导开关仅停用、不删除任何数据</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Clock } from '@element-plus/icons-vue'
import { getOaConfig, updateOaConfig } from '@/api/assessment'
import type { AssessmentOaConfig } from '@/types/assessment'
import { OA_GUIDE_DEFAULTS } from '@/config/assessment-registry'

const PageHero = defineAsyncComponent(
  () => import('@/components/base/PageHero/index.vue')
)
const FakeQr = defineAsyncComponent(
  () => import('@/views/assessment/components/FakeQr.vue')
)

const loading = ref(false)
const saving = ref(false)
const loadError = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<AssessmentOaConfig>({
  id: 1,
  officialName: '',
  wechatId: '',
  accountType: 0,
  qrCodeUrl: '',
  guideEnabled: true,
  guideTitle: OA_GUIDE_DEFAULTS.result.title,
  guideDesc: OA_GUIDE_DEFAULTS.result.desc,
  resultGuideTitle: '',
  resultGuideDesc: '',
  completeGuideTitle: '',
  completeGuideDesc: '',
  posterShareText: OA_GUIDE_DEFAULTS.posterShareText,
  plazaPath: OA_GUIDE_DEFAULTS.plazaPath,
  updatedAt: ''
})

/** 校验：公众号名称 / 二维码必填，标题 ≤ 30 字（4.4.1 限长校验） */
const rules: FormRules = {
  officialName: [{ required: true, message: '请填写公众号名称', trigger: 'blur' }],
  qrCodeUrl: [{ required: true, message: '请填写二维码图片 URL', trigger: 'blur' }],
  accountType: [{ required: true, message: '请选择账号类型', trigger: 'change' }],
  guideTitle: [
    { required: true, message: '请填写通用引导标题', trigger: 'blur' },
    { max: 30, message: '标题不超过 30 字', trigger: 'blur' }
  ],
  posterShareText: [{ required: true, message: '请填写海报分享语', trigger: 'blur' }],
  resultGuideTitle: [{ max: 30, message: '标题不超过 30 字', trigger: 'blur' }],
  completeGuideTitle: [{ max: 30, message: '标题不超过 30 字', trigger: 'blur' }]
}

/** 位置话术空值回退通用话术（与 C 端 mockGuideConfig 口径一致） */
const preview = computed(() => ({
  result: {
    title: form.resultGuideTitle || form.guideTitle,
    desc: form.resultGuideDesc || form.guideDesc
  },
  complete: {
    title: form.completeGuideTitle || form.guideTitle,
    desc: form.completeGuideDesc || form.guideDesc
  }
}))

/** 渲染 {结果名} 槽位 */
function renderPreview(text: string, sample: string) {
  return (text || '').replace(/\{结果名\}/g, sample)
}

/** 标题输入框追加 {结果名} 槽位 */
function insertSlot(field: 'guideTitle' | 'resultGuideTitle' | 'completeGuideTitle') {
  const cur = String(form[field] || '')
  if (cur.length + 5 > 30) {
    ElMessage.warning('标题已达 30 字上限，无法再插入槽位')
    return
  }
  form[field] = (cur + '{结果名}') as never
}

async function load() {
  loading.value = true
  loadError.value = false
  try {
    const config = await getOaConfig()
    Object.assign(form, config)
  } catch (e: any) {
    loadError.value = true
    ElMessage.error(e?.message || '公众号配置加载失败')
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) {
    ElMessage.warning('请先补全必填项（公众号名称 / 二维码 URL / 引导标题 / 分享语）')
    return
  }
  saving.value = true
  try {
    const saved = await updateOaConfig({ ...form })
    Object.assign(form, saved)
    ElMessage.success(
      form.guideEnabled
        ? '已保存并生效（C 端缓存最长 5 分钟）'
        : '已保存：引导位已停用（数据保留，重新开启立即恢复）'
    )
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped lang="less">
.asmt-oa-page {
  text-align: left;

  .mb16 {
    margin-bottom: 16px;
  }

  .oa-body {
    min-height: 200px;
  }

  .form-tip {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .head-switch {
      display: flex;
      gap: 10px;
      align-items: center;

      .head-switch-label {
        font-size: 13px;
        font-weight: 400;
        color: var(--el-text-color-regular);
      }
    }
  }

  .section-title {
    margin: 4px 0 16px;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);

    &::before {
      margin-right: 6px;
      content: '';
      border-left: 3px solid var(--el-color-primary);
    }
  }

  .qr-preview {
    display: flex;
    flex-direction: column;
    align-items: center;

    .qr-box {
      width: 120px;
      height: 120px;
      padding: 6px;
      background: #fff;
      border: 1px solid var(--el-border-color);
      border-radius: 8px;

      .el-image,
      :deep(.fakeqr) {
        width: 100%;
        height: 100%;
        color: #191636;
      }
    }

    .qr-tip {
      margin-top: 8px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .preview-row {
    display: flex;
    justify-content: center;
  }

  .phone {
    width: 300px;
    padding: 14px;
    background: linear-gradient(160deg, #2c2a55 0%, #191636 100%);
    border: 4px solid #0f0d24;
    border-radius: 24px;
  }

  .phone-bar {
    margin: 8px 0 10px;
    font-size: 12px;
    color: #d3ccf5;
    opacity: 0.8;
  }

  .guide-block {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 12px;
    background: #39366b;
    border: 1px solid #d3ccf533;
    border-radius: 10px;

    .qr-mini {
      flex-shrink: 0;
      width: 64px;
      height: 64px;
      padding: 4px;
      background: #f5f0e4;
      border-radius: 6px;

      :deep(.fakeqr) {
        width: 100%;
        height: 100%;
        color: #191636;
      }
    }

    .guide-text {
      min-width: 0;
    }

    .g-title {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.4;
      color: #f6f2ff;
    }

    .g-desc {
      margin-top: 4px;
      font-size: 12px;
      line-height: 1.5;
      color: #d3ccf5;
    }

    .share-line {
      width: 100%;
    }

    &.off {
      justify-content: center;

      .guide-off-tip {
        font-size: 12px;
        color: #8f89bb;
      }
    }
  }

  .oa-footer {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}
</style>
