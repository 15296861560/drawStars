<template>
  <div
    class="im-list-row"
    :class="{ active, disabled }"
    @click="!disabled && emit('click')"
  >
    <div class="im-list-row__avatar">
      <slot name="avatar">
        <ImAvatar
          :src="avatar"
          :name="name"
          :size="40"
          :badge="badge"
          :online="online"
        />
      </slot>
    </div>
    <div class="im-list-row__main">
      <div class="im-list-row__title">
        <span class="im-list-row__name">{{ name }}</span>
        <span v-if="$slots.tag" class="im-list-row__tag"
          ><slot name="tag"
        /></span>
      </div>
      <div v-if="$slots.sub || sub" class="im-list-row__sub">
        <slot name="sub">{{ sub }}</slot>
      </div>
    </div>
    <div v-if="$slots.extra" class="im-list-row__extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

withDefaults(
  defineProps<{
    name?: string
    avatar?: string
    sub?: string
    badge?: number
    online?: boolean
    active?: boolean
    disabled?: boolean
  }>(),
  {
    name: '',
    avatar: '',
    sub: '',
    badge: 0,
    online: false,
    active: false,
    disabled: false
  }
)

const emit = defineEmits<{ click: [] }>()

const ImAvatar = defineAsyncComponent(() => import('./ImAvatar.vue'))
</script>

<style scoped lang="less">
.im-list-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid @color-bg-divider;
  transition: background-color 0.15s;

  &:hover {
    background: @color-fill-hover;
  }
  &.active {
    background: fade(@color-primary, 8%);
  }
  &.disabled {
    cursor: default;
    opacity: 0.55;
    &:hover {
      background: transparent;
    }
  }

  &__avatar {
    flex-shrink: 0;
  }
  &__main {
    flex: 1;
    overflow: hidden;
  }
  &__title {
    display: flex;
    align-items: center;
    gap: 6px;
    justify-content: space-between;
  }
  &__name {
    font-size: 14px;
    color: @color-text-normal;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
  &__sub {
    font-size: 12px;
    color: @color-text-placeholder;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 2px;
  }
  &__extra {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
</style>
