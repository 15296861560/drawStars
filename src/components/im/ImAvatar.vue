<template>
  <div class="im-avatar" :class="{ 'is-online': online }">
    <el-badge :value="badge" :hidden="!badge" :max="max" :type="badgeType">
      <el-avatar
        :size="size"
        :src="src"
        :class="['im-avatar__img', { 'is-fallback': !src }]"
      >
        <span v-if="!src">{{ initial }}</span>
      </el-avatar>
    </el-badge>
    <span v-if="online" class="im-avatar__dot"></span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 头像图片地址 */
    src?: string
    /** 无图时显示的文字（取首字） */
    name?: string
    /** 尺寸 */
    size?: number
    /** 角标数值 */
    badge?: number
    /** 角标上限 */
    max?: number
    /** 角标类型 */
    badgeType?: 'primary' | 'success' | 'warning' | 'info' | 'danger'
    /** 是否展示在线小圆点 */
    online?: boolean
  }>(),
  {
    src: '',
    name: '',
    size: 40,
    badge: 0,
    max: 99,
    badgeType: 'danger',
    online: false
  }
)

const initial = computed(() => {
  const n = (props.name || '').trim()
  if (!n) return '?'
  // 中文取最后一字（昵称常用末字），英文取首字母
  return /[一-鿿]/.test(n) ? n.slice(-1) : n.slice(0, 1).toUpperCase()
})
</script>

<style scoped lang="less">
.im-avatar {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;

  &__img {
    background: @color-fill-hover;
    color: @color-text-secondary;
    &.is-fallback {
      background: @color-morandi-1;
      color: @color-text-inverse;
    }
  }

  &__dot {
    position: absolute;
    right: 2px;
    bottom: 2px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: @color-success;
    border: 2px solid @color-bg;
  }
}
</style>
