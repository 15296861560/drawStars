<template>
  <header class="page-hero">
    <div class="page-hero__main">
      <h2 class="page-hero__title">{{ title }}</h2>
      <p v-if="desc" class="page-hero__desc">{{ desc }}</p>
    </div>
    <div v-if="$slots.side" class="page-hero__side">
      <slot name="side" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  /** 页面标题 */
  title: string
  /** 页面描述（可选） */
  desc?: string
}>()
</script>

<style scoped lang="less">
/* 星夜页头：靛蓝渐变 + 星点 + 四芒星光晕（通用台账页统一视觉） */
.page-hero {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
  padding: 22px 24px;
  overflow: hidden;
  color: @ds-night-text-active;
  background: radial-gradient(
      420px 170px at 88% -18%,
      fade(@ds-primary, 42%),
      transparent 70%
    ),
    linear-gradient(
      118deg,
      @ds-night-deep 0%,
      @ds-night 52%,
      mix(@ds-night, @ds-primary, 18%) 100%
    );
  border-radius: @ds-radius-lg;

  /* 星点 */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(
        1.6px 1.6px at 12% 26%,
        @ds-night-text-active 50%,
        transparent 51%
      ),
      radial-gradient(1.2px 1.2px at 30% 74%, @ds-night-text 50%, transparent 51%),
      radial-gradient(
        1.4px 1.4px at 48% 22%,
        @ds-night-text-active 50%,
        transparent 51%
      ),
      radial-gradient(1px 1px at 63% 64%, @ds-night-text 50%, transparent 51%),
      radial-gradient(
        1.6px 1.6px at 76% 30%,
        @ds-night-text-active 50%,
        transparent 51%
      ),
      radial-gradient(1.1px 1.1px at 92% 78%, @ds-night-text 50%, transparent 51%);
    animation: hero-twinkle 4.5s ease-in-out infinite;
  }

  /* 四芒星光晕 */
  &::after {
    content: '';
    position: absolute;
    top: -30px;
    right: 38%;
    width: 118px;
    height: 118px;
    pointer-events: none;
    background: radial-gradient(
      circle at 50% 50%,
      fade(@ds-primary-light, 16%),
      transparent 70%
    );
    clip-path: polygon(
      50% 0,
      61% 39%,
      100% 50%,
      61% 61%,
      50% 100%,
      39% 61%,
      0 50%,
      39% 39%
    );
    animation: hero-twinkle 6s ease-in-out 1.2s infinite;
  }
}

.page-hero__main {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.page-hero__title {
  margin: 0 0 6px;
  font-size: @ds-font-xl;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.page-hero__desc {
  margin: 0;
  font-size: @ds-font-sm;
  color: @ds-night-text;
}

.page-hero__side {
  position: relative;
  z-index: 1;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 12px;
}

// pill 与主操作按钮由父页面经 #side 插槽传入，样式需 :deep 命中
:deep(.page-hero__pill) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: @ds-font-sm;
  color: @ds-night-text-active;
  background: @ds-night-veil;
  border: 1px solid @ds-night-line;
  border-radius: @ds-radius-round;
}

/* 暗夜上的玻璃按钮 */
:deep(.page-hero__btn) {
  --el-button-bg-color: @ds-night-veil;
  --el-button-border-color: @ds-night-line;
  --el-button-text-color: @ds-night-text-active;
  --el-button-hover-bg-color: @ds-primary-light;
  --el-button-hover-border-color: @ds-primary-light;
  --el-button-hover-text-color: @ds-primary-active;
  --el-button-active-bg-color: @ds-primary-light;
  --el-button-active-border-color: @ds-primary-light;
  --el-button-active-text-color: @ds-primary-active;
}

@keyframes hero-twinkle {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(0.94);
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-hero::before,
  .page-hero::after {
    animation: none;
  }
}
</style>
