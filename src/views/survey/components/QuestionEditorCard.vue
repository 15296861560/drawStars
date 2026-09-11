<template>
  <div class="editor-card" :class="{ active: active }" @click="$emit('select')">
    <div class="card-head">
      <span class="drag-handle">☰</span>
      <span class="type-tag">{{ typeLabel }}</span>
      <span class="page-tag">P{{ question.pageIndex || 1 }}</span>
      <span v-if="question.required" class="req">必填</span>
      <div class="actions">
        <el-button link type="primary" @click.stop="$emit('move-up')"
          >上移</el-button
        >
        <el-button link type="primary" @click.stop="$emit('move-down')"
          >下移</el-button
        >
        <el-button link type="primary" @click.stop="$emit('copy')"
          >复制</el-button
        >
        <el-button link type="danger" @click.stop="$emit('remove')"
          >删除</el-button
        >
      </div>
    </div>
    <div class="card-title">
      {{ index }}. {{ question.title || '未命名题目' }}
    </div>
    <div v-if="question.description" class="card-desc">
      {{ question.description }}
    </div>
    <div class="card-preview">
      <template v-if="options.length">
        <div v-for="(opt, i) in options" :key="i" class="opt-line">
          ○ {{ opt.content }}
        </div>
      </template>
      <template v-else-if="question.type === 'rating'">★★★★★</template>
      <template v-else-if="question.type === 'slider'">——●————</template>
      <template v-else>
        <el-input disabled :placeholder="placeholder" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '@/types/survey'
import { getQuestionType } from '../types'

const props = defineProps<{
  question: Question
  index: number
  active?: boolean
}>()
defineEmits(['select', 'move-up', 'move-down', 'copy', 'remove'])

const typeLabel = computed(
  () => getQuestionType(props.question.type)?.label || props.question.type
)
const options = computed(() => props.question.config?.options || [])
const placeholder = computed(
  () => props.question.config?.placeholder || '填写区域'
)
</script>

<style scoped>
.editor-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 12px;
  background: #fff;
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.editor-card:hover {
  border-color: #c0c4cc;
}
.editor-card.active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px rgba(76, 94, 219, 0.15);
}
.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.drag-handle {
  color: #909399;
  cursor: grab;
}
.type-tag,
.page-tag {
  font-size: 12px;
  background: #f4f4f5;
  color: #606266;
  padding: 2px 6px;
  border-radius: 4px;
}
.req {
  color: #f56c6c;
  font-size: 12px;
}
.actions {
  margin-left: auto;
}
.card-title {
  font-weight: 600;
  margin-bottom: 6px;
}
.card-desc {
  color: #909399;
  font-size: 12px;
  margin-bottom: 8px;
}
.opt-line {
  color: #606266;
  font-size: 13px;
  line-height: 1.8;
}
</style>
