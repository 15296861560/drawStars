<template>
  <div class="survey-result" v-loading="loading">
    <el-card v-if="scoring">
      <div class="score-hero">
        <div class="score-num">{{ scoring.totalScore }}</div>
        <div class="score-max">/ {{ scoring.maxScore }}</div>
      </div>
      <div class="grade-row">
        <el-tag v-if="scoring.gradeLabel" size="large" type="success">{{
          scoring.gradeLabel
        }}</el-tag>
        <el-tag
          v-if="scoring.isPassed != null"
          size="large"
          :type="scoring.isPassed ? 'success' : 'danger'"
          >{{ scoring.isPassed ? '通过' : '未通过' }}</el-tag
        >
        <span v-if="scoring.rank">排名：第 {{ scoring.rank }} 名</span>
      </div>

      <el-divider />
      <h4>答题明细</h4>
      <el-table :data="scoring.detail || []" size="small" border>
        <el-table-column prop="questionId" label="题目ID" width="100" />
        <el-table-column label="得分" width="120">
          <template #default="{ row }">{{ row.score }} / {{ row.max }}</template>
        </el-table-column>
        <el-table-column label="结果" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isCorrect ? 'success' : 'info'" size="small">
              {{ row.isCorrect ? '正确' : '—' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="备注" />
      </el-table>

      <div class="cert-area">
        <canvas ref="certRef" width="720" height="420" class="cert-canvas" />
        <el-button type="primary" @click="downloadCert">下载证书</el-button>
      </div>
    </el-card>
    <el-empty v-else-if="!loading" description="暂无成绩数据" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { ScoringResult, Survey } from '@/types/survey'
import { getResult } from '@/api/survey'

const route = useRoute()
const loading = ref(false)
const scoring = ref<ScoringResult | null>(null)
const survey = ref<Survey | null>(null)
const certRef = ref<HTMLCanvasElement | null>(null)

async function load() {
  loading.value = true
  try {
    const res = await getResult(String(route.params.responseId), {
      shareCode: (route.query.shareCode as string) || undefined
    })
    scoring.value = res.scoring || null
    survey.value = res.survey || null
    await nextTick()
    drawCert()
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function drawCert() {
  const canvas = certRef.value
  if (!canvas || !scoring.value) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#faf6ef'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#c9a227'
  ctx.lineWidth = 6
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32)
  ctx.fillStyle = '#333'
  ctx.font = 'bold 36px serif'
  ctx.textAlign = 'center'
  ctx.fillText('成绩证书', canvas.width / 2, 90)
  ctx.font = '20px sans-serif'
  ctx.fillText(survey.value?.title || '问卷测评', canvas.width / 2, 150)
  ctx.font = 'bold 48px sans-serif'
  ctx.fillStyle = '#1a5fb4'
  ctx.fillText(
    `${scoring.value.totalScore} / ${scoring.value.maxScore}`,
    canvas.width / 2,
    230
  )
  ctx.fillStyle = '#333'
  ctx.font = '22px sans-serif'
  ctx.fillText(scoring.value.gradeLabel || '', canvas.width / 2, 280)
  ctx.font = '14px sans-serif'
  ctx.fillText(
    `编号：R${route.params.responseId}-${Date.now().toString(36)}`,
    canvas.width / 2,
    340
  )
}

function downloadCert() {
  const canvas = certRef.value
  if (!canvas) return
  drawCert()
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = `certificate-${route.params.responseId}.png`
  a.click()
}

onMounted(load)
</script>

<style scoped>
.survey-result {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px 16px;
}
.score-hero {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin: 12px 0;
}
.score-num { font-size: 56px; font-weight: 700; color: #1a5fb4; }
.score-max { font-size: 24px; color: #909399; }
.grade-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}
.cert-area {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.cert-canvas {
  max-width: 100%;
  border: 1px solid #eee;
  border-radius: 4px;
}
</style>
