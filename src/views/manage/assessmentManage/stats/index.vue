<template>
  <div class="manage-page asmt-stats-page">
    <page-hero
      title="数据看板"
      desc="E01–E09 埋点次日 01:00 聚合至 assessment_events_daily（T+1 非实时）；E10 follow_scan 为 v1.2+ 预留事件，本版不入看板"
    >
      <template #side>
        <el-radio-group v-model="days" size="small" @change="reload">
          <el-radio-button :value="7">近 7 天</el-radio-button>
          <el-radio-button :value="30">近 30 天</el-radio-button>
        </el-radio-group>
        <el-button class="page-hero__btn" :icon="Refresh" :loading="loading" @click="reload">
          刷新
        </el-button>
      </template>
    </page-hero>

    <div v-loading="loading" class="stats-body">
      <!-- ① 核心指标卡 -->
      <el-row :gutter="16" class="mb16">
        <el-col v-for="card in coreCards" :key="card.label" :xs="12" :sm="8" :md="4" :lg="4">
          <div class="core-card">
            <div class="core-label">{{ card.label }}</div>
            <div class="core-value" :class="card.cls">{{ card.value }}</div>
            <div class="core-sub">{{ card.sub }}</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4" :lg="4">
          <div class="core-card core-card--more" @click="jumpChannel">
            <div class="core-label">渠道管理</div>
            <div class="core-value"><el-icon><Connection /></el-icon></div>
            <div class="core-sub">投放入口维护 ></div>
          </div>
        </el-col>
      </el-row>

      <!-- ② 七级漏斗 + 注册/积分 -->
      <el-row :gutter="16" class="mb16">
        <el-col :xs="24" :lg="14">
          <el-card shadow="never" class="funnel-card">
            <template #header>
              <div class="card-head">
                <span>七级转化漏斗（L1 会话去重口径）</span>
                <span class="card-head-tip">相对上一级转化率</span>
              </div>
            </template>
            <div class="funnel-list">
              <div v-for="(step, i) in funnelSteps" :key="step.key" class="funnel-row">
                <div class="f-label">
                  <span class="f-idx">{{ i + 1 }}</span>
                  {{ step.label }}
                </div>
                <div class="f-bar-wrap">
                  <div class="f-bar" :style="barStyle(step)"></div>
                  <span class="f-value">{{ fmt(step.value) }}</span>
                </div>
                <div class="f-rate">
                  <template v-if="i === 0"><span class="f-base">基准</span></template>
                  <template v-else-if="i === 2">
                    <el-tag size="small" type="primary" effect="plain">
                      E02 点击→完成 {{ pct(step.rate) }}
                    </el-tag>
                  </template>
                  <template v-else-if="i === 4">
                    <el-tag size="small" type="warning" effect="plain">
                      E04 曝光→E05 {{ pct(step.rate) }}
                    </el-tag>
                  </template>
                  <template v-else>{{ pct(step.rate) }}</template>
                </div>
              </div>
            </div>
            <div class="form-tip">
              L1 = channel_visit 按「会话+来源+refId」三元组去重；「注册成功」按 isNewUser 计；「分享行为」= E08 海报 + E09 链接分享
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="10">
          <el-card shadow="never" class="mb16">
            <template #header>注册转化（E04 曝光 → E05 注册）</template>
            <div class="reg-row">
              <div class="reg-item">
                <div class="core-label">曝光 E04</div>
                <div class="reg-num">{{ fmt(register.showCount) }}</div>
              </div>
              <div class="reg-item">
                <div class="core-label">注册成功</div>
                <div class="reg-num">{{ fmt(register.successCount) }}</div>
              </div>
              <div class="reg-item">
                <div class="core-label">新用户</div>
                <div class="reg-num">{{ fmt(register.newCount) }}</div>
              </div>
              <div class="reg-item">
                <div class="core-label">曝光→注册率</div>
                <div class="reg-num" :class="{ 'reg-red': registerAlert }">
                  {{ pct(register.rate) }}
                </div>
              </div>
            </div>
            <el-alert
              v-if="registerAlert"
              class="mt8"
              type="error"
              :closable="false"
              show-icon
              :title="`注册率 ${pct(register.rate)} 触发红黄线（< ${pct(REGISTER_RATE_ALERT)}，REGISTER_RATE_ALERT）`"
            >
              E06 / E07 引导需自检：① 公众号文风与测评名称是否存在歧义；② 关注后欢迎语是否误触发（频控 1 次 / 会话）；③ 缓存未更新最长 5 分钟
            </el-alert>
            <div v-else-if="register.showCount === 0" class="form-tip mt8">
              当前窗口无 E04 注册曝光，注册率不计算；开启 OA 引导位（引导开关）后开始采集
            </div>
            <div v-else class="form-tip mt8">
              注册率 ≥ 红线 {{ pct(REGISTER_RATE_ALERT) }}；分享页模板与 OA 引导位正常投放
            </div>
          </el-card>

          <el-card shadow="never">
            <template #header>积分发放（点数整体口径）</template>
            <div class="reg-row">
              <div class="reg-item">
                <div class="core-label">完成奖励</div>
                <div class="reg-num">{{ fmt(points.completeCount) }}</div>
              </div>
              <div class="reg-item">
                <div class="core-label">海报奖励</div>
                <div class="reg-num">{{ fmt(points.posterCount) }}</div>
              </div>
              <div class="reg-item">
                <div class="core-label">关注礼</div>
                <div class="reg-num">{{ fmt(points.welcomeCount) }}</div>
              </div>
              <div class="reg-item">
                <div class="core-label">发放成功率</div>
                <div class="reg-num">{{ pct(points.grantRate) }}</div>
              </div>
            </div>
            <div class="form-tip mt8">
              累计发放 {{ fmt(points.totalPoints) }} 点；游客答卷可补领 {{ points.claimable }} 笔，已完成迁移
              {{ points.claimCount }} 笔（注册后自动合并）
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- ③ 渠道透视 -->
      <el-card shadow="never" class="mb16" :body-style="{ padding: 0 }">
        <template #header>
          <div class="card-head">
            <span>渠道透视（polling 明细，按 source+refId 采集）</span>
            <span class="card-head-tip">E01 缺 refId 时归入 article 渠道</span>
          </div>
        </template>
        <el-table :data="overview?.channelPivot || []" empty-text="暂无渠道数据">
          <el-table-column label="渠道" min-width="140">
            <template #default="{ row }">
              <span class="ch-icon">{{ sourceIcon(row.source) }}</span>
              {{ sourceLabel(row.source) }}
            </template>
          </el-table-column>
          <el-table-column label="进入 E01 (人次)" prop="visits" align="right" width="130" />
          <el-table-column label="完成 E03" prop="completes" align="right" width="110" />
          <el-table-column label="注册 E05" prop="registers" align="right" width="110" />
          <el-table-column label="海报 E08" prop="posters" align="right" width="110" />
          <el-table-column label="点击→完成率" align="right" width="130">
            <template #default="{ row }">
              <span :class="{ 'rate-zero': row.completeRate === 0 }">{{ pct(row.completeRate) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- ④ 趋势 & Top 榜 -->
      <el-row :gutter="16" class="mb16">
        <el-col :xs="24" :lg="14">
          <el-card shadow="never">
            <template #header>事件趋势（E01 进入 / E03 完成 / E05 注册成功）</template>
            <div v-if="hasTrend" ref="trendRef" class="trend-chart"></div>
            <el-empty v-else description="暂无趋势数据（口径：次日 01:00 聚合，T+1 更新）" />
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="10">
          <el-card shadow="never" :body-style="{ padding: 0 }">
            <template #header>测评贡献 Top 10（点击 visit=曝光 + 完成）</template>
            <el-table :data="overview?.topSurveys || []" empty-text="暂无完成数据">
              <el-table-column label="#" width="50" align="center">
                <template #default="{ $index }">
                  <span class="rank" :class="{ top: $index < 3 }">{{ $index + 1 }}</span>
                </template>
              </el-table-column>
              <el-table-column label="测评" min-width="180">
                <template #default="{ row }">
                  <div class="cc-name">
                    <span class="ch-icon">{{ typeOf(row.typeKey)?.icon }}</span>
                    {{ row.title }}
                  </div>
                  <div class="cc-sub">{{ typeOf(row.typeKey)?.fullName || row.typeKey }}</div>
                </template>
              </el-table-column>
              <el-table-column label="点击" prop="visits" align="right" width="80" />
              <el-table-column label="完成" prop="completes" align="right" width="80" />
              <el-table-column label="完成率" align="right" width="90">
                <template #default="{ row }">
                  {{ pct(row.completeRate) }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>

      <!-- ⑤ 口径说明 -->
      <el-card shadow="never">
        <template #header>指标口径（E01–E10）</template>
        <el-collapse>
          <el-collapse-item title="埋点事件与聚合口径" name="1">
            <ul class="schema-list">
              <li>E01 channel_visit 渠道进入：链接携带 source+refId 参数进入，人次 + 会话去重（L1）双口径</li>
              <li>E02 plaza_click 广场列表点击：单测评卡片点击（列表点击→完成率为核心转化指标）</li>
              <li>E03 response_complete 测评完成：按 userId 去重后计完成人数</li>
              <li>E04 register_show 注册曝光：分享页模板曝光</li>
              <li>E05 register_success 注册成功：isNewUser 判定蹭量与自然新增</li>
              <li>E06 guide_complete_show / E07 guide_result_show 引导位曝光（关闭开关后停止上报）</li>
              <li>E08 poster_create 海报生成 / E09 share_click 分享点击：转发链路</li>
              <li>E10 follow_scan 关注引导扫码：v1.2+ 预留事件，本版不入看板</li>
              <li>全部事件次日 01:00（服务器本地时区）聚合至 assessment_events_daily；看板为 T+1 非实时数据</li>
            </ul>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { Refresh, Connection } from '@element-plus/icons-vue'
import { getStatsOverview } from '@/api/assessment'
import type { ChannelSource, StatsOverview } from '@/types/assessment'
import { ASSESSMENT_TYPE_REGISTRY, REGISTER_RATE_ALERT } from '@/config/assessment-registry'

const PageHero = defineAsyncComponent(
  () => import('@/components/base/PageHero/index.vue')
)
const router = useRouter()

const loading = ref(false)
const days = ref(30)
const overview = ref<StatsOverview | null>(null)
const trendRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

const funnelSteps = computed(() => overview.value?.funnel || [])
const register = computed(() =>
  overview.value?.register || { showCount: 0, successCount: 0, newCount: 0, rate: 0 }
)
const points = computed(
  () =>
    overview.value?.points || {
      completeCount: 0,
      posterCount: 0,
      welcomeCount: 0,
      totalPoints: 0,
      grantRate: 0,
      claimable: 0,
      claimCount: 0
    }
)
const hasTrend = computed(() => (overview.value?.trend || []).some(t => t.e01 + t.e03 + t.e05 > 0))

/** 注册率红黄线：< 25% 转红（REGISTER_RATE_ALERT） */
const registerAlert = computed(
  () => register.value.showCount > 0 && register.value.rate < REGISTER_RATE_ALERT
)

const coreCards = computed(() => {
  const f = funnelSteps.value
  const step = (i: number) => f[i]?.value ?? 0
  return [
    { label: '渠道进入 E01（去重）', value: fmt(step(0)), sub: 'L1 会话×来源×refId', cls: '' },
    { label: '广场点击 E02', value: fmt(step(1)), sub: '卡片点击次数', cls: '' },
    { label: '测评完成 E03', value: fmt(step(2)), sub: '完成人数', cls: '' },
    {
      label: '注册成功（新用户）',
      value: fmt(register.value.newCount),
      sub: `共 ${fmt(register.value.successCount)} 笔`,
      cls: registerAlert.value ? 'reg-red' : ''
    },
    { label: '积分发放成功率', value: pct(points.value.grantRate), sub: '完成页发放口径', cls: '' }
  ]
})

function fmt(n?: number) {
  return (n ?? 0).toLocaleString()
}
function pct(v?: number) {
  if (v == null) return '—'
  return `${Math.round(v * 100)}%`
}
function typeOf(key: string) {
  return ASSESSMENT_TYPE_REGISTRY[key]
}
const SOURCE_META: Array<{ source: ChannelSource; label: string; icon: string }> = [
  { source: 'article', label: '文章', icon: '📝' },
  { source: 'keyword', label: '关键词', icon: '💬' },
  { source: 'welcome', label: '欢迎语', icon: '👋' },
  { source: 'menu', label: '菜单', icon: '📋' },
  { source: 'share', label: '分享', icon: '🔗' }
]
function sourceLabel(s: ChannelSource) {
  return SOURCE_META.find(m => m.source === s)?.label || s
}
function sourceIcon(s: ChannelSource) {
  return SOURCE_META.find(m => m.source === s)?.icon || '🔗'
}

/** 漏斗条宽度：以第一级为基准 */
function barStyle(step: { value: number }) {
  const base = funnelSteps.value[0]?.value || 0
  const pctWidth = base > 0 ? Math.max((step.value / base) * 100, step.value > 0 ? 6 : 0.8) : 0
  return { width: `${pctWidth}%` }
}

async function reload() {
  loading.value = true
  try {
    overview.value = await getStatsOverview(days.value)
    await nextTick()
    renderTrend()
  } catch (e: any) {
    ElMessage.error(e?.message || '看板数据加载失败')
  } finally {
    loading.value = false
  }
}

function renderTrend() {
  const trend = overview.value?.trend || []
  if (!trendRef.value || !hasTrend.value) return
  if (!chart) chart = echarts.init(trendRef.value)
  chart.setOption({
    grid: { left: 44, right: 16, top: 36, bottom: 28 },
    tooltip: { trigger: 'axis' },
    legend: { data: ['E01 进入', 'E03 完成', 'E05 注册成功'], top: 4, textStyle: { fontSize: 12 } },
    xAxis: {
      type: 'category',
      data: trend.map(t => t.date.slice(5)),
      axisLabel: { fontSize: 11 }
    },
    yAxis: { type: 'value', minInterval: 1, axisLabel: { fontSize: 11 } },
    series: [
      {
        name: 'E01 进入',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        data: trend.map(t => t.e01),
        itemStyle: { color: '#7c6ff0' }
      },
      {
        name: 'E03 完成',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        data: trend.map(t => t.e03),
        itemStyle: { color: '#34b78f' }
      },
      {
        name: 'E05 注册成功',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        data: trend.map(t => t.e05),
        itemStyle: { color: '#e6a23c' }
      }
    ]
  })
}

function jumpChannel() {
  router.push('/home/assessment/channel')
}

function onResize() {
  chart?.resize()
}

onMounted(() => {
  window.addEventListener('resize', onResize)
  reload()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
  chart = null
})
</script>

<style scoped lang="less">
.asmt-stats-page {
  text-align: left;

  .mb16 {
    margin-bottom: 16px;
  }

  .mt8 {
    margin-top: 8px;
  }

  .stats-body {
    min-height: 200px;
  }

  /* 核心指标卡 */
  .core-card {
    padding: 16px;
    margin-bottom: 12px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;

    .core-label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .core-value {
      margin-top: 6px;
      font-size: 24px;
      font-weight: 700;
      color: var(--el-text-color-primary);

      &.reg-red {
        color: var(--el-color-danger);
      }
    }

    .core-sub {
      margin-top: 4px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    &--more {
      cursor: pointer;

      .core-value {
        display: flex;
        align-items: center;
        font-size: 20px;
        color: var(--el-color-primary);
      }
    }
  }

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .card-head-tip {
      font-size: 12px;
      font-weight: 400;
      color: var(--el-text-color-secondary);
    }
  }

  /* 漏斗 */
  .funnel-row {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 14px;

    .f-label {
      display: flex;
      gap: 6px;
      align-items: center;
      width: 110px;
      font-size: 13px;

      .f-idx {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        font-size: 12px;
        color: #fff;
        background: var(--el-color-primary);
        border-radius: 50%;
      }
    }

    .f-bar-wrap {
      position: relative;
      flex: 1;
      height: 28px;

      .f-bar {
        height: 100%;
        background: linear-gradient(90deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
        border-radius: 0 14px 14px 0;
        transition: width 0.4s ease;
      }

      .f-value {
        position: absolute;
        top: 50%;
        left: 100%;
        padding-left: 8px;
        font-size: 12px;
        white-space: nowrap;
        transform: translateY(-50%);
      }
    }

    .f-rate {
      width: 170px;
      font-size: 12px;
      text-align: right;
      color: var(--el-text-color-secondary);

      .f-base {
        font-size: 12px;
      }
    }
  }

  /* 注册 / 积分 */
  .reg-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;

    .reg-item {
      .reg-num {
        margin-top: 6px;
        font-size: 22px;
        font-weight: 700;

        &.reg-red {
          color: var(--el-color-danger);
        }
      }
    }
  }

  .form-tip {
    font-size: 12px;
    line-height: 1.7;
    color: var(--el-text-color-secondary);
  }

  .ch-icon {
    margin-right: 4px;
  }

  .rate-zero {
    color: var(--el-text-color-placeholder);
  }

  /* 趋势 */
  .trend-chart {
    width: 100%;
    height: 300px;
  }

  /* Top 榜 */
  .rank {
    font-weight: 700;
    color: var(--el-text-color-secondary);

    &.top {
      color: var(--el-color-warning);
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

  /* 口径列表 */
  .schema-list {
    padding-left: 18px;
    font-size: 13px;
    line-height: 2;

    li {
      color: var(--el-text-color-regular);
    }
  }
}
</style>
