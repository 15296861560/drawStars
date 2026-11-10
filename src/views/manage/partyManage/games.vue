<template>
  <div class="manage-page">
    <page-hero
      title="游戏配置"
      desc="五款游戏的上下架开关、默认人数 / 回合 / 难度与默认惩罚文案（PRD 8.7 无酒温和模板一键切换）"
    >
      <template #side>
        <span class="page-hero__pill">共 {{ configs.length }} 款游戏</span>
        <el-button
          v-permission="'party:game:config'"
          class="page-hero__btn"
          type="primary"
          :icon="Sunny"
          @click="applyMildTemplate"
        >
          无酒温和模板
        </el-button>
      </template>
    </page-hero>

    <base-table :options="tableOptions" />

    <!-- 编辑弹窗 -->
    <el-dialog v-model="formVisible" :title="formTitle" width="480px" destroy-on-close append-to-body>
      <el-form ref="formRef" :model="form" label-width="90px">
        <el-form-item label="默认人数">
          <el-input-number v-model="form.playerLimit" :min="2" :max="20" />
        </el-form-item>
        <el-form-item label="默认回合">
          <el-input-number v-model="form.roundLimit" :min="1" :max="99" />
        </el-form-item>
        <el-form-item label="默认难度">
          <el-select v-model="form.level" style="width: 100%">
            <el-option v-for="op in PARTY_LEVEL_OPTIONS" :key="op.value" :label="op.label" :value="op.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="惩罚文案">
          <el-input
            v-model="form.penaltyText"
            type="textarea"
            :rows="3"
            maxlength="64"
            show-word-limit
            placeholder="如：向左侧邻座讲一个冷笑话"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Sunny } from '@element-plus/icons-vue'
import { showTips } from '@/utils/message/showTips.js'
import { getGameConfigs, updateGameConfig } from '@/api/party'
import { PARTY_LEVEL_OPTIONS } from '@/types/party'
import type { PartyGameConfig, PartyGameType, PartyLevel } from '@/types/party'

const BaseTable = defineAsyncComponent(() => import('@/components/base/form/BaseTable.vue'))
const PageHero = defineAsyncComponent(() => import('@/components/base/PageHero/index.vue'))

/** PRD 8.7 温和模板：无饮酒表述的固定惩罚文案 */
const MILD_PENALTY_TEXT = '向左侧邻座讲一个冷笑话'
/** 饮酒文案判定口径：默认惩罚含「喝」即视为需替换（8.7「喝一杯」表述） */
const ALCOHOL_PATTERN = /喝/

const loading = ref(false)
const saving = ref(false)
const configs = ref<PartyGameConfig[]>([])
const tableData = ref<Record<string, unknown>[]>([])

function levelLabel(level: string) {
  const hit = PARTY_LEVEL_OPTIONS.find(op => op.value === level)
  return hit ? hit.label : level
}

function gameLabel(row: PartyGameConfig) {
  const emoji = row.gameEmoji || ''
  const name = row.gameName || row.gameType
  return emoji ? `${emoji} ${name}` : name
}

const tableOptions = reactive({
  tableName: '游戏配置',
  tableData,
  tableFields: [
    { fieldName: 'gameLabel', label: '游戏', minWidth: 170, align: 'left' },
    { fieldName: 'gameType', label: 'gameType', width: 100, align: 'center' },
    {
      fieldName: 'status',
      label: '上架开关',
      width: 90,
      align: 'center',
      type: 'switch',
      activeValue: 'online',
      inactiveValue: 'offline',
      onChange: (row: Record<string, unknown>, val: string | number | boolean) =>
        onStatusChange(row as unknown as PartyGameConfig, val)
    },
    { fieldName: 'playerLimit', label: '人数上限', width: 90, align: 'center' },
    { fieldName: 'roundLimit', label: '回合上限', width: 90, align: 'center' },
    { fieldName: 'levelLabel', label: '默认难度', width: 90, align: 'center' },
    { fieldName: 'penaltyText', label: '默认惩罚文案', minWidth: 190, align: 'left' },
    { fieldName: 'updatedAt', label: '最近更新', width: 170, align: 'center' }
  ],
  showIndex: true,
  pageTableOperate: [
    {
      label: '编辑',
      tip: '编辑配置',
      action: row => openEdit(row as unknown as PartyGameConfig)
    }
  ],
  tableOperateWidth: 90
})

const formVisible = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  gameType: '' as PartyGameType | '',
  gameLabel: '',
  playerLimit: 2,
  roundLimit: 1,
  level: '' as PartyLevel | '',
  penaltyText: ''
})
const formTitle = computed(() => `编辑配置${form.gameLabel ? ` · ${form.gameLabel}` : ''}`)

async function load() {
  loading.value = true
  try {
    const data = await getGameConfigs()
    configs.value = data || []
    tableData.value = configs.value.map(it => ({
      ...it,
      gameLabel: gameLabel(it),
      levelLabel: levelLabel(it.level)
    }))
  } catch (err) {
    showTips('error', (err as Error).message || '数据请求失败')
  } finally {
    loading.value = false
  }
}

async function onStatusChange(row: PartyGameConfig, val: string | number | boolean) {
  const next = String(val) as 'online' | 'offline'
  try {
    await updateGameConfig(row.gameType, { status: next })
    row.status = next
    showTips('success', next === 'online' ? `${row.gameName || row.gameType} 已上架` : `${row.gameName || row.gameType} 已下架`)
  } catch (err) {
    // 失败还原开关状态，避免界面与服务端不一致
    row.status = next === 'online' ? 'offline' : 'online'
    showTips('error', (err as Error).message || '状态更新失败')
  }
}

function openEdit(row: PartyGameConfig) {
  form.gameType = row.gameType
  form.gameLabel = gameLabel(row)
  form.playerLimit = row.playerLimit
  form.roundLimit = row.roundLimit
  form.level = (row.level as PartyLevel) || 'gentle'
  form.penaltyText = row.penaltyText || ''
  formVisible.value = true
}

async function submitForm() {
  if (!form.gameType) return
  saving.value = true
  try {
    await updateGameConfig(form.gameType, {
      playerLimit: form.playerLimit,
      roundLimit: form.roundLimit,
      level: form.level || 'gentle',
      penaltyText: form.penaltyText
    })
    showTips('success', '保存成功')
    formVisible.value = false
    load()
  } catch (err) {
    showTips('error', (err as Error).message || '保存失败')
  } finally {
    saving.value = false
  }
}

/** 无酒温和模板：一键把含饮酒表述的默认惩罚文案替换为固定温和文案（PRD 8.7） */
function applyMildTemplate() {
  const targets = configs.value.filter(it => !!it.penaltyText && ALCOHOL_PATTERN.test(it.penaltyText))
  if (!targets.length) {
    showTips('info', '当前没有含饮酒表述的默认惩罚文案，无需切换')
    return
  }
  const names = targets.map(it => it.gameName || it.gameType).join('、')
  ElMessageBox.confirm(
    `检测到 ${targets.length} 款游戏（${names}）的默认惩罚文案含饮酒表述，一键替换为「${MILD_PENALTY_TEXT}」？保存后服务端热更新生效，无需发版。`,
    '无酒温和模板',
    { confirmButtonText: '一键替换', cancelButtonText: '取消', type: 'warning' }
  )
    .then(async () => {
      loading.value = true
      try {
        await Promise.all(
          targets.map(it => updateGameConfig(it.gameType, { penaltyText: MILD_PENALTY_TEXT }))
        )
        showTips('success', `已替换 ${targets.length} 款游戏的惩罚文案`)
      } catch (err) {
        showTips('error', (err as Error).message || '替换失败')
      } finally {
        loading.value = false
        load()
      }
    })
    .catch(() => undefined)
}

onMounted(load)
</script>
